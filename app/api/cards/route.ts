import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''

  const cards = await prisma.card.findMany({
    where: {
      name: { contains: search, mode: 'insensitive' }
    },
    orderBy: [{ character: 'asc' }, { name: 'asc' }]
  })

  return NextResponse.json(cards)
}