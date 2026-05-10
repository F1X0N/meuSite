import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spark } from '@/components/mdx/Spark'

describe('Spark', () => {
  it('renderiza valores antes/depois com unidade', () => {
    render(<Spark before={100} after={25} unit=" ms" label="latência" />)
    expect(screen.getByText('100 ms')).toBeDefined()
    expect(screen.getByText('25 ms')).toBeDefined()
  })

  it('classifica como melhora quando direction lower-better e after < before', () => {
    render(<Spark before={100} after={25} unit="ms" />)
    expect(screen.getByText(/de melhora/i)).toBeDefined()
  })

  it('classifica como regressão quando direction lower-better e after > before', () => {
    render(<Spark before={50} after={120} unit="ms" />)
    expect(screen.getByText(/de regressão/i)).toBeDefined()
  })

  it('inverte semântica em higher-better', () => {
    render(<Spark before={50} after={120} unit="rps" direction="higher-better" />)
    expect(screen.getByText(/de melhora/i)).toBeDefined()
  })

  it('mostra label quando passado', () => {
    render(<Spark before={1} after={2} unit="" label="latência p99" />)
    expect(screen.getByText('latência p99')).toBeDefined()
  })

  it('arredonda inteiros sem decimal e fracionais com 1 casa', () => {
    render(<Spark before={4} after={0.1} unit=" USD" />)
    expect(screen.getByText('4 USD')).toBeDefined()
    expect(screen.getByText('0.1 USD')).toBeDefined()
  })

  it('não quebra com before=0 (sem divisão por zero no delta)', () => {
    render(<Spark before={0} after={10} unit="" />)
    expect(screen.getByText(/de melhora|de regressão/i)).toBeDefined()
  })
})
