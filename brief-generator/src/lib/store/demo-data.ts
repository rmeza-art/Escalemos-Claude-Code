import type { Answers } from '../questions/types';
import type { Client } from '../types';
import { EMPTY_OVERRIDES } from '../types';

/**
 * Datos de demostración. Tres proyectos en estados distintos para poder
 * recorrer el panel completo sin tener que llenar formularios a mano.
 *
 * Todo es inventado con fines de prueba: nombres, direcciones y teléfonos no
 * corresponden a ninguna clínica ni empresa real.
 */

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

const CLINICA_SONRIE: Answers = {
  con_nombre: 'Carolina Ibáñez',
  con_cargo: 'Socia y directora clínica',
  con_empresa: 'Clínica Dental Sonríe',
  con_email: 'carolina@clinicasonrie.cl',
  con_telefono: '+56 9 8123 4567',
  con_ciudad: 'Santiago, Ñuñoa',
  con_rut: '76.543.210-K',

  neg_descripcion:
    'Clínica dental de barrio con dos boxes. Atendemos familias del sector hace once años. La mayoría de los pacientes llega por recomendación de otro paciente.',
  neg_anos: 11,
  neg_tamano: '2_5',
  neg_diferenciadores:
    'Once años en la misma dirección.\nScanner intraoral propio, no mandamos a tomar impresiones afuera.\nPresupuesto por escrito antes de empezar cualquier tratamiento.\nConvenio vigente con dos isapres.',
  neg_competencia: 'Cadenas dentales del mall de Ñuñoa. Dos consultas particulares a tres cuadras.',
  neg_objetivo_3m:
    'Llenar la agenda de ortodoncia. Hoy tenemos el box de ortodoncia ocupado a menos de la mitad y es el tratamiento que más margen deja.',
  neg_meta_numerica: '15 evaluaciones de ortodoncia al mes',
  neg_temporada: 'Marzo y abril son los meses fuertes. Enero y febrero se cae todo.',
  neg_restricciones:
    'No podemos prometer resultados ni tiempos de tratamiento: depende de cada caso.',

  odo_nombre_clinica: 'Clínica Dental Sonríe',
  odo_tipo_centro: 'clinica',
  odo_especialidades: ['general', 'ortodoncia', 'endodoncia', 'odontopediatria', 'estetica'],
  odo_tratamientos:
    'Limpieza y destartraje\nTapaduras y restauraciones\nOrtodoncia con brackets metálicos y estéticos\nEndodoncia\nBlanqueamiento\nUrgencias dentales',
  odo_tratamiento_prioritario: 'Ortodoncia con brackets',
  odo_prioridad_escala: '4',
  odo_sedes:
    'Una sola sede en Irarrázaval 3400, Ñuñoa. Llegan pacientes de Ñuñoa, Providencia, La Reina y Macul.',
  odo_horarios: 'Lunes a viernes de 9:00 a 19:00. Sábados de 9:00 a 14:00.',
  odo_perfil_paciente:
    'Adultos entre 25 y 45 años que quieren ordenarse los dientes y nunca usaron ortodoncia de chicos. También mamás que traen a sus hijos y de paso preguntan por ellas.',
  odo_problemas_pacientes:
    'Les incomoda cómo se ven los dientes en las fotos. Creen que la ortodoncia es sólo para adolescentes. Piensan que va a ser carísimo y no se atreven a preguntar el precio.',
  odo_diferenciadores:
    'Once años atendiendo en la misma dirección.\nScanner intraoral: la evaluación se hace en la misma consulta.\nPresupuesto escrito antes de empezar.\nConvenio vigente con Consalud y Colmena.',
  odo_profesionales:
    'Carolina Ibáñez, cirujano dentista, Universidad de Chile, 2011.\nMatías Rojas, ortodoncista, especialidad en la Universidad de los Andes, 2016.\nAmbos con registro vigente en la Superintendencia de Salud.',
  odo_agendamiento: ['telefono', 'whatsapp', 'presencial'],
  odo_post_consulta:
    'Contesta Paulina en recepción. Pregunta qué necesita, ofrece una evaluación y le da dos alternativas de hora. Después manda un recordatorio por WhatsApp el día antes.',
  odo_tiempo_respuesta: '1_4h',
  odo_promociones: true,
  odo_promociones_detalle:
    'Evaluación de ortodoncia sin costo, incluye scanner. Vigente todo el año.\nPlan de ortodoncia en 12 cuotas sin interés con tarjeta de crédito bancaria.',
  odo_restricciones:
    'No se puede prometer un tiempo de tratamiento ni un resultado específico. No usamos fotos de pacientes sin consentimiento firmado.',
  odo_fotos_casos: 'si_sin_firma',

  ser_lista:
    'Ortodoncia\nLimpieza y destartraje\nEndodoncia\nBlanqueamiento\nOdontopediatría\nUrgencias',
  ser_prioritario: 'Ortodoncia con brackets',
  ser_prioridad_escala: '4',
  ser_ticket: 1200000,
  ser_margen: 'Ortodoncia',
  ser_no_promocionar: 'Urgencias. No damos abasto y no queremos más de las que ya llegan.',
  ser_capacidad: 15,

  pub_perfil:
    'Adultos de 25 a 45, con trabajo estable, que viven o trabajan cerca de Ñuñoa. Capacidad de pagar en cuotas, no al contado.',
  pub_problemas:
    'No les gusta cómo se ven los dientes al sonreír. Postergaron el tema por años. Quieren saber cuánto cuesta antes de ir.',
  pub_objeciones:
    'El precio, siempre. Cuánto va a durar. Si se va a notar mucho en el trabajo. Si tienen que ir todas las semanas.',
  pub_zonas: 'Ñuñoa, Providencia, La Reina, Macul y Peñalolén.',
  pub_modalidad: 'presencial',
  pub_tono: 'cercano',

  web_tiene: true,
  web_url: 'https://clinicasonrie.cl',
  web_plataforma: 'WordPress, la hizo un sobrino y no la toca nadie hace dos años.',
  web_landing_tiene: false,
  web_formularios: 'Hay un formulario de contacto, llega a un correo que nadie revisa.',
  web_whatsapp: false,
  web_problemas: 'Se ve mal en el celular y los precios están desactualizados.',

  cam_anteriores: true,
  cam_detalle:
    'Probamos Instagram el 2023 con posteos promocionados. Llegaron consultas pero todas preguntando precio y ninguna agendó. Gastamos como 400 mil en tres meses.',
  cam_inversion: 600000,
  cam_fotos: true,
  cam_videos: false,
  cam_piezas: false,
  cam_manual_marca: false,
  cam_redes: ['instagram', 'facebook'],
  cam_redes_urls: 'https://instagram.com/clinicasonriedemo',

  acc_meta: 'si_sin_acceso',
  acc_pixel: 'no_existe',
  acc_google_ads: 'no_existe',
  acc_analytics: 'no_se',
  acc_tag_manager: 'no_se',
  acc_gmb: 'si_con_acceso',
  acc_hosting: 'si_sin_acceso',
  acc_responsable: 'Carolina Ibáñez, carolina@clinicasonrie.cl',

  lead_canales: ['whatsapp', 'telefono', 'presencial', 'recomendacion'],
  lead_quien: 'Paulina, la recepcionista, de lunes a viernes',
  lead_horario: '9:00 a 19:00, en los ratos que no hay pacientes en el mesón',
  lead_tiempo: '1_4h',
  lead_registro: 'agenda',
  lead_seguimiento:
    'Si no contesta, Paulina insiste una vez a los dos días. Si no responde ahí, queda ahí.',
  lead_cierre: 'Sabemos que cerró cuando el paciente llega a la evaluación y firma el presupuesto.',

  arch_notas:
    'Tenemos fotos de la consulta que sacó un fotógrafo el año pasado. Del equipo hay pocas.',
};

const BOUTIQUE: Answers = {
  con_nombre: 'Daniela Soto',
  con_cargo: 'Fundadora',
  con_empresa: 'Vera Boutique',
  con_email: 'daniela@veraboutique.cl',
  con_telefono: '+56 9 7654 3210',
  con_ciudad: 'Valparaíso, Viña del Mar',
  neg_descripcion:
    'Tienda online de ropa de mujer con diseño propio. Producción chilena en tiradas cortas.',
  neg_anos: 3,
  neg_tamano: '2_5',
  neg_diferenciadores:
    'Producción en Chile, tiradas de menos de 40 unidades por diseño.\nCambios sin costo dentro de 30 días.',
  neg_objetivo_3m: 'Bajar el costo por venta y dejar de depender de los descuentos.',
  ser_lista: 'Vestidos\nBlusas\nPantalones\nAbrigos',
  ser_prioritario: 'Abrigos de temporada',
  ser_prioridad_escala: '3',
  eco_plataforma: 'shopify',
  eco_url: 'https://veraboutique.cl',
  eco_categorias: 'Vestidos, blusas, pantalones, abrigos',
  eco_top_productos: 'Abrigo Lena\nVestido Mara',
  eco_sku: 84,
  eco_ticket: 58000,
  eco_despacho: 'Starken y Chilexpress a todo Chile. Despacho gratis sobre $50.000.',
  eco_pagos: ['webpay', 'transferencia', 'mercadopago'],
  eco_feed: 'meta',
  pub_perfil: 'Mujeres de 28 a 45, profesionales, de Santiago y la V región.',
  pub_problemas: 'Buscan ropa que no vean puesta en todo el mundo.',
  pub_zonas: 'Todo Chile, con foco en Región Metropolitana y Valparaíso.',
  web_tiene: true,
  web_url: 'https://veraboutique.cl',
  cam_anteriores: true,
  cam_inversion: 900000,
  acc_meta: 'si_con_acceso',
  acc_google_ads: 'no_existe',
  lead_canales: ['instagram', 'formulario'],
  lead_quien: 'Daniela, ella misma',
};

export function seedClients(): Client[] {
  const base = {
    briefOverrides: EMPTY_OVERRIDES,
    submittedAt: null as string | null,
  };
  return [
    {
      ...base,
      id: 'cli_demo_sonrie',
      contactName: 'Carolina Ibáñez',
      company: 'Clínica Dental Sonríe',
      email: 'carolina@clinicasonrie.cl',
      phone: '+56 9 8123 4567',
      niche: 'odontologia',
      status: 'recibido',
      token: 'demo-sonrie-2f7a91c4',
      internalNotes:
        'Viene por recomendación de otro cliente. Reunión inicial hecha el 12 de agosto.',
      answers: CLINICA_SONRIE,
      createdAt: daysAgo(9),
      updatedAt: daysAgo(2),
      lastActivityAt: daysAgo(2),
      submittedAt: daysAgo(2),
    },
    {
      ...base,
      id: 'cli_demo_vera',
      contactName: 'Daniela Soto',
      company: 'Vera Boutique',
      email: 'daniela@veraboutique.cl',
      phone: '+56 9 7654 3210',
      niche: 'ecommerce',
      status: 'incompleto',
      token: 'demo-vera-8b3d5e10',
      internalNotes: 'Quedó a medias en el paso de accesos. Recordarle el viernes.',
      answers: BOUTIQUE,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
      lastActivityAt: daysAgo(1),
    },
    {
      ...base,
      id: 'cli_demo_altura',
      contactName: 'Rodrigo Peña',
      company: 'Altura Propiedades',
      email: 'rodrigo@alturapropiedades.cl',
      phone: '+56 9 5555 1212',
      niche: null,
      status: 'enviado',
      token: 'demo-altura-c19f4a77',
      internalNotes: 'Enlace enviado el lunes. Todavía no lo abre.',
      answers: {},
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
      lastActivityAt: daysAgo(3),
    },
  ];
}
