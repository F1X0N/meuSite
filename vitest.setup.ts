import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom não implementa document.fonts; GIcon usa fonts.ready/check
if (typeof document !== 'undefined' && !document.fonts) {
  Object.defineProperty(document, 'fonts', {
    value: {
      ready: Promise.resolve(),
      check: () => true,
    },
    configurable: true,
  })
}

// jsdom default não implementa matchMedia; useReducedMotion depende disso.
// Testes que precisam customizar matchMedia podem sobrescrever o spy localmente.
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    }),
  })
}

// Mock next/navigation pra componentes que usam usePathname/useRouter
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))
