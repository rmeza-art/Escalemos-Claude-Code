/**
 * Configuración de entorno.
 *
 * La app funciona de dos maneras:
 *  - con Supabase, si están las tres variables; es el modo real.
 *  - en modo demo, si faltan; los datos van a un archivo local y el ingreso
 *    del administrador es con usuario y clave de `.env`. Sirve para probar el
 *    sistema completo sin cuentas externas.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? '';

export const usingSupabase = Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceKey);
export const demoMode = !usingSupabase;

export const storageBucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'brief-adjuntos';

export const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';

export const adminDemoEmail = process.env.ADMIN_DEMO_EMAIL?.trim() || 'admin@agencia.cl';
export const adminDemoPassword = process.env.ADMIN_DEMO_PASSWORD?.trim() || 'demo1234';
export const sessionSecret =
  process.env.ADMIN_SESSION_SECRET?.trim() || 'secreto-de-desarrollo-cambiar';

/** Tope de subida por archivo. */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export const ALLOWED_UPLOAD_MIME = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'video/mp4',
  'video/quicktime',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'text/plain',
];
