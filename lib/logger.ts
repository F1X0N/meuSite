/**
 * Logger estruturado para auditabilidade.
 *
 * - Em produção: emite JSON estruturado em uma linha (Vercel/Log Drain consomem fácil).
 * - Em dev: imprime formato legível com cores básicas via prefixo.
 * - Anti-PII: o consumer NUNCA deve passar conteúdo de mensagem do chat, e-mail
 *   completo ou IP cru nesses logs. Use ip_hash, message_length, etc.
 *
 * Eventos seguem o catálogo em lib/audit-events.ts (nomes estáveis).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogContext = Record<string, unknown>

const isProd = (): boolean => process.env.NODE_ENV === 'production'

const emit = (level: LogLevel, event: string, context?: LogContext): void => {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...context,
  }

  if (isProd()) {
    // Stdout linha única JSON — consumível por Vercel runtime logs e Log Drains
    console.log(JSON.stringify(payload))
    return
  }

  const consoleFn =
    level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  consoleFn(`[${level}] ${event}`, context ?? '')
}

export const logger = {
  debug: (event: string, ctx?: LogContext) => emit('debug', event, ctx),
  info: (event: string, ctx?: LogContext) => emit('info', event, ctx),
  warn: (event: string, ctx?: LogContext) => emit('warn', event, ctx),
  error: (event: string, ctx?: LogContext) => emit('error', event, ctx),
}
