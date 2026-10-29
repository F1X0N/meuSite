'use client'

import { useState } from 'react'
import { BackLink } from '@/components/ui/BackLink'
import { GuideNavigation, GuideSections } from './guide-sections'
import { formatInterviewGuide } from '@/lib/agent-tools/interview-guide-format'
import type { InterviewGuide } from '@/lib/agent-tools/interview-guide'

const inputClass = 'w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const actionClass = 'inline-flex min-h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

const GuideView = ({ guide, generatedAt }: { guide: InterviewGuide; generatedAt: string }) => {
  const [copyMessage, setCopyMessage] = useState('')
  const markdown = formatInterviewGuide(guide)

  const copyGuide = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopyMessage('Roteiro copiado.')
    } catch {
      setCopyMessage('Não foi possível copiar. Use o download abaixo.')
    }
  }

  return (
    <section className="mt-16 border-t pt-12" aria-labelledby="guide-title">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Roteiro gerado</p>
          <h2 id="guide-title" className="mt-2 font-display text-3xl font-bold">{guide.role}{guide.company ? ` · ${guide.company}` : ''}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerado em {new Date(generatedAt).toLocaleString('pt-BR')} · base pública do currículo v{guide.profileVersion}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copyGuide} className={actionClass}>Copiar roteiro</button>
          <a
            href={`data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`}
            download={`Josivan_Amorim_Interview_Guide_${guide.language.toUpperCase()}.md`}
            className={actionClass}
          >
            Baixar Markdown
          </a>
        </div>
      </div>
      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-muted-foreground">{copyMessage}</p>
      <p className="mt-3 text-sm text-muted-foreground">
        Use como apoio durante a conversa e responda com suas palavras. Para incluir experiências novas, atualize primeiro a base profissional sanitizada do currículo publicado.
      </p>

      <GuideNavigation />
      <GuideSections guide={guide} />
    </section>
  )
}

export const InterviewPrepClient = () => {
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [language, setLanguage] = useState<'pt' | 'en'>('en')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ guide: InterviewGuide; generatedAt: string } | null>(null)

  const generateGuide = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/ai/interview-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, company, language, jobDescription }),
        cache: 'no-store',
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Não foi possível gerar o roteiro.')
      setResult(data)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível gerar o roteiro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-16 md:py-20 lg:py-24">
      <div className="container max-w-5xl">
        <BackLink href="/tools" label="Voltar para ferramentas" />
        <header className="mt-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Ferramentas</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">Preparar entrevista</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Cole a descrição da vaga para montar um roteiro navegável com apresentação, exemplos profissionais, perguntas prováveis e pontos a esclarecer.
          </p>
        </header>

        <form onSubmit={generateGuide} className="mt-10 space-y-5 rounded-2xl border bg-card p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium">Cargo
              <input value={role} onChange={(event) => setRole(event.target.value)} className={`mt-2 ${inputClass}`} required minLength={2} maxLength={120} placeholder="Ex.: Full-Stack Software Engineer" />
            </label>
            <label className="block text-sm font-medium">Empresa (opcional)
              <input value={company} onChange={(event) => setCompany(event.target.value)} className={`mt-2 ${inputClass}`} maxLength={120} placeholder="Ex.: nome da empresa" />
            </label>
          </div>
          <label className="block text-sm font-medium">Idioma do roteiro
            <select value={language} onChange={(event) => setLanguage(event.target.value as 'pt' | 'en')} className={`mt-2 ${inputClass}`}>
              <option value="en">Inglês</option>
              <option value="pt">Português</option>
            </select>
          </label>
          <label className="block text-sm font-medium">Descrição da vaga
            <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} className={`mt-2 min-h-52 ${inputClass}`} required minLength={50} maxLength={10000} placeholder="Cole as responsabilidades, requisitos e informações sobre a oportunidade..." />
          </label>
          <p className="text-xs leading-relaxed text-muted-foreground">A descrição é enviada ao serviço de IA para identificar prioridades da vaga. O roteiro usa apenas evidências do currículo público sanitizado; o site não salva a descrição nem o roteiro.</p>
          <button type="submit" disabled={loading} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {loading ? 'Montando roteiro...' : 'Gerar roteiro'}
          </button>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </form>

        {result && <GuideView guide={result.guide} generatedAt={result.generatedAt} />}
      </div>
    </div>
  )
}
