import type { ReactNode } from 'react'
import { Card, CardDescription, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Motion'
import { TransitionLink } from '@/components/layout/TransitionLink'
import { FourDigitsCover } from '@/components/play/FourDigitsCover'
import { ProximaSessaoCover } from '@/components/play/ProximaSessaoCover'

type SideProject = {
  stack: string
  title: string
  description: string
  tags: string[]
  href: string
  cta: string
  cover: ReactNode
}

const PROJECTS: SideProject[] = [
  {
    stack: 'Expo · Hono · Supabase',
    title: 'Próxima Sessão · Filmes e séries',
    description:
      'Ajuda a decidir o que assistir agora: uma escolha rápida sem conta, ' +
      'ou uma escolha que aprende com seu gosto e seu histórico, explica o ' +
      'motivo com IA e abre direto no streaming onde a obra está. Grupos ' +
      'com chat para escolher junto.',
    tags: ['React Native Web', 'TypeScript', 'Postgres + RLS', 'IA', 'Em produção'],
    href: '/play/proxima-sessao',
    cta: 'Conhecer o projeto →',
    cover: <ProximaSessaoCover className="w-full h-auto" />,
  },
  {
    stack: 'PWA · Firebase · Vanilla JS',
    title: '4 Dígitos · Arcade',
    description:
      'Adivinhação de número de 4 dígitos no estilo Mastermind: solo ' +
      'contra a IA (3 níveis de dificuldade) ou multiplayer com chat. ' +
      'Identidade CRT, áudio 8-bit em runtime, easter eggs. Só ' +
      'posições exatas contam como acerto.',
    tags: ['Mastermind', 'Solo vs IA', 'Multiplayer', 'PWA', 'Firebase'],
    href: '/play/4-digitos',
    cta: 'Conhecer e jogar →',
    cover: <FourDigitsCover className="w-full h-auto" />,
  },
]

const ProjectCard = ({ project }: { project: SideProject }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
    <div className="grid lg:grid-cols-2 lg:items-center">
      <div className="p-6 md:p-8 lg:p-10 order-2 lg:order-1">
        <Badge variant="outline">{project.stack}</Badge>
        <CardTitle as="h3" className="mt-4 text-2xl md:text-3xl">
          {project.title}
        </CardTitle>
        <CardDescription className="mt-3 text-base leading-relaxed">
          {project.description}
        </CardDescription>
        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
        <div className="mt-6">
          <TransitionLink href={project.href}>
            <Button variant="primary">{project.cta}</Button>
          </TransitionLink>
        </div>
      </div>
      <div className="bg-muted/30 border-b lg:border-b-0 lg:border-l border-border order-1 lg:order-2">
        {project.cover}
      </div>
    </div>
  </Card>
)

export const SideProjects = () => (
  <div className="container">
    <Reveal>
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Side projects
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Coisas que construí fora do trabalho. Dá pra usar.
        </p>
      </div>
    </Reveal>

    <div className="mt-10 space-y-8">
      {PROJECTS.map((project) => (
        <Reveal key={project.href}>
          <ProjectCard project={project} />
        </Reveal>
      ))}
    </div>
  </div>
)
