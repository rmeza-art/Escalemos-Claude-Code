import { NextResponse } from 'next/server';

import { computeProgress } from '@/lib/questions/engine';
import type { NicheId } from '@/lib/questions/types';
import { store } from '@/lib/store';
import type { ProjectStatus } from '@/lib/types';
import { guardarSchema, mergeAnswers } from '@/lib/validation';

export const runtime = 'nodejs';

/** Guardado parcial: el cliente puede cerrar y volver después. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const client = await store.getClientByToken(token);
  if (!client) {
    return NextResponse.json({ error: 'Enlace no válido.' }, { status: 404 });
  }
  if (client.submittedAt) {
    return NextResponse.json(
      { error: 'Este formulario ya fue enviado. Escríbele a la agencia para reabrirlo.' },
      { status: 409 },
    );
  }

  const parsed = guardarSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos con formato incorrecto.' }, { status: 400 });
  }

  const questions = await store.listQuestions();
  const answers = mergeAnswers(questions, client.answers, parsed.data.respuestas);
  const niche = (parsed.data.nicho ?? client.niche) as NicheId | null;
  const progress = computeProgress(questions, niche, answers);

  // Mientras el cliente llena, el proyecto queda como incompleto; sólo el
  // envío final lo pasa a recibido.
  const status: ProjectStatus =
    client.status === 'borrador' || client.status === 'enviado' ? 'incompleto' : client.status;

  const updated = await store.updateClient(client.id, {
    answers,
    niche,
    status,
    lastActivityAt: new Date().toISOString(),
  });

  return NextResponse.json({
    guardado: true,
    progreso: progress.percent,
    actualizado: updated.updatedAt,
  });
}
