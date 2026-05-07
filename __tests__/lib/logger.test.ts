import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '@/lib/logger'

describe('lib/logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
    warnSpy.mockRestore()
    vi.unstubAllEnvs()
  })

  it('em dev, info chama console.log com prefixo legível', () => {
    vi.stubEnv('NODE_ENV', 'development')
    logger.info('test.event', { foo: 'bar' })
    expect(logSpy).toHaveBeenCalledWith('[info] test.event', { foo: 'bar' })
  })

  it('em dev, error chama console.error', () => {
    vi.stubEnv('NODE_ENV', 'development')
    logger.error('test.failure', { reason: 'x' })
    expect(errorSpy).toHaveBeenCalledWith('[error] test.failure', { reason: 'x' })
  })

  it('em prod, emite JSON estruturado em uma linha via console.log', () => {
    vi.stubEnv('NODE_ENV', 'production')
    logger.info('chat.openai.dispatched', { request_id: 'abc', model: 'gpt-4o' })
    expect(logSpy).toHaveBeenCalledTimes(1)
    const call = logSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(call)
    expect(parsed.level).toBe('info')
    expect(parsed.event).toBe('chat.openai.dispatched')
    expect(parsed.request_id).toBe('abc')
    expect(parsed.model).toBe('gpt-4o')
    expect(typeof parsed.timestamp).toBe('string')
  })

  it('aceita context vazio sem quebrar', () => {
    vi.stubEnv('NODE_ENV', 'production')
    logger.warn('only.event')
    const call = logSpy.mock.calls[0][0] as string
    const parsed = JSON.parse(call)
    expect(parsed.event).toBe('only.event')
  })
})
