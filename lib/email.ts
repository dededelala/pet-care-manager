import { Resend } from 'resend'

// 初始化 Resend（如果配置了 RESEND_API_KEY）
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// 备用方案：使用 nodemailer（需要 SMTP 配置）
import nodemailer from 'nodemailer'

const smtpConfig = {
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
}

const transporter = nodemailer.createTransport(smtpConfig)

// 邮件模板
const createEmailTemplate = (petName: string, reminderType: string, dueDate: Date) => {
  const typeMap: Record<string, { title: string; description: string }> = {
    'deworming': {
      title: '外驱提醒',
      description: `您的宠物 ${petName} 需要进行外驱了！`
    },
    'internal_deworming': {
      title: '内驱提醒',
      description: `您的宠物 ${petName} 需要进行内驱了！`
    },
    'vaccine': {
      title: '疫苗提醒',
      description: `您的宠物 ${petName} 需要接种疫苗了！`
    },
    'bathing': {
      title: '洗澡提醒',
      description: `您的宠物 ${petName} 需要洗澡了！`
    }
  }

  const typeInfo = typeMap[reminderType] || { title: '健康提醒', description: `您的宠物 ${petName} 有健康记录到期了！` }

  return {
    subject: `🐾 ${typeInfo.title} - ${petName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899 0%, #9333ea 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .pet-name { font-size: 28px; font-weight: bold; margin: 10px 0; }
          .reminder-type { font-size: 20px; color: #ec4899; margin-bottom: 20px; }
          .due-date { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #9333ea 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 宠物健康提醒</h1>
          </div>
          <div class="content">
            <div class="reminder-type">${typeInfo.title}</div>
            <p>${typeInfo.description}</p>

            <div class="pet-name">${petName}</div>

            <div class="due-date">
              <strong>📅 到期日期：</strong> ${dueDate.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </div>

            <p>请及时为您的宠物安排相应的健康护理。</p>

            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'}" class="button">
              查看详情
            </a>
          </div>
          <div class="footer">
            <p>此邮件由宠物健康管理系统自动发送</p>
            <p>© 2024 宠物健康管理系统</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

// 发送提醒邮件
export async function sendReminderEmail(
  email: string,
  petName: string,
  reminderType: string,
  dueDate: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    const { subject, html } = createEmailTemplate(petName, reminderType, dueDate)

    // 尝试使用 Resend
    if (resend && resendApiKey) {
      const response = await resend.emails.send({
        from: 'Pet Care <noreply@your-domain.com>',
        to: email,
        subject,
        html,
      })

      if (response.error) {
        console.error('Resend error:', response.error)
        return { success: false, error: response.error.message }
      }

      console.log('Email sent via Resend:', response.data?.id)
      return { success: true }
    }

    // 备用：使用 nodemailer
    if (smtpConfig.host && smtpConfig.auth.user) {
      const info = await transporter.sendMail({
        from: `"Pet Care" <${smtpConfig.auth.user}>`,
        to: email,
        subject,
        html,
      })

      console.log('Email sent via SMTP:', info.messageId)
      return { success: true }
    }

    // 如果没有配置邮件服务
    console.log('Reminder email (mock):', { to: email, subject, petName, reminderType, dueDate })
    return { success: true, error: 'Email service not configured, logged to console' }

  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
