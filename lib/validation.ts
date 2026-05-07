import { z } from 'zod'

// Schemas compartilhados entre client e server.
// Mantenha estes consistentes — qualquer mudança aqui afeta forms + APIs.

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto').max(80, 'Nome muito longo'),
  email: z.string().trim().toLowerCase().email('E-mail inválido').max(120, 'E-mail muito longo'),
  message: z.string().trim().min(10, 'Mensagem muito curta (mínimo 10 caracteres)').max(2000, 'Mensagem muito longa (máximo 2000 caracteres)'),
})

export type ContactInput = z.infer<typeof contactSchema>

export const formatZodErrors = (error: z.ZodError): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_root'
    if (!out[key]) out[key] = issue.message
  }
  return out
}
