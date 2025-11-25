import nodemailer from 'nodemailer'

const transportOptions = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
}

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transportOptions.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
}

let transporter = null

export const getTransporter = () => {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP configuration missing. OTP emails will not be sent.')
    return null
  }

  if (!transporter) {
    transporter = nodemailer.createTransport(transportOptions)
  }
  return transporter
}

export const sendOtpEmail = async (recipient, otp) => {
  const transport = getTransporter()
  if (!transport) {
    return
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipient,
    subject: 'Your Rural Connect verification code',
    html: `
      <p>Hello,</p>
      <p>Your verification code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not initiate this request, please ignore this email.</p>
    `,
  })
}

