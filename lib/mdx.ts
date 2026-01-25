import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const getContentDirectory = () => {
  return path.join(process.cwd(), 'content')
}

const getCaseStudiesDirectory = () => {
  return path.join(getContentDirectory(), 'case-studies')
}

const getBlogDirectory = () => {
  return path.join(getContentDirectory(), 'blog')
}

const readFileContent = (filePath) => {
  return fs.readFileSync(filePath, 'utf-8')
}

const parseMarkdownWithFrontmatter = (content) => {
  return matter(content)
}

const extractSlugFromFilename = (filename) => {
  return filename.replace(/\.mdx?$/, '')
}

const buildCaseStudyMetadata = (data, slug) => ({
  title: data.title || '',
  description: data.description || '',
  date: data.date || '',
  tags: data.tags || [],
  coverImage: data.coverImage || null,
  featured: data.featured || false,
  slug,
})

const buildBlogPostMetadata = (data, slug) => ({
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

export const getCaseStudyBySlug = (slug) => {
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

export const getBlogPostBySlug = (slug) => {
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
