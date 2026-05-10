/**
 * Sugestões de rotas para a página 404.
 * Calcula distância de Levenshtein entre o path errado e os slugs/rotas
 * conhecidos, retornando os top-N mais parecidos.
 *
 * Sem dependências externas: implementação iterativa em ~20 linhas.
 */

const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  )
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }
  return matrix[a.length][b.length]
}

export type RouteSuggestion = {
  href: string
  label: string
  kind: 'blog' | 'case' | 'page'
}

const STATIC_PAGES: RouteSuggestion[] = [
  { href: '/blog', label: 'Blog', kind: 'page' },
  { href: '/case-studies', label: 'Case Studies', kind: 'page' },
  { href: '/contact', label: 'Contato', kind: 'page' },
  { href: '/about', label: 'Sobre', kind: 'page' },
  { href: '/#ai-tools', label: 'AI Tools', kind: 'page' },
  { href: '/#experience', label: 'Trajetória', kind: 'page' },
  { href: '/#highlights', label: 'Highlights', kind: 'page' },
]

const normalize = (input: string): string =>
  input
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase()

const lastSegment = (input: string): string => {
  const trimmed = input.replace(/^\/+|\/+$/g, '')
  if (!trimmed) return ''
  const parts = trimmed.split('/')
  return normalize(parts[parts.length - 1] ?? '')
}

type IndexedItem = { slug: string; title: string }

export const suggestRoutes = (
  badPath: string,
  posts: IndexedItem[],
  cases: IndexedItem[],
  limit = 3,
): RouteSuggestion[] => {
  const fullTarget = normalize(badPath)
  if (!fullTarget) return STATIC_PAGES.slice(0, limit)

  // Slug do path errado (último segmento) é o que comparamos com slugs reais.
  // Ex: /blog/idempotnecia → "idempotnecia" vs slug "idempotencia-state-machine".
  // Sem isso, "/blog" ganharia sempre por ser muito curto.
  const slugTarget = lastSegment(badPath) || fullTarget

  // Distância normalizada (ratio) é mais justa entre strings de comprimento
  // muito diferente. Sem isso, static pages curtas ("/blog") ganham por default
  // contra slugs longos com 1-2 typos.
  const ratio = (a: string, b: string): number => {
    if (!a && !b) return 0
    const max = Math.max(a.length, b.length)
    return max === 0 ? 0 : levenshtein(a, b) / max
  }

  type Scored = RouteSuggestion & { distance: number }

  const candidates: Scored[] = [
    ...posts.map((p): Scored => ({
      href: `/blog/${p.slug}`,
      label: p.title,
      kind: 'blog',
      distance: ratio(slugTarget, normalize(p.slug)),
    })),
    ...cases.map((c): Scored => ({
      href: `/case-studies/${c.slug}`,
      label: c.title,
      kind: 'case',
      distance: ratio(slugTarget, normalize(c.slug)),
    })),
    ...STATIC_PAGES.map((p): Scored => ({
      ...p,
      distance: ratio(fullTarget, normalize(p.href)),
    })),
  ]

  return candidates
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ href, label, kind }) => ({ href, label, kind }))
}
