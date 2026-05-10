import { describe, it, expect } from 'vitest'
import { suggestRoutes } from '@/lib/route-suggestions'

const posts = [
  { slug: 'idempotencia-state-machine', title: 'Idempotência via state machine' },
  { slug: 'anti-corruption-layer-llm', title: 'Anti-Corruption Layer para LLM' },
  { slug: 'retry-backoff-dlq', title: 'Retry, Backoff e Dead Letter' },
]

const cases = [
  { slug: 'cost-ledger-llm-multi-modelo', title: 'Cost Ledger LLM Multi-Modelo' },
  { slug: 'hexagonal-domain-saas', title: 'Hexagonal Domain SaaS' },
]

describe('suggestRoutes', () => {
  it('retorna array com tamanho limit (default 3)', () => {
    expect(suggestRoutes('/qualquer-coisa', posts, cases)).toHaveLength(3)
  })

  it('encontra match próximo para typo no slug do blog', () => {
    const result = suggestRoutes('/blog/idempotnecia', posts, cases)
    expect(result[0].href).toBe('/blog/idempotencia-state-machine')
    expect(result[0].kind).toBe('blog')
  })

  it('encontra match próximo para typo no slug de case study', () => {
    const result = suggestRoutes('/case-studies/cost-ledger-multi', posts, cases)
    expect(result[0].href).toBe('/case-studies/cost-ledger-llm-multi-modelo')
    expect(result[0].kind).toBe('case')
  })

  it('cai em página estática quando path está vazio', () => {
    const result = suggestRoutes('/', posts, cases)
    expect(result).toHaveLength(3)
    expect(result.every((r) => r.kind === 'page')).toBe(true)
  })

  it('sugere /about para typo /aboutt', () => {
    const result = suggestRoutes('/aboutt', posts, cases)
    expect(result[0].href).toBe('/about')
    expect(result[0].kind).toBe('page')
  })

  it('sugere /#experience para typo de seção', () => {
    const result = suggestRoutes('/expereience', posts, cases)
    expect(result[0].href).toBe('/#experience')
  })

  it('respeita limit customizado', () => {
    expect(suggestRoutes('/blog/x', posts, cases, 1)).toHaveLength(1)
    expect(suggestRoutes('/blog/x', posts, cases, 5)).toHaveLength(5)
  })

  it('não vaza distance no shape de retorno', () => {
    const result = suggestRoutes('/blog/x', posts, cases, 1)
    expect(Object.keys(result[0]).sort()).toEqual(['href', 'kind', 'label'])
  })
})
