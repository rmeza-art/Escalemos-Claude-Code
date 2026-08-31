import type { Metadata } from 'next';
import Link from 'next/link';

import { FormularioNuevoCliente } from './FormularioNuevoCliente';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Nuevo cliente · Generador de Brief' };

export default function NuevoClientePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/clientes" className="enlace text-sm">
        ← Volver a clientes
      </Link>
      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Crear cliente</h1>
      <p className="mt-1 text-muted">
        Con esto se genera el enlace privado del formulario. El cliente puede corregir estos datos
        en el paso 1.
      </p>
      <FormularioNuevoCliente />
    </div>
  );
}
