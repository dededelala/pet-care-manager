import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Run migration
    execSync('npx prisma migrate deploy', {
      env: process.env,
      stdio: 'inherit',
    })

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
    })
  } catch (error) {
    console.error('Migration failed:', error)
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
