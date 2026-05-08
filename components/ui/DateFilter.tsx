'use client'

import { Button } from './Button'

export type DateFilterRange = 'all' | '30d' | '90d' | '180d' | 'thisYear'

const RANGES: { id: DateFilterRange; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: '30d', label: 'Último mês' },
  { id: '90d', label: '3 meses' },
  { id: '180d', label: '6 meses' },
  { id: 'thisYear', label: 'Este ano' },
]

const DAY_MS = 24 * 60 * 60 * 1000

export const filterByDateRange = <T extends { date: string }>(
  items: T[],
  range: DateFilterRange,
): T[] => {
  if (range === 'all') return items
  const now = new Date()
  let cutoff: Date
  if (range === 'thisYear') {
    cutoff = new Date(now.getFullYear(), 0, 1)
  } else {
    const days = { '30d': 30, '90d': 90, '180d': 180 }[range]
    cutoff = new Date(now.getTime() - days * DAY_MS)
  }
  return items.filter((it) => new Date(it.date) >= cutoff)
}

type DateFilterProps = {
  active: DateFilterRange
  onChange: (r: DateFilterRange) => void
}

export const DateFilter = ({ active, onChange }: DateFilterProps) => (
  <div
    className="flex flex-wrap gap-2"
    role="group"
    aria-label="Filtrar por data de publicação"
  >
    {RANGES.map((r) => (
      <Button
        key={r.id}
        size="sm"
        variant={active === r.id ? 'primary' : 'outline'}
        onClick={() => onChange(r.id)}
        aria-pressed={active === r.id}
      >
        {r.label}
      </Button>
    ))}
  </div>
)
