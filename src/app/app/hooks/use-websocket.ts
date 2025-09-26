"use client"

import { useEffect, useRef, useState, useCallback } from "react"

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

interface UseWebSocketReturn {
  isConnected: boolean
  sendMessage: (message: string) => void
  messages: Message[]
  isTyping: boolean
  connect: () => void
  disconnect: () => void
  clearMessages: () => void
  exportMessages: () => void
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
  isMockMode: boolean
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI assistant with document knowledge. Upload documents to get more accurate answers, or ask me anything!",
      sender: "bot",
      timestamp: new Date().toISOString(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )
  const [isMockMode, setIsMockMode] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const clientIdRef = useRef<string>(Math.random().toString(36).substring(7))
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 3
  const shouldReconnectRef = useRef(true)

  useEffect(() => {
    const savedMessages = localStorage.getItem("chatbot-messages")
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        setMessages(parsed)
      } catch (error) {
        console.error("Error loading saved messages:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("chatbot-messages", JSON.stringify(messages))
  }, [messages])

  const mockAIResponses = [
    "I understand you're trying to chat with me. Unfortunately, the backend server isn't running right now, so I'm operating in demo mode.",
    "That's an interesting question! In a real deployment, I would use RAG (Retrieval-Augmented Generation) to search through your uploaded documents for relevant information.",
    "I'm currently in mock mode since the FastAPI backend isn't available. Please start the backend server to enable full RAG functionality with document search.",
    "Thanks for your message! To get real AI responses with document knowledge, please run the Python FastAPI server from the backend directory.",
    "I'd love to help with that! Right now I'm showing demo responses. Start the backend server to chat with the real RAG-powered AI assistant.",
  ]

  const getMockResponse = useCallback((userMessage: string): string => {
    const message = userMessage.toLowerCase()

    if (message.includes("hello") || message.includes("hi")) {
      return "Hello! I'm currently in demo mode. To enable full RAG capabilities with document search, please start the FastAPI backend server."
    }
    if (message.includes("help")) {
      return "I'd be happy to help! Right now I'm running in mock mode. For real AI assistance with document knowledge, please start the backend server by running 'uvicorn main:app --reload' in the backend directory."
    }
    if (message.includes("document") || message.includes("upload")) {
      return "In full mode, I can search through your uploaded documents to provide accurate answers. Upload documents via the Documents tab and I'll use them to enhance my responses!"
    }
    if (message.includes("backend") || message.includes("server")) {
      return "To start the backend server: 1) Navigate to the backend directory, 2) Install dependencies with 'pip install -r requirements.txt', 3) Set your OPENAI_API_KEY environment variable, 4) Run 'uvicorn main:app --reload'"
    }

    return mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)]
  }, [])

  const connect = useCallback(() => {
    if (isMockMode || !shouldReconnectRef.current) {
      return
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionStatus("connecting")

    try {
      const wsUrl = `ws://localhost:5000/api/v1/chat/ws/${clientIdRef.current}`
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log("[v0] Connected to WebSocket")
        setIsConnected(true)
        setConnectionStatus("connected")
        setIsMockMode(false)
        reconnectAttemptsRef.current = 0
        shouldReconnectRef.current = true
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setIsTyping(false)

          const newMessage: Message = {
            id: Date.now().toString(),
            content: data.content,
            sender: "bot",
            timestamp: data.timestamp,
            metadata: data.metadata,
          }

          setMessages((prev) => [...prev, newMessage])
        } catch (error) {
          console.error("[v0] Error parsing message:", error)
          setIsTyping(false)
        }
      }

      ws.onclose = (event) => {
        console.log("[v0] Disconnected from WebSocket", event.code)
        setIsConnected(false)
        setConnectionStatus("disconnected")
        wsRef.current = null

        if (reconnectAttemptsRef.current >= maxReconnectAttempts || !shouldReconnectRef.current) {
          console.log("[v0] Switching to mock mode - backend server not available")
          setIsMockMode(true)
          setConnectionStatus("disconnected")
          shouldReconnectRef.current = false
          return
        }

        if (event.code !== 1000 && shouldReconnectRef.current) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        }
      }

      ws.onerror = (error) => {
        console.log("[v0] WebSocket connection failed - switching to mock mode")
        setConnectionStatus("error")
        setIsConnected(false)
        setIsTyping(false)
        setIsMockMode(true)
        shouldReconnectRef.current = false
      }

      wsRef.current = ws
    } catch (error) {
      console.error("[v0] Failed to create WebSocket connection:", error)
      setConnectionStatus("error")
      setIsMockMode(true)
      shouldReconnectRef.current = false
    }
  }, [isMockMode])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    shouldReconnectRef.current = false

    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected")
      wsRef.current = null
    }

    setIsConnected(false)
    setConnectionStatus("disconnected")
    reconnectAttemptsRef.current = 0
    setIsTyping(false)
  }, [])

  const retryConnection = useCallback(() => {
    setIsMockMode(false)
    shouldReconnectRef.current = true
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect])

  const sendMessage = useCallback(
    (content: string) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: "user",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsTyping(true)

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isMockMode) {
        wsRef.current.send(
          JSON.stringify({
            content,
            timestamp: new Date().toISOString(),
          }),
        )
      } else {
        setTimeout(
          () => {
            const mockResponse: Message = {
              id: (Date.now() + 1).toString(),
              content: getMockResponse(content),
              sender: "bot",
              timestamp: new Date().toISOString(),
              metadata: {
                fallback_mode: true,
                error: "Backend server not available",
              },
            }

            setMessages((prev) => [...prev, mockResponse])
            setIsTyping(false)
          },
          1000 + Math.random() * 2000,
        )
      }
    },
    [isMockMode, getMockResponse],
  )

  const clearMessages = useCallback(async () => {
    try {
      if (!isMockMode) {
        await fetch(`http://127.0.0.1:5000/api/v1/reset/${clientIdRef.current}`, {
          method: "POST",
        })
      }

      const initialMessage: Message = {
        id: "1",
        content:
          "Hello! I'm your AI assistant with document knowledge. Upload documents to get more accurate answers, or ask me anything!",
        sender: "bot",
        timestamp: new Date().toISOString(),
      }
      setMessages([initialMessage])
      setIsTyping(false)
    } catch (error) {
      console.log("[v0] Could not reset server conversation (expected if backend not running)")
      const initialMessage: Message = {
        id: "1",
        content:
          "Hello! I'm your AI assistant with document knowledge. Upload documents to get more accurate answers, or ask me anything!",
        sender: "bot",
        timestamp: new Date().toISOString(),
      }
      setMessages([initialMessage])
      setIsTyping(false)
    }
  }, [isMockMode])

  const exportMessages = useCallback(() => {
    const chatData = {
      exportDate: new Date().toISOString(),
      messages: messages.filter((msg) => msg.id !== "1"),
    }

    const dataStr = JSON.stringify(chatData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `chat-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [messages])

  useEffect(() => {
    const timer = setTimeout(() => {
      connect()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    sendMessage,
    messages,
    isTyping,
    connect: retryConnection,
    disconnect,
    clearMessages,
    exportMessages,
    connectionStatus,
    isMockMode,
  }
}
