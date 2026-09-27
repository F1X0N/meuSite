import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { BackLink } from '@/components/ui/BackLink'
import { ProximaSessaoCover } from '@/components/play/ProximaSessaoCover'

export const metadata = {
  title: 'Próxima Sessão · Side project',
  description:
    'Side project: app que ajuda a decidir qual filme ou série assistir agora, com escolha rápida sem conta, perfil de gosto, explicação por IA, links diretos para o streaming e grupos com chat. Expo, Hono, Supabase e TypeScript estrito.',
}

const APP_URL = 'https://audiovisual-arts.vercel.app'

const TAGS = ['React Native Web', 'Expo', 'Hono', 'Supabase', 'Postgres + RLS', 'TypeScript', 'IA']

const SCREENSHOTS = [
  {
    src: '/projects/proxima-sessao/escolha-rapida.png',
    alt: 'Tela da escolha rápida sem conta: escolha entre filme e série, filtros e a obra sugerida com os motivos da escolha',
    caption: 'Escolha rápida, sem conta e sem IA.',
  },
  {
    src: '/projects/proxima-sessao/onde-assistir.png',
    alt: 'Tela da obra sugerida com os motivos da escolha e o atalho para abrir a obra no serviço de streaming',
    caption: 'Por que esta escolha e onde assistir.',
  },
]

export default function ProximaSessaoPage() {
  return (
    <div className="py-16 md:py-20 lg:py-24">
      <div className="container max-w-3xl">
        <BackLink href="/" label="Voltar para a home" />

        <div className="mt-6 cover-interactive">
          <ProximaSessaoCover className="w-full h-auto" />
        </div>

        <header className="mt-12 border-b pb-8">
          <Badge variant="outline">Side project</Badge>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Próxima Sessão
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Um app para responder à pergunta de toda noite: o que eu assisto
            agora? Ele escolhe um filme ou uma série pelo seu momento, diz por
            que escolheu e leva direto para o streaming onde a obra está. Em
            inglês, o mesmo app se chama Next Showing.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SCREENSHOTS.map((shot) => (
            <figure key={shot.src}>
              <div className="overflow-hidden rounded-2xl border border-border bg-[#0C0D10] shadow-sm">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={390}
                  height={900}
                  className="w-full h-auto"
                  sizes="(min-width: 640px) 360px, 100vw"
                />
              </div>
              <figcaption className="mt-3 text-sm text-muted-foreground text-center">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <article className="mt-12 prose prose-lg dark:prose-invert max-w-none">
          <h2>Como funciona</h2>
          <p>
            <strong>Sem conta</strong>: você escolhe entre filme e série,
            ajusta alguns filtros e recebe uma sugestão na hora. Essa escolha
            não usa IA. Ela combina sinais públicos e agregados: o que as
            pessoas andam aprovando no app, notas públicas e premiações. Nada
            fica salvo.
          </p>
          <p>
            <strong>Com conta</strong>: a escolha passa a considerar seu perfil
            de gosto, não repete o que você já viu e pergunta depois como foi.
            A avaliação volta para o perfil e melhora as próximas sugestões.
            Quando a IA entra, ela explica o motivo da escolha em linguagem
            natural, com uma cota mensal no plano gratuito.
          </p>
          <p>
            <strong>Onde assistir</strong>: a sugestão mostra em quais serviços
            a obra está disponível no Brasil e abre direto na página dela
            dentro do streaming, sem passar por um site intermediário.
          </p>
          <p>
            <strong>Em grupo</strong>: até 10 pessoas escolhem juntas, sem
            repetir o que alguém do grupo já viu, com chat e perfil de cada
            membro. Cada pessoa decide o que o grupo pode ver do seu perfil.
          </p>

          <h2>Identidade</h2>
          <p>
            O símbolo se chama Match: dois círculos que se cruzam, você com seu
            gosto e o catálogo, com o play onde os dois se encontram. O mesmo
            símbolo vale em todos os idiomas; o nome muda por mercado. A capa
            acima redesenha o símbolo com as cores deste site.
          </p>

          <h2>Como foi construído</h2>
          <p>
            O código segue uma arquitetura de portas e adaptadores. Entidades
            e objetos de valor do domínio não fazem IO, os casos de uso
            dependem de portas, e a infraestrutura implementa repositórios e
            provedores. As rotas validam os dados de entrada com schemas em
            runtime antes de chamar os casos de uso.
          </p>
          <p>
            As regras de acesso ficam no banco, com Row Level Security e
            funções que só a API chama, e cada migration vem com testes em
            pgTAP. O motor de escolha é agnóstico: o uso de IA é uma política
            por público (anônimo, gratuito ou assinante), não uma dependência.
          </p>

          <h2>Stack</h2>
          <ul>
            <li>Monorepo pnpm com TypeScript estrito.</li>
            <li>Cliente em Expo (React Native Web), pensado para web e lojas de apps.</li>
            <li>API em Hono, com validação de DTOs por schema.</li>
            <li>Supabase: Postgres, Auth, RLS e testes pgTAP.</li>
            <li>Catálogo com dados do TMDB; explicações com um modelo da OpenAI.</li>
            <li>GitHub Actions roda verificação, build e pgTAP em cada PR; o merge em main aplica as migrations e publica na Vercel.</li>
          </ul>
        </article>

        <div className="mt-12">
          <a href={APP_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="lg">Abrir o app →</Button>
          </a>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Abre em nova aba. A escolha rápida funciona sem cadastro.
        </p>
      </div>
    </div>
  )
}
