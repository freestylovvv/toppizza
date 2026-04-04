import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: [{ level: 'error', emit: 'event' }],
})

// Фильтруем Neon auto-suspend noise
;(prisma as any).$on?.('error', (e: any) => {
  if (e?.message?.includes('terminating connection') || e?.message?.includes('Closed')) return
  console.error(e)
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (e: any) {
      const isConnectionError = e?.message?.includes('Closed') || e?.code === 'P1001' || e?.code === 'P1002'
      if (isConnectionError && i < retries - 1) {
        await new Promise(r => setTimeout(r, 500 * (i + 1)))
        continue
      }
      throw e
    }
  }
  throw new Error('Max retries reached')
}
