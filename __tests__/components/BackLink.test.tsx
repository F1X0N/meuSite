import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BackLink } from '@/components/ui/BackLink'

describe('BackLink', () => {
  it('renderiza com label customizado e href correto', () => {
    render(<BackLink href="/case-studies" label="Voltar para case studies" />)
    const link = screen.getByRole('link', { name: /voltar para case studies/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/case-studies')
  })

  it('usa label "Voltar" como default', () => {
    render(<BackLink href="/blog" />)
    const link = screen.getByRole('link', { name: /voltar/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/blog')
  })
})
