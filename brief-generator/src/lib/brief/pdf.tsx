import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer';
import React from 'react';

import type { AccessState, Brief, BriefBlock, BriefSection } from './types';

/**
 * Render del brief a PDF, en el servidor.
 *
 * Usa las tipografías base del formato PDF (Helvetica), que cubren los
 * acentos y la eñe. Así el render no depende de descargar fuentes ni de lo que
 * tenga instalado la máquina.
 */

const COLORS = {
  ink: '#14202e',
  body: '#38495c',
  muted: '#6b7c90',
  line: '#dfe6ee',
  accent: '#1d5f8a',
  falta: '#9a4b12',
  faltaBg: '#fdf3e8',
  supuesto: '#5b3f8f',
  supuestoBg: '#f3f0fb',
  notaBg: '#eef4f9',
  ok: '#1c6b4a',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 46,
    paddingBottom: 56,
    paddingHorizontal: 46,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.body,
    lineHeight: 1.5,
  },
  coverTitle: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: COLORS.ink, marginBottom: 4 },
  coverCompany: { fontSize: 16, color: COLORS.accent, marginBottom: 18 },
  coverMeta: { fontSize: 10, color: COLORS.muted, marginBottom: 2 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.ink,
    marginTop: 18,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  subTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: COLORS.ink, marginTop: 10, marginBottom: 4 },
  paragraph: { marginBottom: 6 },
  listItem: { flexDirection: 'row', marginBottom: 3 },
  bullet: { width: 12, color: COLORS.accent },
  listText: { flex: 1 },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingVertical: 4,
  },
  dataTerm: { width: '35%', fontFamily: 'Helvetica-Bold', color: COLORS.ink, paddingRight: 8 },
  dataValue: { width: '65%' },
  notice: { padding: 8, marginVertical: 6, borderLeftWidth: 3, borderRadius: 2 },
  noticeLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 2 },
  chip: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 2,
    color: '#ffffff',
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 3,
    padding: 8,
    marginBottom: 6,
  },
  cardTitle: { fontFamily: 'Helvetica-Bold', color: COLORS.ink, marginBottom: 3 },
  footer: {
    position: 'absolute',
    bottom: 26,
    left: 46,
    right: 46,
    fontSize: 8,
    color: COLORS.muted,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const ACCESS_TEXT: Record<AccessState, { label: string; color: string }> = {
  disponible: { label: 'DISPONIBLE', color: COLORS.ok },
  existe_sin_acceso: { label: 'SIN ACCESO', color: COLORS.falta },
  no_existe: { label: 'NO EXISTE', color: COLORS.muted },
  sin_dato: { label: 'SIN DATO', color: COLORS.supuesto },
};

const NOTICE_STYLE = {
  falta: { bg: COLORS.faltaBg, border: COLORS.falta, label: 'Información faltante' },
  supuesto: { bg: COLORS.supuestoBg, border: COLORS.supuesto, label: 'Supuesto por validar' },
  nota: { bg: COLORS.notaBg, border: COLORS.accent, label: 'Nota' },
};

function Bullets({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Block({ block }: { block: BriefBlock }) {
  switch (block.kind) {
    case 'parrafo':
      return <Text style={styles.paragraph}>{block.text}</Text>;
    case 'lista':
      return <Bullets items={block.items} />;
    case 'datos':
      return (
        <View style={{ marginBottom: 6 }}>
          {block.items.map((item, i) => (
            <View key={i} style={styles.dataRow}>
              <Text style={styles.dataTerm}>{item.term}</Text>
              <Text style={styles.dataValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      );
    case 'checklist':
      return (
        <View style={{ marginBottom: 6 }}>
          {block.items.map((item, i) => {
            const state = ACCESS_TEXT[item.state];
            return (
              <View key={i} style={styles.dataRow} wrap={false}>
                <Text style={[styles.dataTerm, { width: '38%' }]}>{item.label}</Text>
                <View style={{ width: '22%' }}>
                  <Text style={[styles.chip, { backgroundColor: state.color }]}>{state.label}</Text>
                </View>
                <Text style={{ width: '40%', fontSize: 9 }}>{item.action ?? ''}</Text>
              </View>
            );
          })}
        </View>
      );
    case 'bloques_landing':
      return (
        <View>
          {block.items.map((item, i) => (
            <View key={i} style={styles.card} wrap={false}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.content.length > 0 && <Bullets items={item.content} />}
              {item.missing.length > 0 && (
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 9, color: COLORS.falta, fontFamily: 'Helvetica-Bold' }}>
                    Falta para poder escribirla:
                  </Text>
                  <Bullets items={item.missing} />
                </View>
              )}
            </View>
          ))}
        </View>
      );
    case 'fases':
      return (
        <View>
          {block.items.map((phase, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>
                {phase.title} · {phase.timeframe}
              </Text>
              <Bullets items={phase.items} />
            </View>
          ))}
        </View>
      );
    case 'aviso': {
      const tone = NOTICE_STYLE[block.tone];
      return (
        <View style={[styles.notice, { backgroundColor: tone.bg, borderLeftColor: tone.border }]}>
          <Text style={[styles.noticeLabel, { color: tone.border }]}>{tone.label}</Text>
          <Text>{block.text}</Text>
        </View>
      );
    }
    default:
      return null;
  }
}

function Section({ section }: { section: BriefSection }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>
        {section.number}. {section.title}
      </Text>
      {section.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </View>
  );
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CL', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(iso),
  );
}

export function BriefDocument({ brief }: { brief: Brief }) {
  const missingRequired = brief.missing.filter((m) => m.required);
  const missingOptional = brief.missing.filter((m) => !m.required);

  return (
    <Document
      title={`Brief — ${brief.company}`}
      author="Generador de Brief de Clientes"
      language="es-CL"
    >
      <Page size="A4" style={styles.page}>
        <View style={{ marginBottom: 22 }}>
          <Text style={styles.coverMeta}>BRIEF DE ONBOARDING</Text>
          <Text style={styles.coverTitle}>{brief.company || 'Cliente sin nombre'}</Text>
          <Text style={styles.coverCompany}>{brief.nicheLabel}</Text>
          <Text style={styles.coverMeta}>Contacto: {brief.clientName || '—'}</Text>
          <Text style={styles.coverMeta}>Estado del proyecto: {brief.status}</Text>
          <Text style={styles.coverMeta}>
            Formulario completado: {brief.coverage}% ({brief.answeredCount} de {brief.visibleCount}{' '}
            preguntas)
          </Text>
          <Text style={styles.coverMeta}>Generado el {formatDate(brief.generatedAt)}</Text>
        </View>

        <View style={[styles.notice, { backgroundColor: COLORS.notaBg, borderLeftColor: COLORS.accent }]}>
          <Text style={styles.noticeLabel}>Cómo leer este documento</Text>
          <Text>
            Las secciones 1 a 9 contienen sólo información confirmada por el cliente y propuestas de
            la agencia. Lo que falta, los supuestos por validar y las acciones de cada lado van
            separados al final. Nada de lo que el cliente no respondió fue redactado por la agencia.
          </Text>
        </View>

        {brief.sections.map((section) => (
          <Section key={section.id} section={section} />
        ))}

        {/* ── Faltante ── */}
        <Text style={styles.sectionTitle} break>
          Información faltante en detalle
        </Text>
        {missingRequired.length > 0 && (
          <View>
            <Text style={styles.subTitle}>Obligatorias sin responder ({missingRequired.length})</Text>
            {missingRequired.map((item) => (
              <View key={item.questionId} style={styles.listItem} wrap={false}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>{item.question}</Text>
                  {` — paso ${item.step}, ${item.stepTitle}.`}
                  {item.why ? ` ${item.why}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
        {missingOptional.length > 0 && (
          <View>
            <Text style={styles.subTitle}>Opcionales sin responder ({missingOptional.length})</Text>
            <Bullets items={missingOptional.map((m) => `${m.question} (paso ${m.step})`)} />
          </View>
        )}
        {brief.missing.length === 0 && (
          <Text style={styles.paragraph}>No falta ninguna respuesta.</Text>
        )}

        {/* ── Supuestos ── */}
        <Text style={styles.sectionTitle}>Supuestos que requieren validación</Text>
        {brief.assumptions.length > 0 ? (
          <Bullets items={brief.assumptions} />
        ) : (
          <Text style={styles.paragraph}>
            No hubo que asumir nada: la información entregada alcanza para el alcance de este brief.
          </Text>
        )}

        {/* ── Acciones ── */}
        <Text style={styles.sectionTitle}>Acciones que le corresponden al cliente</Text>
        {brief.clientActions.length > 0 ? (
          <Bullets items={brief.clientActions} />
        ) : (
          <Text style={styles.paragraph}>Sin acciones pendientes del cliente.</Text>
        )}

        <Text style={styles.sectionTitle}>Acciones que le corresponden a la agencia</Text>
        {brief.agencyActions.length > 0 ? (
          <Bullets items={brief.agencyActions} />
        ) : (
          <Text style={styles.paragraph}>Sin acciones pendientes de la agencia.</Text>
        )}

        {brief.agencyNotes.trim().length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Notas internas de la agencia</Text>
            <Text style={styles.paragraph}>{brief.agencyNotes}</Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>
            {brief.company} · Brief de onboarding · {formatDate(brief.generatedAt)}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function renderBriefPdf(brief: Brief): Promise<Buffer> {
  return renderToBuffer(<BriefDocument brief={brief} />);
}
