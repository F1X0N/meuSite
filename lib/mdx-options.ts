import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code'
import type { Pluggable } from 'unified'

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { dark: 'github-dark-dimmed', light: 'github-light' },
  keepBackground: false,
  defaultLang: 'plaintext',
}

export const mdxOptions = {
  mdxOptions: {
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]] as Pluggable[],
  },
}
