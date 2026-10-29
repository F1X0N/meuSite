import resumeBase from '@/content/resume-base.json'

const maxFileBytes = 2_000_000
const maxTextLength = 20_000
type ResumeFile = Pick<File, 'name' | 'type' | 'size' | 'arrayBuffer'>

const fileKind = (file: ResumeFile): 'pdf' | 'docx' | 'txt' | null => {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf') && ['application/pdf', 'application/octet-stream', ''].includes(file.type)) return 'pdf'
  if (name.endsWith('.docx') && ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream', ''].includes(file.type)) return 'docx'
  if (name.endsWith('.txt') && ['text/plain', 'application/octet-stream', ''].includes(file.type)) return 'txt'
  return null
}

const readPdf = async (buffer: Buffer): Promise<string> => {
  if (buffer.subarray(0, 5).toString() !== '%PDF-') throw new Error('PDF inválido.')
  await import('pdf-parse/worker')
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: buffer })
  try {
    const result = await parser.getText()
    return result.text
  } finally {
    await parser.destroy()
  }
}

const readDocx = async (buffer: Buffer): Promise<string> => {
  if (buffer.subarray(0, 2).toString() !== 'PK') throw new Error('DOCX inválido.')
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

const readers = {
  pdf: readPdf,
  docx: readDocx,
  txt: async (buffer: Buffer) => buffer.toString('utf8'),
}

export const extractResumeText = async (file: ResumeFile): Promise<string> => {
  const kind = fileKind(file)
  if (!kind) throw new Error('Envie um currículo em PDF, DOCX ou TXT.')
  if (file.size === 0 || file.size > maxFileBytes) throw new Error('O arquivo deve ter até 2 MB.')
  const buffer = Buffer.from(await file.arrayBuffer())
  const text = (await readers[kind](buffer)).replace(/\0/g, '').trim().slice(0, maxTextLength)
  if (text.length < 100) throw new Error('Não foi possível extrair texto suficiente do currículo.')
  return text
}

const normalize = (value: string): string => value.toLowerCase().replace(/\s+/g, ' ')

export const isOwnerResumeText = (text: string): boolean => {
  const normalized = normalize(text)
  const header = normalized.slice(0, 1_000)
  const name = normalize(resumeBase.header.name)
  const email = normalize(resumeBase.header.email)
  const linkedin = resumeBase.header.linkedin.replace('https://www.', '').replace(/\/$/, '')
  const summaryMatches = resumeBase.summaryClauses
    .filter((clause) => clause.default)
    .filter((clause) => normalized.includes(normalize(clause.text).slice(0, 55))).length
  return header.includes(name) && header.includes(email) && header.includes(linkedin) && summaryMatches >= 2
}
