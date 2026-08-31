import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { Formulario } from '@/components/formulario/Formulario';
import { TOTAL_STEPS } from '@/lib/questions/engine';
import { store } from '@/lib/store';
import { clientDisplayName } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Formulario de onboarding',
  robots: { index: false, follow: false },
};

export default async function FormularioPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paso?: string }>;
}) {
  const { token } = await params;
  const client = await store.getClientByToken(token);
  if (!client) notFound();

  if (client.submittedAt) redirect(`/f/${token}/gracias`);

  const questions = await store.listQuestions();
  const { paso } = await searchParams;
  const pasoInicial = Math.min(Math.max(Number(paso) || 1, 1), TOTAL_STEPS);

  return (
    <Formulario
      token={token}
      questions={questions}
      answersIniciales={client.answers}
      nicheInicial={client.niche}
      pasoInicial={pasoInicial}
      empresa={clientDisplayName(client)}
    />
  );
}
