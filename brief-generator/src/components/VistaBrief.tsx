import type { AccessState, Brief, BriefBlock } from '@/lib/brief/types';

/**
 * Vista previa del brief en pantalla. Es el mismo contenido que sale al PDF,
 * con la misma separación entre lo confirmado, lo que falta, los supuestos y
 * las acciones de cada lado.
 */

const ESTADO_ACCESO: Record<AccessState, { label: string; clase: string }> = {
  disponible: { label: 'Disponible', clase: 'bg-good-soft text-good' },
  existe_sin_acceso: { label: 'Sin acceso', clase: 'bg-warn-soft text-warn' },
  no_existe: { label: 'No existe', clase: 'bg-canvas text-muted border border-line-strong' },
  sin_dato: { label: 'Sin dato', clase: 'bg-info-soft text-info' },
};

const AVISO = {
  falta: { clase: 'border-warn bg-warn-soft text-warn', label: 'Información faltante' },
  supuesto: { clase: 'border-info bg-info-soft text-info', label: 'Supuesto por validar' },
  nota: { clase: 'border-accent bg-accent-soft text-accent', label: 'Nota' },
};

export function VistaBrief({ brief }: { brief: Brief }) {
  const obligatoriasFaltantes = brief.missing.filter((m) => m.required);
  const opcionalesFaltantes = brief.missing.filter((m) => !m.required);

  return (
    <article className="space-y-8">
      <header className="tarjeta p-5 sm:p-6">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">
          Brief de onboarding
        </p>
        <h2 className="mt-1 text-2xl font-semibold">{brief.company}</h2>
        <p className="mt-1 text-muted">
          {brief.nicheLabel} · {brief.status} · {brief.coverage}% completado (
          {brief.answeredCount} de {brief.visibleCount} preguntas)
        </p>
        <p className="mt-4 rounded-md border-l-4 border-accent bg-accent-soft px-4 py-3 text-sm">
          Las secciones 1 a 9 contienen sólo información confirmada por el cliente y propuestas de
          la agencia. Lo que falta, los supuestos y las acciones van separados al final. Nada de lo
          que el cliente no respondió fue redactado por la agencia.
        </p>
      </header>

      {brief.sections.map((section) => (
        <section key={section.id} className="tarjeta p-5 sm:p-6">
          <h3 className="mb-4 border-b border-line pb-2 text-lg font-semibold">
            {section.number}. {section.title}
          </h3>
          <div className="space-y-3">
            {section.blocks.map((block, i) => (
              <Bloque key={i} block={block} />
            ))}
          </div>
        </section>
      ))}

      <section className="tarjeta p-5 sm:p-6">
        <h3 className="mb-4 border-b border-line pb-2 text-lg font-semibold">
          Información faltante en detalle
        </h3>
        {brief.missing.length === 0 ? (
          <p>No falta ninguna respuesta.</p>
        ) : (
          <div className="space-y-5">
            {obligatoriasFaltantes.length > 0 && (
              <div>
                <h4 className="font-semibold text-warn">
                  Obligatorias sin responder ({obligatoriasFaltantes.length})
                </h4>
                <ul className="mt-2 space-y-2">
                  {obligatoriasFaltantes.map((item) => (
                    <li key={item.questionId} className="rounded-md bg-warn-soft px-3 py-2">
                      <p className="font-medium text-ink">{item.question}</p>
                      <p className="text-sm text-muted">
                        Paso {item.step} · {item.stepTitle}
                        {item.why ? ` — ${item.why}` : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {opcionalesFaltantes.length > 0 && (
              <div>
                <h4 className="font-semibold text-ink">
                  Opcionales sin responder ({opcionalesFaltantes.length})
                </h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {opcionalesFaltantes.map((item) => (
                    <li key={item.questionId}>
                      {item.question} <span className="text-muted">(paso {item.step})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <ListaFinal
        titulo="Supuestos que requieren validación"
        items={brief.assumptions}
        vacio="No hubo que asumir nada: la información entregada alcanza para el alcance de este brief."
        tono="info"
      />
      <ListaFinal
        titulo="Acciones que le corresponden al cliente"
        items={brief.clientActions}
        vacio="Sin acciones pendientes del cliente."
        tono="warn"
      />
      <ListaFinal
        titulo="Acciones que le corresponden a la agencia"
        items={brief.agencyActions}
        vacio="Sin acciones pendientes de la agencia."
        tono="accent"
      />

      {brief.agencyNotes.trim() && (
        <section className="tarjeta p-5 sm:p-6">
          <h3 className="mb-3 border-b border-line pb-2 text-lg font-semibold">
            Notas internas de la agencia
          </h3>
          <p className="whitespace-pre-line">{brief.agencyNotes}</p>
        </section>
      )}
    </article>
  );
}

function ListaFinal({
  titulo,
  items,
  vacio,
  tono,
}: {
  titulo: string;
  items: string[];
  vacio: string;
  tono: 'info' | 'warn' | 'accent';
}) {
  const borde =
    tono === 'info' ? 'border-l-info' : tono === 'warn' ? 'border-l-warn' : 'border-l-accent';

  return (
    <section className={`tarjeta border-l-4 p-5 sm:p-6 ${borde}`}>
      <h3 className="mb-3 text-lg font-semibold">{titulo}</h3>
      {items.length === 0 ? (
        <p className="text-muted">{vacio}</p>
      ) : (
        <ul className="list-disc space-y-1.5 pl-5">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Bloque({ block }: { block: BriefBlock }) {
  switch (block.kind) {
    case 'parrafo':
      return <p className="whitespace-pre-line">{block.text}</p>;

    case 'lista':
      return (
        <ul className="list-disc space-y-1 pl-5">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case 'datos':
      return (
        <dl className="divide-y divide-line rounded-md border border-line">
          {block.items.map((item, i) => (
            <div key={i} className="px-3 py-2 sm:flex sm:gap-4">
              <dt className="text-sm font-medium text-ink sm:w-1/3 sm:shrink-0">{item.term}</dt>
              <dd className="whitespace-pre-line sm:flex-1">{item.value}</dd>
            </div>
          ))}
        </dl>
      );

    case 'checklist':
      return (
        <ul className="divide-y divide-line rounded-md border border-line">
          {block.items.map((item, i) => {
            const estado = ESTADO_ACCESO[item.state];
            return (
              <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5">
                <span className="min-w-40 flex-1 font-medium text-ink">{item.label}</span>
                <span className={`etiqueta ${estado.clase}`}>{estado.label}</span>
                {item.action && <span className="w-full text-sm text-muted sm:w-auto sm:flex-1">{item.action}</span>}
              </li>
            );
          })}
        </ul>
      );

    case 'bloques_landing':
      return (
        <div className="space-y-3">
          {block.items.map((item, i) => (
            <div key={i} className="rounded-md border border-line p-3">
              <h4 className="font-semibold text-ink">{item.title}</h4>
              {item.content.length > 0 && (
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
                  {item.content.map((c, j) => (
                    <li key={j}>{c}</li>
                  ))}
                </ul>
              )}
              {item.missing.length > 0 && (
                <div className="mt-2 rounded bg-warn-soft px-3 py-2">
                  <p className="text-sm font-semibold text-warn">Falta para poder escribirla:</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-warn">
                    {item.missing.map((m, j) => (
                      <li key={j}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case 'fases':
      return (
        <div className="space-y-3">
          {block.items.map((phase, i) => (
            <div key={i} className="rounded-md border border-line p-3">
              <h4 className="font-semibold text-ink">
                {phase.title} <span className="font-normal text-muted">· {phase.timeframe}</span>
              </h4>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
                {phase.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'aviso': {
      const tono = AVISO[block.tone];
      return (
        <div className={`rounded-md border-l-4 px-4 py-3 ${tono.clase}`}>
          <p className="text-sm font-semibold">{tono.label}</p>
          <p className="mt-0.5 text-sm text-body">{block.text}</p>
        </div>
      );
    }

    default:
      return null;
  }
}
