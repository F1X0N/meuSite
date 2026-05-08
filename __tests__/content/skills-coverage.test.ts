import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { skillFrontmatterSchema } from '@/lib/skill-schema'

const CONTENT_DIR = path.join(process.cwd(), 'content')
const SKILLS_DIR = path.join(CONTENT_DIR, 'knowledge-skills')

const listMdxSlugs = (subdir: string): string[] => {
  const dir = path.join(CONTENT_DIR, subdir)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => f.replace(/\.mdx?$/, ''))
}

const loadSkill = (skillName: string) => {
  const filePath = path.join(SKILLS_DIR, `${skillName}.md`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(raw)
  return skillFrontmatterSchema.safeParse(data)
}

describe('Skills coverage gate', () => {
  const caseSlugs = listMdxSlugs('case-studies')
  const blogSlugs = listMdxSlugs('blog')

  it.each(caseSlugs)('case-study "%s" tem skill correspondente válida', (slug) => {
    const skillName = `case-${slug}`
    const result = loadSkill(skillName)
    expect(result, `Faltando ${SKILLS_DIR}/${skillName}.md`).not.toBeNull()
    expect(result?.success, `${skillName}.md frontmatter invalido: ${JSON.stringify(result && !result.success ? result.error.issues : '')}`).toBe(true)
    if (result?.success) {
      expect(result.data.linkedContent).toBe(`/case-studies/${slug}`)
      expect(result.data.linkedType).toBe('case-study')
    }
  })

  it.each(blogSlugs)('blog post "%s" tem skill correspondente válida', (slug) => {
    const skillName = `blog-${slug}`
    const result = loadSkill(skillName)
    expect(result, `Faltando ${SKILLS_DIR}/${skillName}.md`).not.toBeNull()
    expect(result?.success, `${skillName}.md frontmatter invalido`).toBe(true)
    if (result?.success) {
      expect(result.data.linkedContent).toBe(`/blog/${slug}`)
      expect(result.data.linkedType).toBe('blog')
    }
  })

  it('todos os triggers nas skills são únicos por skill', () => {
    const skillFiles = fs.readdirSync(SKILLS_DIR).filter((f) => f.endsWith('.md') && f !== 'INDEX.md')
    for (const file of skillFiles) {
      const raw = fs.readFileSync(path.join(SKILLS_DIR, file), 'utf-8')
      const { data } = matter(raw)
      const triggers = data.triggers as string[]
      const unique = new Set(triggers.map((t) => t.toLowerCase()))
      expect(unique.size).toBe(triggers.length)
    }
  })
})
