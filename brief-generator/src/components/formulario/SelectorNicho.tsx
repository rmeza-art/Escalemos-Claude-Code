'use client';

import { NICHES, type NicheId } from '@/lib/questions/types';

const DESCRIPCIONES: Record<NicheId, string> = {
  odontologia: 'Clínicas y consultas dentales.',
  centro_medico: 'Consultas, centros médicos y prestadores de salud.',
  ecommerce: 'Tiendas online que venden productos.',
  servicios_profesionales: 'Estudios, consultoras y profesionales independientes.',
  inmobiliaria: 'Corretaje, proyectos y venta de propiedades.',
  belleza_estetica: 'Peluquerías, spas, centros de estética y barberías.',
  otro: 'Ninguna de las anteriores.',
};

/** Paso 2: define qué preguntas se muestran en el paso 4. */
export function SelectorNicho({
  valor,
  onChange,
}: {
  valor: NicheId | null;
  onChange: (niche: NicheId) => void;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="sr-only">Elige el rubro de tu negocio</legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {NICHES.map((niche) => {
          const activo = valor === niche.id;
          return (
            <label
              key={niche.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                activo
                  ? 'border-accent bg-accent-soft'
                  : 'border-line-strong bg-surface hover:border-muted'
              }`}
            >
              <input
                type="radio"
                name="nicho"
                className="mt-1 size-4 accent-[var(--color-accent)]"
                checked={activo}
                onChange={() => onChange(niche.id)}
              />
              <span>
                <span className="block font-medium text-ink">{niche.label}</span>
                <span className="mt-0.5 block text-sm text-muted">{DESCRIPCIONES[niche.id]}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
