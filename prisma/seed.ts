import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create pricing plans
  await prisma.plan.createMany({
    data: [
      {
        name: 'Starter',
        tokens: 500,
        price: 9,
        description: 'Perfect for trying out the platform',
        popular: false,
      },
      {
        name: 'Pro',
        tokens: 2000,
        price: 29,
        description: 'Best value for regular users',
        popular: true,
      },
      {
        name: 'Enterprise',
        tokens: 10000,
        price: 99,
        description: 'For power users and teams',
        popular: false,
      },
    ],
  })

  console.log('✅ Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
