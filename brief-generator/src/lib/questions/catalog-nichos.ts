import { q, opts } from './catalog-general';
import type { Question } from './types';

/**
 * Módulos del paso 4 para el resto de los nichos. Todos heredan el catálogo
 * general; acá va sólo lo propio de cada rubro.
 */

const CENTRO_MEDICO: Question[] = [
  q({ id: 'med_nombre', niche: 'centro_medico', category: 'especifico', text: 'Nombre del centro médico', type: 'texto_corto', required: true, order: 10 }),
  q({
    id: 'med_especialidades', niche: 'centro_medico', category: 'especifico',
    text: '¿Qué especialidades atienden?', type: 'texto_largo', required: true, order: 20,
    help: 'Una por línea.',
  }),
  q({
    id: 'med_prioritaria', niche: 'centro_medico', category: 'especifico',
    text: '¿Qué especialidad o prestación quieres priorizar?', type: 'texto_corto', required: true, order: 30,
  }),
  q({ id: 'med_sedes', niche: 'centro_medico', category: 'especifico', text: '¿Qué sedes tienen y qué comunas atienden?', type: 'texto_largo', required: true, order: 40 }),
  q({ id: 'med_horarios', niche: 'centro_medico', category: 'especifico', text: 'Horarios de atención', type: 'texto_largo', required: true, order: 50 }),
  q({
    id: 'med_convenios', niche: 'centro_medico', category: 'especifico',
    text: '¿Con qué previsiones o seguros tienen convenio vigente?', type: 'texto_largo', order: 60,
    help: 'Fonasa, isapres, seguros complementarios. Sólo convenios vigentes.',
  }),
  q({
    id: 'med_agendamiento', niche: 'centro_medico', category: 'especifico',
    text: '¿Cómo se agenda hoy una hora?', type: 'seleccion_multiple', required: true, order: 70,
    options: opts(['telefono', 'Por teléfono'], ['whatsapp', 'Por WhatsApp'], ['formulario', 'Formulario de la web'], ['agenda_online', 'Agenda online'], ['redes', 'Mensajes de redes sociales'], ['presencial', 'Presencial']),
  }),
  q({ id: 'med_profesionales', niche: 'centro_medico', category: 'especifico', text: '¿Qué profesionales atienden y qué credenciales podemos comunicar?', type: 'texto_largo', required: true, order: 80, help: 'Sólo lo vigente y acreditable.' }),
  q({
    id: 'med_restricciones', niche: 'centro_medico', category: 'especifico',
    text: '¿Qué restricciones legales o sanitarias hay para comunicar?', type: 'texto_largo', required: true, order: 90,
    help: 'No pedimos ni publicamos datos clínicos ni información de pacientes.',
  }),
];

const ECOMMERCE: Question[] = [
  q({
    id: 'eco_plataforma', niche: 'ecommerce', category: 'especifico',
    text: '¿En qué plataforma está la tienda?', type: 'seleccion_unica', required: true, order: 10,
    options: opts('Shopify', 'WooCommerce', ['jumpseller', 'Jumpseller'], ['vtex', 'VTEX'], ['tiendanube', 'Tiendanube'], ['propia', 'Desarrollo propio'], ['no_tiene', 'Todavía no tenemos tienda']),
  }),
  q({ id: 'eco_url', niche: 'ecommerce', category: 'especifico', text: 'Dirección de la tienda', type: 'url', order: 20, conditions: [{ questionId: 'eco_plataforma', operator: 'distinto', value: 'no_tiene' }] }),
  q({ id: 'eco_categorias', niche: 'ecommerce', category: 'especifico', text: '¿Qué categorías de productos venden?', type: 'texto_largo', required: true, order: 30 }),
  q({ id: 'eco_top_productos', niche: 'ecommerce', category: 'especifico', text: '¿Cuáles son los productos que más venden?', type: 'texto_largo', required: true, order: 40 }),
  q({ id: 'eco_sku', niche: 'ecommerce', category: 'especifico', text: '¿Cuántos productos tienen publicados?', type: 'numero', order: 50 }),
  q({ id: 'eco_ticket', niche: 'ecommerce', category: 'especifico', text: 'Ticket promedio de una orden, en pesos', type: 'numero', order: 60 }),
  q({
    id: 'eco_despacho', niche: 'ecommerce', category: 'especifico',
    text: '¿Cómo despachan y a qué zonas?', type: 'texto_largo', required: true, order: 70,
    help: 'Couriers, plazos y si hay despacho gratis desde algún monto.',
  }),
  q({
    id: 'eco_pagos', niche: 'ecommerce', category: 'especifico',
    text: '¿Qué medios de pago aceptan?', type: 'seleccion_multiple', order: 80,
    options: opts(['webpay', 'Webpay'], ['mercadopago', 'Mercado Pago'], ['transferencia', 'Transferencia'], ['flow', 'Flow'], ['khipu', 'Khipu'], ['tarjeta_int', 'Tarjetas internacionales'], ['efectivo', 'Efectivo contra entrega']),
  }),
  q({ id: 'eco_feed', niche: 'ecommerce', category: 'especifico', text: '¿Tienen catálogo conectado a Meta o Google Merchant Center?', type: 'seleccion_unica', order: 90, options: opts(['ambos', 'Sí, en ambos'], ['meta', 'Sólo en Meta'], ['google', 'Sólo en Google'], ['no', 'No'], ['no_se', 'No lo sé']) }),
  q({ id: 'eco_devoluciones', niche: 'ecommerce', category: 'especifico', text: '¿Cuál es la política de cambios y devoluciones?', type: 'texto_largo', order: 100, help: 'Escríbela tal como está publicada.' }),
  q({ id: 'eco_stock', niche: 'ecommerce', category: 'especifico', text: '¿Hay problemas de stock o de temporada que debamos considerar?', type: 'texto_largo', order: 110 }),
];

const SERVICIOS_PROFESIONALES: Question[] = [
  q({ id: 'pro_rubro', niche: 'servicios_profesionales', category: 'especifico', text: '¿Cuál es tu profesión o rubro exacto?', type: 'texto_corto', required: true, order: 10, placeholder: 'Ej.: estudio jurídico especializado en derecho laboral' }),
  q({ id: 'pro_servicios', niche: 'servicios_profesionales', category: 'especifico', text: '¿Qué servicios prestan?', type: 'texto_largo', required: true, order: 20, help: 'Uno por línea.' }),
  q({ id: 'pro_prioritario', niche: 'servicios_profesionales', category: 'especifico', text: '¿Qué servicio quieres priorizar?', type: 'texto_corto', required: true, order: 30 }),
  q({
    id: 'pro_modelo_cobro', niche: 'servicios_profesionales', category: 'especifico',
    text: '¿Cómo cobran?', type: 'seleccion_unica', order: 40,
    options: opts(['hora', 'Por hora'], ['proyecto', 'Por proyecto'], ['retainer', 'Mensualidad fija'], ['exito', 'Por resultado o éxito'], ['mixto', 'Mixto']),
  }),
  q({ id: 'pro_ciclo', niche: 'servicios_profesionales', category: 'especifico', text: '¿Cuánto demora en promedio cerrar un cliente nuevo?', type: 'seleccion_unica', order: 50, options: opts(['mismo_dia', 'El mismo día'], ['1_semana', 'Menos de una semana'], ['1_mes', 'Hasta un mes'], ['3_meses', 'Hasta tres meses'], ['mas', 'Más de tres meses']) }),
  q({ id: 'pro_equipo', niche: 'servicios_profesionales', category: 'especifico', text: '¿Quiénes forman el equipo y qué credenciales podemos comunicar?', type: 'texto_largo', required: true, order: 60, help: 'Sólo títulos, registros y certificaciones vigentes y acreditables.' }),
  q({ id: 'pro_casos', niche: 'servicios_profesionales', category: 'especifico', text: '¿Tienen casos o clientes que se puedan mencionar públicamente?', type: 'texto_largo', order: 70, help: 'Sólo con autorización. Si hay acuerdos de confidencialidad, indícalo.' }),
  q({ id: 'pro_restricciones', niche: 'servicios_profesionales', category: 'especifico', text: '¿Hay restricciones del colegio profesional o legales para publicitar?', type: 'texto_largo', order: 80 }),
];

const INMOBILIARIA: Question[] = [
  q({
    id: 'inm_tipo', niche: 'inmobiliaria', category: 'especifico',
    text: '¿Qué tipo de operación es la principal?', type: 'seleccion_unica', required: true, order: 10,
    options: opts(['venta_nuevo', 'Venta de proyectos nuevos'], ['venta_usado', 'Venta de propiedades usadas'], ['arriendo', 'Arriendo'], ['corretaje', 'Corretaje general'], ['inversion', 'Inversión y renta']),
  }),
  q({ id: 'inm_proyectos', niche: 'inmobiliaria', category: 'especifico', text: '¿Qué proyectos o propiedades quieres promocionar?', type: 'texto_largo', required: true, order: 20, help: 'Nombre, comuna y estado de cada uno.' }),
  q({ id: 'inm_prioritario', niche: 'inmobiliaria', category: 'especifico', text: '¿Cuál es el proyecto o propiedad prioritaria?', type: 'texto_corto', required: true, order: 30 }),
  q({ id: 'inm_comunas', niche: 'inmobiliaria', category: 'especifico', text: '¿En qué comunas están las propiedades?', type: 'texto_largo', required: true, order: 40 }),
  q({ id: 'inm_rango_precios', niche: 'inmobiliaria', category: 'especifico', text: 'Rango de precios, en UF', type: 'texto_corto', order: 50, placeholder: 'Ej.: entre 2.800 y 4.500 UF' }),
  q({ id: 'inm_tipologias', niche: 'inmobiliaria', category: 'especifico', text: '¿Qué tipologías hay disponibles?', type: 'texto_largo', order: 60, placeholder: 'Ej.: 1D1B de 38 m², 2D2B de 62 m²' }),
  q({ id: 'inm_estado_obra', niche: 'inmobiliaria', category: 'especifico', text: '¿En qué estado está la obra o la propiedad?', type: 'seleccion_unica', order: 70, options: opts(['blanco', 'En verde o en blanco'], ['construccion', 'En construcción'], ['entrega_inmediata', 'Entrega inmediata'], ['usada', 'Usada, habitable'], ['mixto', 'Hay de todo']) }),
  q({ id: 'inm_sala_ventas', niche: 'inmobiliaria', category: 'especifico', text: '¿Tienen sala de ventas o piloto? ¿Con qué horario?', type: 'texto_largo', order: 80 }),
  q({ id: 'inm_ejecutivos', niche: 'inmobiliaria', category: 'especifico', text: '¿Cuántos ejecutivos atienden las consultas?', type: 'numero', order: 90 }),
  q({ id: 'inm_financiamiento', niche: 'inmobiliaria', category: 'especifico', text: '¿Qué facilidades de financiamiento están autorizadas para comunicar?', type: 'texto_largo', order: 100, help: 'Sólo las vigentes y con sus condiciones. Nada de esto se va a redactar por ti.' }),
];

const BELLEZA: Question[] = [
  q({ id: 'bel_nombre', niche: 'belleza_estetica', category: 'especifico', text: 'Nombre del centro o de la marca', type: 'texto_corto', required: true, order: 10 }),
  q({
    id: 'bel_tipo', niche: 'belleza_estetica', category: 'especifico',
    text: '¿Qué tipo de centro es?', type: 'seleccion_unica', required: true, order: 20,
    options: opts(['peluqueria', 'Peluquería'], ['spa', 'Spa'], ['estetica', 'Centro de estética'], ['unas', 'Centro de uñas'], ['depilacion', 'Depilación'], ['medicina_estetica', 'Medicina estética'], ['barberia', 'Barbería'], ['otro', 'Otro']),
  }),
  q({ id: 'bel_tratamientos', niche: 'belleza_estetica', category: 'especifico', text: '¿Qué tratamientos o servicios ofrecen?', type: 'texto_largo', required: true, order: 30, help: 'Uno por línea.' }),
  q({ id: 'bel_prioritario', niche: 'belleza_estetica', category: 'especifico', text: '¿Qué tratamiento quieres priorizar?', type: 'texto_corto', required: true, order: 40 }),
  q({ id: 'bel_sedes', niche: 'belleza_estetica', category: 'especifico', text: '¿Dónde están y qué comunas atienden?', type: 'texto_largo', required: true, order: 50 }),
  q({ id: 'bel_horarios', niche: 'belleza_estetica', category: 'especifico', text: 'Horarios de atención', type: 'texto_largo', required: true, order: 60 }),
  q({
    id: 'bel_agendamiento', niche: 'belleza_estetica', category: 'especifico',
    text: '¿Cómo se reserva hoy una hora?', type: 'seleccion_multiple', required: true, order: 70,
    options: opts(['whatsapp', 'Por WhatsApp'], ['telefono', 'Por teléfono'], ['agenda_online', 'Agenda online'], ['instagram', 'Mensajes de Instagram'], ['presencial', 'Presencial']),
  }),
  q({ id: 'bel_profesionales', niche: 'belleza_estetica', category: 'especifico', text: '¿Qué profesionales atienden y qué certificaciones podemos comunicar?', type: 'texto_largo', order: 80, help: 'Sólo certificaciones vigentes y acreditables.' }),
  q({
    id: 'bel_antes_despues', niche: 'belleza_estetica', category: 'especifico',
    text: '¿Tienen fotos de antes y después con autorización firmada?', type: 'seleccion_unica', order: 90,
    options: opts(['si_firmado', 'Sí, con autorización firmada'], ['si_sin_firma', 'Tenemos fotos, pero sin autorización'], ['no', 'No tenemos'], ['no_usar', 'Preferimos no usarlas']),
    help: 'Sin autorización por escrito no se publica ninguna imagen de una clienta o cliente.',
  }),
  q({ id: 'bel_restricciones', niche: 'belleza_estetica', category: 'especifico', text: '¿Hay restricciones sanitarias o legales para comunicar los tratamientos?', type: 'texto_largo', order: 100, help: 'Resultados que no se pueden prometer, tratamientos que exigen evaluación previa.' }),
];

const OTRO: Question[] = [
  q({ id: 'otr_rubro', niche: 'otro', category: 'especifico', text: '¿Cómo describirías tu rubro?', type: 'texto_corto', required: true, order: 10 }),
  q({ id: 'otr_como_vende', niche: 'otro', category: 'especifico', text: '¿Cómo vendes hoy?', type: 'texto_largo', required: true, order: 20, help: 'El camino completo, desde que alguien te conoce hasta que te paga.' }),
  q({ id: 'otr_particularidades', niche: 'otro', category: 'especifico', text: '¿Qué tiene tu negocio que una agencia no se imaginaría?', type: 'texto_largo', required: true, order: 30, help: 'Estacionalidad rara, permisos, competencia particular, forma de cobrar poco habitual.' }),
  q({ id: 'otr_restricciones', niche: 'otro', category: 'especifico', text: '¿Hay restricciones para publicitar en tu rubro?', type: 'texto_largo', order: 40 }),
];

export const NICHE_QUESTIONS: Question[] = [
  ...CENTRO_MEDICO,
  ...ECOMMERCE,
  ...SERVICIOS_PROFESIONALES,
  ...INMOBILIARIA,
  ...BELLEZA,
  ...OTRO,
];
