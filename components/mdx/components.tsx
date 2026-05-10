import type { MDXRemoteProps } from 'next-mdx-remote/rsc'
import { Spark } from './Spark'

/**
 * Componentes customizados disponíveis dentro de MDX (blog + case studies).
 * Registrados aqui para evitar duplicação entre as páginas de slug.
 */
export const mdxComponents: MDXRemoteProps['components'] = {
  Spark,
}
