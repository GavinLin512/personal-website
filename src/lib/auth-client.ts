import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"


export const authClient = createAuthClient({
    baseURL: "http://localhost:3000", // the base url of your auth server
    signUp: {
        email: async (data: { email: string; password: string }) => {
            // 實現註冊邏輯
            return { data: null, error: null }; // 根據實際情況返回
        }
    },
    plugins: [
        adminClient()
    ]
})