import { nicheLabel, type Question } from '../questions/types';
import { statusLabel, type Client } from '../types';
import { ALIASES, HEALTH_NICHES, type AliasKey } from './aliases';
import { AnswerReader, formatCLP, joinEs } from './reader';
import type {
  AccessState,
  Brief,
  BriefBlock,
  BriefSection,
  ChecklistItem,
  LandingBlock,
  PlanPhase,
} from './types';

/**
 * Generación del brief.
 *
 * Regla que atraviesa todo el archivo: acá no se inventa nada. Cada frase sale
 * de una respuesta del cliente o es una acción que la agencia propone hacer.
 * No se redactan servicios, beneficios, resultados, credenciales, promociones,
 * precios ni convenios que el cliente no haya escrito, y no se proyectan
 * resultados de campaña. Cuando falta un dato se dice que falta.
 */

const FALTA = (que: string) => `Falta: ${que}.`;

class BriefBuilder {
  readonly reader: AnswerReader;
  readonly client: Client;
  readonly assumptions: string[] = [];
  readonly clientActions: string[] = [];
  readonly agencyActions: string[] = [];
  /** Por qué importa cada dato faltante; se usa en el diagnóstico. */
  readonly reasons: Record<string, string> = {};

  constructor(questions: Question[], client: Client) {
    this.reader = new AnswerReader(questions, client);
    this.client = client;
  }

  /** Primera respuesta disponible para un concepto. */
  alias(key: AliasKey): string {
    return this.reader.first(...ALIASES[key]);
  }

  aliasLines(key: AliasKey): string[] {
    return this.reader.firstLines(...ALIASES[key]);
  }

  aliasId(key: AliasKey): string | null {
    return ALIASES[key].find((id) => this.reader.has(id)) ?? null;
  }

  hasAlias(key: AliasKey): boolean {
    return this.aliasId(key) !== null;
  }

  /** Todas las respuestas disponibles de un concepto, no sólo la primera. */
  aliasAll(key: AliasKey): string[] {
    return ALIASES[key].filter((id) => this.reader.has(id)).map((id) => this.reader.text(id));
  }

  note(reason: string, ...questionIds: string[]): void {
    for (const id of questionIds) this.reasons[id] = reason;
  }

  assume(text: string): void {
    if (!this.assumptions.includes(text)) this.assumptions.push(text);
  }

  askClient(text: string): void {
    if (!this.clientActions.includes(text)) this.clientActions.push(text);
  }

  agency(text: string): void {
    if (!this.agencyActions.includes(text)) this.agencyActions.push(text);
  }
}

// ── 1. Brief ejecutivo ──────────────────────────────────────

function executiveSummary(b: BriefBuilder): BriefSection {
  const r = b.reader;
  const blocks: BriefBlock[] = [];

  const nombre = b.alias('nombreNegocio') || b.client.company;
  const rubro = nicheLabel(b.client.niche ?? 'otro');
  const zonas = b.alias('zonas');
  const prioritario = b.alias('servicioPrioritario');
  const objetivo = b.alias('objetivo');
  const meta = b.alias('meta');

  const datos: { term: string; value: string }[] = [
    { term: 'Cliente', value: nombre || '—' },
    { term: 'Rubro', value: rubro },
    { term: 'Contacto', value: r.first('con_nombre') || b.client.contactName || '—' },
    { term: 'Correo', value: r.first('con_email') || b.client.email || '—' },
    { term: 'Teléfono', value: r.first('con_telefono') || b.client.phone || '—' },
    { term: 'Ubicación', value: r.first('con_ciudad') || '—' },
    {
      term: 'Foco comercial',
      value: prioritario || 'Sin definir',
    },
    { term: 'Objetivo a tres meses', value: objetivo || 'Sin definir' },
    { term: 'Meta declarada', value: meta || 'Sin meta numérica declarada' },
  ];
  blocks.push({ kind: 'datos', items: datos });

  // El párrafo de apertura se arma sólo con lo que existe.
  const frases: string[] = [];
  if (nombre) {
    frases.push(
      `${nombre} es un negocio del rubro ${rubro.toLowerCase()}${
        r.has('con_ciudad') ? ` con base en ${r.text('con_ciudad')}` : ''
      }.`,
    );
  }
  if (r.has('neg_anos')) {
    frases.push(`Opera hace ${r.text('neg_anos')} años.`);
  }
  if (prioritario) {
    frases.push(
      `El foco declarado para esta etapa es ${prioritario}${
        zonas ? `, con captación en ${zonas.split('\n')[0]}` : ''
      }.`,
    );
  }
  if (objetivo) frases.push(`Objetivo a tres meses, en palabras del cliente: «${objetivo}».`);

  if (frases.length > 0) {
    blocks.push({ kind: 'parrafo', text: frases.join(' ') });
  } else {
    blocks.push({
      kind: 'aviso',
      tone: 'falta',
      text: 'Todavía no hay respuestas suficientes para escribir el resumen ejecutivo.',
    });
  }

  if (!prioritario) {
    b.note('Sin esto no se puede ordenar la campaña alrededor de un servicio.', ...ALIASES.servicioPrioritario);
    blocks.push({ kind: 'aviso', tone: 'falta', text: FALTA('el servicio o tratamiento que se quiere priorizar') });
    b.askClient('Definir cuál es el servicio prioritario para captar clientes en esta etapa.');
  }
  if (!objetivo) {
    blocks.push({ kind: 'aviso', tone: 'falta', text: FALTA('el objetivo comercial de los próximos tres meses') });
    b.askClient('Escribir el objetivo comercial de los próximos tres meses.');
  }

  return { id: 'ejecutivo', number: 1, title: 'Brief ejecutivo', blocks };
}

// ── 2. Resumen del negocio ──────────────────────────────────

function businessSummary(b: BriefBuilder): BriefSection {
  const r = b.reader;
  const blocks: BriefBlock[] = [];

  const descripcion = b.alias('descripcion');
  if (descripcion) blocks.push({ kind: 'parrafo', text: descripcion });
  else blocks.push({ kind: 'aviso', tone: 'falta', text: FALTA('la descripción del negocio') });

  const datos: { term: string; value: string }[] = [];
  if (r.has('neg_anos')) datos.push({ term: 'Años operando', value: r.text('neg_anos') });
  if (r.has('neg_tamano')) datos.push({ term: 'Tamaño del equipo', value: r.text('neg_tamano') });
  if (b.hasAlias('horarios')) datos.push({ term: 'Horarios', value: b.alias('horarios') });
  if (r.has('pub_modalidad')) datos.push({ term: 'Modalidad de atención', value: r.text('pub_modalidad') });
  if (r.has('neg_temporada')) datos.push({ term: 'Estacionalidad', value: r.text('neg_temporada') });
  if (r.has('odo_tipo_centro')) datos.push({ term: 'Tipo de centro', value: r.text('odo_tipo_centro') });
  if (r.has('eco_plataforma')) datos.push({ term: 'Plataforma de la tienda', value: r.text('eco_plataforma') });
  if (datos.length > 0) blocks.push({ kind: 'datos', items: datos });

  const dif = b.aliasLines('diferenciadores');
  if (dif.length > 0) {
    blocks.push({ kind: 'parrafo', text: 'Diferenciadores declarados por el cliente:' });
    blocks.push({ kind: 'lista', items: dif });
    blocks.push({
      kind: 'aviso',
      tone: 'nota',
      text: 'Cada diferenciador se comunica sólo si el cliente puede respaldarlo. Los que no tengan respaldo quedan fuera de las piezas.',
    });
    b.agency('Pedir el respaldo de cada diferenciador antes de usarlo en una pieza.');
  } else {
    blocks.push({ kind: 'aviso', tone: 'falta', text: FALTA('los diferenciadores verificables del negocio') });
    b.note('Sin diferenciadores no hay con qué construir el mensaje.', ...ALIASES.diferenciadores);
    b.askClient('Escribir los diferenciadores del negocio, sólo los que se puedan demostrar.');
  }

  const credenciales = b.aliasLines('credenciales');
  if (credenciales.length > 0) {
    blocks.push({ kind: 'parrafo', text: 'Equipo y credenciales que el cliente autoriza comunicar:' });
    blocks.push({ kind: 'lista', items: credenciales });
    b.agency('Verificar la vigencia de cada credencial antes de publicarla.');
  }

  const competencia = r.lines('neg_competencia');
  if (competencia.length > 0) {
    blocks.push({ kind: 'parrafo', text: 'Competencia mencionada:' });
    blocks.push({ kind: 'lista', items: competencia });
  }

  const restricciones = b.aliasAll('restricciones');
  if (restricciones.length > 0) {
    blocks.push({ kind: 'parrafo', text: 'Restricciones de comunicación declaradas:' });
    blocks.push({ kind: 'lista', items: restricciones.flatMap((t) => t.split('\n').filter(Boolean)) });
  } else {
    blocks.push({
      kind: 'aviso',
      tone: 'falta',
      text: FALTA('la confirmación de si existen restricciones legales o gremiales para comunicar'),
    });
  }

  if (b.client.niche && HEALTH_NICHES.includes(b.client.niche)) {
    blocks.push({
      kind: 'aviso',
      tone: 'nota',
      text: 'Resguardo de datos: este formulario no pide ni almacena datos clínicos, diagnósticos ni información identificable de pacientes. Nada de eso debe llegar a las piezas ni a las plataformas de anuncios.',
    });
    b.agency('Revisar que ninguna respuesta ni material entregado contenga datos identificables de pacientes.');
  }

  return { id: 'negocio', number: 2, title: 'Resumen del negocio', blocks };
}

// ── 3. Servicios prioritarios ───────────────────────────────

function services(b: BriefBuilder): BriefSection {
  const r = b.reader;
  const blocks: BriefBlock[] = [];

  const lista = b.aliasLines('servicios');
  if (lista.length > 0) {
    blocks.push({ kind: 'parrafo', text: 'Servicios o productos declarados:' });
    blocks.push({ kind: 'lista', items: lista });
  } else {
    blocks.push({ kind: 'aviso', tone: 'falta', text: FALTA('la lista de servicios o productos') });
    b.note('Es la base de todo lo que se puede comunicar.', ...ALIASES.servicios);
  }

  const prioritario = b.alias('servicioPrioritario');
  const datos: { term: string; value: string }[] = [];
  if (prioritario) datos.push({ term: 'Servicio prioritario', value: prioritario });
  if (b.hasAlias('prioridadEscala')) {
    datos.push({ term: 'Urgencia declarada', value: b.alias('prioridadEscala') });
  }
  if (r.has('ser_ticket')) {
    datos.push({ term: 'Ticket promedio', value: formatCLP(r.number('ser_ticket') ?? 0) });
  }
  if (r.has('ser_margen')) datos.push({ term: 'Mejor margen', value: r.text('ser_margen') });
  if (r.has('ser_capacidad')) {
    datos.push({ term: 'Capacidad mensual', value: `${r.text('ser_capacidad')} clientes nuevos` });
  }
  if (r.has('eco_top_productos')) {
    datos.push({ term: 'Productos que más venden', value: r.text('eco_top_productos') });
  }
  if (datos.length > 0) blocks.push({ kind: 'datos', items: datos });

  const excluidos = r.lines('ser_no_promocionar');
  if (excluidos.length > 0) {
    blocks.push({ kind: 'parrafo', text: 'El cliente pidió expresamente NO promocionar:' });
    blocks.push({ kind: 'lista', items: excluidos });
    b.agency('Excluir de toda pieza y campaña los servicios que el cliente marcó como no promocionables.');
  }

  const promos = b.aliasAll('promociones');
  if (promos.length > 0) {
    blocks.push({ kind: 'parrafo', text: 'Promociones, convenios o facilidades autorizadas, tal como las escribió el cliente:' });
    blocks.push({ kind: 'lista', items: promos.flatMap((p) => p.split('\n').filter(Boolean)) });
    blocks.push({
      kind: 'aviso',
      tone: 'nota',
      text: 'Estos textos se publican tal cual, con su vigencia. La agencia no redacta ni modifica ofertas, precios ni convenios.',
    });
    b.askClient('Confirmar por escrito la vigencia y las condiciones de cada promoción antes de publicarla.');
  } else if (r.has('odo_promociones') && r.bool('odo_promociones') === false) {
    blocks.push({ kind: 'parrafo', text: 'El cliente declaró que no hay promociones ni convenios autorizados para comunicar.' });
  } else {
    blocks.push({
      kind: 'aviso',
      tone: 'falta',
      text: FALTA('el detalle de promociones, convenios o facilidades de pago autorizadas'),
    });
  }

  if (r.has('ser_capacidad') && b.hasAlias('meta')) {
    const capacidad = r.number('ser_capacidad');
    if (capacidad !== null) {
      b.assume(
        `Se toma como techo operativo la capacidad declarada de ${capacidad} clientes nuevos al mes. Si la meta comercial la supera, hay que resolver la capacidad antes de subir la inversión.`,
      );
    }
  } else if (!r.has('ser_capacidad')) {
    b.note('Sin capacidad declarada no se puede dimensionar cuántas consultas conviene generar.', 'ser_capacidad');
    b.assume(
      'Se asume que el negocio puede atender un aumento de consultas. Hay que confirmar la capacidad mensual real antes de invertir en pauta.',
    );
  }

  return { id: 'servicios', number: 3, title: 'Servicios prioritarios', blocks };
}

// ── 4. Público objetivo ─────────────────────────────────────

function audience(b: BriefBuilder): BriefSection {
  const r = b.reader;
  const blocks: BriefBlock[] = [];

  const perfil = b.alias('publico');
  if (perfil) {
    blocks.push({ kind: 'parrafo', text: `Perfil declarado: ${perfil}` });
  } else {
    blocks.push({ kind: 'aviso', tone: 'falta', text: FALTA('el perfil del cliente que se quiere captar') });
    b.note('Define la segmentación de las campañas.', ...ALIASES.publico);
    b.askClient('Describir el perfil del cliente que se quiere captar.');
  }

  const problemas = b.aliasLines('problemas');
  if (problemas.length > 0) {
    blocks.push({ kind: 'parrafo', text: 'Problemas o necesidades que declara el cliente:' });
    blocks.push({ kind: 'lista', items: problemas });
  } else {
    blocks.push({ kind: 'aviso', tone: 'falta', text: FALTA('los problemas o necesidades del público') });
  }

  const objeciones = b.aliasLines('objeciones');
  if (objeciones.length > 0) {
    blocks.push({ kind: 'parrafo', text: 'Objeciones frecuentes antes de comprar:' });
    blocks.push({ kind: 'lista', items: objeciones });
    b.agency('Responder cada objeción declarada dentro de la landing y de los anuncios.');
  } else {
    blocks.push({ kind: 'aviso', tone: 'falta', text: FALTA('las objeciones más frecuentes') });
    b.note('Sin objeciones no se puede escribir la sección de preguntas frecuentes ni anticiparlas en los anuncios.', 'pub_objeciones');
  }

  const datos: { term: string; value: string }[] = [];
  const zonas = b.alias('zonas');
  if (zonas) datos.push({ term: 'Zonas de captación', value: zonas });
  if (r.has('pub_modalidad')) datos.push({ term: 'Modalidad', value: r.text('pub_modalidad') });
  if (r.has('pub_tono')) datos.push({ term: 'Tono de comunicación', value: r.text('pub_tono') });
  if (datos.length > 0) blocks.push({ kind: 'datos', items: datos });

  if (!zonas) {
    b.note('Sin zonas no se puede configurar la segmentación geográfica.', ...ALIASES.zonas);
    if (r.has('con_ciudad')) {
      b.assume(
        `Se asume, mientras no se confirme, que la captación es en ${r.text('con_ciudad')}, la ubicación declarada del negocio.`,
      );
    }
  }
  if (!r.has('pub_tono')) {
    b.assume('Se asume un tono profesional y cercano hasta que el cliente valide una preferencia distinta.');
  }

  return { id: 'publico', number: 4, title: 'Público objetivo', blocks };
}

// ── 5. Objetivos comerciales ────────────────────────────────

function goals(b: BriefBuilder): BriefSection {
  const r = b.reader;
  const blocks: BriefBlock[] = [];

  const objetivo = b.alias('objetivo');
  if (objetivo) blocks.push({ kind: 'parrafo', text: `Objetivo a tres meses, según el cliente: «${objetivo}»` });
  else blocks.push({ kind: 'aviso', tone: 'falta', text: FALTA('el objetivo de los próximos tres meses') });

  const datos: { term: string; value: string }[] = [];
  if (b.hasAlias('meta')) datos.push({ term: 'Meta declarada', value: b.alias('meta') });
  if (r.has('ser_capacidad')) datos.push({ term: 'Capacidad mensual', value: `${r.text('ser_capacidad')} clientes nuevos` });
  if (r.has('ser_ticket')) datos.push({ term: 'Ticket promedio', value: formatCLP(r.number('ser_ticket') ?? 0) });
  if (r.has('cam_inversion')) {
    datos.push({ term: 'Inversión mensual disponible', value: formatCLP(r.number('cam_inversion') ?? 0) });
  }
  if (r.has('neg_temporada')) datos.push({ term: 'Estacionalidad', value: r.text('neg_temporada') });
  if (datos.length > 0) blocks.push({ kind: 'datos', items: datos });

  if (!b.hasAlias('meta')) {
    blocks.push({
      kind: 'aviso',
      tone: 'falta',
      text: FALTA('una meta numérica; sin ella no hay contra qué medir la campaña'),
    });
    b.note('Sin meta numérica no hay forma de decir si la campaña funcionó.', 'neg_meta_numerica');
    b.agency('Proponer una meta numérica en la reunión de arranque y dejarla escrita.');
  }
  if (!r.has('cam_inversion')) {
    blocks.push({ kind: 'aviso', tone: 'falta', text: FALTA('el presupuesto mensual de pauta') });
    b.note('Define qué canales son viables y a qué escala.', 'cam_inversion');
    b.askClient('Definir el presupuesto mensual de inversión publicitaria.');
  }

  const cierre = r.text('lead_cierre');
  if (cierre) {
    blocks.push({ kind: 'parrafo', text: `Cómo sabe hoy el cliente que una consulta terminó en venta: ${cierre}` });
  } else {
    blocks.push({
      kind: 'aviso',
      tone: 'falta',
      text: FALTA('la definición de cuándo una consulta cuenta como venta'),
    });
    b.note('Es la definición de éxito de toda la operación.', 'lead_cierre');
  }

  blocks.push({
    kind: 'aviso',
    tone: 'nota',
    text: 'Este brief no proyecta resultados. Las metas de campaña se definen con el cliente una vez que estén el presupuesto, la capacidad y la medición.',
  });

  return { id: 'objetivos', number: 5, title: 'Objetivos comerciales', blocks };
}

// ── 6. Checklist de accesos digitales ───────────────────────

const ACCESS_MAP: Record<string, AccessState> = {
  si_con_acceso: 'disponible',
  si_sin_acceso: 'existe_sin_acceso',
  no_existe: 'no_existe',
  no_se: 'sin_dato',
};

const ACCESS_ACTION: Record<AccessState, string> = {
  disponible: 'El cliente comparte el acceso por invitación.',
  existe_sin_acceso: 'El cliente debe recuperar el acceso o pedirlo a quien lo administra.',
  no_existe: 'La agencia lo crea y lo deja a nombre del cliente.',
  sin_dato: 'Hay que averiguar si existe antes de crear uno nuevo.',
};

function accessChecklist(b: BriefBuilder): BriefSection {
  const r = b.reader;
  const items: ChecklistItem[] = [];

  const cuentas: [string, string][] = [
    ['acc_meta', 'Administrador comercial de Meta'],
    ['acc_pixel', 'Píxel de Meta en la web'],
    ['acc_google_ads', 'Google Ads'],
    ['acc_analytics', 'Google Analytics (GA4)'],
    ['acc_tag_manager', 'Google Tag Manager'],
    ['acc_gmb', 'Perfil de Empresa en Google'],
    ['acc_hosting', 'Dominio y hosting'],
  ];

  for (const [id, label] of cuentas) {
    const state = ACCESS_MAP[r.choice(id)] ?? 'sin_dato';
    items.push({ label, state, action: ACCESS_ACTION[state] });
    if (state === 'existe_sin_acceso') {
      b.askClient(`Recuperar o solicitar el acceso a: ${label}.`);
    } else if (state === 'disponible') {
      b.askClient(`Compartir el acceso a ${label} por invitación, sin enviar contraseñas.`);
    } else if (state === 'no_existe') {
      b.agency(`Crear ${label} a nombre del cliente.`);
    } else {
      b.askClient(`Confirmar si existe una cuenta de ${label}.`);
    }
  }

  // La web es un acceso más, aunque se pregunte en otro paso.
  const tieneWeb = r.bool('web_tiene');
  items.push({
    label: 'Página web',
    state: tieneWeb === true ? 'disponible' : tieneWeb === false ? 'no_existe' : 'sin_dato',
    action:
      tieneWeb === true
        ? `Publicada en ${r.text('web_url') || 'una dirección todavía no informada'}.`
        : tieneWeb === false
          ? 'No hay sitio. La captación tiene que apoyarse en una landing.'
          : 'Hay que confirmar si existe sitio web.',
  });

  const blocks: BriefBlock[] = [{ kind: 'checklist', items }];

  if (r.has('acc_responsable')) {
    blocks.push({
      kind: 'parrafo',
      text: `Responsable de entregar los accesos: ${r.text('acc_responsable')}`,
    });
  } else {
    blocks.push({ kind: 'aviso', tone: 'falta', text: FALTA('quién entrega los accesos') });
    b.note('Sin una persona responsable los accesos se quedan pegados.', 'acc_responsable');
  }

  blocks.push({
    kind: 'aviso',
    tone: 'nota',
    text: 'Los accesos se comparten por invitación desde cada plataforma. Nunca por correo, por WhatsApp ni escribiendo la contraseña en este formulario.',
  });

  const pixelState = ACCESS_MAP[r.choice('acc_pixel')] ?? 'sin_dato';
  if (pixelState !== 'disponible' && tieneWeb === true) {
    b.assume('Se asume que se puede instalar código de seguimiento en la web actual. Hay que confirmarlo con quien la administra.');
    b.agency('Instalar el píxel de Meta y GA4 en la web antes de encender cualquier campaña.');
  }

  return { id: 'accesos', number: 6, title: 'Checklist de accesos digitales', blocks };
}

// ── 8. Estructura de landing page ───────────────────────────

function landingProposal(b: BriefBuilder): BriefSection {
  const r = b.reader;
  const prioritario = b.alias('servicioPrioritario');
  const zonas = b.alias('zonas');
  const dif = b.aliasLines('diferenciadores');
  const problemas = b.aliasLines('problemas');
  const objeciones = b.aliasLines('objeciones');
  const credenciales = b.aliasLines('credenciales');
  const promos = b.aliasAll('promociones');
  const horarios = b.alias('horarios');
  const canales = b.alias('agendamiento');

  const items: LandingBlock[] = [];

  items.push({
    title: '1. Encabezado',
    content: [
      prioritario ? `Servicio del que habla la página: ${prioritario}.` : '',
      zonas ? `Zona a la que le habla: ${zonas.split('\n')[0]}.` : '',
      'Un botón de acción visible sin hacer scroll.',
    ].filter(Boolean),
    missing: [
      !prioritario ? 'El servicio prioritario.' : '',
      !zonas ? 'La zona de captación.' : '',
      !r.has('arch_logo') && r.attachments('arch_logo').length === 0 ? 'El logo en buena calidad.' : '',
    ].filter(Boolean),
  });

  items.push({
    title: '2. El problema que resuelve',
    content: problemas.length > 0 ? problemas.map((p) => `Se aborda: ${p}`) : [],
    missing: problemas.length === 0 ? ['Los problemas o necesidades del público, con sus palabras.'] : [],
  });

  items.push({
    title: '3. Por qué acá y no en otra parte',
    content: dif.map((d) => `Diferenciador declarado: ${d}`),
    missing: dif.length === 0 ? ['Los diferenciadores verificables.'] : ['Respaldo documental de cada diferenciador antes de publicarlo.'],
  });

  items.push({
    title: '4. Qué incluye el servicio',
    content: b.aliasLines('servicios').slice(0, 12).map((s) => `Se menciona: ${s}`),
    missing: b.aliasLines('servicios').length === 0 ? ['La lista de servicios.'] : [],
  });

  if (credenciales.length > 0) {
    items.push({
      title: '5. Quién atiende',
      content: credenciales.map((c) => `Perfil autorizado: ${c}`),
      missing: ['Fotografías del equipo.', 'Confirmación de la vigencia de cada credencial.'],
    });
  } else {
    items.push({
      title: '5. Quién atiende',
      content: [],
      missing: ['Nombres, especialidades y credenciales que el cliente autorice comunicar.'],
    });
  }

  const consentimiento = b.alias('imagenesConsentimiento');
  items.push({
    title: '6. Prueba',
    content: [
      r.bool('cam_fotos') === true ? 'Hay fotografías propias del negocio.' : '',
      consentimiento ? `Imágenes de tratamientos: ${consentimiento}` : '',
    ].filter(Boolean),
    missing: [
      r.bool('cam_fotos') !== true ? 'Fotografías propias del lugar y del equipo.' : '',
      'Reseñas o testimonios reales, con autorización de quien los escribió.',
      consentimiento.toLowerCase().includes('sin consentimiento')
        ? 'Consentimiento firmado para cualquier imagen de un tratamiento. Sin él, no se publica.'
        : '',
    ].filter(Boolean),
  });

  if (promos.length > 0) {
    items.push({
      title: '7. Oferta vigente',
      content: promos.flatMap((p) => p.split('\n').filter(Boolean)).map((p) => `Texto autorizado: ${p}`),
      missing: ['Vigencia y letra chica de cada oferta, por escrito.'],
    });
  }

  items.push({
    title: `${promos.length > 0 ? '8' : '7'}. Preguntas frecuentes`,
    content: objeciones.map((o) => `Responde la objeción: ${o}`),
    missing: objeciones.length === 0 ? ['Las objeciones más frecuentes del público.'] : [],
  });

  items.push({
    title: `${promos.length > 0 ? '9' : '8'}. Cómo se contacta`,
    content: [
      canales ? `Canales que ya usa el negocio: ${canales}.` : '',
      horarios ? `Horario a mostrar: ${horarios}.` : '',
      r.has('con_telefono') ? 'Teléfono y WhatsApp visibles.' : '',
      'Formulario corto: nombre, teléfono y el servicio que interesa.',
    ].filter(Boolean),
    missing: [
      !canales ? 'Los canales por los que se agenda hoy.' : '',
      !horarios ? 'Los horarios de atención.' : '',
      'Confirmar a qué correo o número llegan los formularios.',
    ].filter(Boolean),
  });

  const blocks: BriefBlock[] = [
    {
      kind: 'parrafo',
      text: 'Estructura propuesta para la landing del servicio prioritario. Cada bloque indica con qué material se puede escribir hoy y qué falta. Los textos definitivos se redactan sólo con información confirmada por el cliente.',
    },
    { kind: 'bloques_landing', items },
  ];

  const restricciones = b.aliasAll('restricciones');
  if (restricciones.length > 0) {
    blocks.push({
      kind: 'aviso',
      tone: 'nota',
      text: `La redacción tiene que respetar las restricciones declaradas: ${restricciones
        .join(' ')
        .replace(/\n/g, ' ')
        .slice(0, 400)}`,
    });
  }

  b.agency('Redactar los textos de la landing únicamente con los diferenciadores, credenciales y ofertas confirmadas por el cliente.');

  return { id: 'landing', number: 8, title: 'Propuesta de estructura para la landing', blocks };
}

// ── 9. Plan inicial de marketing y captación ────────────────

function marketingPlan(b: BriefBuilder): BriefSection {
  const r = b.reader;
  const metaState = ACCESS_MAP[r.choice('acc_meta')] ?? 'sin_dato';
  const adsState = ACCESS_MAP[r.choice('acc_google_ads')] ?? 'sin_dato';
  const analyticsState = ACCESS_MAP[r.choice('acc_analytics')] ?? 'sin_dato';
  const pixelState = ACCESS_MAP[r.choice('acc_pixel')] ?? 'sin_dato';
  const tieneWeb = r.bool('web_tiene');
  const esEcommerce = b.client.niche === 'ecommerce';
  const presencial = r.choice('pub_modalidad') === 'presencial' || r.choice('pub_modalidad') === 'mixto';

  const preparacion: string[] = [];
  if (metaState !== 'disponible') preparacion.push('Dejar operativo el administrador comercial de Meta.');
  if (pixelState !== 'disponible' && tieneWeb === true) preparacion.push('Instalar el píxel de Meta y verificar que registre eventos.');
  if (analyticsState !== 'disponible') preparacion.push('Instalar GA4 y dejar configurados los eventos de contacto.');
  if (adsState !== 'disponible') preparacion.push('Crear o recuperar la cuenta de Google Ads.');
  if (tieneWeb !== true) preparacion.push('Publicar la landing del servicio prioritario: sin destino no hay campaña.');
  else preparacion.push('Revisar la web actual y montar la landing del servicio prioritario.');
  if (r.bool('web_whatsapp') !== true) preparacion.push('Instalar botón de WhatsApp con seguimiento.');
  if (!r.has('lead_cierre')) preparacion.push('Definir con el cliente cuándo una consulta cuenta como venta.');
  if (r.choice('lead_registro') === 'ninguno' || r.choice('lead_registro') === 'whatsapp') {
    preparacion.push('Montar una planilla compartida para registrar cada consulta y su resultado.');
    b.assume('Se asume que el equipo del cliente puede registrar las consultas en una planilla mientras no haya CRM.');
  }
  if (presencial && ACCESS_MAP[r.choice('acc_gmb')] !== 'disponible') {
    preparacion.push('Reclamar y completar el Perfil de Empresa en Google: es la primera fuente de consultas de un negocio con local.');
  }

  const canales: string[] = [];
  if (esEcommerce) {
    canales.push('Meta Ads con catálogo de productos, si el feed queda conectado.');
    canales.push('Google Ads en búsqueda de marca y de las categorías que más venden.');
    if (r.choice('eco_feed') !== 'ambos') {
      canales.push('Conectar el catálogo a Meta y a Google Merchant Center antes de escalar.');
    }
  } else {
    canales.push('Meta Ads con campaña de generación de consultas hacia la landing del servicio prioritario.');
    canales.push('Google Ads en búsqueda, sobre los términos con los que el público busca el servicio.');
  }
  if (presencial) canales.push('Perfil de Empresa en Google, con reseñas y datos de contacto al día.');
  const redes = r.choices('cam_redes').filter((v) => v !== 'ninguna');
  if (redes.length > 0) {
    canales.push(`Contenido orgánico en los perfiles que ya existen: ${r.text('cam_redes')}.`);
  }

  const material: string[] = [];
  if (r.bool('cam_fotos') !== true) material.push('Producción de fotografías del lugar, del equipo y del servicio.');
  if (r.bool('cam_videos') !== true) material.push('Grabación de piezas de video verticales.');
  if (r.bool('cam_manual_marca') !== true) material.push('Logo en vectores y definición mínima de colores y tipografías.');
  if (r.bool('cam_piezas') !== true) material.push('Diseño de las primeras piezas gráficas.');
  if (material.length === 0) material.push('Revisar el material existente y seleccionar lo utilizable para pauta.');

  const medicion: string[] = [
    'Consultas recibidas por canal.',
    'Costo por consulta.',
    'Consultas que llegan a agendar o comprar.',
  ];
  if (r.has('lead_cierre')) medicion.push(`Cierre según la definición del cliente: ${r.text('lead_cierre')}`);
  const tiempo = b.alias('tiempoRespuesta');
  if (tiempo) medicion.push(`Tiempo de respuesta, hoy declarado en: ${tiempo}.`);

  const fases: PlanPhase[] = [
    { title: 'Fase 1 — Dejar la base operativa', timeframe: 'Semanas 1 y 2', items: preparacion },
    { title: 'Fase 2 — Material y primera campaña', timeframe: 'Semanas 3 a 6', items: [...material, ...canales] },
    {
      title: 'Fase 3 — Medir, ajustar y decidir',
      timeframe: 'Semanas 7 a 12',
      items: [
        ...medicion.map((m) => `Seguimiento de: ${m}`),
        'Revisión mensual con el cliente sobre qué canal trae consultas que cierran.',
        'Decidir con datos si se sube la inversión o se cambia el foco.',
      ],
    },
  ];

  const blocks: BriefBlock[] = [
    {
      kind: 'parrafo',
      text: 'Plan de arranque propuesto por la agencia, ordenado por dependencias: nada se enciende antes de que exista el destino, la medición y el material.',
    },
    { kind: 'fases', items: fases },
  ];

  if (r.has('cam_inversion')) {
    blocks.push({
      kind: 'parrafo',
      text: `Presupuesto de pauta declarado por el cliente: ${formatCLP(r.number('cam_inversion') ?? 0)} al mes. La distribución entre canales se define en la reunión de arranque.`,
    });
  } else {
    blocks.push({ kind: 'aviso', tone: 'falta', text: FALTA('el presupuesto mensual de pauta') });
  }

  if (r.has('cam_detalle')) {
    blocks.push({
      kind: 'parrafo',
      text: `Antecedente de campañas anteriores, según el cliente: ${r.text('cam_detalle')}`,
    });
  }

  blocks.push({
    kind: 'aviso',
    tone: 'nota',
    text: 'Este plan no incluye proyecciones de resultados. Las metas se fijan con el cliente después de las primeras cuatro semanas con medición funcionando.',
  });

  return { id: 'plan', number: 9, title: 'Plan inicial de marketing y captación', blocks };
}

// ── 7. Diagnóstico de información faltante ──────────────────

function diagnosis(b: BriefBuilder, missingCount: number, requiredCount: number): BriefSection {
  const blocks: BriefBlock[] = [];
  if (missingCount === 0) {
    blocks.push({ kind: 'parrafo', text: 'El cliente respondió todas las preguntas que le correspondían.' });
  } else {
    blocks.push({
      kind: 'parrafo',
      text: `Quedan ${missingCount} preguntas sin responder, ${requiredCount} de ellas obligatorias. El detalle está en la tabla de abajo.`,
    });
  }
  if (requiredCount > 0) {
    b.agency('Recuperar con el cliente las respuestas obligatorias que faltan antes de cerrar el brief.');
  }
  return { id: 'faltante', number: 7, title: 'Diagnóstico de información faltante', blocks };
}

// ── Ensamblado ──────────────────────────────────────────────

export function generateBrief(questions: Question[], client: Client): Brief {
  const b = new BriefBuilder(questions, client);

  const secciones: BriefSection[] = [
    executiveSummary(b),
    businessSummary(b),
    services(b),
    audience(b),
    goals(b),
    accessChecklist(b),
  ];

  // La landing y el plan se generan antes del diagnóstico porque van
  // registrando lo que falta y las acciones de cada lado.
  const landing = landingProposal(b);
  const plan = marketingPlan(b);

  const missing = b.reader.missing(b.reasons);
  const requiredMissing = missing.filter((m) => m.required).length;

  secciones.push(diagnosis(b, missing.length, requiredMissing), landing, plan);
  secciones.sort((x, y) => x.number - y.number);

  // Acciones que siempre le tocan al cliente si hay obligatorias pendientes.
  for (const item of missing.filter((m) => m.required).slice(0, 12)) {
    b.askClient(`Responder: ${item.question}`);
  }

  const material: string[] = [];
  if (b.reader.attachments('arch_logo').length === 0) material.push('el logo');
  if (b.reader.attachments('arch_fotos').length === 0) material.push('fotografías');
  if (material.length > 0) {
    b.askClient(`Enviar ${joinEs(material)}: sin ese material no se pueden armar las piezas.`);
  }

  b.agency('Agendar la reunión de arranque para validar los supuestos de este brief.');
  b.agency('Dejar por escrito la meta numérica y la definición de venta antes de encender la pauta.');

  const visibleCount = b.reader.visible.length;
  const answeredCount = b.reader.answeredCount;

  return {
    generatedAt: new Date().toISOString(),
    clientName: b.reader.first('con_nombre') || client.contactName,
    company: b.alias('nombreNegocio') || client.company,
    nicheLabel: nicheLabel(client.niche ?? 'otro'),
    status: statusLabel(client.status),
    coverage: visibleCount === 0 ? 0 : Math.round((answeredCount / visibleCount) * 100),
    answeredCount,
    visibleCount,
    sections: secciones,
    missing,
    assumptions: b.assumptions,
    clientActions: b.clientActions,
    agencyActions: b.agencyActions,
    agencyNotes: client.briefOverrides?.agencyNotes ?? '',
  };
}

/** Aplica los textos que la agencia escribió encima del brief generado. */
export function applyOverrides(brief: Brief, client: Client): Brief {
  const overrides = client.briefOverrides?.sections ?? {};
  if (Object.keys(overrides).length === 0) return brief;
  return {
    ...brief,
    sections: brief.sections.map((section) => {
      const custom = overrides[section.id];
      if (!custom || !custom.trim()) return section;
      return {
        ...section,
        blocks: [
          { kind: 'parrafo', text: custom.trim() } as BriefBlock,
          { kind: 'aviso', tone: 'nota', text: 'Sección editada por la agencia.' } as BriefBlock,
        ],
      };
    }),
  };
}
