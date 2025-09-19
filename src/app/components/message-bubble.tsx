"use client"

import { BotIcon, UserIcon, CopyIcon, CheckIcon, FileTextIcon, ClockIcon, AlertCircleIcon } from "./icons"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card } from "../components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible"
import { useState } from "react"

interface MessageMetadata {
  source_documents?: string[]
  context_chunks_used?: number
  retrieval_performed?: boolean
  processing_time?: number
  suggestion?: {
    suggest: boolean
    reason: string
    suggestion?: string
  }
  fallback_mode?: boolean
  error?: string
}

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: string
  metadata?: MessageMetadata
}

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const [showSources, setShowSources] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting with explicit color inheritance
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /`(.*?)`/g,
        "<code class='bg-opacity-20 bg-black dark:bg-white dark:bg-opacity-20 px-1 py-0.5 rounded text-sm'>$1</code>",
      )
  }

  const hasRAGInfo =
    message.metadata &&
    (message.metadata.source_documents?.length ||
      message.metadata.retrieval_performed ||
      message.metadata.context_chunks_used)

  return (
    <div className={`flex gap-3 group ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
      {message.sender === "bot" && (
        <div className="p-2 bg-primary rounded-full self-start">
          <BotIcon className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <div className="max-w-[70%] space-y-2">
        <div
          className={`p-3 rounded-lg relative ${
            message.sender === "user"
              ? "bg-primary text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          }`}
          style={{
            color: message.sender === "user" ? "#ffffff" : undefined,
          }}
        >
          <div
            className={`text-sm leading-relaxed text-pretty ${
              message.sender === "user" ? "text-white" : "text-gray-900 dark:text-gray-100"
            }`}
            style={{
              color: message.sender === "user" ? "#ffffff" : "#1f2937",
            }}
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />

          {message.sender === "bot" && message.metadata && (
            <div className="mt-3 space-y-2">
              {/* Processing info */}
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                {message.metadata.processing_time && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{message.metadata.processing_time.toFixed(2)}s</span>
                  </div>
                )}
                {message.metadata.context_chunks_used && (
                  <Badge variant="secondary" className="text-xs">
                    {message.metadata.context_chunks_used} chunks used
                  </Badge>
                )}
                {message.metadata.fallback_mode && (
                  <Badge variant="outline" className="text-xs">
                    Demo Mode
                  </Badge>
                )}
              </div>

              {/* Error display */}
              {message.metadata.error && (
                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircleIcon className="w-3 h-3" />
                  <span>{message.metadata.error}</span>
                </div>
              )}

              {/* Suggestion display */}
              {message.metadata.suggestion?.suggest && (
                <Card className="p-2 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <p className="font-medium">💡 Suggestion:</p>
                    <p>{message.metadata.suggestion.reason}</p>
                    {message.metadata.suggestion.suggestion && (
                      <p className="mt-1 italic">"{message.metadata.suggestion.suggestion}"</p>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <p
              className={`text-xs ${
                message.sender === "user" ? "text-white opacity-70" : "text-gray-600 dark:text-gray-400"
              }`}
              style={{
                color: message.sender === "user" ? "rgba(255, 255, 255, 0.7)" : "#6b7280",
              }}
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className={`opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ${
                message.sender === "user"
                  ? "text-white hover:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
              style={{
                color: message.sender === "user" ? "#ffffff" : "#6b7280",
              }}
            >
              {copied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {hasRAGInfo && message.sender === "bot" && (
          <Collapsible open={showSources} onOpenChange={setShowSources}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs bg-transparent">
                <FileTextIcon className="w-3 h-3 mr-1" />
                {message.metadata?.source_documents?.length || 0} sources
                {showSources ? " ▲" : " ▼"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {message.metadata?.source_documents?.map((source, index) => (
                <Card key={index} className="p-2 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="w-4 h-4 text-primary" />
                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{source}</span>
                  </div>
                </Card>
              ))}
              {message.metadata?.retrieval_performed && (
                <div className="text-xs text-gray-600 dark:text-gray-400">✓ Document search performed</div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {message.sender === "user" && (
        <div className="p-2 bg-secondary rounded-full self-start">
          <UserIcon className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  )
}
