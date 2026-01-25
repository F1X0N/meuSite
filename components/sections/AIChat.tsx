'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { GIcon } from '@/components/icons/GIcon'
import { Reveal } from '@/components/motion/Motion'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
  role: 'user' | 'assistant'
  content: string
  type?: 'answer' | 'job_fit' | 'rate_limit' | 'rate_limit_rich' | 'fallback_contact'
  fitData?: any
  contactInfo?: {
    email: string
    linkedin: string
  }
}

const generateSessionId = () => {
  if (typeof window === 'undefined') return ''
  const stored = localStorage.getItem('ai-chat-session')
  if (stored) return stored
  
  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  localStorage.setItem('ai-chat-session', newId)
  return newId
}

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [sessionId] = useState(generateSessionId)
  const [isFocused, setIsFocused] = useState(false)
  
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current
      messagesContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(scrollToBottom, [messages, loading]) // Scroll também quando loading muda

  // Click outside to exit focus & Scroll on Focus & ESC to exit
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
      document.body.style.overflow = 'hidden' // Prevent background scroll
      
      // Centralizar o chat na tela suavemente
      // setTimeout para garantir que a animação de layout do framer motion já iniciou
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          // Enviar histórico no formato de objetos nativos para o backend
          history: messages.map(m => ({ role: m.role, content: m.content })).slice(-6),
        }),
      })

      const data = await response.json()

      if (data.type === 'fallback_contact') {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.content,
          type: 'fallback_contact',
          contactInfo: data.contactInfo
        }])
        return
      }

      if (data.type === 'rate_limit_rich') {
         setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message,
          type: 'rate_limit_rich',
          contactInfo: data.contactInfo
        }])
        // Forçar remaining para 0
        setRemaining(0)
        return
      }

      if (data.type === 'rate_limit') {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message,
          type: 'rate_limit'
        }])
        return
      }

      if (data.type === 'job_fit') {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '', 
          type: 'job_fit',
          fitData: data
        }])
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.content,
          type: 'answer'
        }])
      }

      if (data.remaining !== undefined) {
        setRemaining(data.remaining)
      }

    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro na conexão. Tente novamente mais tarde.',
        type: 'answer'
      }])
    } finally {
      setLoading(false)
    }
  }

  // Render Contact Card (Reutilizável)
  const renderContactCard = (info: any, isFallback = false, reason?: string) => (
    <div className="space-y-4 pt-2">
      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
        <h4 className="font-semibold flex items-center gap-2 mb-2 text-primary">
          <GIcon name={isFallback ? "help" : "waving_hand"} size={20} />
          {isFallback ? "Preciso de ajuda universitária! 😅" : "Vamos continuar essa conversa?"}
        </h4>
        
        <p className="text-sm text-muted-foreground mb-4">
          {reason || "Atingimos o limite de mensagens por aqui, mas adoraria aprofundar esse papo diretamente com você."}
        </p>

        <div className="grid gap-2">
          <a 
            href={info.linkedin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full p-2.5 bg-[#0077b5] hover:bg-[#006396] text-white rounded-lg transition-colors text-sm font-medium"
          >
            <GIcon name="link" size={18} />
            Conectar no LinkedIn
          </a>
          
          <a 
            href={`mailto:${info.email}`}
            className="flex items-center justify-center gap-2 w-full p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium"
          >
            <GIcon name="mail" size={18} />
            Enviar Email Direto
          </a>

          <div className="mt-2 pt-2 border-t border-dashed border-border/50 text-center">
            <p className="text-xs text-muted-foreground mb-2">Ou use o formulário de contato abaixo</p>
            <Button 
               variant="outline" 
               size="sm"
               className="w-full"
               onClick={() => {
                 setIsFocused(false) // Sai do modo foco
                 setTimeout(() => {
                   document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                 }, 300)
               }}
            >
              Ir para Contato
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderJobFitResponse = (fitData: any) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <span className="text-2xl font-bold text-primary">{fitData.fitScore}</span>
        </div>
        <div>
          <h4 className="font-semibold">Análise de Job Fit</h4>
          <p className="text-sm text-muted-foreground">Score de compatibilidade</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed">{fitData.summary}</p>

      {fitData.skillsMatch?.length > 0 && (
        <div>
          <h5 className="font-medium text-sm mb-2">✅ Skills que eu tenho:</h5>
          <ul className="space-y-1">
            {fitData.skillsMatch.map((item: any, i: number) => (
              <li key={i} className="text-sm">
                <span className="font-medium">{item.skill}</span>
                {item.evidence && <span className="text-muted-foreground"> — {item.evidence}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {fitData.skillsGap?.length > 0 && (
        <div>
          <h5 className="font-medium text-sm mb-2">⚠️ Gap de skills:</h5>
          <ul className="space-y-1">
            {fitData.skillsGap.map((gap: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground">• {gap}</li>
            ))}
          </ul>
        </div>
      )}

      {fitData.highlights?.length > 0 && (
        <div>
          <h5 className="font-medium text-sm mb-2">🌟 Por que me contratar:</h5>
          <ol className="space-y-1">
            {fitData.highlights.map((highlight: string, i: number) => (
              <li key={i} className="text-sm">{i + 1}. {highlight}</li>
            ))}
          </ol>
        </div>
      )}

      {fitData.nextSteps && (
        <p className="text-sm mt-4 p-3 bg-muted/50 rounded-lg italic">
          {fitData.nextSteps}
        </p>
      )}
    </div>
  )

  return (
    <div className="container relative z-10">
      <AnimatePresence>
        {isFocused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-40"
            onClick={() => setIsFocused(false)}
          />
        )}
      </AnimatePresence>

      <Reveal>
        <div className={`text-center max-w-3xl mx-auto mb-8 transition-all duration-500 ${isFocused ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl flex items-center justify-center gap-2">
            <GIcon name="smart_toy" size={32} className="text-primary" />
            Converse com Meu Clone Digital
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Cole a descrição da vaga para uma comparação inteligente ou pergunte qualquer coisa sobre minha experiência técnica.
          </p>
        </div>
      </Reveal>

      <div 
        ref={containerRef}
        className={`relative transition-all duration-300 ease-in-out ${isFocused ? 'z-50' : 'z-10'}`}
      >
        <motion.div
          layout
          className={`
            mx-auto bg-card flex flex-col overflow-hidden transition-all duration-500 rounded-xl
            ${isFocused 
              ? 'max-w-4xl shadow-2xl ring-1 ring-primary/20 scale-[1.02]' 
              : 'max-w-4xl shadow-lg border border-muted/50'
            }
          `}
        >
          {/* Header (Zen Mode) - Só aparece no modo foco */}
          <AnimatePresence>
            {isFocused && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b bg-muted/30 overflow-hidden"
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-muted-foreground">AI Online • Modo Foco</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsFocused(false)} 
                    className="h-6 text-xs text-muted-foreground hover:text-foreground px-2"
                  >
                    <GIcon name="close" size={16} className="mr-1" />
                    Esc
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

            {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            className={`
            overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scroll-smooth
            scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40
            transition-all duration-500
            ${isFocused ? 'h-[50dvh] md:h-[60vh] max-h-[800px]' : 'h-[400px] md:h-[500px]'}
          `}>
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground px-4">
                <GIcon name="chat" size={32} className="mb-4 opacity-50" />
                <p className="text-sm font-medium">Inicie uma conversa...</p>
                <div className="mt-6 flex flex-col gap-2 w-full max-w-sm text-xs opacity-90 md:opacity-70 md:hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setInput('Tenho uma vaga de Senior React. Analise para mim: [Cole a JD]'); setIsFocused(true); }}
                    className="px-4 py-3 bg-muted/50 hover:bg-muted rounded-xl transition-colors text-left flex items-center gap-2"
                  >
                        <span className="text-lg">📋</span> Analisar Job Description
                  </button>
                  <button 
                    onClick={() => { setInput('Qual foi seu maior desafio técnico no Grupo Dass?'); setIsFocused(true); handleSubmit({ preventDefault: () => {} } as any); }}
                    className="px-4 py-3 bg-muted/50 hover:bg-muted rounded-xl transition-colors text-left flex items-center gap-2"
                  >
                        <span className="text-lg">🏆</span> Maior desafio técnico
                  </button>
                  <button 
                      onClick={() => { setInput('Como você lida com redução de custos em Cloud?'); setIsFocused(true); handleSubmit({ preventDefault: () => {} } as any); }}
                      className="px-4 py-3 bg-muted/50 hover:bg-muted rounded-xl transition-colors text-left flex items-center gap-2"
                  >
                        <span className="text-lg">💰</span> FinOps e Redução de Custos
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center self-start mt-1 hidden md:flex">
                    <GIcon name="psychology" size={20} className="text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[90%] md:max-w-[75%] rounded-2xl p-3 md:p-4 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted/80 rounded-bl-sm border border-border/50'
                  }`}
                >
                  {msg.type === 'job_fit' && msg.fitData ? (
                    renderJobFitResponse(msg.fitData)
                  ) : msg.type === 'rate_limit_rich' && msg.contactInfo ? (
                    renderContactCard(msg.contactInfo)
                  ) : msg.type === 'fallback_contact' && msg.contactInfo ? (
                    renderContactCard(msg.contactInfo, true, msg.content)
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center self-start mt-1 hidden md:flex">
                    <GIcon name="person" size={20} />
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Loading omitido para brevidade, mas mantido na lógica se não sobrescrito... 
                Vou incluir para garantir integridade do bloco */}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hidden md:flex">
                  <GIcon name="psychology" size={20} className="text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm p-4">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* Input Area */}
          <div className="border-t p-3 md:p-4 bg-background/50 backdrop-blur-sm">
            {remaining !== null && remaining < 5 && (
              <p className="text-xs text-muted-foreground mb-2 text-center">
                ⚠️ {remaining} pergunta{remaining !== 1 ? 's' : ''} restante{remaining !== 1 ? 's' : ''} nesta sessão
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto w-full relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                  if (e.key === 'Escape') {
                    setIsFocused(false)
                  }
                }}
                placeholder={isFocused ? "Digite sua mensagem..." : "Cole a descrição da vaga ou pergunte..."}
                className={`
                  flex-1 px-4 py-3 text-base md:text-sm bg-background border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans
                  scrollbar-thin scrollbar-thumb-muted-foreground/20
                  ${isFocused ? 'min-h-[60px] max-h-[120px] shadow-sm' : 'min-h-[50px] max-h-[100px]'}
                `}
                disabled={loading}
              />
              <Button 
                type="submit" 
                disabled={loading || !input.trim()}
                className={`
                  self-end rounded-xl transition-all
                  ${isFocused ? 'h-[60px] w-[60px]' : 'h-[50px] w-[50px]'}
                `}
              >
                <GIcon name="send" size={isFocused ? 24 : 20} className={loading ? 'opacity-0' : 'opacity-100'} />
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <GIcon name="autorenew" size={20} className="animate-spin" />
                  </div>
                )}
              </Button>
            </form>
            {isFocused && (
              <div className="text-center mt-2 hidden md:block">
                <span className="text-[10px] text-muted-foreground">
                  Pressione <strong>Enter</strong> para enviar • <strong>Shift + Enter</strong> para quebra de linha • <strong>Esc</strong> para sair
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
