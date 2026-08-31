import { NextResponse } from 'next/server';

import { computeProgress } from '@/lib/questions/engine';
import { store } from '@/lib/store';

export const runtime = 'nodejs';

/** Envío final. Se rechaza si quedan obligatorias sin responder. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const client = await store.getClientByToken(token);
  if (!client) return NextResponse.json({ error: 'Enlace no válido.' }, { status: 404 });
  if (client.submittedAt) {
    return NextResponse.json({ enviado: true, yaEstaba: true });
  }

  const questions = await store.listQuestions();
  const progress = computeProgress(questions, client.niche, client.answers);

  if (client.niche === null) {
    return NextResponse.json(
      { error: 'Falta elegir el rubro del negocio.', pasos: [2] },
      { status: 422 },
    );
  }
  if (progress.missingRequired.length > 0) {
    return NextResponse.json(
      {
        error: `Faltan ${progress.missingRequired.length} respuestas obligatorias.`,
        pasos: progress.incompleteSteps,
        preguntas: progress.missingRequired.map((q) => ({ id: q.id, texto: q.text })),
      },
      { status: 422 },
    );
  }

  const now = new Date().toISOString();
  await store.updateClient(client.id, {
    status: 'recibido',
    submittedAt: now,
    lastActivityAt: now,
  });

  return NextResponse.json({ enviado: true });
}
