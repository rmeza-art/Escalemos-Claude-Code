import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { storageBucket, supabaseServiceKey, supabaseUrl } from '../config';
import { DEFAULT_QUESTIONS } from '../questions';
import type { Question } from '../questions/types';
import type { Client, NewClientInput } from '../types';
import { EMPTY_OVERRIDES } from '../types';
import type { Store, StoredFile } from './types';

/**
 * Implementación sobre Supabase. Usa la clave de servicio y por eso sólo puede
 * instanciarse en el servidor: nunca se importa desde un componente cliente.
 */

let cached: SupabaseClient | null = null;

function admin(): SupabaseClient {
  if (!cached) {
    cached = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

type ClientRow = {
  id: string;
  contact_name: string;
  company: string;
  email: string;
  phone: string;
  niche: string | null;
  status: string;
  token: string;
  internal_notes: string;
  answers: Client['answers'];
  brief_overrides: Client['briefOverrides'];
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  submitted_at: string | null;
};

function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    contactName: row.contact_name,
    company: row.company,
    email: row.email,
    phone: row.phone ?? '',
    niche: (row.niche as Client['niche']) ?? null,
    status: row.status as Client['status'],
    token: row.token,
    internalNotes: row.internal_notes ?? '',
    answers: row.answers ?? {},
    briefOverrides: row.brief_overrides ?? EMPTY_OVERRIDES,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastActivityAt: row.last_activity_at,
    submittedAt: row.submitted_at,
  };
}

function toRow(patch: Partial<Client>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (patch.contactName !== undefined) row.contact_name = patch.contactName;
  if (patch.company !== undefined) row.company = patch.company;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.niche !== undefined) row.niche = patch.niche;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.token !== undefined) row.token = patch.token;
  if (patch.internalNotes !== undefined) row.internal_notes = patch.internalNotes;
  if (patch.answers !== undefined) row.answers = patch.answers;
  if (patch.briefOverrides !== undefined) row.brief_overrides = patch.briefOverrides;
  if (patch.lastActivityAt !== undefined) row.last_activity_at = patch.lastActivityAt;
  if (patch.submittedAt !== undefined) row.submitted_at = patch.submittedAt;
  return row;
}

type QuestionRow = {
  id: string;
  niche: string;
  category: string;
  text: string;
  type: string;
  required: boolean;
  options: Question['options'];
  conditions: Question['conditions'];
  help: string | null;
  placeholder: string | null;
  format: string | null;
  order: number;
  built_in: boolean;
};

function toQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    niche: row.niche as Question['niche'],
    category: row.category as Question['category'],
    text: row.text,
    type: row.type as Question['type'],
    required: row.required,
    options: row.options ?? [],
    conditions: row.conditions ?? [],
    help: row.help ?? undefined,
    placeholder: row.placeholder ?? undefined,
    format: (row.format as Question['format']) ?? undefined,
    order: row.order,
    builtIn: row.built_in,
  };
}

function questionToRow(question: Question): Record<string, unknown> {
  return {
    id: question.id,
    niche: question.niche,
    category: question.category,
    text: question.text,
    type: question.type,
    required: question.required,
    options: question.options,
    conditions: question.conditions,
    help: question.help ?? null,
    placeholder: question.placeholder ?? null,
    format: question.format ?? null,
    order: question.order,
    built_in: question.builtIn ?? false,
  };
}

function fail(context: string, error: { message: string } | null): void {
  if (error) throw new Error(`Supabase (${context}): ${error.message}`);
}

/** Deja el catálogo base en la tabla la primera vez que se consulta vacía. */
async function seedQuestionsIfEmpty(): Promise<QuestionRow[]> {
  const { data, error } = await admin().from('questions').select('*').order('order');
  fail('leer preguntas', error);
  if (data && data.length > 0) return data as QuestionRow[];

  const rows = DEFAULT_QUESTIONS.map(questionToRow);
  const { error: insertError } = await admin().from('questions').insert(rows);
  fail('sembrar preguntas', insertError);

  const seeded = await admin().from('questions').select('*').order('order');
  fail('releer preguntas', seeded.error);
  return (seeded.data ?? []) as QuestionRow[];
}

export const supabaseStore: Store = {
  async listClients() {
    const { data, error } = await admin()
      .from('clients')
      .select('*')
      .order('last_activity_at', { ascending: false });
    fail('listar clientes', error);
    return (data ?? []).map((row) => toClient(row as ClientRow));
  },

  async getClient(id) {
    const { data, error } = await admin().from('clients').select('*').eq('id', id).maybeSingle();
    fail('obtener cliente', error);
    return data ? toClient(data as ClientRow) : null;
  },

  async getClientByToken(token) {
    const { data, error } = await admin()
      .from('clients')
      .select('*')
      .eq('token', token)
      .maybeSingle();
    fail('obtener cliente por token', error);
    return data ? toClient(data as ClientRow) : null;
  },

  async createClient(input: NewClientInput) {
    const { data, error } = await admin()
      .from('clients')
      .insert({
        contact_name: input.contactName,
        company: input.company,
        email: input.email,
        phone: input.phone ?? '',
        niche: input.niche ?? null,
        internal_notes: input.internalNotes ?? '',
        status: 'borrador',
        token: crypto.randomUUID().replace(/-/g, ''),
      })
      .select('*')
      .single();
    fail('crear cliente', error);
    return toClient(data as ClientRow);
  },

  async updateClient(id, patch) {
    const { data, error } = await admin()
      .from('clients')
      .update(toRow(patch))
      .eq('id', id)
      .select('*')
      .single();
    fail('actualizar cliente', error);
    return toClient(data as ClientRow);
  },

  async deleteClient(id) {
    const { data } = await admin().storage.from(storageBucket).list(id);
    if (data && data.length > 0) {
      await admin()
        .storage.from(storageBucket)
        .remove(data.map((f) => `${id}/${f.name}`));
    }
    const { error } = await admin().from('clients').delete().eq('id', id);
    fail('borrar cliente', error);
  },

  async listQuestions() {
    const rows = await seedQuestionsIfEmpty();
    return rows
      .map(toQuestion)
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  },

  async saveQuestion(question) {
    const { error } = await admin().from('questions').upsert(questionToRow(question));
    fail('guardar pregunta', error);
    return question;
  },

  async deleteQuestion(id) {
    const { error } = await admin().from('questions').delete().eq('id', id);
    fail('borrar pregunta', error);
  },

  async duplicateNicheQuestions(from, to) {
    const all = await this.listQuestions();
    const source = all.filter((q) => q.niche === from);
    const existing = new Set(all.map((q) => q.id));
    const rename = (id: string) => `${to}_${id.replace(/^[a-z]+_/, '')}`.slice(0, 60);

    const copies = source
      .filter((q) => !existing.has(rename(q.id)))
      .map((q) => ({
        ...q,
        id: rename(q.id),
        niche: to as Question['niche'],
        builtIn: false,
        conditions: q.conditions.map((c) => ({
          ...c,
          questionId: source.some((s) => s.id === c.questionId)
            ? rename(c.questionId)
            : c.questionId,
        })),
      }));

    if (copies.length === 0) return 0;
    const { error } = await admin().from('questions').insert(copies.map(questionToRow));
    fail('duplicar preguntas', error);
    return copies.length;
  },

  async uploadFile(clientId, filename, mime, bytes) {
    const safe = filename.replace(/[^\w.\- ]+/g, '_').slice(0, 120) || 'archivo';
    const storagePath = `${clientId}/${crypto.randomUUID().slice(0, 8)}-${safe}`;
    const { error } = await admin()
      .storage.from(storageBucket)
      .upload(storagePath, bytes, { contentType: mime, upsert: false });
    fail('subir archivo', error);
    return storagePath;
  },

  async readFile(storagePath): Promise<StoredFile | null> {
    const { data, error } = await admin().storage.from(storageBucket).download(storagePath);
    if (error || !data) return null;
    return {
      path: storagePath,
      bytes: new Uint8Array(await data.arrayBuffer()),
      mime: data.type || 'application/octet-stream',
    };
  },

  async deleteFile(storagePath) {
    await admin().storage.from(storageBucket).remove([storagePath]);
  },
};
