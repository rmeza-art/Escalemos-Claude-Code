import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BarraAvance } from '@/components/BarraAvance';
import { EstadoEtiqueta } from '@/components/EstadoEtiqueta';
import { VistaBrief } from '@/components/VistaBrief';
import { applyOverrides, generateBrief } from '@/lib/brief/generate';
import { appUrl } from '@/lib/config';
import { fechaLarga, tiempoRelativo } from '@/lib/panel';
import { computeProgress } from '@/lib/questions/engine';
import { nicheLabel, type AttachmentRef } from '@/lib/questions/types';
import { store } from '@/lib/store';
import { clientDisplayName } from '@/lib/types';

import { EditorBrief } from './EditorBrief';
import { EditorRespuestas } from './EditorRespuestas';
import { PanelAjustes } from './PanelAjustes';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Cliente · Generador de Brief' };

type Vista = 'brief' | 'respuestas' | 'editor' | 'ajustes';

const PESTANAS: { id: Vista; label: string }[] = [
  { id: 'brief', label: 'Brief' },
  { id: 'respuestas', label: 'Respuestas' },
  { id: 'editor', label: 'Editar brief' },
  { id: 'ajustes', label: 'Ajustes' },
];

export default async function ClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ vista?: string }>;
}) {
  const { id } = await params;
  const client = await store.getClient(id);
  if (!client) notFound();

  const questions = await store.listQuestions();
  const progreso = computeProgress(questions, client.niche, client.answers);
  const brief = applyOverrides(generateBrief(questions, client), client);

  const { vista: vistaParam } = await searchParams;
  const vista: Vista = PESTANAS.some((p) => p.id === vistaParam)
    ? (vistaParam as Vista)
    : 'brief';

  const enlace = `${appUrl.replace(/\/$/, '')}/f/${client.token}`;
  const adjuntos = juntarAdjuntos(client.answers);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/clientes" className="enlace text-sm">
          ← Volver a clientes
        </Link>
      </div>

      <header className="tarjeta p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold sm:text-3xl">{clientDisplayName(client)}</h1>
              <EstadoEtiqueta estado={client.status} />
            </div>
            <p className="mt-1 text-muted">
              {client.niche ? nicheLabel(client.niche) : 'Sin rubro elegido'} ·{' '}
              {client.contactName} · {client.email}
              {client.phone ? ` · ${client.phone}` : ''}
            </p>
            <p className="mt-1 text-sm text-muted">
              Creado el {fechaLarga(client.createdAt)} · Última actividad{' '}
              {tiempoRelativo(client.lastActivityAt)}
              {client.submittedAt ? ` · Enviado el ${fechaLarga(client.submittedAt)}` : ''}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <BarraAvance porcentaje={progreso.percent} />
            <a href={`/api/clientes/${client.id}/brief`} className="btn btn-primario">
              Descargar brief en PDF
            </a>
          </div>
        </div>

        {progreso.missingRequired.length > 0 && (
          <p className="mt-4 rounded-md border-l-4 border-warn bg-warn-soft px-4 py-2 text-sm text-warn">
            Faltan {progreso.missingRequired.length} respuestas obligatorias.
          </p>
        )}
      </header>

      <nav aria-label="Vistas del cliente" className="flex flex-wrap gap-1 border-b border-line">
        {PESTANAS.map((pestana) => {
          const activa = pestana.id === vista;
          return (
            <Link
              key={pestana.id}
              href={`/admin/clientes/${client.id}?vista=${pestana.id}`}
              aria-current={activa ? 'page' : undefined}
              className={`-mb-px border-b-2 px-4 py-2.5 font-medium transition-colors ${
                activa
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:border-line-strong hover:text-ink'
              }`}
            >
              {pestana.label}
            </Link>
          );
        })}
      </nav>

      {vista === 'brief' && <VistaBrief brief={brief} />}

      {vista === 'respuestas' && (
        <div className="space-y-6">
          {adjuntos.length > 0 && (
            <section className="tarjeta p-5">
              <h2 className="font-semibold text-ink">Archivos entregados ({adjuntos.length})</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {adjuntos.map((adjunto) => (
                  <li key={adjunto.id}>
                    <a
                      href={`/api/archivos/${adjunto.path.split('/').map(encodeURIComponent).join('/')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2 hover:border-accent"
                    >
                      <span className="min-w-0 truncate text-ink">{adjunto.filename}</span>
                      <span className="shrink-0 text-sm text-muted">
                        {Math.max(1, Math.round(adjunto.size / 1024))} KB
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <EditorRespuestas
            clientId={client.id}
            questions={questions}
            niche={client.niche}
            answersIniciales={client.answers}
          />
        </div>
      )}

      {vista === 'editor' && (
        <EditorBrief
          clientId={client.id}
          brief={brief}
          seccionesIniciales={client.briefOverrides?.sections ?? {}}
          notasIniciales={client.briefOverrides?.agencyNotes ?? ''}
        />
      )}

      {vista === 'ajustes' && <PanelAjustes client={client} enlace={enlace} />}
    </div>
  );
}

/** Junta los adjuntos de todas las preguntas de tipo archivo. */
function juntarAdjuntos(answers: Record<string, unknown>): AttachmentRef[] {
  const salida: AttachmentRef[] = [];
  for (const valor of Object.values(answers)) {
    if (!Array.isArray(valor)) continue;
    for (const item of valor) {
      if (item && typeof item === 'object' && 'filename' in item && 'path' in item) {
        salida.push(item as AttachmentRef);
      }
    }
  }
  return salida;
}
