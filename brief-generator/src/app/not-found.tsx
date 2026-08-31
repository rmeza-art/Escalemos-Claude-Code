import Link from 'next/link';

export default function NoEncontrado() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-12 text-center">
      <h1 className="text-2xl font-semibold">No encontramos esta página</h1>
      <p className="mt-2">
        Si llegaste con un enlace de formulario, puede que haya sido reemplazado. Escríbele a la
        agencia para pedir uno nuevo.
      </p>
      <Link href="/" className="btn btn-secundario mx-auto mt-6">
        Ir al inicio
      </Link>
    </main>
  );
}
