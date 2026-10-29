import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { InterviewPrepClient } from '@/app/tools/interview-prep/client'
import { generateInterviewGuide } from '@/lib/agent-tools/interview-guide'

describe('InterviewPrepClient', () => {
  it('envia a vaga e exibe um roteiro navegável que pode ser copiado', async () => {
    const guide = generateInterviewGuide({ prioritySkills: ['must:React'], language: 'en', role: 'Full-Stack Engineer' })
    const fetchRequest = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ guide, generatedAt: '2026-10-28T12:00:00.000Z' }),
    })
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('fetch', fetchRequest)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })

    render(<InterviewPrepClient />)
    fireEvent.change(screen.getByLabelText('Cargo'), { target: { value: 'Full-Stack Engineer' } })
    fireEvent.change(screen.getByLabelText('Descrição da vaga'), { target: { value: 'Buscamos uma pessoa para construir interfaces React, APIs e apoiar entregas de produto com a equipe.' } })
    fireEvent.change(screen.getByLabelText(/Seu currículo/), { target: { files: [new File(['CV de exemplo'], 'curriculo.txt', { type: 'text/plain' })] } })
    fireEvent.submit(screen.getByRole('button', { name: 'Gerar roteiro' }).closest('form')!)

    expect(await screen.findByRole('heading', { name: 'Full-Stack Engineer' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Seções do roteiro' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Copiar roteiro' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Interview guide')))
    expect(fetchRequest).toHaveBeenCalledWith('/api/ai/interview-guide', expect.objectContaining({ method: 'POST' }))
  })
})
