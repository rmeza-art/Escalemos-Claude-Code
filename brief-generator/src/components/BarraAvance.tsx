/** Barra compacta de porcentaje completado, para las listas del panel. */
export function BarraAvance({ porcentaje }: { porcentaje: number }) {
  const tono =
    porcentaje >= 90 ? 'bg-good' : porcentaje >= 40 ? 'bg-accent' : porcentaje > 0 ? 'bg-warn' : 'bg-line-strong';

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 w-20 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${porcentaje}% completado`}
      >
        <div className={`h-full rounded-full ${tono}`} style={{ width: `${porcentaje}%` }} />
      </div>
      <span className="text-sm tabular-nums text-muted">{porcentaje}%</span>
    </div>
  );
}
