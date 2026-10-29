import { InterviewPrepClient } from './client'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Preparar entrevista · Ferramentas',
  description: 'Gere um roteiro navegável de entrevista adaptado a uma vaga e baseado no currículo público atualizado.',
}

export default function InterviewPrepPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <InterviewPrepClient />
}
