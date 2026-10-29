import type { InterviewGuide } from '@/lib/agent-tools/interview-guide'

const sections = [
  { id: 'guide-quick', label: 'Referência rápida' },
  { id: 'guide-story', label: 'História principal' },
  { id: 'guide-questions', label: 'Perguntas para treinar' },
  { id: 'guide-ask', label: 'Perguntas para fazer' },
  { id: 'guide-contingencies', label: 'Respostas de apoio' },
]

export const GuideNavigation = () => (
  <nav aria-label="Seções do roteiro" className="mt-8 flex flex-wrap gap-2">
    {sections.map((section) => (
      <a key={section.id} href={`#${section.id}`} className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary">
        {section.label}
      </a>
    ))}
  </nav>
)

const QuickReference = ({ guide }: { guide: InterviewGuide }) => (
  <section id="guide-quick" className="scroll-mt-24 rounded-2xl border bg-muted/30 p-6">
    <h3 className="font-display text-2xl font-bold">{guide.labels.quickReference}</h3>
    <p className="mt-2 text-sm text-muted-foreground">Ideias para consultar durante a chamada, sem ler respostas inteiras.</p>
    <ul className="mt-5 space-y-3 text-sm leading-relaxed">
      {guide.quickReference.map((item) => <li key={item} className="border-l-2 border-primary pl-4">{item}</li>)}
    </ul>
  </section>
)

const MainStory = ({ guide }: { guide: InterviewGuide }) => (
  <section id="guide-story" className="scroll-mt-24">
    <h3 className="font-display text-2xl font-bold">{guide.labels.story}</h3>
    <p className="mt-3 text-sm text-muted-foreground">{guide.story.role} · {guide.story.contextPrompt}</p>
    <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed">
      {guide.story.evidence.map((item) => <li key={item}>{item}</li>)}
    </ul>
    <p className="mt-4 rounded-lg border-l-2 border-primary bg-muted/30 p-4 text-sm">{guide.story.outcomePrompt}</p>
  </section>
)

const PracticeQuestions = ({ guide }: { guide: InterviewGuide }) => (
  <section id="guide-questions" className="scroll-mt-24">
    <h3 className="font-display text-2xl font-bold">{guide.labels.questions}</h3>
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {guide.questions.map((item) => (
        <article key={item.question} className="rounded-xl border p-5">
          <h4 className="font-semibold">{item.question}</h4>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {item.talkingPoints.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </article>
      ))}
    </div>
  </section>
)

const QuestionsToAsk = ({ guide }: { guide: InterviewGuide }) => (
  <section id="guide-ask" className="scroll-mt-24">
    <h3 className="font-display text-2xl font-bold">{guide.labels.ask}</h3>
    <ol className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed">
      {guide.questionsToAsk.map((question) => <li key={question}>{question}</li>)}
    </ol>
  </section>
)

const Contingencies = ({ guide }: { guide: InterviewGuide }) => (
  <section id="guide-contingencies" className="scroll-mt-24">
    <h3 className="font-display text-2xl font-bold">{guide.labels.contingencies}</h3>
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {guide.contingencies.map((item) => (
        <article key={item.question} className="rounded-xl border p-5">
          <h4 className="font-semibold">{item.question}</h4>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
        </article>
      ))}
    </div>
    <ul className="mt-5 list-disc space-y-2 pl-6 text-sm text-muted-foreground">
      {guide.supportPhrases.map((phrase) => <li key={phrase}>{phrase}</li>)}
    </ul>
  </section>
)

const EvidenceGaps = ({ guide }: { guide: InterviewGuide }) => {
  if (guide.gaps.length === 0) return null
  return (
    <section className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-6">
      <h3 className="font-display text-xl font-bold">{guide.labels.gaps}</h3>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-relaxed">
        {guide.gaps.map((gap) => <li key={gap}>{gap}</li>)}
      </ul>
    </section>
  )
}

export const GuideSections = ({ guide }: { guide: InterviewGuide }) => (
  <div className="mt-10 space-y-12">
    <QuickReference guide={guide} />
    <MainStory guide={guide} />
    <PracticeQuestions guide={guide} />
    <QuestionsToAsk guide={guide} />
    <Contingencies guide={guide} />
    <EvidenceGaps guide={guide} />
    <section className="border-t pt-8">
      <h3 className="font-display text-2xl font-bold">{guide.labels.closing}</h3>
      <p className="mt-3 leading-relaxed">{guide.closing}</p>
    </section>
  </div>
)
