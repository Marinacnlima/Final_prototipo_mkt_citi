import sgMail from '@sendgrid/mail'
import { config } from './config.js'

if (config.SENDGRID_API_KEY) sgMail.setApiKey(config.SENDGRID_API_KEY)

export async function sendPasswordResetEmail(to: string, code: string): Promise<void> {
  if (!config.SENDGRID_API_KEY) {
    console.log(`[email] SENDGRID_API_KEY não configurado — código de reset para ${to}: ${code}`)
    return
  }
  await sgMail.send({
    to,
    from: { email: config.EMAIL_FROM, name: config.EMAIL_FROM_NAME },
    subject: 'Seu código de verificação — CITi MarketOps',
    text: `Seu código de verificação é ${code}. Ele expira em ${config.RESET_CODE_TTL_MINUTES} minutos.`,
    html: `<p>Seu código de verificação é <strong style="font-size:20px">${code}</strong>.</p><p>Ele expira em ${config.RESET_CODE_TTL_MINUTES} minutos. Se você não solicitou isso, ignore este e-mail.</p>`,
  })
}
