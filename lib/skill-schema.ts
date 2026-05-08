import { z } from 'zod'

export const skillFrontmatterSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/, 'name deve ser slug em kebab-case'),
  description: z.string().min(80).max(300),
  triggers: z.array(z.string().min(2)).min(3).max(20),
  linkedContent: z.string().regex(/^\/(case-studies|blog)\/[a-z0-9-]+$/, 'linkedContent deve ser /case-studies/<slug> ou /blog/<slug>'),
  linkedType: z.enum(['case-study', 'blog']),
  relatedSkills: z.array(z.string()).default([]),
  followups: z.array(z.string().min(10).max(200)).min(2).max(5),
})

export type SkillFrontmatter = z.infer<typeof skillFrontmatterSchema>

export type SkillIndexEntry = SkillFrontmatter
