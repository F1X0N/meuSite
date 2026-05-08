/**
 * Registry de covers SVG do blog/case-studies.
 * Mapeia o `coverComponent` declarado no frontmatter dos MDX para
 * o componente React correspondente.
 *
 * Cada cover é carregada via `next/dynamic` — Next.js separa cada uma
 * em chunk independente. Página individual carrega apenas a sua cover,
 * não as outras 14.
 */
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

type CoverComponent = ComponentType<{ className?: string }>

const COVER_REGISTRY: Record<string, CoverComponent> = {
  IdempotenciaCover: dynamic(() => import('./IdempotenciaCover').then((m) => m.IdempotenciaCover)),
  HexagonalCover: dynamic(() => import('./HexagonalCover').then((m) => m.HexagonalCover)),
  AntiCorruptionLayerCover: dynamic(() => import('./AntiCorruptionLayerCover').then((m) => m.AntiCorruptionLayerCover)),
  RetryBackoffDlqCover: dynamic(() => import('./RetryBackoffDlqCover').then((m) => m.RetryBackoffDlqCover)),
  DomainEventsCover: dynamic(() => import('./DomainEventsCover').then((m) => m.DomainEventsCover)),
  CostLedgerLlmCover: dynamic(() => import('./CostLedgerLlmCover').then((m) => m.CostLedgerLlmCover)),
  TimeoutPromiseRaceCover: dynamic(() => import('./TimeoutPromiseRaceCover').then((m) => m.TimeoutPromiseRaceCover)),
  ConnectionContextCover: dynamic(() => import('./ConnectionContextCover').then((m) => m.ConnectionContextCover)),
  RequestIdTraceCover: dynamic(() => import('./RequestIdTraceCover').then((m) => m.RequestIdTraceCover)),
  LogPayloadTruncationCover: dynamic(() => import('./LogPayloadTruncationCover').then((m) => m.LogPayloadTruncationCover)),
  RumIntegrationCover: dynamic(() => import('./RumIntegrationCover').then((m) => m.RumIntegrationCover)),
  WebhookSignatureCover: dynamic(() => import('./WebhookSignatureCover').then((m) => m.WebhookSignatureCover)),
  ApiKeyIsolationCover: dynamic(() => import('./ApiKeyIsolationCover').then((m) => m.ApiKeyIsolationCover)),
  StrategyPatternCover: dynamic(() => import('./StrategyPatternCover').then((m) => m.StrategyPatternCover)),
  ValueObjectIdCover: dynamic(() => import('./ValueObjectIdCover').then((m) => m.ValueObjectIdCover)),
}

export const getCoverComponent = (name: string | null | undefined): CoverComponent | null => {
  if (!name) return null
  return COVER_REGISTRY[name] ?? null
}
