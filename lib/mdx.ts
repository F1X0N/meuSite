import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

type FrontmatterData = Record<string, unknown> & {
  title?: string
  description?: string
  date?: string
  tags?: string[]
  coverImage?: string | null
  featured?: boolean
  readingTime?: string
}

export type CaseStudyMeta = {
  title: string
  description: string
  date: string
  tags: string[]
  coverImage: string | null
  featured: boolean
  slug: string
}

export type BlogPostMeta = {
  title: string
  description: string
  date: string
  tags: string[]
  readingTime: string
  slug: string
}

const getContentDirectory = () => {
  return path.join(process.cwd(), 'content')
}

const getCaseStudiesDirectory = () => {
  return path.join(getContentDirectory(), 'case-studies')
}

const getBlogDirectory = () => {
  return path.join(getContentDirectory(), 'blog')
}

const readFileContent = (filePath: string) => {
  return fs.readFileSync(filePath, 'utf-8')
}

const parseMarkdownWithFrontmatter = (content: string) => {
  return matter(content)
}

const extractSlugFromFilename = (filename: string) => {
  return filename.replace(/\.mdx?$/, '')
}

const buildCaseStudyMetadata = (data: FrontmatterData, slug: string): CaseStudyMeta => ({
  title: data.title || '',
  description: data.description || '',
  date: data.date || '',
  tags: data.tags || [],
  coverImage: data.coverImage || null,
  featured: data.featured || false,
  slug,
})

const buildBlogPostMetadata = (data: FrontmatterData, slug: string): BlogPostMeta => ({
  title: data.title || '',
  description: data.description || '',
  date: data.date || '',
  tags: data.tags || [],
  readingTime: data.readingTime || '5 min',
  slug,
})

export const getAllCaseStudies = () => {
  const directory = getCaseStudiesDirectory()
  
  if (!fs.existsSync(directory)) {
    return []
  }

  const filenames = fs.readdirSync(directory)

  return filenames
    .filter((filename) => /\.mdx?$/.test(filename))
    .map((filename) => {
      const filePath = path.join(directory, filename)
      const content = readFileContent(filePath)
      const { data } = parseMarkdownWithFrontmatter(content)
      const slug = extractSlugFromFilename(filename)

      return buildCaseStudyMetadata(data, slug)
    })
}

export const getCaseStudyBySlug = (slug: string) => {
  const directory = getCaseStudiesDirectory()
  const filePath = path.join(directory, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const content = readFileContent(filePath)
  const { data, content: markdown } = parseMarkdownWithFrontmatter(content)

  return {
    ...buildCaseStudyMetadata(data, slug),
    content: markdown,
  }
}

export const getAllBlogPosts = () => {
  const directory = getBlogDirectory()
  
  if (!fs.existsSync(directory)) {
    return []
  }

  const filenames = fs.readdirSync(directory)

  return filenames
    .filter((filename) => /\.mdx?$/.test(filename))
    .map((filename) => {
      const filePath = path.join(directory, filename)
      const content = readFileContent(filePath)
      const { data } = parseMarkdownWithFrontmatter(content)
      const slug = extractSlugFromFilename(filename)

      return buildBlogPostMetadata(data, slug)
    })
}

export const getBlogPostBySlug = (slug: string) => {
  const directory = getBlogDirectory()
  const filePath = path.join(directory, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const content = readFileContent(filePath)
  const { data, content: markdown } = parseMarkdownWithFrontmatter(content)

  return {
    ...buildBlogPostMetadata(data, slug),
    content: markdown,
  }
}

export const getAllContent = () => {
  const cases = getAllCaseStudies()
  const posts = getAllBlogPosts()
  
  return {
    cases,
    posts,
    all: [...cases, ...posts],
  }
}
