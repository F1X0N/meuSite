import { describe, it, expect } from 'vitest'
import {
  getAllCaseStudies,
  getAllBlogPosts,
  getCaseStudyBySlug,
  getBlogPostBySlug,
  getAllContent,
} from '@/lib/mdx'

describe('lib/mdx', () => {
  describe('getAllCaseStudies', () => {
    it('retorna pelo menos um case study', () => {
      const cases = getAllCaseStudies()
      expect(cases.length).toBeGreaterThan(0)
    })

    it('cada case tem slug, title, description e tags', () => {
      const cases = getAllCaseStudies()
      for (const c of cases) {
        expect(c.slug).toBeTruthy()
        expect(c.title).toBeTruthy()
        expect(c.description).toBeTruthy()
        expect(Array.isArray(c.tags)).toBe(true)
      }
    })

    it('inclui os 3 cases sanitizados criados na reformulação', () => {
      const slugs = getAllCaseStudies().map((c) => c.slug)
      expect(slugs).toContain('orquestracao-ia-operacao')
      expect(slugs).toContain('diagnostico-observabilidade-producao')
      expect(slugs).toContain('validacao-criterios-aceite')
    })
  })

  describe('getCaseStudyBySlug', () => {
    it('retorna o case com content quando slug existe', () => {
      const c = getCaseStudyBySlug('orquestracao-ia-operacao')
      expect(c).not.toBeNull()
      expect(c?.title).toBeTruthy()
      expect(c?.content).toContain('Contexto')
    })

    it('retorna null quando slug não existe', () => {
      const c = getCaseStudyBySlug('slug-que-nao-existe-ever')
      expect(c).toBeNull()
    })
  })

  describe('getAllBlogPosts', () => {
    it('inclui os 3 blog posts criados na reformulação', () => {
      const slugs = getAllBlogPosts().map((p) => p.slug)
      expect(slugs).toContain('ia-controle-humano')
      expect(slugs).toContain('observabilidade-antes-de-opiniao')
      expect(slugs).toContain('metricas-que-pagam-a-conta')
    })
  })

  describe('getBlogPostBySlug', () => {
    it('retorna post com content quando slug existe', () => {
      const p = getBlogPostBySlug('ia-controle-humano')
      expect(p).not.toBeNull()
      expect(p?.content.length).toBeGreaterThan(100)
    })
  })

  describe('getAllContent', () => {
    it('agrega cases e posts em um único shape', () => {
      const all = getAllContent()
      expect(all.cases.length).toBeGreaterThan(0)
      expect(all.posts.length).toBeGreaterThan(0)
      expect(all.all.length).toBe(all.cases.length + all.posts.length)
    })
  })
})
