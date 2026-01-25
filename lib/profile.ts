import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content')
const KNOWLEDGE_BASE_PATH = path.join(CONTENT_DIR, 'knowledge-base.md')

const getMdxContent = (subdir: string, typeLabel: string) => {
  try {
    const dir = path.join(CONTENT_DIR, subdir)
    if (!fs.existsSync(dir)) return ''

    const files = fs.readdirSync(dir).filter(f => /\.mdx?$/.test(f))
    
    return files.map(file => {
      const filePath = path.join(dir, file)
      const rawContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(rawContent)
      
      // Smart Context: Pega apenas os primeiros 500 caracteres para não estourar tokens
      // Remove blocos de código grandes ```...``` para economizar
      const cleanContent = content
        .replace(/```[\s\S]*?```/g, '[Código omitido para brevidade]')
        .slice(0, 500)
        .trim() + '...'

      return `
=== ${typeLabel.toUpperCase()}: ${data.title || file} ===
Data: ${data.date || 'N/A'}
Tags: ${data.tags?.join(', ') || 'N/A'}
Resumo: ${data.description || 'Sem descrição'}
Trecho Inicial:
${cleanContent}
`
    }).join('\n\n')
  } catch (e) {
    console.error(`Erro ao ler ${subdir}:`, e)
    return ''
  }
}

export const getKnowledgeBase = () => {
  let fullContext = ''

  // 1. Base Principal (Perfil Biográfico + Resumos de Artigos/Cases)
  try {
    if (fs.existsSync(KNOWLEDGE_BASE_PATH)) {
      fullContext += fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf-8')
    }
  } catch (e) {
    console.error('Erro ao ler knowledge base:', e)
  }

  // DESABILITADO: Leitura dinâmica de Blogs e Cases (agora estão resumidos no knowledge-base.md)
  /*
  const blogContext = getMdxContent('blog', 'ARTIGO TÉCNICO')
  if (blogContext) {
    fullContext += `\n\n\n--- INÍCIO DOS ARTIGOS DO BLOG ---\n${blogContext}`
  }

  const caseContext = getMdxContent('case-studies', 'ESTUDO DE CASO (PROJETO REAL)')
  if (caseContext) {
    fullContext += `\n\n\n--- INÍCIO DOS ESTUDOS DE CASO ---\n${caseContext}`
  }
  */

  return fullContext
}
