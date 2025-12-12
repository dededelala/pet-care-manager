import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReminderEmail } from '@/lib/email'
import { addDays, isBefore } from 'date-fns'

// 这个 API 会被 Vercel Cron Jobs 调用
export async function GET() {
  try {
    console.log('Starting reminder check...')

    // 查找所有启用的提醒设置
    const reminders = await prisma.reminderSettings.findMany({
      where: {
        isEnabled: true,
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    console.log(`Found ${reminders.length} active reminders`)

    let sentCount = 0
    let skippedCount = 0
    const errors: string[] = []

    for (const reminder of reminders) {
      try {
        // 检查是否应该发送提醒
        const shouldSend = await shouldSendReminder(reminder)

        if (shouldSend) {
          console.log(`Sending reminder for ${reminder.pet.name} (${reminder.type})`)

          // 发送邮件
          const result = await sendReminderEmail(
            reminder.email,
            reminder.pet.name,
            reminder.type,
            reminder.nextDueDate || new Date()
          )

          if (result.success) {
            // 更新最后发送时间和下次到期日期
            await prisma.reminderSettings.update({
              where: { id: reminder.id },
              data: {
                lastSent: new Date(),
                nextDueDate: addDays(new Date(), reminder.intervalDays),
              },
            })

            sentCount++
            console.log(`Reminder sent successfully to ${reminder.email}`)
          } else {
            const errorMsg = `Failed to send to ${reminder.email}: ${result.error}`
            console.error(errorMsg)
            errors.push(errorMsg)
          }
        } else {
          skippedCount++
          console.log(`Skipping ${reminder.pet.name} - not time yet`)
        }
      } catch (error) {
        const errorMsg = `Error processing reminder ${reminder.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: reminders.length,
        sent: sentCount,
        skipped: skippedCount,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// 检查是否应该发送提醒
async function shouldSendReminder(reminder: any): Promise<boolean> {
  const now = new Date()
  const nextDueDate = reminder.nextDueDate ? new Date(reminder.nextDueDate) : null

  // 如果没有设置下次到期日期，跳过
  if (!nextDueDate) {
    console.log(`No nextDueDate set for reminder ${reminder.id}`)
    return false
  }

  // 如果上次发送时间和下次到期日期都为空，说明是第一次发送
  if (!reminder.lastSent && !nextDueDate) {
    return true
  }

  // 如果已经过了下次到期日期，发送提醒
  if (isBefore(nextDueDate, now)) {
    console.log(`Reminder ${reminder.id} is overdue`)
    return true
  }

  // 如果在到期日期的3天内，提前发送提醒
  const threeDaysFromNow = addDays(now, 3)
  if (isBefore(nextDueDate, threeDaysFromNow)) {
    console.log(`Reminder ${reminder.id} is due within 3 days`)
    return true
  }

  return false
}
