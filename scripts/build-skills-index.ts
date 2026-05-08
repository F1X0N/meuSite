/**
 * Lê todos os arquivos em content/knowledge-skills/*.md, valida frontmatter
 * via zod schema, e gera:
 *   - content/knowledge-skills/INDEX.md (markdown legível)
 *   - lib/skills-data.json (estruturado para uso runtime sem ler FS no request path)
 *
 * Roda como `prebuild` no package.json. Falha o build se algum frontmatter
 * for inválido.
 */
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { skillFrontmatterSchema, type SkillFrontmatter } from '../lib/skill-schema'

const SKILLS_DIR = path.join(process.cwd(), 'content', 'knowledge-skills')
const INDEX_PATH = path.join(SKILLS_DIR, 'INDEX.md')
const JSON_PATH = path.join(process.cwd(), 'lib', 'skills-data.json')

const main = (): void => {
  if (!fs.existsSync(SKILLS_DIR)) {
    throw new Error(`Skills dir not found: ${SKILLS_DIR}`)
  }

  const files = fs
    .readdirSync(SKILLS_DIR)
    .filter((f) => f.endsWith('.md') && f !== 'INDEX.md')

  const skills: SkillFrontmatter[] = []
  const errors: string[] = []

  for (const file of files) {
    const filePath = path.join(SKILLS_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(raw)
    const parsed = skillFrontmatterSchema.safeParse(data)
    if (!parsed.success) {
      errors.push(`[${file}] ${JSON.stringify(parsed.error.issues)}`)
      continue
    }
    skills.push(parsed.data)
  }

  if (errors.length > 0) {
    console.error('Skill validation failed:')
    for (const e of errors) console.error('  ' + e)
    process.exit(1)
  }

  const indexMd = [
    '# Skills disponíveis',
    '',
    'Gerado automaticamente por `scripts/build-skills-index.ts`. Não editar à mão.',
    '',
    '| Skill | Descrição | Conteúdo linkado |',
    '|---|---|---|',
    ...skills.map(
      (s) =>
        `| \`${s.name}\` | ${s.description.replace(/\|/g, '\\|')} | [${s.linkedType}](${s.linkedContent}) |`,
    ),
    '',
  ].join('\n')

  fs.writeFileSync(INDEX_PATH, indexMd, 'utf-8')
  fs.writeFileSync(JSON_PATH, JSON.stringify(skills, null, 2) + '\n', 'utf-8')

  console.log(`✓ ${skills.length} skills validated`)
  console.log(`✓ wrote ${path.relative(process.cwd(), INDEX_PATH)}`)
  console.log(`✓ wrote ${path.relative(process.cwd(), JSON_PATH)}`)
}

main()
