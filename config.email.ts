interface EmailConfig {
  port?: number,
  host?: string,
  user?: string,
  password?: string,
  from: string,
}

export const emailConfig: EmailConfig = {
  host: process.env.EMAIL_HOST ?? 'smtp.ethereal.email',
  port: Number(process.env.EMAIL_PORT) ?? 587,
  user: process.env.EMAIL_USER ?? 'graciela88@ethereal.email',
  password: process.env.EMAIL_PASSWORD ?? 'D4xuSS1gWhtNxa1jt4',
  from: "Support <support@basic.com>"
}