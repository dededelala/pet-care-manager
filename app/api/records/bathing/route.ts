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

    const records = await prisma.bathingRecord.findMany({
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
    console.error('Error fetching bathing records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const record = await prisma.bathingRecord.create({
      data: {
        petId: body.petId,
        date: new Date(body.date),
        products: body.products || null,
        location: body.location || null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating bathing record:', error)
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    )
  }
}
