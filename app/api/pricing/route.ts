import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } })
    return NextResponse.json({ plans })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { walletAddress, planId } = await req.json()

    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Update or create user based on wallet address
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: { tokens: { increment: plan.tokens } },
      create: {
        walletAddress,
        tokens: plan.tokens
      }
    })

    await prisma.purchase.create({
      data: {
        walletAddress,
        planId,
        tokens: plan.tokens,
        amount: plan.price,
        status: 'completed'
      }
    })

    return NextResponse.json({ user: { id: user.id, walletAddress: user.walletAddress, tokens: user.tokens } })
  } catch (error) {
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 })
  }
}
