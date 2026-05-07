'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { copy } from '@/config/copy'
import { contactSchema, formatZodErrors } from '@/lib/validation'

const buildInputClasses = () =>
  'w-full rounded-lg border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none'

type ContactState = {
  name: string
  email: string
  message: string
  loading: boolean
  success: boolean
  error: string | null
}

const createInitialState = (): ContactState => ({
  name: '',
  email: '',
  message: '',
  loading: false,
  success: false,
  error: null,
})

export const Contact = () => {
  const [state, setState] = useState(createInitialState())

  const handleChange = (field) => (event) => {
    setState({ ...state, [field]: event.target.value, error: null })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const parsed = contactSchema.safeParse({
      name: state.name,
      email: state.email,
      message: state.message,
    })

    if (!parsed.success) {
      const errors = formatZodErrors(parsed.error)
      const firstError = errors.name || errors.email || errors.message || 'Verifique os campos.'
      setState({ ...state, error: firstError })
      return
    }

    setState({ ...state, loading: true, error: null })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.name,
          email: state.email,
          message: state.message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setState({
          ...state,
          loading: false,
          error: data.error || copy.contact.errorMessage,
        })
        return
      }

      setState({
        ...createInitialState(),
        success: true,
      })
    } catch (error) {
      setState({
        ...state,
        loading: false,
        error: copy.contact.errorMessage,
      })
    }
  }

  return (
    <div className="container max-w-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {copy.contact.title}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          {copy.contact.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulário de Contato</CardTitle>
          <CardDescription>
            Preencha os campos abaixo e retornarei em breve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.success ? (
            <div className="p-6 text-center">
              <p className="text-lg font-medium text-primary">
                {copy.contact.successMessage}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setState(createInitialState())}
              >
                Enviar outra mensagem
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {copy.contact.form.name.label}
                </label>
                <input
                  type="text"
                  value={state.name}
                  onChange={handleChange('name')}
                  placeholder={copy.contact.form.name.placeholder}
                  className={buildInputClasses()}
                  disabled={state.loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {copy.contact.form.email.label}
                </label>
                <input
                  type="email"
                  value={state.email}
                  onChange={handleChange('email')}
                  placeholder={copy.contact.form.email.placeholder}
                  className={buildInputClasses()}
                  disabled={state.loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {copy.contact.form.message.label}
                </label>
                <textarea
                  value={state.message}
                  onChange={handleChange('message')}
                  placeholder={copy.contact.form.message.placeholder}
                  rows={6}
                  className={`${buildInputClasses()} resize-none`}
                  disabled={state.loading}
                />
              </div>

              {state.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={state.loading}
                className="w-full"
              >
                {state.loading ? 'Enviando...' : copy.contact.form.submit}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
