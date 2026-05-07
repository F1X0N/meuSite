'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { copy } from '@/config/copy'

const buildInputClasses = () =>
  'w-full rounded-lg border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none'

const getFitScoreColor = (score) => {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const renderSkillMatch = (match) => (
  <li key={match.skill} className="flex flex-col gap-1">
    <span className="font-medium">{match.skill}</span>
    <span className="text-sm text-muted-foreground">→ {match.evidence}</span>
  </li>
)

const renderSkillsMatch = (matches) => {
  if (!matches || matches.length === 0) return null

  return (
    <div>
      <h3 className="font-semibold mb-3">✅ Skills que você tem:</h3>
      <ul className="space-y-2">
        {matches.map(renderSkillMatch)}
      </ul>
    </div>
  )
}

const renderSkillsGap = (gaps) => {
  if (!gaps || gaps.length === 0) return null

  return (
    <div>
      <h3 className="font-semibold mb-3">⚠️ Skills que faltam:</h3>
      <div className="flex flex-wrap gap-2">
        {gaps.map((skill) => (
          <Badge key={skill} variant="outline">
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  )
}

const renderHighlights = (highlights) => {
  if (!highlights || highlights.length === 0) return null

  return (
    <div>
      <h3 className="font-semibold mb-3">⭐ Seus destaques para esta vaga:</h3>
      <ul className="space-y-1">
        {highlights.map((highlight, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary">→</span>
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const renderRecommendations = (recommendations) => {
  if (!recommendations || recommendations.length === 0) return null

  return (
    <div>
      <h3 className="font-semibold mb-3">💡 Como se destacar:</h3>
      <ul className="space-y-1">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-primary">→</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

type JobFitAnalysis = {
  fitScore?: number
  summary?: string
  skillsMatch?: { skill: string; evidence?: string; level?: string }[]
  skillsGap?: string[]
  highlights?: string[]
  recommendations?: string[]
}

type JobFitState = {
  jobDescription: string
  analysis: JobFitAnalysis | null
  loading: boolean
  error: string | null
}

const createInitialState = (): JobFitState => ({
  jobDescription: '',
  analysis: null,
  loading: false,
  error: null,
})

export const JobFit = () => {
  const [state, setState] = useState(createInitialState())

  const handleJobDescriptionChange = (event) => {
    setState({ ...state, jobDescription: event.target.value, error: null })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (state.jobDescription.trim().length < 50) {
      setState({ ...state, error: 'Descrição muito curta (mínimo 50 caracteres)' })
      return
    }

    setState({ ...state, loading: true, error: null })

    try {
      const response = await fetch('/api/ai/job-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: state.jobDescription }),
      })

      const data = await response.json()

      if (!response.ok) {
        setState({
          ...state,
          loading: false,
          error: data.error || 'Erro ao analisar vaga',
        })
        return
      }

      setState({
        ...state,
        analysis: data,
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
    <div className="container max-w-4xl">
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
        {copy.jobFit.title}
      </h2>
      <p className="mt-4 text-lg text-muted-foreground">
        {copy.jobFit.subtitle}
      </p>

      <form onSubmit={handleSubmit} className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Descrição da Vaga</CardTitle>
            <CardDescription>
              Cole o texto completo da vaga (requisitos, responsabilidades, etc)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={state.jobDescription}
              onChange={handleJobDescriptionChange}
              placeholder={copy.jobFit.placeholder}
              rows={12}
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
                disabled={state.loading || state.jobDescription.trim().length < 50}
              >
                {state.loading ? 'Analisando...' : copy.jobFit.buttonLabel}
              </Button>

              {state.analysis && (
                <Button type="button" variant="outline" onClick={handleReset}>
                  Nova análise
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      {state.analysis && (
        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resultado da Análise</span>
                <span className={`text-5xl font-bold ${getFitScoreColor(state.analysis.fitScore)}`}>
                  {state.analysis.fitScore}%
                </span>
              </CardTitle>
              <CardDescription>{state.analysis.summary}</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              {renderSkillsMatch(state.analysis.skillsMatch)}
              {renderSkillsGap(state.analysis.skillsGap)}
              {renderHighlights(state.analysis.highlights)}
              {renderRecommendations(state.analysis.recommendations)}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8 p-4 rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <strong>Importante:</strong> {copy.jobFit.disclaimer}
        </p>
      </div>
    </div>
  )
}
