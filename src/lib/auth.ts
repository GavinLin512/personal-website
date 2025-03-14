import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { admin } from "better-auth/plugins/admin";
import { openAPI } from "better-auth/plugins"

 
const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: { 
        enabled: true, 
    },
    plugins: [
        admin(),
        openAPI(), // 顯示所有登入相關的 api /api/auth/reference
    ]
});
