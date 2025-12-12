import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('petId')

    const where: any = { userId: session.user.id }
    if (petId) {
      where.petId = petId
    }

    const records = await prisma.dewormingRecord.findMany({
      where,
      include: {
        pet: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching deworming records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const record = await prisma.dewormingRecord.create({
      data: {
        userId: session.user.id,
        petId: body.petId,
        date: new Date(body.date),
        brand: body.brand,
        dosage: body.dosage,
        nextDueDate: body.nextDueDate ? new Date(body.nextDueDate) : null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating deworming record:', error)
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    )
  }
}
