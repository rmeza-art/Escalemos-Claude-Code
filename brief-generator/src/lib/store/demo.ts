import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { DEFAULT_QUESTIONS } from '../questions';
import type { Question } from '../questions/types';
import type { Client, NewClientInput } from '../types';
import { EMPTY_OVERRIDES } from '../types';
import { seedClients } from './demo-data';
import type { Store, StoredFile } from './types';

/**
 * Almacenamiento del modo demo: un archivo JSON en `.data/` y los adjuntos en
 * `.data/uploads/`. Pensado para desarrollo y para la vista previa privada, no
 * para producción — en un entorno sin disco persistente los datos se pierden
 * al reiniciar.
 */

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'demo.json');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

interface DemoDb {
  clients: Client[];
  questions: Question[];
}

/** Serializa las escrituras: el archivo se lee y escribe entero. */
let queue: Promise<unknown> = Promise.resolve();
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.catch(() => undefined);
  return next;
}

async function readDb(): Promise<DemoDb> {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<DemoDb>;
    return {
      clients: parsed.clients ?? [],
      questions: parsed.questions ?? DEFAULT_QUESTIONS,
    };
  } catch {
    const fresh: DemoDb = { clients: seedClients(), questions: DEFAULT_QUESTIONS };
    await writeDb(fresh);
    return fresh;
  }
}

async function writeDb(db: DemoDb): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

async function mutate<T>(fn: (db: DemoDb) => Promise<T> | T): Promise<T> {
  return serialize(async () => {
    const db = await readDb();
    const result = await fn(db);
    await writeDb(db);
    return result;
  });
}

/** Sólo deja pasar nombres de archivo seguros para escribir en disco. */
function safeName(filename: string): string {
  return (
    path
      .basename(filename)
      .replace(/[^\w.\- ]+/g, '_')
      .slice(0, 120) || 'archivo'
  );
}

export const demoStore: Store = {
  async listClients() {
    const db = await readDb();
    return [...db.clients].sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
  },

  async getClient(id) {
    const db = await readDb();
    return db.clients.find((c) => c.id === id) ?? null;
  },

  async getClientByToken(token) {
    const db = await readDb();
    return db.clients.find((c) => c.token === token) ?? null;
  },

  async createClient(input: NewClientInput) {
    const now = new Date().toISOString();
    const client: Client = {
      id: `cli_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
      contactName: input.contactName,
      company: input.company,
      email: input.email,
      phone: input.phone ?? '',
      niche: input.niche ?? null,
      status: 'borrador',
      token: randomUUID().replace(/-/g, ''),
      internalNotes: input.internalNotes ?? '',
      answers: {},
      briefOverrides: EMPTY_OVERRIDES,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
      submittedAt: null,
    };
    return mutate((db) => {
      db.clients.push(client);
      return client;
    });
  },

  async updateClient(id, patch) {
    return mutate((db) => {
      const index = db.clients.findIndex((c) => c.id === id);
      if (index === -1) throw new Error(`No existe el cliente ${id}`);
      const updated: Client = {
        ...db.clients[index],
        ...patch,
        id,
        updatedAt: new Date().toISOString(),
      };
      db.clients[index] = updated;
      return updated;
    });
  },

  async deleteClient(id) {
    await mutate((db) => {
      db.clients = db.clients.filter((c) => c.id !== id);
    });
    await fs.rm(path.join(UPLOAD_DIR, id), { recursive: true, force: true });
  },

  async listQuestions() {
    const db = await readDb();
    return [...db.questions].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  },

  async saveQuestion(question) {
    return mutate((db) => {
      const index = db.questions.findIndex((q) => q.id === question.id);
      if (index === -1) db.questions.push(question);
      else db.questions[index] = { ...db.questions[index], ...question };
      return question;
    });
  },

  async deleteQuestion(id) {
    await mutate((db) => {
      db.questions = db.questions.filter((q) => q.id !== id);
    });
  },

  async duplicateNicheQuestions(from, to) {
    return mutate((db) => {
      const source = db.questions.filter((q) => q.niche === from);
      const existing = new Set(db.questions.map((q) => q.id));
      let copied = 0;
      for (const question of source) {
        const newId = `${to}_${question.id.replace(/^[a-z]+_/, '')}`.slice(0, 60);
        if (existing.has(newId)) continue;
        db.questions.push({
          ...question,
          id: newId,
          niche: to as Question['niche'],
          builtIn: false,
          conditions: question.conditions.map((c) => ({
            ...c,
            // Las condiciones apuntan a la copia, no al nicho original.
            questionId: source.some((s) => s.id === c.questionId)
              ? `${to}_${c.questionId.replace(/^[a-z]+_/, '')}`.slice(0, 60)
              : c.questionId,
          })),
        });
        existing.add(newId);
        copied++;
      }
      return copied;
    });
  },

  async uploadFile(clientId, filename, mime, bytes) {
    const dir = path.join(UPLOAD_DIR, clientId);
    await fs.mkdir(dir, { recursive: true });
    const stored = `${randomUUID().slice(0, 8)}-${safeName(filename)}`;
    await fs.writeFile(path.join(dir, stored), bytes);
    await fs.writeFile(path.join(dir, `${stored}.mime`), mime, 'utf8');
    return `${clientId}/${stored}`;
  },

  async readFile(storagePath): Promise<StoredFile | null> {
    const full = path.join(UPLOAD_DIR, storagePath);
    if (!full.startsWith(UPLOAD_DIR + path.sep)) return null;
    try {
      const bytes = await fs.readFile(full);
      let mime = 'application/octet-stream';
      try {
        mime = (await fs.readFile(`${full}.mime`, 'utf8')).trim() || mime;
      } catch {
        // sin archivo de tipo: se entrega como binario genérico
      }
      return { path: storagePath, bytes: new Uint8Array(bytes), mime };
    } catch {
      return null;
    }
  },

  async deleteFile(storagePath) {
    const full = path.join(UPLOAD_DIR, storagePath);
    if (!full.startsWith(UPLOAD_DIR + path.sep)) return;
    await fs.rm(full, { force: true });
    await fs.rm(`${full}.mime`, { force: true });
  },
};
