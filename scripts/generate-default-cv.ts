/**
 * Gera o CV default em public/cv.pdf a partir do template react-pdf.
 * Roda no prebuild do package.json — single source of truth a partir
 * de content/resume-base.json.
 */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { generateResumePDF } from '../lib/agent-tools/resume-pdf'

async function main() {
  console.log('[gen-default-cv] gerando public/cv.pdf...')
  const buffer = await generateResumePDF([])
  const outPath = path.join(process.cwd(), 'public', 'cv.pdf')
  await writeFile(outPath, buffer)
  console.log(`[gen-default-cv] gravado: ${outPath} (${buffer.length} bytes)`)
}

main().catch((err) => {
  console.error('[gen-default-cv] erro:', err)
  process.exit(1)
})
