import { z } from 'zod'

const sourceRefsSchema = z.array(z.string().min(3)).min(1)

const taggedTextSchema = z.object({
  text: z.string().min(2).max(500),
  tags: z.array(z.string().min(2)).min(1),
  sourceRefs: sourceRefsSchema,
})

const bulletSchema = taggedTextSchema.extend({
  text: z.string().min(40).max(240),
})

const summaryClauseSchema = taggedTextSchema.extend({
  text: z.string().min(40).max(220),
  default: z.boolean().optional(),
})

const skillItemSchema = taggedTextSchema.extend({
  text: z.string().min(2).max(80),
})

const skillGroupSchema = z.object({
  label: z.string().min(3).max(60),
  items: z.array(skillItemSchema).min(1).max(7),
})

const experienceSchema = z.object({
  company: z.string().min(2),
  role: z.string().min(2),
  period: z.string().min(4),
  location: z.string().optional(),
  bullets: z.array(bulletSchema).min(1).max(5),
})

const publicProjectSchema = z.object({
  title: z.string().min(3),
  role: z.string().optional(),
  url: z.string().url(),
  repo: z.string().url().optional(),
  sourceRefs: sourceRefsSchema,
  bullets: z.array(bulletSchema).min(1).max(2),
})

const educationSchema = z.object({
  institution: z.string().min(3),
  degree: z.string().min(3),
  period: z.string().min(4),
  sourceRefs: sourceRefsSchema,
})

const certificationSchema = z.object({
  text: z.string().min(5).max(120),
  sourceRefs: sourceRefsSchema,
})

const languageSchema = z.object({
  text: z.string().min(3).max(80),
  sourceRefs: sourceRefsSchema,
})

export const resumeBaseSchema = z.object({
  header: z.object({
    name: z.string().min(3),
    title: z.string().min(5),
    email: z.string().email(),
    phone: z.string().min(8),
    location: z.string().optional(),
    linkedin: z.string().url(),
    github: z.string().url(),
    portfolio: z.string().url(),
    sourceRefs: sourceRefsSchema,
  }),
  summaryClauses: z.array(summaryClauseSchema).min(3).max(5),
  skills: z.record(z.string(), skillGroupSchema),
  experience: z.array(experienceSchema).min(1).max(4),
  publicProjects: z.array(publicProjectSchema).min(1).max(1),
  education: z.array(educationSchema).min(1),
  certifications: z.array(certificationSchema),
  languages: z.array(languageSchema).min(1),
})

export type ResumeBase = z.infer<typeof resumeBaseSchema>
export type ResumeBullet = z.infer<typeof bulletSchema>
export type ResumeSkillGroup = z.infer<typeof skillGroupSchema>
export type ResumeSkillItem = z.infer<typeof skillItemSchema>
export type ResumeSummaryClause = z.infer<typeof summaryClauseSchema>
