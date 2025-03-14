"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { PasswordInput } from "./ui/password-input"
import type * as React from "react";
import { signUp } from "@/lib/auth/sign-up"

import type { z } from "@/lib/zod/zh-tw"
// import type { z } from "zod";
import { formSchema } from "@/lib/auth/auth-schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"


export function SignUpForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            console.log('values', values)
            await signUp(values)
            // if (error) {
            //     toast.error(error.message)
            // } else {
            //     toast.success("註冊成功")
            //     console.log('output', data, error)
            // }
        } catch (error) {
            console.error('Form submission error', error)
            toast.error('Failed to submit the form. Please try again.')
        }

    }

    return (
        <div className={cn("flex flex-col ", className)} {...props}>
            <Card className="w-[100%]">
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>註冊帳號資訊</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent>
                            <FormField
                                // control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="mb-3">
                                        <FormLabel>使用者名稱*</FormLabel>
                                        <FormControl>
                                            <Input placeholder="請輸入使用者名稱" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public display name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                // control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="mb-3">
                                        <FormLabel>帳號*</FormLabel>
                                        <FormControl>
                                            <Input placeholder="請輸入信箱" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public display name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                // control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="mb-3">
                                        <FormLabel>密碼*</FormLabel>
                                        <FormControl>
                                            <PasswordInput placeholder="請輸入密碼" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public display name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline">
                                <Link href="/admin/login">回登入頁</Link>
                            </Button>
                            <Button type="submit">送出</Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}