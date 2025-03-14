import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
// import { withOptimize } from "@prisma/extension-optimize";

// Optimize 必須在 Accelerate 前面
const prisma = new PrismaClient()
    // .$extends(
    //     withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY || "" })
    // )
    .$extends(withAccelerate())




const globalForPrisma = global as unknown as { prisma: typeof prisma }

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma