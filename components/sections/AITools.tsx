'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { GIcon } from '@/components/icons/GIcon'
import { Reveal } from '@/components/motion/Motion'
import { motion, AnimatePresence } from 'framer-motion'
import { site } from '@/config/site'

// ============ Types ============
type Mode = 'ask' | 'job_fit'

type Source = {
    label: string
    href: string
}

type AskAIResponse = {
    answer_md: string
    sources: Source[]
    followups?: string[]
}

type JobFitRequirement = {
    requirement: string
    status: 'match' | 'partial' | 'unknown'
    evidence_links: string[]
    notes?: string
}

type JobFitResponse = {
    match_score_0_100: number
    summary_md: string
    requirements: JobFitRequirement[]
    gaps: string[]
    open_questions: string[]
    sources: Source[]
}

type Message = {
    role: 'user' | 'assistant'
    content: string
    mode: Mode
    type?: 'answer' | 'job_fit' | 'rate_limit' | 'error'
    askData?: AskAIResponse
    fitData?: JobFitResponse
}

// ============ Config ============
const modeConfig = {
    ask: {
        label: 'Perguntar',
        placeholder: 'Pergunte sobre experiências, projetos ou habilidades...',
        icon: 'chat',
        hint: 'Tire dúvidas sobre minha trajetória',
    },
    job_fit: {
        label: 'Verificar Fit',
        placeholder: 'Cole a job description aqui para analisar minha compatibilidade com a vaga...',
        icon: 'target',
        hint: 'Avalia o nível de match entre seu desafio e meu perfil técnico.',
    },
}

// ============ Helpers ============
const generateSessionId = (): string => {
    if (typeof window === 'undefined') return ''
    const stored = localStorage.getItem('ai-tools-session')
    if (stored) return stored

    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    localStorage.setItem('ai-tools-session', newId)
    return newId
}

// ============ Mode Toggle Component ============
const ModeToggle = ({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) => (
    <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg">
        <button
            onClick={() => onChange('ask')}
            className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${mode === 'ask'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }
            `}
            type="button"
        >
            <GIcon name="chat" size={14} />
            Perguntar
        </button>
        <button
            onClick={() => onChange('job_fit')}
            className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${mode === 'job_fit'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }
            `}
            type="button"
        >
            <GIcon name="target" size={14} />
            Verificar Fit
        </button>
    </div>
)

// ============ Component ============
export const AITools = () => {
    const [mode, setMode] = useState<Mode>('ask')
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [remaining, setRemaining] = useState<number | null>(null)
    const [sessionId] = useState(generateSessionId)
    const [isFocused, setIsFocused] = useState(false)

    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const config = modeConfig[mode]

    // ============ Scroll ============
    const scrollToBottom = useCallback(() => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current
            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth'
            })
        }
    }, [])

    useEffect(scrollToBottom, [messages, loading, scrollToBottom])

    // ============ Focus & Keyboard ============
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false)
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isFocused) {
                setIsFocused(false)
            }
        }

        if (isFocused) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'

            setTimeout(() => {
                containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 100)
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [isFocused])

    // ============ Submit ============
    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || loading) return

        const userMessage = input.trim()
        setInput('')

        const newUserMessage: Message = {
            role: 'user',
            content: userMessage,
            mode
        }

        setMessages(prev => [...prev, newUserMessage])
        setLoading(true)

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    mode,
                    sessionId,
                    history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
                }),
            })

            const data = await response.json()

            if (data.type === 'rate_limit') {
                const rateLimitMessage: Message = {
                    role: 'assistant',
                    content: data.message,
                    mode,
                    type: 'rate_limit'
                }
                setMessages(prev => [...prev, rateLimitMessage])
                setRemaining(0)
                return
            }

            // Resposta baseada no modo
            if (mode === 'ask') {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: data.content || data.answer_md || '',
                    mode,
                    type: 'answer',
                    askData: data.type === 'structured' ? data : undefined
                }
                setMessages(prev => [...prev, assistantMessage])
            }

            if (mode === 'job_fit') {
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: '',
                    mode,
                    type: 'job_fit',
                    fitData: data
                }
                setMessages(prev => [...prev, assistantMessage])
            }

            if (data.remaining !== undefined) {
                setRemaining(data.remaining)
            }

        } catch {
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Desculpe, ocorreu um erro na conexão. Tente novamente mais tarde.',
                mode,
                type: 'error'
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    // ============ Quick Action ============
    const handleQuickAction = (prompt: string, targetMode: Mode) => {
        setMode(targetMode)
        setInput(prompt)
        setIsFocused(true)
        setTimeout(() => inputRef.current?.focus(), 100)
    }

    // ============ Render Sources ============
    const renderSources = (sources?: Source[]) => {
        if (!sources || sources.length === 0) return null

        return (
            <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">📚 Fontes:</p>
                <div className="flex flex-wrap gap-2">
                    {sources.map((source, idx) => (
                        <a
                            key={idx}
                            href={source.href}
                            className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                        >
                            {source.label}
                        </a>
                    ))}
                </div>
            </div>
        )
    }

    // ============ Render Job Fit Response ============
    const renderJobFitResponse = (fitData: JobFitResponse) => (
        <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30">
                    <span className="text-xl font-bold text-primary">{fitData.match_score_0_100}</span>
                </div>
                <div>
                    <h4 className="font-semibold text-sm">Diagnóstico de Match</h4>
                    <p className="text-xs text-muted-foreground">Compatibilidade com meu perfil</p>
                </div>
            </div>

            {/* Summary */}
            <p className="text-sm leading-relaxed">{fitData.summary_md}</p>

            {/* Requirements */}
            {fitData.requirements?.length > 0 && (
                <div>
                    <h5 className="font-medium text-xs mb-2">📋 Requisitos:</h5>
                    <ul className="space-y-1.5">
                        {fitData.requirements.slice(0, 5).map((req, i) => (
                            <li key={i} className="text-xs flex items-start gap-2">
                                <span className={`mt-0.5 ${req.status === 'match' ? 'text-green-500' :
                                    req.status === 'partial' ? 'text-yellow-500' :
                                        'text-muted-foreground'
                                    }`}>
                                    {req.status === 'match' ? '✓' : req.status === 'partial' ? '◐' : '?'}
                                </span>
                                <span>{req.requirement}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Gaps */}
            {fitData.gaps?.length > 0 && (
                <div>
                    <h5 className="font-medium text-xs mb-1">⚠️ Gaps:</h5>
                    <ul className="space-y-0.5">
                        {fitData.gaps.slice(0, 3).map((gap, i) => (
                            <li key={i} className="text-xs text-muted-foreground">• {gap}</li>
                        ))}
                    </ul>
                </div>
            )}

            {renderSources(fitData.sources)}
        </div>
    )

    // ============ Render Message ============
    const renderMessage = (msg: Message, idx: number) => (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
            {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center self-start mt-0.5">
                    <GIcon name="psychology" size={16} className="text-primary" />
                </div>
            )}
            <div
                className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted/80 rounded-bl-sm border border-border/50'
                    }`}
            >
                {msg.type === 'job_fit' && msg.fitData ? (
                    renderJobFitResponse(msg.fitData)
                ) : msg.type === 'rate_limit' ? (
                    <div className="space-y-2">
                        <p className="text-sm">{msg.content}</p>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={site.social.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-2.5 py-1 bg-[#0077b5] text-white rounded-md"
                            >
                                LinkedIn
                            </a>
                            <a
                                href={`mailto:${site.email}`}
                                className="text-xs px-2.5 py-1 bg-primary text-primary-foreground rounded-md"
                            >
                                Email
                            </a>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        {msg.askData?.sources && renderSources(msg.askData.sources)}
                    </>
                )}
            </div>
            {msg.role === 'user' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center self-start mt-0.5">
                    <GIcon name="person" size={16} />
                </div>
            )}
        </motion.div>
    )

    // ============ Render ============
    return (
        <div className="container relative z-10">
            {/* Backdrop for Focus Mode */}
            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                        onClick={() => setIsFocused(false)}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <Reveal>
                <div className={`text-center max-w-2xl mx-auto mb-6 transition-all duration-300 ${isFocused ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
                        <GIcon name="smart_toy" size={28} className="text-primary" />
                        AI Tools
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Tire dúvidas sobre minha experiência ou analise compatibilidade com vagas.
                    </p>
                </div>
            </Reveal>

            {/* Main Container */}
            <div
                ref={containerRef}
                className={`relative transition-all duration-300 ease-out ${isFocused ? 'z-50' : 'z-10'}`}
            >
                <motion.div
                    layout
                    className={`
                        mx-auto bg-card flex flex-col overflow-hidden rounded-xl transition-shadow duration-300
                        ${isFocused
                            ? 'max-w-3xl shadow-2xl ring-1 ring-primary/20'
                            : 'max-w-3xl shadow-lg border border-border/50'
                        }
                    `}
                    style={{ maxHeight: isFocused ? '80vh' : '500px' }}
                >
                    {/* Focus Mode Header */}
                    <AnimatePresence>
                        {isFocused && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-b bg-muted/30 overflow-hidden"
                            >
                                <div className="flex items-center justify-between px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs text-muted-foreground">
                                            Modo Foco • {config.label}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsFocused(false)}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <GIcon name="close" size={14} />
                                        Esc
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Messages Area */}
                    <div
                        ref={messagesContainerRef}
                        className={`
                            flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth
                            scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20
                            ${isFocused ? 'min-h-[200px]' : 'min-h-[280px] max-h-[320px]'}
                        `}
                    >
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                                <GIcon name="smart_toy" size={40} className="mb-3 opacity-30" />
                                <p className="text-sm font-medium mb-1">Como posso ajudar?</p>
                                <p className="text-xs text-muted-foreground/80 mb-6 max-w-xs">
                                    Use o seletor abaixo para perguntar livremente ou analisar uma vaga
                                </p>

                                {/* Quick Actions */}
                                <div className="flex flex-wrap justify-center gap-2 max-w-md">
                                    <button
                                        onClick={() => handleQuickAction('Quais são suas experiências com IA em produção?', 'ask')}
                                        className="px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors text-xs"
                                    >
                                        💡 IA em produção
                                    </button>
                                    <button
                                        onClick={() => handleQuickAction('Me conte sobre cases de redução de custos.', 'ask')}
                                        className="px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors text-xs"
                                    >
                                        💰 Redução de custos
                                    </button>
                                    <button
                                        onClick={() => handleQuickAction('Senior React Developer com 5+ anos, TypeScript, Next.js', 'job_fit')}
                                        className="px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors text-xs"
                                    >
                                        📋 Exemplo de vaga
                                    </button>
                                </div>
                            </div>
                        )}

                        {messages.map(renderMessage)}

                        {/* Loading */}
                        {loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                    <GIcon name="psychology" size={16} className="text-primary" />
                                </div>
                                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input Area with Mode Toggle */}
                    <div className="border-t p-3 bg-background/80 backdrop-blur-sm">
                        {remaining !== null && remaining < 5 && (
                            <p className="text-[10px] text-muted-foreground mb-2 text-center">
                                ⚠️ {remaining} pergunta{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''}
                            </p>
                        )}

                        {/* Mode Toggle + Input Row */}
                        <form onSubmit={handleSubmit} className="space-y-2">
                            {/* Toggle Row */}
                            <div className="flex items-center justify-between gap-2">
                                <ModeToggle mode={mode} onChange={setMode} />

                                {mode === 'job_fit' && (
                                    <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                                        <GIcon name="lock" size={10} className="opacity-70" />
                                        A descrição da vaga não é armazenada
                                    </span>
                                )}
                            </div>

                            {/* Input Row */}
                            <div className="flex gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSubmit()
                                        }
                                        if (e.key === 'Escape') {
                                            setIsFocused(false)
                                        }
                                    }}
                                    placeholder={config.placeholder}
                                    className={`
                                        flex-1 px-3 py-2.5 text-sm bg-background border rounded-xl resize-none 
                                        focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all
                                        scrollbar-thin scrollbar-thumb-muted-foreground/20
                                        ${isFocused ? 'min-h-[80px] max-h-[120px]' : 'min-h-[44px] max-h-[44px]'}
                                    `}
                                    disabled={loading}
                                />
                                <Button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    size="sm"
                                    className={`
                                        self-end rounded-xl transition-all
                                        ${isFocused ? 'h-10 w-10' : 'h-[44px] w-[44px]'}
                                    `}
                                >
                                    {loading ? (
                                        <GIcon name="autorenew" size={18} className="animate-spin" />
                                    ) : (
                                        <GIcon name="send" size={18} />
                                    )}
                                </Button>
                            </div>

                            {/* Hint */}
                            {isFocused && (
                                <p className="text-[10px] text-center text-muted-foreground">
                                    <span className="hidden md:inline">
                                        <strong>Enter</strong> enviar • <strong>Shift+Enter</strong> nova linha • <strong>Esc</strong> sair
                                    </span>
                                </p>
                            )}
                        </form>
                    </div>
                </motion.div>
            </div>

            {/* Transparency note */}
            <p className="text-center text-[11px] text-muted-foreground/70 mt-4 max-w-md mx-auto">
                💡 Respostas baseadas no conteúdo público deste site. Quando não houver evidência, será indicado.
            </p>
        </div>
    )
}

