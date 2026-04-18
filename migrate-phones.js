const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  let updated = 0
  for (const user of users) {
    if (user.phone && !user.phone.startsWith('+')) {
      const normalized = '+' + (user.phone.startsWith('7') ? user.phone : '7' + user.phone)
      await prisma.user.update({ where: { id: user.id }, data: { phone: normalized } })
      console.log(`Updated: ${user.phone} -> ${normalized}`)
      updated++
    }
  }
  console.log(`Done. Updated ${updated} users.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
