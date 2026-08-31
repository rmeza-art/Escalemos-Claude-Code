import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

import {
  adminDemoEmail,
  adminDemoPassword,
  sessionSecret,
  supabaseAnonKey,
  supabaseUrl,
  usingSupabase,
} from './config';

/**
 * Ingreso del administrador.
 *
 * Con Supabase configurado se usa Supabase Auth. Sin él, la app corre en modo
 * demo y valida contra el usuario y la clave de `.env`, guardando una cookie
 * firmada. El resto de la app sólo llama a `getAdmin()` y `requireAdmin()`.
 */

const COOKIE = 'brief_admin';
const MAX_AGE = 60 * 60 * 8;

export interface AdminSession {
  email: string;
}

function sign(payload: string): string {
  return createHmac('sha256', sessionSecret).update(payload).digest('base64url');
}

function verify(token: string): AdminSession | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email: string;
      exp: number;
    };
    if (Date.now() > data.exp) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

/** Compara sin filtrar por tiempo cuántos caracteres coincidieron. */
function constantEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

async function supabaseSignIn(email: string, password: string): Promise<string | null> {
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', apikey: supabaseAnonKey },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { access_token?: string; user?: { email?: string } };
  return data.access_token ? (data.user?.email ?? email) : null;
}

/** Devuelve null si las credenciales no sirven. */
export async function signIn(email: string, password: string): Promise<AdminSession | null> {
  let session: AdminSession | null = null;

  if (usingSupabase) {
    const verified = await supabaseSignIn(email, password);
    if (verified) session = { email: verified };
  } else if (
    constantEquals(email.trim().toLowerCase(), adminDemoEmail.toLowerCase()) &&
    constantEquals(password, adminDemoPassword)
  ) {
    session = { email: adminDemoEmail };
  }

  if (!session) return null;

  const payload = Buffer.from(
    JSON.stringify({ email: session.email, exp: Date.now() + MAX_AGE * 1000 }),
  ).toString('base64url');

  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });

  return session;
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getAdmin(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  return token ? verify(token) : null;
}

/** Para usar en rutas de API. Lanza si no hay sesión. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdmin();
  if (!session) throw new Error('No autorizado');
  return session;
}
