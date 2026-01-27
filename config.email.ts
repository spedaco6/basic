interface EmailConfig {
  port?: number,
  host?: string,
  user?: string,
  password?: string,
  from: string,
}

export const emailConfig: EmailConfig = {
  host: 'smtp.ethereal.email',
  port: 587,
  user: 'graciela88@ethereal.email',
  password: 'D4xuSS1gWhtNxa1jt4',
  from: "Support <support@basic.com>"
}