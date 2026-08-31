import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import { ALLOWED_UPLOAD_MIME, MAX_UPLOAD_BYTES } from '@/lib/config';
import type { AttachmentRef } from '@/lib/questions/types';
import { store } from '@/lib/store';

export const runtime = 'nodejs';

/** Sube un adjunto del cliente. La respuesta se guarda aparte, con /guardar. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const client = await store.getClientByToken(token);
  if (!client) return NextResponse.json({ error: 'Enlace no válido.' }, { status: 404 });
  if (client.submittedAt) {
    return NextResponse.json({ error: 'El formulario ya fue enviado.' }, { status: 409 });
  }

  const form = await request.formData();
  const file = form.get('archivo');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No llegó ningún archivo.' }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'El archivo está vacío.' }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `El archivo pesa más de ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.` },
      { status: 413 },
    );
  }
  const mime = file.type || 'application/octet-stream';
  if (!ALLOWED_UPLOAD_MIME.includes(mime)) {
    return NextResponse.json(
      { error: 'Ese tipo de archivo no está permitido. Sube imágenes, videos, PDF o documentos.' },
      { status: 415 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const path = await store.uploadFile(client.id, file.name, mime, bytes);

  const adjunto: AttachmentRef = {
    id: randomUUID(),
    filename: file.name,
    size: file.size,
    mime,
    path,
    uploadedAt: new Date().toISOString(),
  };

  await store.updateClient(client.id, { lastActivityAt: new Date().toISOString() });

  return NextResponse.json({ adjunto });
}

/** Borra un adjunto. Sólo dentro de la carpeta del propio cliente. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const client = await store.getClientByToken(token);
  if (!client) return NextResponse.json({ error: 'Enlace no válido.' }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { path?: string };
  const path = body.path ?? '';
  if (!path.startsWith(`${client.id}/`) || path.includes('..')) {
    return NextResponse.json({ error: 'Ruta no válida.' }, { status: 400 });
  }

  await store.deleteFile(path);
  return NextResponse.json({ borrado: true });
}
