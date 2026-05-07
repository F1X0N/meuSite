import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { contactSchema, formatZodErrors } from '@/lib/validation'

const MY_EMAIL = 'amorimjosivan7@gmail.com'

const getSmtpTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validação falhou', fieldErrors: formatZodErrors(parsed.error) },
        { status: 400 },
      )
    }

    const { name, email, message } = parsed.data
    const emailHtml = `
      <div style="font-family: sans-serif; max-w-600px; margin: 0 auto;">
        <h2>Nova mensagem de contato! 🚀</h2>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <hr />
        <p><strong>Mensagem:</strong></p>
        <p style="white-space: pre-wrap; background: #f4f4f5; p: 16px; border-radius: 8px;">${escapeHtml(message)}</p>
      </div>
    `

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const data = await resend.emails.send({
          from: 'Portfolio Contact <onboarding@resend.dev>',
          to: MY_EMAIL,
          subject: `Novo contato de ${name} via Portfolio (Resend)`,
          replyTo: email,
          html: emailHtml
        })
        if (data.error) throw new Error(data.error.message)
        return NextResponse.json({ success: true, provider: 'resend', id: data.data?.id })
      } catch (err) {
        console.error('Resend falhou, tentando fallback SMTP...', err)
      }
    }

    const transporter = getSmtpTransporter()
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER, 
          to: MY_EMAIL,
          replyTo: email, 
          subject: `Novo contato de ${name} via Portfolio (SMTP)`,
          html: emailHtml,
        })
        return NextResponse.json({ success: true, provider: 'smtp' })
      } catch (err) {
        return NextResponse.json({ error: 'Falha no envio via SMTP' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, simulated: true })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
