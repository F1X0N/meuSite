/**
 * Template PDF reutilizável (CV ATS-grade).
 *
 * Render via @react-pdf/renderer. Layout: 1 coluna A4, Helvetica built-in
 * (ATS-safe), sem ícones SVG, preto sobre branco com cor primária sutil
 * apenas em headings de seção. Os mesmos dados do content/resume-base.json
 * geram tanto o CV default (sem prioritySkills) quanto o adaptado por vaga.
 */
import * as React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import resumeBase from '@/content/resume-base.json'
import {
  sortBulletsByPriority,
  SKILL_GROUP_LABELS,
  type ResumeBase,
  type Experience,
  type PublicProject,
} from './resume'

const COLOR_PRIMARY = '#0e7490'
const COLOR_TEXT = '#111111'
const COLOR_MUTED = '#444444'

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLOR_TEXT,
    lineHeight: 1.4,
  },
  name: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: COLOR_TEXT, marginBottom: 2 },
  title: { fontSize: 11, color: COLOR_MUTED, marginBottom: 6 },
  contactLine: { fontSize: 9, color: COLOR_MUTED, marginBottom: 2 },
  sectionHeading: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 6,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR_PRIMARY,
  },
  summary: { fontSize: 10, marginBottom: 4, textAlign: 'justify' },
  skillsRow: { fontSize: 9.5, marginBottom: 3, lineHeight: 1.45 },
  skillsLabel: { fontFamily: 'Helvetica-Bold' },
  experienceItem: { marginBottom: 8 },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 1,
  },
  roleCompany: { fontSize: 10.5, fontFamily: 'Helvetica-Bold' },
  period: { fontSize: 9, color: COLOR_MUTED },
  location: { fontSize: 9, color: COLOR_MUTED, fontStyle: 'italic', marginBottom: 2 },
  bullet: { flexDirection: 'row', marginBottom: 2 },
  bulletDash: { width: 9, fontSize: 9.5 },
  bulletText: { flex: 1, fontSize: 9.5 },
  projectItem: { marginBottom: 6 },
  projectTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold' },
  projectUrl: { fontSize: 9, color: COLOR_MUTED, marginBottom: 2 },
  educationItem: { fontSize: 9.5, marginBottom: 2 },
  certItem: { fontSize: 9.5, marginBottom: 2 },
  langItem: { fontSize: 9.5, marginBottom: 2 },
})

const Bullet = ({ text }: { text: string }) => (
  <View style={styles.bullet}>
    <Text style={styles.bulletDash}>·</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
)

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View>
    <Text style={styles.sectionHeading}>{title}</Text>
    {children}
  </View>
)

const renderHeader = (h: ResumeBase['header']) => {
  const contact1 = [h.email, h.phone].filter(Boolean).join('  ·  ')
  const contact2 = [h.linkedin, h.github, h.portfolio].filter(Boolean).join('  ·  ')
  return (
    <View>
      <Text style={styles.name}>{h.name}</Text>
      <Text style={styles.title}>{h.title}</Text>
      <Text style={styles.contactLine}>{contact1}</Text>
      <Text style={styles.contactLine}>{contact2}</Text>
      {h.location ? <Text style={styles.contactLine}>{h.location}</Text> : null}
    </View>
  )
}

const renderSkills = (skills: ResumeBase['skills'], prioritySkills: string[]) => {
  const groups = Object.entries(skills) as Array<[string, string[]]>
  const groupScore = ([, items]: [string, string[]]) =>
    items.filter((i) => prioritySkills.some((s) => s.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(s.toLowerCase()))).length
  const sorted = prioritySkills.length > 0 ? groups.sort((a, b) => groupScore(b) - groupScore(a)) : groups
  return (
    <View>
      {sorted.map(([key, items]) => (
        <Text key={key} style={styles.skillsRow}>
          <Text style={styles.skillsLabel}>{(SKILL_GROUP_LABELS[key] ?? key) + ': '}</Text>
          {items.join(', ') + '.'}
        </Text>
      ))}
    </View>
  )
}

const renderExperience = (exp: Experience, prioritySkills: string[]) => {
  const sorted = sortBulletsByPriority(exp.bullets, prioritySkills)
  return (
    <View key={`${exp.company}-${exp.period}`} style={styles.experienceItem} wrap={false}>
      <View style={styles.experienceHeader}>
        <Text style={styles.roleCompany}>
          {exp.role} — {exp.company}
        </Text>
        <Text style={styles.period}>{exp.period}</Text>
      </View>
      {exp.location ? <Text style={styles.location}>{exp.location}</Text> : null}
      {sorted.map((b, i) => (
        <Bullet key={i} text={b.text} />
      ))}
    </View>
  )
}

const renderProject = (p: PublicProject, prioritySkills: string[]) => {
  const sorted = sortBulletsByPriority(p.bullets, prioritySkills)
  return (
    <View key={p.title} style={styles.projectItem} wrap={false}>
      <Text style={styles.projectTitle}>
        {p.title}
        {p.role ? ` (${p.role})` : ''}
      </Text>
      <Text style={styles.projectUrl}>{p.url}</Text>
      {sorted.map((b, i) => (
        <Bullet key={i} text={b.text} />
      ))}
    </View>
  )
}

export const ResumeDocument = ({ prioritySkills = [] }: { prioritySkills?: string[] }) => {
  const base = resumeBase as ResumeBase
  return (
    <Document title={`${base.header.name} — CV`} author={base.header.name}>
      <Page size="A4" style={styles.page}>
        {renderHeader(base.header)}

        <Section title="Resumo Profissional">
          <Text style={styles.summary}>{base.summary}</Text>
        </Section>

        <Section title="Competências Técnicas">
          {renderSkills(base.skills, prioritySkills)}
        </Section>

        <Section title="Experiência Profissional">
          {base.experience.map((exp) => renderExperience(exp as Experience, prioritySkills))}
        </Section>

        {base.publicProjects && base.publicProjects.length > 0 && (
          <Section title="Projetos Públicos">
            {base.publicProjects.map((p) => renderProject(p as PublicProject, prioritySkills))}
          </Section>
        )}

        {base.notableMetrics && base.notableMetrics.length > 0 && (
          <Section title="Métricas e Resultados Documentados">
            {base.notableMetrics.map((m, i) => (
              <Bullet key={i} text={m} />
            ))}
          </Section>
        )}

        <Section title="Educação">
          {base.education.map((e, i) => (
            <Text key={i} style={styles.educationItem}>
              {e.institution} — {e.degree} ({e.period})
            </Text>
          ))}
        </Section>

        <Section title="Certificações">
          {base.certifications.map((c, i) => (
            <Text key={i} style={styles.certItem}>
              · {c}
            </Text>
          ))}
        </Section>

        <Section title="Idiomas">
          {base.languages.map((l, i) => (
            <Text key={i} style={styles.langItem}>
              · {l}
            </Text>
          ))}
        </Section>
      </Page>
    </Document>
  )
}

export const generateResumePDF = async (prioritySkills: string[] = []): Promise<Buffer> => {
  const instance = pdf(<ResumeDocument prioritySkills={prioritySkills} />)
  const stream = (await instance.toBuffer()) as NodeJS.ReadableStream
  const chunks: Buffer[] = []
  return new Promise<Buffer>((resolve, reject) => {
    stream.on('data', (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    })
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}
