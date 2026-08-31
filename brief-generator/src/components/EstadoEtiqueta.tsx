import { PROJECT_STATUSES, type ProjectStatus } from '@/lib/types';

const ESTILOS: Record<ProjectStatus, string> = {
  borrador: 'bg-canvas text-muted border border-line-strong',
  enviado: 'bg-accent-soft text-accent',
  incompleto: 'bg-warn-soft text-warn',
  recibido: 'bg-info-soft text-info',
  en_revision: 'bg-info-soft text-info',
  aprobado: 'bg-good-soft text-good',
};

export function EstadoEtiqueta({ estado }: { estado: ProjectStatus }) {
  const definicion = PROJECT_STATUSES.find((s) => s.id === estado);
  return (
    <span className={`etiqueta ${ESTILOS[estado]}`} title={definicion?.description}>
      {definicion?.label ?? estado}
    </span>
  );
}
