"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "../components/ui/button"
import { BotIcon, FileTextIcon } from "./icons"

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <BotIcon className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">AI Chatbot</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant={pathname === "/" ? "default" : "ghost"} asChild>
              <Link href="/" className="flex items-center gap-2">
                <BotIcon className="w-4 h-4" />
                Chat
              </Link>
            </Button>

            <Button variant={pathname === "/documents" ? "default" : "ghost"} asChild>
              <Link href="/documents" className="flex items-center gap-2">
                <FileTextIcon className="w-4 h-4" />
                Documents
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
