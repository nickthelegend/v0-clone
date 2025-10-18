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
      select: {
        id: true,
        walletAddress: true,
        tokens: true,
        createdAt: true,
      },
    })

    // If user doesn't exist, return default data
    if (!user) {
      return NextResponse.json({
        user: {
          walletAddress: walletAddress,
          tokens: 0,
          createdAt: new Date().toISOString()
        },
        purchases: [],
        stats: {
          totalSpent: 0,
          totalTokensPurchased: 0,
          purchaseCount: 0
        }
      })
    }

    const purchases = await prisma.purchase.findMany({
      where: { walletAddress },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    const stats = {
      totalSpent: purchases.reduce((sum: number, p: any) => sum + p.amount, 0),
      totalTokensPurchased: purchases.reduce((sum: number, p: any) => sum + p.tokens, 0),
      purchaseCount: purchases.length,
    }

    return NextResponse.json({ user, purchases, stats })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
