import { z } from 'zod'

const bulletSchema = z.object({
  text: z.string().min(20).max(500),
  tags: z.array(z.string().min(2)).min(1),
})

const experienceSchema = z.object({
  company: z.string().min(2),
  role: z.string().min(2),
  period: z.string().min(4),
  location: z.string().optional(),
  bullets: z.array(bulletSchema).min(1),
})

const publicProjectSchema = z.object({
  title: z.string().min(3),
  role: z.string().optional(),
  url: z.string().url(),
  repo: z.string().url().optional(),
  bullets: z.array(bulletSchema).min(1),
})

const educationSchema = z.object({
  institution: z.string().min(3),
  degree: z.string().min(3),
  period: z.string().min(4),
  coursework: z.array(z.string()).optional(),
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
  }),
  summary: z.string().min(150).max(1200),
  skills: z.record(z.string(), z.array(z.string().min(2)).min(1)),
  experience: z.array(experienceSchema).min(1),
  publicProjects: z.array(publicProjectSchema).min(1),
  notableMetrics: z.array(z.string().min(10)).optional(),
  education: z.array(educationSchema).min(1),
  certifications: z.array(z.string().min(5)),
  languages: z.array(z.string().min(3)).min(1),
  principles: z.array(z.string().min(20)).optional(),
})

export type ResumeBase = z.infer<typeof resumeBaseSchema>
