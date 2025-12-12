import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('petId')

    const where: any = {
      userId: session.user.id,
    }
    if (petId) {
      where.petId = petId
    }

    const reminders = await prisma.reminderSettings.findMany({
      where,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 计算下次到期日期
    const nextDueDate = new Date()
    nextDueDate.setDate(nextDueDate.getDate() + body.intervalDays)

    const reminder = await prisma.reminderSettings.create({
      data: {
        userId: session.user.id,
        petId: body.petId,
        type: body.type,
        email: body.email,
        intervalDays: body.intervalDays,
        isEnabled: body.isEnabled ?? true,
        nextDueDate,
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

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    )
  }
}
