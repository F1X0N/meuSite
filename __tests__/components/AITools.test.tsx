import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AITools } from '@/components/sections/AITools'

vi.mock('@/components/motion/Motion', () => ({ Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }))

describe('análise de vaga e candidatura', () => {
  beforeEach(() => {
    localStorage.clear()
    Element.prototype.scrollTo = vi.fn()
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('analisa uma vaga longa na primeira tentativa e preserva a descrição ao fazer outra pergunta', async () => {
    const description = 'Experiência com desenvolvimento full stack e infraestrutura. '.repeat(100).trim()
    const fetchMock = vi.fn(async (url: string, _options: RequestInit) => {
      if (url.includes('targeted-resume')) return new Response(JSON.stringify({ error: 'teste' }), { status: 400 })
      return new Response(JSON.stringify({ type: 'job_fit', match_score_0_100: 75, summary_md: 'Análise da vaga', requirements: [], gaps: [], open_questions: [], sources: [] }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<AITools />)
    fireEvent.click(screen.getByRole('button', { name: 'Modo Verificar Fit' }))
    const input = screen.getByPlaceholderText(/cole a job description/i)
    fireEvent.change(input, { target: { value: description } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))
    await screen.findByText('Análise da vaga')
    fireEvent.change(input, { target: { value: 'Por que?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }))
    await waitFor(() => expect(screen.getAllByText('Análise da vaga')).toHaveLength(2))
    fireEvent.click(screen.getAllByRole('button', { name: 'Preparar candidatura' })[1])
    fireEvent.change(screen.getByLabelText('Cargo da vaga'), { target: { value: 'Software Engineer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Gerar currículo e carta' }))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
    const payload = JSON.parse(fetchMock.mock.calls[2][1].body as string)
    expect(payload.jobDescription).toBe(description)
    const followup = JSON.parse(fetchMock.mock.calls[1][1].body as string)
    expect(followup.history.some((message: { content: string }) => message.content === description)).toBe(true)
  })
})
