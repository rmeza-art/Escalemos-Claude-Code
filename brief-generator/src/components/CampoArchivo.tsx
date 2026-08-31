'use client';

import { useRef, useState } from 'react';

import type { AttachmentRef } from '@/lib/questions/types';

/** Sube archivos al servidor y muestra los que ya están cargados. */
export function CampoArchivo({
  questionId,
  token,
  value,
  disabled,
  onChange,
}: {
  questionId: string;
  token: string;
  value: AttachmentRef[];
  disabled?: boolean;
  onChange: (value: AttachmentRef[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subir(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setSubiendo(true);
    const subidos: AttachmentRef[] = [];
    try {
      for (const file of Array.from(files)) {
        const cuerpo = new FormData();
        cuerpo.append('archivo', file);
        cuerpo.append('preguntaId', questionId);
        const respuesta = await fetch(`/api/formulario/${token}/archivos`, {
          method: 'POST',
          body: cuerpo,
        });
        const datos = (await respuesta.json()) as { adjunto?: AttachmentRef; error?: string };
        if (!respuesta.ok || !datos.adjunto) {
          throw new Error(datos.error ?? 'No se pudo subir el archivo.');
        }
        subidos.push(datos.adjunto);
      }
      onChange([...value, ...subidos]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir el archivo.');
    } finally {
      setSubiendo(false);
      if (input.current) input.current.value = '';
    }
  }

  async function eliminar(adjunto: AttachmentRef) {
    onChange(value.filter((a) => a.id !== adjunto.id));
    await fetch(`/api/formulario/${token}/archivos`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path: adjunto.path }),
    }).catch(() => undefined);
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        multiple
        className="sr-only"
        disabled={disabled || subiendo}
        onChange={(e) => void subir(e.target.files)}
      />

      <button
        type="button"
        className="btn btn-secundario w-full sm:w-auto"
        disabled={disabled || subiendo}
        onClick={() => input.current?.click()}
      >
        {subiendo ? 'Subiendo…' : value.length > 0 ? 'Agregar más archivos' : 'Elegir archivos'}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="mt-3 space-y-2">
          {value.map((adjunto) => (
            <li
              key={adjunto.id}
              className="flex items-center justify-between gap-3 rounded-md border border-line bg-canvas px-3 py-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">
                  {adjunto.filename}
                </span>
                <span className="text-xs text-muted">{formatBytes(adjunto.size)}</span>
              </span>
              {!disabled && (
                <button
                  type="button"
                  className="shrink-0 rounded px-2 py-1 text-sm text-danger hover:bg-danger/5"
                  onClick={() => void eliminar(adjunto)}
                >
                  Quitar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
