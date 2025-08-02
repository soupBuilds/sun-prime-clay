import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.role.createMany({
    data: [
      { name: 'ADMIN' },
      { name: 'PROCUREMENT' },
      { name: 'MAINTENANCE' },
    ],
    skipDuplicates: true,
  })

await prisma.vendor.createMany({
  data: [{ name: 'Default Vendor', contact: 'vendor@example.com' }],
  skipDuplicates: true,
})

}

main().finally(() => prisma.$disconnect())