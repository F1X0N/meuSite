import * as React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { buildTargetedResumeModel, type ResumeRenderModel } from './resume'

const COLOR_PRIMARY = '#0e7490'
const COLOR_TEXT = '#111111'
const COLOR_MUTED = '#444444'

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 38,
    fontFamily: 'Helvetica',
    fontSize: 9.4,
    color: COLOR_TEXT,
    lineHeight: 1.3,
  },
  name: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLOR_TEXT, marginBottom: 2 },
  title: { fontSize: 10.2, color: COLOR_MUTED, marginBottom: 5 },
  contactLine: { fontSize: 8.4, color: COLOR_MUTED, marginBottom: 1.5 },
  sectionHeading: {
    fontSize: 10.6,
    fontFamily: 'Helvetica-Bold',
    color: COLOR_PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 10,
    marginBottom: 4,
    paddingBottom: 1.5,
    borderBottomWidth: 0.5,
    borderBottomColor: COLOR_PRIMARY,
  },
  summary: { fontSize: 9.3, marginBottom: 2 },
  skillsRow: { fontSize: 8.8, marginBottom: 2, lineHeight: 1.35 },
  skillsLabel: { fontFamily: 'Helvetica-Bold' },
  experienceItem: { marginBottom: 6 },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 1,
  },
  roleCompany: { fontSize: 9.6, fontFamily: 'Helvetica-Bold' },
  period: { fontSize: 8.4, color: COLOR_MUTED },
  location: { fontSize: 8.4, color: COLOR_MUTED, fontStyle: 'italic', marginBottom: 1.5 },
  bullet: { flexDirection: 'row', marginBottom: 1.5 },
  bulletDash: { width: 8, fontSize: 8.8 },
  bulletText: { flex: 1, fontSize: 8.8 },
  projectItem: { marginBottom: 5 },
  projectTitle: { fontSize: 9.6, fontFamily: 'Helvetica-Bold' },
  projectUrl: { fontSize: 8.4, color: COLOR_MUTED, marginBottom: 1.5 },
  compactItem: { fontSize: 8.8, marginBottom: 1.5 },
})

const Bullet = ({ text }: { text: string }) => (
  <View style={styles.bullet}>
    <Text style={styles.bulletDash}>-</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
)

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View>
    <Text style={styles.sectionHeading}>{title}</Text>
    {children}
  </View>
)

const renderHeader = (model: ResumeRenderModel) => {
  const header = model.header
  const contactLine = [header.email, header.phone].filter(Boolean).join(' | ')
  const linksLine = [header.linkedin, header.github, header.portfolio].filter(Boolean).join(' | ')

  return (
    <View>
      <Text style={styles.name}>{header.name}</Text>
      <Text style={styles.title}>{header.title}</Text>
      <Text style={styles.contactLine}>{contactLine}</Text>
      <Text style={styles.contactLine}>{linksLine}</Text>
      {header.location ? <Text style={styles.contactLine}>{header.location}</Text> : null}
    </View>
  )
}

const renderSummary = (model: ResumeRenderModel) => (
  <View>
    {model.summaryClauses.map((clause) => (
      <Text key={clause.text} style={styles.summary}>
        {clause.text}
      </Text>
    ))}
  </View>
)

const renderSkills = (model: ResumeRenderModel) => (
  <View>
    {model.skills.map((group) => (
      <Text key={group.key} style={styles.skillsRow}>
        <Text style={styles.skillsLabel}>{`${group.label}: `}</Text>
        {`${group.items.map((item) => item.text).join(', ')}.`}
      </Text>
    ))}
  </View>
)

const renderExperience = (experience: ResumeRenderModel['experience'][number]) => (
  <View key={`${experience.company}-${experience.period}`} style={styles.experienceItem} wrap={false}>
    <View style={styles.experienceHeader}>
      <Text style={styles.roleCompany}>
        {experience.role} - {experience.company}
      </Text>
      <Text style={styles.period}>{experience.period}</Text>
    </View>
    {experience.location ? <Text style={styles.location}>{experience.location}</Text> : null}
    {experience.bullets.map((bullet) => (
      <Bullet key={bullet.text} text={bullet.text} />
    ))}
  </View>
)

const renderProject = (project: ResumeRenderModel['publicProjects'][number]) => (
  <View key={project.title} style={styles.projectItem} wrap={false}>
    <Text style={styles.projectTitle}>
      {project.title}
      {project.role ? ` (${project.role})` : ''}
    </Text>
    <Text style={styles.projectUrl}>{project.url}</Text>
    {project.bullets.map((bullet) => (
      <Bullet key={bullet.text} text={bullet.text} />
    ))}
  </View>
)

export const ResumeDocument = ({ prioritySkills = [] }: { prioritySkills?: string[] }) => {
  const model = buildTargetedResumeModel(prioritySkills)

  return (
    <Document title={`${model.header.name} - CV`} author={model.header.name}>
      <Page size="A4" style={styles.page}>
        {renderHeader(model)}

        <Section title="Summary">{renderSummary(model)}</Section>

        <Section title="Skills">{renderSkills(model)}</Section>

        <Section title="Experience">
          {model.experience.map(renderExperience)}
        </Section>

        <Section title="Projects">
          {model.publicProjects.map(renderProject)}
        </Section>

        <Section title="Education">
          {model.education.map((education) => (
            <Text key={`${education.institution}-${education.period}`} style={styles.compactItem}>
              {education.institution} - {education.degree} ({education.period})
            </Text>
          ))}
        </Section>

        <Section title="Certifications">
          {model.certifications.map((certification) => (
            <Text key={certification.text} style={styles.compactItem}>
              - {certification.text}
            </Text>
          ))}
        </Section>

        <Section title="Languages">
          {model.languages.map((language) => (
            <Text key={language.text} style={styles.compactItem}>
              - {language.text}
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
