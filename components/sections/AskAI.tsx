'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { copy } from '@/config/copy'
import Link from 'next/link'

const buildInputClasses = () =>
  'w-full rounded-lg border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none'

const buildSourceLink = (source) => {
  const href = source.type === 'blog' ? `/blog/${source.slug}` : `/case-studies/${source.slug}`
  const label = source.type === 'blog' ? 'Post' : 'Case'
  
  return { href, label }
}

const renderSource = (source) => {
  const { href, label } = buildSourceLink(source)
  
  return (
    <li key={source.slug} className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">[{label}]</span>
      <Link href={href} className="text-sm hover:underline">
        {source.title}
      </Link>
    </li>
  )
}

const renderSources = (sources) => {
  if (!sources || sources.length === 0) return null

  return (
    <div className="mt-4 pt-4 border-t">
      <p className="text-sm font-medium mb-2">Fontes:</p>
      <ul className="space-y-1">
        {sources.map(renderSource)}
      </ul>
    </div>
  )
}

const createInitialState = () => ({
  question: '',
  answer: '',
  sources: [],
  loading: false,
  error: null,
})

export const AskAI = () => {
  const [state, setState] = useState(createInitialState())

  const handleQuestionChange = (event) => {
    setState({ ...state, question: event.target.value, error: null })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (state.question.trim().length < 3) {
      setState({ ...state, error: 'Pergunta muito curta (mínimo 3 caracteres)' })
      return
    }

    setState({ ...state, loading: true, error: null })

    try {
      const response = await fetch('/api/ai/ask-my-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: state.question }),
      })

      const data = await response.json()

      if (!response.ok) {
        setState({
          ...state,
          loading: false,
          error: data.error || 'Erro ao processar pergunta',
        })
        return
      }

      setState({
        ...state,
        answer: data.answer,
        sources: data.sources,
        loading: false,
      })
    } catch (error) {
      setState({
        ...state,
        loading: false,
        error: 'Erro de conexão. Tente novamente.',
      })
    }
  }

  const handleReset = () => {
    setState(createInitialState())
  }

  return (
    <div className="container max-w-3xl">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        {copy.askAi.title}
      </h2>
      <p className="mt-4 text-lg text-muted-foreground">
        {copy.askAi.subtitle}
      </p>

      <form onSubmit={handleSubmit} className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Sua pergunta</CardTitle>
            <CardDescription>
              {copy.askAi.placeholder}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={state.question}
              onChange={handleQuestionChange}
              placeholder={copy.askAi.placeholder}
              rows={4}
              className={buildInputClasses()}
              disabled={state.loading}
            />

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={state.loading || state.question.trim().length < 3}
              >
                {state.loading ? 'Processando...' : copy.askAi.buttonLabel}
              </Button>

              {state.answer && (
                <Button type="button" variant="outline" onClick={handleReset}>
                  Nova pergunta
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      {state.answer && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{state.answer}</p>
            </div>
            {renderSources(state.sources)}
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-4 rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <strong>Nota:</strong> {copy.askAi.disclaimer}
        </p>
      </div>
    </div>
  )
}
