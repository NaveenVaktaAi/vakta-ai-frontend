"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { SendIcon, BotIcon, WifiIcon, WifiOffIcon, AlertCircleIcon, InfoIcon, FileTextIcon } from "./icons"

import MessageBubble from "./message-bubble"
import ChatControls from "./chat-controls"
import { useChatWebSocket } from "../hooks/use-chat-websocket"

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    isConnected,
    sendMessage,
    messages,
    isTyping,
    connect,
    disconnect,
    clearMessages,
    exportMessages,
    connectionStatus,
    isMockMode,
    currentChatId,
    createNewChat,
  } = useChatWebSocket(1) // Using user ID 1 for demo

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    sendMessage(inputValue)
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getConnectionIcon = () => {
    if (isMockMode) {
      return <InfoIcon className="w-4 h-4 text-blue-500" />
    }

    switch (connectionStatus) {
      case "connected":
        return <WifiIcon className="w-4 h-4 text-green-500" />
      case "connecting":
        return <WifiIcon className="w-4 h-4 text-yellow-500 animate-pulse" />
      case "error":
        return <AlertCircleIcon className="w-4 h-4 text-red-500" />
      default:
        return <WifiOffIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getConnectionText = () => {
    if (isMockMode) {
      return "Demo Mode"
    }

    switch (connectionStatus) {
      case "connected":
        return "Connected"
      case "connecting":
        return "Connecting..."
      case "error":
        return "Connection Error"
      default:
        return "Disconnected"
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <Card className="p-4 mb-4 border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-full">
              <BotIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Chatbot with RAG</h1>
              <div className="flex items-center gap-2">
                {getConnectionIcon()}
                <p className="text-sm text-muted-foreground">{getConnectionText()}</p>
                {currentChatId && (
                  <Badge variant="secondary" className="text-xs">
                    Chat: {currentChatId.slice(-8)}
                  </Badge>
                )}
                {!isMockMode && (
                  <Badge variant="outline" className="text-xs">
                    <FileTextIcon className="w-3 h-3 mr-1" />
                    RAG Enabled
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <ChatControls
              messages={messages}
              onClearChat={clearMessages}
              onExportChat={exportMessages}
              isConnected={isConnected || isMockMode}
            />
            <Button onClick={createNewChat} variant="outline" size="sm">
              New Chat
            </Button>
            {!isConnected && !isMockMode && connectionStatus !== "connecting" && (
              <Button onClick={connect} variant="outline" size="sm">
                Connect
              </Button>
            )}
            {isConnected && !isMockMode && (
              <Button onClick={disconnect} variant="outline" size="sm">
                Disconnect
              </Button>
            )}
          </div>
        </div>

        {isMockMode && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <InfoIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 dark:text-blue-200 font-medium">Demo Mode Active</p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  The backend server isn't running, so I'm showing demo responses. To enable full RAG capabilities with
                  document search:
                </p>
                <ol className="text-blue-700 dark:text-blue-300 mt-2 ml-4 list-decimal text-xs space-y-1">
                  <li>
                    Navigate to the <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">backend</code> directory
                  </li>
                  <li>
                    Install dependencies:{" "}
                    <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">pip install -r requirements.txt</code>
                  </li>
                  <li>Set environment variables (OpenAI API key, database URLs, etc.)</li>
                  <li>
                    Start the server:{" "}
                    <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">uvicorn main:app --reload</code>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Messages */}
      <Card className="flex-1 p-4 mb-4 overflow-hidden border-border">
        <div className="h-full overflow-y-auto space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="p-2 bg-primary rounded-full">
                <BotIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Input */}
      <Card className="p-4 border-border">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isMockMode
                ? "Ask me about your documents (demo mode)..."
                : isConnected
                  ? "Ask me about your documents..."
                  : "Connect to start chatting..."
            }
            disabled={!isConnected && !isMockMode}
            className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </div>
        {connectionStatus === "error" && !isMockMode && (
          <p className="text-xs text-destructive mt-2">
            Connection failed. The app is now running in demo mode. Start the backend server to enable RAG responses.
          </p>
        )}
        {!isMockMode && isConnected && (
          <p className="text-xs text-muted-foreground mt-2">
            💡 Upload documents in the Documents tab to get more accurate, context-aware responses
          </p>
        )}
      </Card>
    </div>
  )
}
