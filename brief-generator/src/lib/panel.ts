import 'server-only';

import { computeProgress } from './questions/engine';
import type { Question } from './questions/types';
import { store } from './store';
import { clientDisplayName, type Client } from './types';

export interface ResumenCliente {
  client: Client;
  nombre: string;
  porcentaje: number;
  faltanObligatorias: number;
}

/** Los clientes con su porcentaje ya calculado, para las vistas del panel. */
export async function cargarResumen(): Promise<{
  clientes: ResumenCliente[];
  questions: Question[];
}> {
  const [clients, questions] = await Promise.all([store.listClients(), store.listQuestions()]);

  const clientes = clients.map<ResumenCliente>((client) => {
    const progreso = computeProgress(questions, client.niche, client.answers);
    return {
      client,
      nombre: clientDisplayName(client),
      porcentaje: progreso.percent,
      faltanObligatorias: progreso.missingRequired.length,
    };
  });

  return { clientes, questions };
}

/** «hace 3 días», «hoy». El panel se lee más rápido así que con fechas. */
export function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutos = Math.round(diff / 60000);
  if (minutos < 1) return 'recién';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  if (dias === 1) return 'ayer';
  if (dias < 30) return `hace ${dias} días`;
  const meses = Math.round(dias / 30);
  return meses === 1 ? 'hace un mes' : `hace ${meses} meses`;
}

export function fechaLarga(iso: string): string {
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso),
  );
}
