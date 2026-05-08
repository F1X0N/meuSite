/**
 * Registry de covers SVG do blog/case-studies.
 * Mapeia o `coverComponent` declarado no frontmatter dos MDX para
 * o componente React correspondente.
 */
import type { ComponentType } from 'react'

import { IdempotenciaCover } from './IdempotenciaCover'
import { HexagonalCover } from './HexagonalCover'
import { AntiCorruptionLayerCover } from './AntiCorruptionLayerCover'
import { RetryBackoffDlqCover } from './RetryBackoffDlqCover'
import { DomainEventsCover } from './DomainEventsCover'
import { CostLedgerLlmCover } from './CostLedgerLlmCover'
import { TimeoutPromiseRaceCover } from './TimeoutPromiseRaceCover'
import { ConnectionContextCover } from './ConnectionContextCover'
import { RequestIdTraceCover } from './RequestIdTraceCover'
import { LogPayloadTruncationCover } from './LogPayloadTruncationCover'
import { RumIntegrationCover } from './RumIntegrationCover'
import { WebhookSignatureCover } from './WebhookSignatureCover'
import { ApiKeyIsolationCover } from './ApiKeyIsolationCover'
import { StrategyPatternCover } from './StrategyPatternCover'
import { ValueObjectIdCover } from './ValueObjectIdCover'

type CoverComponent = ComponentType<{ className?: string }>

export const COVER_REGISTRY: Record<string, CoverComponent> = {
  IdempotenciaCover,
  HexagonalCover,
  AntiCorruptionLayerCover,
  RetryBackoffDlqCover,
  DomainEventsCover,
  CostLedgerLlmCover,
  TimeoutPromiseRaceCover,
  ConnectionContextCover,
  RequestIdTraceCover,
  LogPayloadTruncationCover,
  RumIntegrationCover,
  WebhookSignatureCover,
  ApiKeyIsolationCover,
  StrategyPatternCover,
  ValueObjectIdCover,
}

export const getCoverComponent = (name: string | null | undefined): CoverComponent | null => {
  if (!name) return null
  return COVER_REGISTRY[name] ?? null
}
