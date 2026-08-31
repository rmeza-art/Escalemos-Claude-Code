import { NextResponse } from 'next/server';

import { getAdmin } from '@/lib/auth';
import { applyOverrides, generateBrief } from '@/lib/brief/generate';
import { renderBriefPdf } from '@/lib/brief/pdf';
import { store } from '@/lib/store';
import { clientDisplayName } from '@/lib/types';

export const runtime = 'nodejs';

/** Descarga del brief en PDF. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { id } = await params;
  const client = await store.getClient(id);
  if (!client) return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 });

  const questions = await store.listQuestions();
  const brief = applyOverrides(generateBrief(questions, client), client);
  const pdf = await renderBriefPdf(brief);

  const nombre = `brief-${slugify(clientDisplayName(client))}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${nombre}"`,
      'cache-control': 'private, no-store',
    },
  });
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'cliente'
  );
}
