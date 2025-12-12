import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reminder = await prisma.reminderSettings.findUnique({
      where: { id: params.id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error fetching reminder:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminder' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // 如果更新了间隔天数，重新计算下次到期日期
    const updateData: any = {
      email: body.email,
      intervalDays: body.intervalDays,
      isEnabled: body.isEnabled,
      updatedAt: new Date(),
    }

    if (body.intervalDays) {
      const now = new Date()
      updateData.nextDueDate = new Date(now.getTime() + body.intervalDays * 24 * 60 * 60 * 1000)
    }

    const reminder = await prisma.reminderSettings.update({
      where: { id: params.id },
      data: updateData,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.reminderSettings.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    )
  }
}
