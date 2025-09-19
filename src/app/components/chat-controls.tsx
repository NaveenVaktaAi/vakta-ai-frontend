"use client"

import { Button } from "../components/ui/button"
import { TrashIcon, DownloadIcon, SettingsIcon } from "./icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: string
}

interface ChatControlsProps {
  messages: Message[]
  onClearChat: () => void
  onExportChat: () => void
  isConnected: boolean
}

export default function ChatControls({ messages, onClearChat, onExportChat, isConnected }: ChatControlsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportChat} disabled={messages.length <= 1}>
          <DownloadIcon className="w-4 h-4 mr-2" />
          Export Chat
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onClearChat}
          disabled={messages.length <= 1 || !isConnected}
          className="text-destructive"
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          Clear Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
