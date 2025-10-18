import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    // Try to find existing user, or create a default response
    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress },
      select: { id: true, walletAddress: true, tokens: true }
    })

    // If user doesn't exist, return default data
    if (!user) {
      return NextResponse.json({
        user: {
          walletAddress: walletAddress,
          tokens: 0
        }
      })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
