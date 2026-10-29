import { readFile } from 'node:fs/promises'
import { File } from 'node:buffer'
import { describe, expect, it } from 'vitest'
import { extractResumeText, isOwnerResumeText } from '@/lib/agent-tools/resume-upload'

describe('resume upload', () => {
  it('lê o CV público em PDF e reconhece a base profissional correspondente', async () => {
    const buffer = await readFile('public/cv.pdf')
    const file = new File([buffer], 'cv.pdf', { type: 'application/pdf' })
    const text = await extractResumeText(file)

    expect(text).toContain('Josivan Amorim')
    expect(isOwnerResumeText(text)).toBe(true)
  })

  it('não mistura um CV em texto de outra pessoa com o perfil público', async () => {
    const file = new File([
      'Maria Silva\nDesenvolveu interfaces React e APIs em Node.js.\nColaborou com uma equipe de produto para entregar sistemas web em produção.',
    ], 'cv.txt', { type: 'text/plain' })
    const text = await extractResumeText(file)

    expect(text).toContain('Maria Silva')
    expect(isOwnerResumeText(text)).toBe(false)
  })
})
