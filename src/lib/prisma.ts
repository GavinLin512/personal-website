// prisma postgresql
// import { PrismaClient } from '@prisma/client'
// import { withAccelerate } from '@prisma/extension-accelerate'
// import { withOptimize } from "@prisma/extension-optimize";

// Optimize 必須在 Accelerate 前面
// const prisma = new PrismaClient({ log: ['query','error', 'info', 'warn'] })
// .$extends(
//     withOptimize({ apiKey: process.env.OPTIMIZE_API_KEY || "" })
// )
// .$extends(withAccelerate())

// neon
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import ws from "ws";

dotenv.config();
neonConfig.webSocketConstructor = ws;
const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ log: ['query','error', 'info', 'warn'], adapter });

const globalForPrisma = global as unknown as { prisma: typeof prisma };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
