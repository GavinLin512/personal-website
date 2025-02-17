"use client";

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"


export default function Navigation() {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }
    return (
        <nav className="flex items-center border-b w-full">
            <div className="container mx-auto py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <a
                        href="/"
                        className="text-xl font-bold transition-colors hover:text-blue-600"
                    >
                        Logo
                    </a>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        <a
                            href="/"
                            className="text-sm font-medium transition-colors hover:text-amber-600"
                        >
                            首頁
                        </a>
                        <a
                            href="/about"
                            className="text-sm font-medium transition-colors hover:text-blue-600"
                        >
                            關於
                        </a>
                        <a
                            href="/products"
                            className="text-sm font-medium transition-colors hover:text-blue-600"
                        >
                            產品
                        </a>
                        <a
                            href="/contact"
                            className="text-sm font-medium transition-colors hover:text-blue-600"
                        >
                            聯絡我們
                        </a>
                        <Button variant="outline" size="icon" onClick={toggleTheme}>
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">切換主題</span>
                        </Button>
                    </div>
                    <Sheet>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="outline">Open</Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Edit profile</SheetTitle>
                                <SheetDescription>
                                    Make changes to your profile here. Click save when you're done.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="grid gap-4 py-4">

                            </div>
                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button type="submit">Save changes</Button>
                                </SheetClose>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}