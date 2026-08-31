'use server';

import { randomUUID } from 'node:crypto';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireAdmin, signIn, signOut } from '@/lib/auth';
import { DEFAULT_QUESTIONS } from '@/lib/questions';
import type { Question } from '@/lib/questions/types';
import { store } from '@/lib/store';
import { PROJECT_STATUSES, type ProjectStatus } from '@/lib/types';
import { mergeAnswers, nuevoClienteSchema, preguntaSchema } from '@/lib/validation';

/** Resultado uniforme para los formularios del panel. */
export interface AccionResultado {
  ok: boolean;
  mensaje?: string;
}

// ── Sesión ──────────────────────────────────────────────────

export async function iniciarSesion(
  _previo: AccionResultado | null,
  formData: FormData,
): Promise<AccionResultado> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { ok: false, mensaje: 'Escribe el correo y la clave.' };
  }

  const sesion = await signIn(email, password);
  if (!sesion) return { ok: false, mensaje: 'Correo o clave incorrectos.' };

  redirect('/admin');
}

export async function cerrarSesion(): Promise<void> {
  await signOut();
  redirect('/admin/login');
}

// ── Clientes ────────────────────────────────────────────────

export async function crearCliente(
  _previo: AccionResultado | null,
  formData: FormData,
): Promise<AccionResultado> {
  await requireAdmin();

  const parsed = nuevoClienteSchema.safeParse({
    contactName: formData.get('contactName'),
    company: formData.get('company'),
    email: formData.get('email'),
    phone: formData.get('phone') ?? '',
    niche: formData.get('niche') || null,
    internalNotes: formData.get('internalNotes') ?? '',
  });

  if (!parsed.success) {
    return { ok: false, mensaje: parsed.error.issues[0]?.message ?? 'Revisa los datos.' };
  }

  const client = await store.createClient({
    contactName: parsed.data.contactName,
    company: parsed.data.company,
    email: parsed.data.email,
    phone: parsed.data.phone,
    niche: parsed.data.niche as never,
    internalNotes: parsed.data.internalNotes,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/clientes');
  redirect(`/admin/clientes/${client.id}`);
}

export async function cambiarEstado(clientId: string, estado: string): Promise<AccionResultado> {
  await requireAdmin();
  if (!PROJECT_STATUSES.some((s) => s.id === estado)) {
    return { ok: false, mensaje: 'Estado no válido.' };
  }
  await store.updateClient(clientId, { status: estado as ProjectStatus });
  revalidatePath(`/admin/clientes/${clientId}`);
  revalidatePath('/admin/clientes');
  revalidatePath('/admin');
  return { ok: true, mensaje: 'Estado actualizado.' };
}

export async function guardarNotasInternas(
  clientId: string,
  notas: string,
): Promise<AccionResultado> {
  await requireAdmin();
  await store.updateClient(clientId, { internalNotes: notas.slice(0, 4000) });
  revalidatePath(`/admin/clientes/${clientId}`);
  return { ok: true, mensaje: 'Notas guardadas.' };
}

/** Edición de respuestas desde el panel. Pasa por la misma validación que el cliente. */
export async function guardarRespuestasAdmin(
  clientId: string,
  respuestasJson: string,
): Promise<AccionResultado> {
  await requireAdmin();
  const client = await store.getClient(clientId);
  if (!client) return { ok: false, mensaje: 'Cliente no encontrado.' };

  let entrantes: Record<string, unknown>;
  try {
    entrantes = JSON.parse(respuestasJson) as Record<string, unknown>;
  } catch {
    return { ok: false, mensaje: 'Datos con formato incorrecto.' };
  }

  const questions = await store.listQuestions();
  const answers = mergeAnswers(questions, client.answers, entrantes);
  await store.updateClient(clientId, { answers });

  revalidatePath(`/admin/clientes/${clientId}`);
  return { ok: true, mensaje: 'Respuestas guardadas.' };
}

/** Textos que la agencia escribe encima del brief generado. */
export async function guardarBrief(
  clientId: string,
  seccionesJson: string,
  notasAgencia: string,
): Promise<AccionResultado> {
  await requireAdmin();
  const client = await store.getClient(clientId);
  if (!client) return { ok: false, mensaje: 'Cliente no encontrado.' };

  let secciones: Record<string, string>;
  try {
    const parsed = JSON.parse(seccionesJson) as Record<string, unknown>;
    secciones = Object.fromEntries(
      Object.entries(parsed)
        .filter(([, v]) => typeof v === 'string')
        .map(([k, v]) => [k.slice(0, 40), String(v).slice(0, 20000)]),
    );
  } catch {
    return { ok: false, mensaje: 'Datos con formato incorrecto.' };
  }

  await store.updateClient(clientId, {
    briefOverrides: { sections: secciones, agencyNotes: notasAgencia.slice(0, 8000) },
  });

  revalidatePath(`/admin/clientes/${clientId}`);
  return { ok: true, mensaje: 'Brief guardado.' };
}

/** Invalida el enlace anterior y genera uno nuevo. */
export async function regenerarEnlace(clientId: string): Promise<AccionResultado> {
  await requireAdmin();
  await store.updateClient(clientId, { token: randomUUID().replace(/-/g, '') });
  revalidatePath(`/admin/clientes/${clientId}`);
  return { ok: true, mensaje: 'Enlace nuevo generado. El anterior dejó de servir.' };
}

/** Marca el proyecto como enviado al cliente. El envío del correo es manual. */
export async function marcarComoEnviado(clientId: string): Promise<AccionResultado> {
  await requireAdmin();
  const client = await store.getClient(clientId);
  if (!client) return { ok: false, mensaje: 'Cliente no encontrado.' };
  if (client.status === 'borrador') {
    await store.updateClient(clientId, { status: 'enviado' });
  }
  revalidatePath(`/admin/clientes/${clientId}`);
  revalidatePath('/admin/clientes');
  return { ok: true, mensaje: 'Marcado como enviado.' };
}

export async function reabrirFormulario(clientId: string): Promise<AccionResultado> {
  await requireAdmin();
  await store.updateClient(clientId, { submittedAt: null, status: 'incompleto' });
  revalidatePath(`/admin/clientes/${clientId}`);
  return { ok: true, mensaje: 'Formulario reabierto: el cliente puede volver a editarlo.' };
}

export async function eliminarCliente(clientId: string): Promise<void> {
  await requireAdmin();
  await store.deleteClient(clientId);
  revalidatePath('/admin/clientes');
  revalidatePath('/admin');
  redirect('/admin/clientes');
}

// ── Preguntas ───────────────────────────────────────────────

export async function guardarPregunta(
  _previo: AccionResultado | null,
  formData: FormData,
): Promise<AccionResultado> {
  await requireAdmin();

  const opcionesTexto = String(formData.get('options') ?? '').trim();
  const options = opcionesTexto
    ? opcionesTexto
        .split('\n')
        .map((linea) => linea.trim())
        .filter(Boolean)
        .map((linea) => {
          const [label, value] = linea.split('|').map((p) => p.trim());
          return { label, value: value || slugify(label) };
        })
    : [];

  const condicionPregunta = String(formData.get('condQuestion') ?? '').trim();
  const conditions = condicionPregunta
    ? [
        {
          questionId: condicionPregunta,
          operator: String(formData.get('condOperator') ?? 'igual') as
            | 'igual'
            | 'distinto'
            | 'contiene'
            | 'respondida',
          value: String(formData.get('condValue') ?? '').trim() || undefined,
        },
      ]
    : [];

  const parsed = preguntaSchema.safeParse({
    id: String(formData.get('id') ?? '').trim(),
    niche: String(formData.get('niche') ?? ''),
    category: String(formData.get('category') ?? ''),
    text: String(formData.get('text') ?? ''),
    type: String(formData.get('type') ?? ''),
    required: formData.get('required') === 'on',
    options,
    conditions,
    help: String(formData.get('help') ?? '').trim() || undefined,
    placeholder: String(formData.get('placeholder') ?? '').trim() || undefined,
    order: Number(formData.get('order') ?? 100),
  });

  if (!parsed.success) {
    return { ok: false, mensaje: parsed.error.issues[0]?.message ?? 'Revisa los datos.' };
  }

  const existentes = await store.listQuestions();
  const previa = existentes.find((q) => q.id === parsed.data.id);

  const question: Question = {
    ...(parsed.data as unknown as Question),
    // El catálogo base no se puede convertir en pregunta propia por accidente.
    builtIn: previa?.builtIn ?? false,
  };

  await store.saveQuestion(question);
  revalidatePath('/admin/preguntas');
  return { ok: true, mensaje: previa ? 'Pregunta actualizada.' : 'Pregunta creada.' };
}

export async function eliminarPregunta(id: string): Promise<AccionResultado> {
  await requireAdmin();
  const existentes = await store.listQuestions();
  const question = existentes.find((q) => q.id === id);
  if (!question) return { ok: false, mensaje: 'La pregunta ya no existe.' };
  if (question.builtIn) {
    return {
      ok: false,
      mensaje: 'Las preguntas del catálogo base no se borran. Puedes editarlas.',
    };
  }
  await store.deleteQuestion(id);
  revalidatePath('/admin/preguntas');
  return { ok: true, mensaje: 'Pregunta eliminada.' };
}

/** Duplica la plantilla de un nicho en otro, para partir de algo armado. */
export async function duplicarPlantilla(
  _previo: AccionResultado | null,
  formData: FormData,
): Promise<AccionResultado> {
  await requireAdmin();
  const desde = String(formData.get('desde') ?? '').trim();
  const hacia = String(formData.get('hacia') ?? '').trim();

  if (!desde || !hacia) return { ok: false, mensaje: 'Elige el nicho de origen y el de destino.' };
  if (desde === hacia) return { ok: false, mensaje: 'El origen y el destino son el mismo nicho.' };

  const copiadas = await store.duplicateNicheQuestions(desde, hacia);
  revalidatePath('/admin/preguntas');

  return copiadas === 0
    ? { ok: false, mensaje: 'No había preguntas nuevas que copiar: el destino ya las tiene.' }
    : { ok: true, mensaje: `Se copiaron ${copiadas} preguntas.` };
}

/** Repone las preguntas del catálogo base que se hayan borrado o modificado. */
export async function restaurarCatalogo(): Promise<AccionResultado> {
  await requireAdmin();
  for (const question of DEFAULT_QUESTIONS) {
    await store.saveQuestion(question);
  }
  revalidatePath('/admin/preguntas');
  return { ok: true, mensaje: 'Catálogo base restaurado.' };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}
