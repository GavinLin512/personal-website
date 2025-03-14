import { z } from "@/lib/zod/zh-tw";
// import { z } from "zod";

// 表單驗證
export const formSchema = z.object({
  name: z
    .string()
    .max(20)
    .refine((value) => value !== '',{
      params: { i18n: "string_is_empty" }
    })
    ,

  email: z
    .string()
    .email()
    .refine((value) => value !== '',{
      params: { i18n: "string_is_empty" }
    })
    ,

  password: z
    .string()
    .min(8)
    .regex(/[a-zA-Z0-9]/)
    .refine((value) => value !== '',{
      params: { i18n: "string_is_empty" }
    })
    ,
})
