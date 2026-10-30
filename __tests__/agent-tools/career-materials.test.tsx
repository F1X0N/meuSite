import { describe, expect, it } from 'vitest'
import { pdf } from '@react-pdf/renderer'
import { CoverLetterDocument } from '@/lib/agent-tools/cover-letter-pdf'
import { buildTargetedResumeModel, validateMarkdownIsSubset, generateTargetedResumeMarkdown } from '@/lib/agent-tools/resume'
import { generateCoverLetter } from '@/lib/agent-tools/cover-letter'

describe('career materials', () => {
  it('relaciona a vaga somente a competências verificadas em português e inglês', () => {
    const signals = ['must:React', 'must:Java']
    const english = buildTargetedResumeModel(signals, 'en').summaryClauses.map((clause) => clause.text).join(' ')
    const portuguese = buildTargetedResumeModel(signals, 'pt').summaryClauses.map((clause) => clause.text).join(' ')
    const letter = generateCoverLetter({ prioritySkills: signals, language: 'en', role: 'Engineer' })

    expect(english).toContain('Experience with React')
    expect(portuguese).toContain('Experiência com React')
    expect(english).not.toContain('Experience with React, Java')
    expect(letter).not.toContain('calls for React, Java')
    expect(validateMarkdownIsSubset(generateTargetedResumeMarkdown(signals)).ok).toBe(true)
    expect(validateMarkdownIsSubset('Experience with Java, aligned with requirements of this role.').ok).toBe(false)
  })

  it('gera PDF com o texto editado da carta', async () => {
    const blob = await pdf(<CoverLetterDocument content={'Texto editado.\n\nSegunda parte.'} />).toBlob()
    const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = reject
      reader.readAsArrayBuffer(blob)
    })
    const buffer = Buffer.from(bytes)
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-')
    await import('pdf-parse/worker')
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({ data: buffer })
    const text = (await parser.getText()).text
    await parser.destroy()
    expect(text).toContain('Texto editado.')
    expect(text).toContain('Segunda parte.')
  })
})
