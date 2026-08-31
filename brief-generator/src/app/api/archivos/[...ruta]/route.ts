import { NextResponse } from 'next/server';

import { getAdmin } from '@/lib/auth';
import { store } from '@/lib/store';

export const runtime = 'nodejs';

/**
 * Entrega un adjunto. Sólo con sesión de administrador: los archivos que sube
 * el cliente no son públicos y su ruta no debe servir como llave de acceso.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ruta: string[] }> },
) {
  if (!(await getAdmin())) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { ruta } = await params;
  const path = ruta.map(decodeURIComponent).join('/');
  if (path.includes('..')) {
    return NextResponse.json({ error: 'Ruta no válida.' }, { status: 400 });
  }

  const file = await store.readFile(path);
  if (!file) return NextResponse.json({ error: 'Archivo no encontrado.' }, { status: 404 });

  const nombre = path.split('/').pop() ?? 'archivo';
  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      'content-type': file.mime,
      'content-disposition': `inline; filename="${nombre.replace(/"/g, '')}"`,
      'cache-control': 'private, no-store',
    },
  });
}
