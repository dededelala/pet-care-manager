import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const pets = await prisma.pet.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(pets)
  } catch (error) {
    console.error('Error fetching pets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pets' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Debug: Log database URL (first 50 chars only for security)
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20))

    const body = await request.json()

    const pet = await prisma.pet.create({
      data: {
        name: body.name,
        breed: body.breed || null,
        birthday: body.birthday ? new Date(body.birthday) : null,
        gender: body.gender || null,
        color: body.color || null,
        photo: body.photo || null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json(pet, { status: 201 })
  } catch (error) {
    console.error('Error creating pet:', error)
    return NextResponse.json(
      { error: 'Failed to create pet' },
      { status: 500 }
    )
  }
}
