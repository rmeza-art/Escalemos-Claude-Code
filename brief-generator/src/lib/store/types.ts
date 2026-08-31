import type { Question } from '../questions/types';
import type { Client, NewClientInput } from '../types';

export interface StoredFile {
  path: string;
  bytes: Uint8Array;
  mime: string;
}

/**
 * Contrato de persistencia. Hay dos implementaciones: Supabase y un archivo
 * local para el modo demo. El resto de la app sólo conoce esta interfaz.
 */
export interface Store {
  listClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | null>;
  getClientByToken(token: string): Promise<Client | null>;
  createClient(input: NewClientInput): Promise<Client>;
  updateClient(id: string, patch: Partial<Client>): Promise<Client>;
  deleteClient(id: string): Promise<void>;

  listQuestions(): Promise<Question[]>;
  saveQuestion(question: Question): Promise<Question>;
  deleteQuestion(id: string): Promise<void>;
  /** Copia todas las preguntas de un nicho a otro. Devuelve cuántas copió. */
  duplicateNicheQuestions(from: string, to: string): Promise<number>;

  uploadFile(clientId: string, filename: string, mime: string, bytes: Uint8Array): Promise<string>;
  readFile(path: string): Promise<StoredFile | null>;
  deleteFile(path: string): Promise<void>;
}
