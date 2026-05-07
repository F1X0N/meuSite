import { describe, it, expect } from 'vitest'
import { getKnowledgeBase } from '@/lib/profile'

describe('lib/profile.getKnowledgeBase', () => {
  it('retorna conteúdo do knowledge-base.md (não vazio)', () => {
    const kb = getKnowledgeBase()
    expect(kb.length).toBeGreaterThan(500)
  })

  it('inclui seções esperadas (resumo executivo, princípios, experiência)', () => {
    const kb = getKnowledgeBase()
    expect(kb).toMatch(/RESUMO EXECUTIVO/i)
    expect(kb).toMatch(/PRINC[ÍI]PIOS/i)
    expect(kb).toMatch(/EXPERI[ÊE]NCIA/i)
  })

  it('inclui regra explícita sobre como contar anos de experiência', () => {
    const kb = getKnowledgeBase()
    expect(kb).toMatch(/Como contar anos de experi[êe]ncia/i)
  })

  it('inclui FAQ com pergunta sobre limites de honestidade', () => {
    const kb = getKnowledgeBase()
    expect(kb).toMatch(/Limites e Honestidade/i)
  })
})
