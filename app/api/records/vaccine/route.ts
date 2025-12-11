import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const petId = searchParams.get('petId')

    const where: any = {}
    if (petId) {
      where.petId = petId
    }

    const records = await prisma.vaccineRecord.findMany({
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
    console.error('Error fetching vaccine records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const record = await prisma.vaccineRecord.create({
      data: {
        petId: body.petId,
        date: new Date(body.date),
        type: body.type,
        institution: body.institution || null,
        nextDueDate: body.nextDueDate ? new Date(body.nextDueDate) : null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating vaccine record:', error)
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    )
  }
}
