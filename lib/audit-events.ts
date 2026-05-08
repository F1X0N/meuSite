/**
 * Catálogo de eventos auditáveis. Nomes ESTÁVEIS — qualquer mudança aqui
 * é breaking para downstream (dashboards, queries, alertas).
 *
 * Princípios:
 * - Nome no formato `{domain}.{action}.{outcome}` ou `{domain}.{action}` para eventos pontuais.
 * - Todos os eventos carregam `request_id` quando aplicável.
 * - Sensibilidade indica o nível de cuidado ao consumir: nunca incluir conteúdo PII
 *   (mensagens, e-mails, IPs crus). IDs hashados (ip_hash) são OK.
 *
 * Documentação completa em AUDIT.md.
 */

export const AUDIT_EVENTS = {
  // Chat (rota /api/ai/chat)
  CHAT_REQUEST_RECEIVED: 'chat.request.received',
  CHAT_OPENAI_DISPATCHED: 'chat.openai.dispatched',
  CHAT_OPENAI_RESPONDED: 'chat.openai.responded',
  CHAT_RESPONSE_DELIVERED: 'chat.response.delivered',
  CHAT_RATE_LIMIT_HIT: 'chat.rate_limit.hit',
  CHAT_PARSE_FAILURE: 'chat.parse_failure',
  CHAT_MOCK_MODE: 'chat.mock_mode',

  // Job-fit (rota /api/ai/job-fit)
  JOB_FIT_REQUESTED: 'job_fit.analysis.requested',
  JOB_FIT_COMPLETED: 'job_fit.analysis.completed',

  // Ask-my-work (rota /api/ai/ask-my-work)
  ASK_MY_WORK_REQUESTED: 'ask_my_work.requested',
  ASK_MY_WORK_COMPLETED: 'ask_my_work.completed',

  // Extract-job (rota /api/ai/extract-job)
  EXTRACT_JOB_REQUESTED: 'extract_job.requested',
  EXTRACT_JOB_COMPLETED: 'extract_job.completed',
  EXTRACT_JOB_FAILED: 'extract_job.failed',

  // Contact (rota /api/contact)
  CONTACT_RECEIVED: 'contact.submission.received',
  CONTACT_VALIDATION_FAILED: 'contact.validation.failed',
  CONTACT_EMAIL_DISPATCHED: 'contact.email.dispatched',
  CONTACT_EMAIL_FAILED: 'contact.email.failed',

  // Frontend (rota /api/log/client-error)
  CLIENT_ERROR_CAPTURED: 'client.error.captured',

  // Targeted resume (rota /api/ai/targeted-resume)
  TARGETED_RESUME_REQUESTED: 'targeted_resume.requested',
  TARGETED_RESUME_GENERATED: 'targeted_resume.generated',
  TARGETED_RESUME_VALIDATION_FAILED: 'targeted_resume.validation_failed',
  TARGETED_RESUME_RATE_LIMIT_HIT: 'targeted_resume.rate_limit.hit',
  TARGETED_RESUME_PDF_UPLOADED: 'targeted_resume.pdf.uploaded',
  TARGETED_RESUME_PDF_FAILED: 'targeted_resume.pdf.failed',
  TARGETED_RESUME_EMAIL_REQUESTED: 'targeted_resume.email.requested',
  TARGETED_RESUME_EMAIL_SENT: 'targeted_resume.email.sent',
  TARGETED_RESUME_EMAIL_FAILED: 'targeted_resume.email.failed',
  TARGETED_RESUME_EMAIL_RATE_LIMIT_HIT: 'targeted_resume.email.rate_limit.hit',

  // Catch-all
  API_ERROR_UNHANDLED: 'api.error.unhandled',
} as const

export type AuditEventName = (typeof AUDIT_EVENTS)[keyof typeof AUDIT_EVENTS]
