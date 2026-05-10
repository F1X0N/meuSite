import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import type { Pluggable } from 'unified'

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { dark: 'github-dark-dimmed', light: 'github-light' },
  keepBackground: false,
  defaultLang: 'plaintext',
}

// rehype-slug adiciona id aos headings (h2/h3/...) baseado no texto.
// rehype-autolink-headings envolve o heading em <a href="#id"> para deep link.
// O PostAside lê os IDs gerados aqui pra construir o TOC dinâmico.
const autolinkOptions = {
  behavior: 'wrap' as const,
  properties: { className: ['heading-anchor'] },
}

export const mdxOptions = {
  mdxOptions: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, autolinkOptions],
      [rehypePrettyCode, prettyCodeOptions],
    ] as Pluggable[],
  },
}
