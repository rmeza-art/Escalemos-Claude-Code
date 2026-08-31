'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { iniciarSesion, type AccionResultado } from '../acciones';

export function FormularioIngreso() {
  const [estado, accion] = useActionState<AccionResultado | null, FormData>(iniciarSesion, null);

  return (
    <form action={accion} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block font-medium text-ink">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoCapitalize="none"
          className="campo"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block font-medium text-ink">
          Clave
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="campo"
        />
      </div>

      {estado && !estado.ok && estado.mensaje && (
        <p role="alert" className="text-sm font-medium text-danger">
          {estado.mensaje}
        </p>
      )}

      <BotonIngresar />
    </form>
  );
}

function BotonIngresar() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primario w-full" disabled={pending}>
      {pending ? 'Entrando…' : 'Entrar'}
    </button>
  );
}
