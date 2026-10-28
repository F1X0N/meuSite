import { JobSearchQueries } from './queries'

export const metadata = {
  title: 'Buscar vagas · Ferramentas',
  description: 'Buscas prontas para encontrar vagas de engenharia de software, full stack, backend, frontend, cloud e IA aplicada.',
}

export default function JobSearchPage() {
  return <JobSearchQueries />
}
