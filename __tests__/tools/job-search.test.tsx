import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { JobSearchQueries } from '@/app/tools/job-search/queries'
import { jobSearchGroups } from '@/content/job-search-queries'

describe('JobSearchQueries', () => {
  it('copia a query selecionada e abre a mesma busca no LinkedIn', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })

    render(<JobSearchQueries />)

    const query = jobSearchGroups[0].queries[0]
    fireEvent.click(screen.getByRole('button', { name: 'Copiar busca de Full stack para Brasil' }))

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(query.expression))
    expect(screen.getByText('Query copiada.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Abrir busca de Full stack para Brasil no LinkedIn em nova aba' })).toHaveAttribute(
      'href',
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query.expression)}`,
    )
  })
})
