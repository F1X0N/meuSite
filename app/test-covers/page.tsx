/**
 * Página de teste interna para validar covers em light/dark + thumbnail size.
 * Bloqueada em produção via notFound() — só acessível em dev/preview.
 */
import { notFound } from 'next/navigation'
import { IdempotenciaCover } from '@/components/blog-covers/IdempotenciaCover'
import { HexagonalCover } from '@/components/blog-covers/HexagonalCover'
import { AntiCorruptionLayerCover } from '@/components/blog-covers/AntiCorruptionLayerCover'
import { RetryBackoffDlqCover } from '@/components/blog-covers/RetryBackoffDlqCover'
import { DomainEventsCover } from '@/components/blog-covers/DomainEventsCover'
import { CostLedgerLlmCover } from '@/components/blog-covers/CostLedgerLlmCover'
import { TimeoutPromiseRaceCover } from '@/components/blog-covers/TimeoutPromiseRaceCover'
import { ConnectionContextCover } from '@/components/blog-covers/ConnectionContextCover'
import { RequestIdTraceCover } from '@/components/blog-covers/RequestIdTraceCover'
import { LogPayloadTruncationCover } from '@/components/blog-covers/LogPayloadTruncationCover'
import { RumIntegrationCover } from '@/components/blog-covers/RumIntegrationCover'
import { WebhookSignatureCover } from '@/components/blog-covers/WebhookSignatureCover'
import { ApiKeyIsolationCover } from '@/components/blog-covers/ApiKeyIsolationCover'
import { StrategyPatternCover } from '@/components/blog-covers/StrategyPatternCover'
import { ValueObjectIdCover } from '@/components/blog-covers/ValueObjectIdCover'

export const metadata = { title: 'Test Covers (interno)' }

const COVERS: Array<{ name: string; Component: React.ComponentType<{ className?: string }> }> = [
  { name: 'Idempotência via state machine', Component: IdempotenciaCover },
  { name: 'Hexagonal architecture', Component: HexagonalCover },
  { name: 'Anti-Corruption Layer (LLM → domínio)', Component: AntiCorruptionLayerCover },
  { name: 'Retry · Backoff · Dead Letter', Component: RetryBackoffDlqCover },
  { name: 'Domain Events', Component: DomainEventsCover },
  { name: 'Cost Ledger LLM', Component: CostLedgerLlmCover },
  { name: 'Timeout Promise.race', Component: TimeoutPromiseRaceCover },
  { name: 'Connection Context (serverless)', Component: ConnectionContextCover },
  { name: 'Request ID Trace Correlation', Component: RequestIdTraceCover },
  { name: 'Log Payload Truncation', Component: LogPayloadTruncationCover },
  { name: 'RUM Integration', Component: RumIntegrationCover },
  { name: 'Webhook Signature Verification', Component: WebhookSignatureCover },
  { name: 'API Key Isolation', Component: ApiKeyIsolationCover },
  { name: 'Strategy Pattern', Component: StrategyPatternCover },
  { name: 'Value Object ID', Component: ValueObjectIdCover },
]

export default function TestCoversPage() {
  // Página interna apenas — não exposta em produção.
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <main className="container max-w-6xl py-12 space-y-16">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Cover preview — light / dark / thumbnail</h1>
        <p className="text-sm text-muted-foreground">
          Página interna para validar identidade visual antes de aplicar no fluxo do blog.
          Cores derivam de design tokens (CSS vars) — herdam tema do site automaticamente.
          Para alternar entre light/dark, use o ThemeToggle do site (header).
        </p>
      </header>

      {COVERS.map((cover, index) => (
        <section key={cover.name} className="space-y-4">
          <h2 className="text-xl font-semibold">{index + 1}. {cover.name}</h2>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Tamanho hero (largura cheia)</div>
            <div className="rounded-lg border bg-card overflow-hidden">
              <cover.Component />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Tamanho card de listagem (~400px)</div>
            <div className="max-w-sm rounded-lg border bg-card overflow-hidden">
              <cover.Component />
            </div>
          </div>
        </section>
      ))}

      <footer className="text-xs text-muted-foreground border-t pt-4">
        Total: {COVERS.length} covers. Para alternar entre light/dark, use o ThemeToggle do site (header).
      </footer>
    </main>
  )
}
