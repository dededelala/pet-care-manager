import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Use db push instead of migrate deploy
    // db push will create tables directly from schema without migration files
    execSync('npx prisma db push --force-reset', {
      env: process.env,
      stdio: 'inherit',
    })

    return NextResponse.json({
      success: true,
      message: 'Database schema pushed successfully! Tables created.',
    })
  } catch (error) {
    console.error('Database push failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
