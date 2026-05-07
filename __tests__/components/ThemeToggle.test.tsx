import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query.includes('dark'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    }) as unknown as MediaQueryList)
  })

  it('renderiza botão com aria-label de troca de tema após mount', async () => {
    render(<ThemeToggle />)
    const btn = await screen.findByRole('button', { name: /mudar para tema/i })
    expect(btn).toBeInTheDocument()
  })

  it('alterna a classe "dark" no documento ao clicar', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const btn = await screen.findByRole('button', { name: /mudar para tema/i })
    const initialDark = document.documentElement.classList.contains('dark')
    await act(async () => {
      await user.click(btn)
    })
    const afterClick = document.documentElement.classList.contains('dark')
    expect(afterClick).toBe(!initialDark)
  })

  it('persiste preferência em localStorage ao alternar', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const btn = await screen.findByRole('button', { name: /mudar para tema/i })
    await act(async () => {
      await user.click(btn)
    })
    expect(localStorage.getItem('theme')).toMatch(/light|dark/)
  })
})
