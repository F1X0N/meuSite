'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

const reportClientError = async (error: Error & { digest?: string }) => {
  try {
    await fetch('/api/log/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message?.slice(0, 500) ?? 'unknown',
        digest: error.digest ?? null,
        stack: error.stack?.slice(0, 2000) ?? null,
        path: typeof window !== 'undefined' ? window.location.pathname : null,
      }),
    })
  } catch {
    // Logger backend offline; nada a fazer no client.
  }
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    reportClientError(error)
  }, [error])

  return (
    <div className="container max-w-xl py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Algo deu errado</h1>
      <p className="mt-4 text-muted-foreground">
        Encontramos um erro inesperado nesta página. Já registramos o problema. Você pode tentar
        novamente ou voltar para o início.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button onClick={reset}>Tentar novamente</Button>
        <Link href="/">
          <Button variant="outline">Voltar ao início</Button>
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-muted-foreground">Digest: {error.digest}</p>
      )}
    </div>
  )
}
