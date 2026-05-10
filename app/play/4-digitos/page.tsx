import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { BackLink } from '@/components/ui/BackLink'
import { FourDigitsCover } from '@/components/play/FourDigitsCover'

export const metadata = {
  title: '4 Dígitos · Side project',
  description:
    'Side project: adivinhação de número de 4 dígitos no estilo Mastermind, com modo solo contra IA e multiplayer com chat. Identidade arcade/CRT, PWA, Vanilla JS + Firebase.',
}

const PLAY_URL = 'https://number-guesser-63f12.web.app/'

export default function FourDigitsPlayPage() {
  return (
    <div className="py-16 md:py-20 lg:py-24">
      <div className="container max-w-3xl">
        <BackLink href="/" label="Voltar para a home" />

        <div className="mt-6 cover-interactive">
          <FourDigitsCover className="w-full h-auto" />
        </div>

        <header className="mt-12 border-b pb-8">
          <Badge variant="outline">Side project</Badge>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
            4 Dígitos
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Adivinhação de número de 4 dígitos no estilo Mastermind. Tem modo
            solo contra IA com 3 níveis de dificuldade e modo multiplayer com
            chat entre os jogadores. Identidade arcade/CRT, PWA, easter eggs.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['Mastermind', 'Solo vs IA', 'Multiplayer', 'PWA', 'Firebase', 'Vanilla JS'].map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </header>

        <article className="mt-12 prose prose-lg dark:prose-invert max-w-none">
          <h2>Como funciona</h2>
          <p>
            Cada lado escolhe um número secreto de 4 dígitos e tenta adivinhar
            o do oponente. Só posições exatas contam como acerto. Quem fechar
            os 4 acertos primeiro vence.
          </p>
          <p>
            <strong>Solo</strong>: você joga contra a IA. Ela não vê seu
            número — deduz a partir das respostas que você dá aos palpites
            dela, usando o mesmo motor de candidatos do jogo. Tem três níveis
            de dificuldade que mudam tanto a inteligência da IA quanto o
            quanto cada palpite revela.
          </p>
          <p>
            <strong>Multiplayer</strong>: dois jogadores numa sala compartilhada,
            estado canônico no Realtime Database, presença com{' '}
            <code>onDisconnect</code>, chat em painel lateral persistido junto
            com a sala.
          </p>

          <h2>Modos de jogo</h2>
          <p>
            Uma única dimensão de dificuldade controla quanta informação cada
            palpite revela:
          </p>
          <ul>
            <li>
              <strong>Fácil</strong> — mostra posições + dígitos + total
              acertado. IA aleatória com leve drift.
            </li>
            <li>
              <strong>Médio</strong> — mostra o conjunto de dígitos certos +
              total. IA consistente.
            </li>
            <li>
              <strong>Difícil</strong> — mostra apenas o total. IA com minimax.
            </li>
          </ul>
          <p>
            Placar local guarda vitórias e derrotas por modo. Help modal com as
            regras fica acessível pelo ícone <code>?</code> em qualquer tela.
          </p>

          <h2>Por que isso existe</h2>
          <p>
            Foi um exercício deliberadamente sem framework. Vanilla JS,
            módulos ES, Service Worker pra PWA, Realtime Database pra estado
            canônico do multiplayer. Render via DOM imperativo, lógica pura
            isolada em módulos testáveis (Vitest), E2E em Playwright contra o
            emulator do Firebase. Sem build step.
          </p>
          <p>
            A estética arcade veio depois, quase como uma camada cosmética:
            VT323 para os dígitos, paleta CRT (verde fósforo + âmbar +
            magenta), áudio 8-bit gerado em runtime via Web Audio API,
            scanlines opcionais com <code>prefers-reduced-motion</code>{' '}
            respeitado. Konami code (ou long-press no logo, no mobile)
            intensifica o modo CRT.
          </p>

          <h2>Stack</h2>
          <ul>
            <li>HTML + CSS + JavaScript ES modules. Zero bundler.</li>
            <li>Firebase Hosting + Realtime Database + Auth.</li>
            <li>Service Worker (cache estático + network-first).</li>
            <li>Vitest (unit) + Playwright (E2E contra emulator) + smoke pós-deploy.</li>
            <li>CI no GitHub Actions: PR roda unit + E2E; merge em main faz deploy + smoke.</li>
          </ul>

          <h2>Como entrar</h2>
          <p>
            Basta um nome de jogador (3-20 caracteres). Sem email, sem senha.
            No solo a partida começa direto; no multiplayer cria-se uma sala e
            a partida começa quando os dois jogadores definirem seus números
            secretos.
          </p>
        </article>

        <div className="mt-12">
          <a href={PLAY_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="lg">Jogar agora →</Button>
          </a>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Abre em nova aba. Crie um nome de jogador (3-20 caracteres) — sem email.
        </p>
      </div>
    </div>
  )
}
