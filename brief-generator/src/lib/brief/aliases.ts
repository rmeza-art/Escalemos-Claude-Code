import type { NicheId } from '../questions/types';

/**
 * Un mismo dato puede venir del catálogo general o del módulo del nicho: el
 * tratamiento prioritario de una clínica y el servicio prioritario de un
 * estudio jurídico ocupan el mismo lugar en el brief. Acá se declara, para
 * cada concepto, las preguntas que lo pueden responder, en orden de
 * preferencia.
 */
export const ALIASES = {
  nombreNegocio: ['odo_nombre_clinica', 'med_nombre', 'bel_nombre', 'con_empresa'],
  descripcion: ['neg_descripcion', 'otr_como_vende'],
  servicios: [
    'odo_tratamientos',
    'med_especialidades',
    'eco_categorias',
    'pro_servicios',
    'bel_tratamientos',
    'inm_proyectos',
    'ser_lista',
  ],
  servicioPrioritario: [
    'odo_tratamiento_prioritario',
    'med_prioritaria',
    'pro_prioritario',
    'inm_prioritario',
    'bel_prioritario',
    'ser_prioritario',
  ],
  prioridadEscala: ['odo_prioridad_escala', 'ser_prioridad_escala'],
  publico: ['odo_perfil_paciente', 'pub_perfil'],
  problemas: ['odo_problemas_pacientes', 'pub_problemas'],
  objeciones: ['pub_objeciones'],
  zonas: ['odo_sedes', 'med_sedes', 'bel_sedes', 'inm_comunas', 'pub_zonas'],
  horarios: ['odo_horarios', 'med_horarios', 'bel_horarios', 'inm_sala_ventas'],
  diferenciadores: ['odo_diferenciadores', 'neg_diferenciadores'],
  credenciales: ['odo_profesionales', 'med_profesionales', 'pro_equipo', 'bel_profesionales'],
  agendamiento: ['odo_agendamiento', 'med_agendamiento', 'bel_agendamiento', 'lead_canales'],
  postConsulta: ['odo_post_consulta', 'lead_seguimiento'],
  tiempoRespuesta: ['odo_tiempo_respuesta', 'lead_tiempo'],
  promociones: ['odo_promociones_detalle', 'inm_financiamiento'],
  restricciones: [
    'odo_restricciones',
    'med_restricciones',
    'pro_restricciones',
    'bel_restricciones',
    'otr_restricciones',
    'neg_restricciones',
  ],
  objetivo: ['neg_objetivo_3m'],
  meta: ['neg_meta_numerica'],
  imagenesConsentimiento: ['odo_fotos_casos', 'bel_antes_despues'],
} as const satisfies Record<string, readonly string[]>;

export type AliasKey = keyof typeof ALIASES;

/** Nichos donde hay que resguardar información de salud. */
export const HEALTH_NICHES: NicheId[] = ['odontologia', 'centro_medico', 'belleza_estetica'];
