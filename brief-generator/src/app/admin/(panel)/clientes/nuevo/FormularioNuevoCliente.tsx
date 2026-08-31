'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { NICHES } from '@/lib/questions/types';

import { crearCliente, type AccionResultado } from '../../../acciones';

export function FormularioNuevoCliente() {
  const [estado, accion] = useActionState<AccionResultado | null, FormData>(crearCliente, null);

  return (
    <form action={accion} className="tarjeta mt-6 space-y-5 p-5 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="company" label="Empresa o marca" required />
        <Campo id="contactName" label="Persona de contacto" required />
        <Campo id="email" label="Correo" type="email" required />
        <Campo id="phone" label="Teléfono" type="tel" />
      </div>

      <div>
        <label htmlFor="niche" className="mb-1 block font-medium text-ink">
          Nicho <span className="ml-1 text-sm font-normal text-muted">(opcional)</span>
        </label>
        <select id="niche" name="niche" className="campo" defaultValue="">
          <option value="">Que lo elija el cliente</option>
          {NICHES.map((niche) => (
            <option key={niche.id} value={niche.id}>
              {niche.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-muted">
          Si lo dejas en blanco, el cliente lo elige en el paso 2 del formulario.
        </p>
      </div>

      <div>
        <label htmlFor="internalNotes" className="mb-1 block font-medium text-ink">
          Notas internas <span className="ml-1 text-sm font-normal text-muted">(opcional)</span>
        </label>
        <textarea id="internalNotes" name="internalNotes" rows={3} className="campo" />
        <p className="mt-1 text-sm text-muted">El cliente no ve estas notas.</p>
      </div>

      {estado && !estado.ok && estado.mensaje && (
        <p role="alert" className="text-sm font-medium text-danger">
          {estado.mensaje}
        </p>
      )}

      <Boton />
    </form>
  );
}

function Campo({
  id,
  label,
  type = 'text',
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-medium text-ink">
        {label}
        {!required && <span className="ml-1 text-sm font-normal text-muted">(opcional)</span>}
      </label>
      <input id={id} name={id} type={type} required={required} className="campo" />
    </div>
  );
}

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primario" disabled={pending}>
      {pending ? 'Creando…' : 'Crear y generar enlace'}
    </button>
  );
}
