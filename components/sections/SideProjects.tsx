import { Card, CardDescription, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Motion'
import { TransitionLink } from '@/components/layout/TransitionLink'
import { FourDigitsCover } from '@/components/play/FourDigitsCover'

const TAGS = ['Mastermind', 'Solo vs IA', 'Multiplayer', 'PWA', 'Firebase']

export const SideProjects = () => (
  <div className="container">
    <Reveal>
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Side projects
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Coisas pequenas que escrevi pra mim. Dá pra brincar.
        </p>
      </div>
    </Reveal>

    <Reveal>
      <Card className="mt-10 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="grid lg:grid-cols-2 lg:items-center">
          <div className="p-6 md:p-8 lg:p-10 order-2 lg:order-1">
            <Badge variant="outline">PWA · Firebase · Vanilla JS</Badge>
            <CardTitle as="h3" className="mt-4 text-2xl md:text-3xl">
              4 Dígitos · Arcade
            </CardTitle>
            <CardDescription className="mt-3 text-base leading-relaxed">
              Adivinhação de número de 4 dígitos no estilo Mastermind: solo
              contra a IA (3 níveis de dificuldade) ou multiplayer com chat.
              Identidade CRT, áudio 8-bit em runtime, easter eggs. Só
              posições exatas contam como acerto.
            </CardDescription>
            <div className="mt-6 flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <div className="mt-6">
              <TransitionLink href="/play/4-digitos">
                <Button variant="primary">Conhecer e jogar →</Button>
              </TransitionLink>
            </div>
          </div>
          <div className="bg-muted/30 border-b lg:border-b-0 lg:border-l border-border order-1 lg:order-2">
            <FourDigitsCover className="w-full h-auto" />
          </div>
        </div>
      </Card>
    </Reveal>
  </div>
)
