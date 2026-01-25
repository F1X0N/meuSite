import { getAllCaseStudies } from '@/lib/mdx'
import CaseStudiesClient from './client'

export const metadata = {
  title: 'Case Studies',
  description:
    'Casos reais de implementação de IA em produção com foco em resiliência, performance e custos.',
}

export default function CaseStudiesPage() {
  const cases = getAllCaseStudies()
  return <CaseStudiesClient initialCases={cases} />
}
