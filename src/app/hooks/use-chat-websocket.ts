"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { chatService, ChatMessage } from "../services/chatService"

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
  message_context?: any
  streaming?: boolean
  token?: string
}

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: string
  metadata?: MessageMetadata
}

interface UseChatWebSocketReturn {
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
  currentChatId: string | null
  createNewChat: () => Promise<string | null>
}

export function useChatWebSocket(userId: number = 1, documentId?: string | null): UseChatWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: documentId 
        ? `Hello! I'm your AI assistant. I'm ready to help you with your document. You can ask me questions about the content, request summaries, or get insights. What would you like to know?`
        : "Hello! I'm your AI assistant with document knowledge. Upload documents to get more accurate answers, or ask me anything!",
      sender: "bot",
      timestamp: new Date().toISOString(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )
  const [isMockMode, setIsMockMode] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const hasAttemptedConnect = useRef<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
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

    if (documentId) {
      // Document-specific responses
      if (message.includes("hello") || message.includes("hi")) {
        return `Hello! I'm ready to help you with your document. I can answer questions, provide summaries, or explain specific parts. What would you like to know about this document?`
      }
      if (message.includes("summary") || message.includes("summarize")) {
        return `I'd be happy to provide a summary of your document! In full mode, I would analyze the content and give you key points and main ideas. Right now I'm in demo mode, but you can ask me specific questions about the document.`
      }
      if (message.includes("explain") || message.includes("what does")) {
        return `I can help explain parts of your document! In full mode, I would search through the content to find relevant information. What specific part would you like me to explain?`
      }
      if (message.includes("question") || message.includes("ask")) {
        return `Feel free to ask me any questions about your document! I can help with understanding concepts, finding specific information, or clarifying details. What would you like to know?`
      }
      return `I'm here to help you with your document! I can answer questions, provide insights, or help you understand the content better. What would you like to know?`
    }

    // General responses when no document is selected
    if (message.includes("hello") || message.includes("hi")) {
      return "Hello! I'm currently in demo mode. To enable full RAG capabilities with document search, please start the FastAPI backend server."
    }
    if (message.includes("help")) {
      return "I'd be happy to help! Right now I'm running in mock mode. For real AI assistance with document knowledge, please start the backend server by running 'uvicorn app.main:app --reload' in the backend directory."
    }
    if (message.includes("document") || message.includes("upload")) {
      return "In full mode, I can search through your uploaded documents to provide accurate answers. Upload documents via the Documents tab and I'll use them to enhance my responses!"
    }
    if (message.includes("backend") || message.includes("server")) {
      return "To start the backend server: 1) Navigate to the backend directory, 2) Install dependencies with 'pip install -r requirements.txt', 3) Set your OPENAI_API_KEY environment variable, 4) Run 'uvicorn app.main:app --reload'"
    }

    // Return a contextual response instead of random one
    return "I understand your question. In demo mode, I can provide general assistance. For more accurate responses with document knowledge, please start the backend server."
  }, [documentId])

  const createNewChat = useCallback(async () => {
    if (isCreatingChat) {
      console.log("[Chat] Chat creation already in progress, skipping...")
      return currentChatId
    }

    setIsCreatingChat(true)
    try {
      const chatTitle = documentId 
        ? `Chat with Document ${new Date().toLocaleString()}`
        : `Chat ${new Date().toLocaleString()}`

      const response = await chatService.createChat({
        user_id: userId,
        title: chatTitle,
        status: 'active',
        document_id: documentId || undefined
      })
      console.log("[Chat] Create chat response---------------------:", response)
      console.log("[Chat] Document ID being sent:", documentId)
      
      if (response.success && response.data) {
        setCurrentChatId(response.data.chat_id)
        console.log('New chat created:', response.data.chat_id)
        return response.data.chat_id
      }
    } catch (error) {
      console.error('Failed to create new chat:', error)
      setIsMockMode(true)
    } finally {
      setIsCreatingChat(false)
    }
    return null
  }, [userId, isCreatingChat, currentChatId, documentId])

  const connect = useCallback(async () => {
    if (isMockMode || !shouldReconnectRef.current) {
      return
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("[Chat] WebSocket already connected, skipping...")
      return
    }

    if (connectionStatus === "connecting") {
      console.log("[Chat] Connection already in progress, skipping...")
      return
    }

    setConnectionStatus("connecting")

    try {
      // Create a new chat if we don't have one
      console.log("[Chat] Creating new chat---------------------:", currentChatId)
      let chatId = currentChatId
      console.log("[Chat] Chat ID---------------------:", chatId)
      if (!chatId) {
        chatId = await createNewChat()
        console.log("[Chat] Chat ID---------in if------------:", chatId)
        if (!chatId) {
          throw new Error('Failed to create chat')
        }
      }

      const wsUrl = `ws://localhost:5000/api/v1/chat/ws/${chatId}`
      console.log("[Chat] WebSocket URL---------------------:", wsUrl)
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log("[Chat] Connected to WebSocket for chat:", chatId)
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
          console.log("[Chat] Message received:", data)

          // Only process bot messages, ignore user message confirmations
          if (data.isBot === false) {
            console.log("[Chat] Ignoring user message confirmation")
            return
          }

          // Handle different message types from backend
          if (data.mt === "chat_message_bot_partial") {
            // Handle streaming message
            if (data.start) {
              // Message start - create new message
              const newMessage: Message = {
                id: data.start,
                content: '',
                sender: "bot",
                timestamp: data.timestamp || new Date().toISOString(),
                metadata: {
                  message_context: data.message_context,
                  streaming: true
                }
              }
              setMessages(prev => [...prev, newMessage])
            } else if (data.partial) {
              // Partial content - update existing message
              setMessages(prev => prev.map(msg => 
                msg.id === data.uuid 
                  ? { ...msg, content: msg.content + data.partial }
                  : msg
              ))
            } else if (data.stop) {
              // Message end - mark as complete
              setMessages(prev => prev.map(msg => 
                msg.id === data.stop 
                  ? { ...msg, metadata: { ...msg.metadata, streaming: false } }
                  : msg
              ))
            }
          } else if (data.mt === "message_upload_confirm") {
            // Handle complete message - only add if it's a bot message
            if (data.isBot === true) {
              const newMessage: Message = {
                id: data.token || Date.now().toString(),
                content: data.message,
                sender: "bot",
                timestamp: data.timestamp || new Date().toISOString(),
                metadata: {
                  message_context: data.message_context,
                  token: data.token
                }
              }
              setMessages(prev => [...prev, newMessage])
            }
          } else if (data.mt === "new_message") {
            // Handle complete message
            const newMessage: Message = {
              id: data.messageId || Date.now().toString(),
              content: data.message,
              sender: "bot",
              timestamp: data.timestamp || new Date().toISOString(),
            }
            setMessages(prev => [...prev, newMessage])
          } else {
            // Handle legacy format or simple responses - only add bot messages
            if ((data.content || data.message || data.response) && data.sender !== "user") {
              // Check if this message is just repeating the user's query
              const messageContent = data.content || data.message || data.response || ''
              const lastUserMessage = messages.slice().reverse().find(msg => msg.sender === "user")
              
              if (lastUserMessage && messageContent.toLowerCase().includes(lastUserMessage.content.toLowerCase())) {
                console.log("[Chat] Ignoring message that repeats user query")
                return
              }
              
              const newMessage: Message = {
                id: Date.now().toString(),
                content: messageContent,
                sender: "bot",
                timestamp: data.timestamp || new Date().toISOString(),
                metadata: data.metadata,
              }
              setMessages(prev => [...prev, newMessage])
            }
          }
        } catch (error) {
          console.error("[Chat] Error parsing message:", error)
          setIsTyping(false)
        }
      }

      ws.onclose = (event) => {
        console.log("[Chat] Disconnected from WebSocket", event.code)
        setIsConnected(false)
        setConnectionStatus("disconnected")
        wsRef.current = null

        if (reconnectAttemptsRef.current >= maxReconnectAttempts || !shouldReconnectRef.current) {
          console.log("[Chat] Switching to mock mode - backend server not available")
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
        console.log("[Chat] WebSocket connection failed - switching to mock mode")
        setConnectionStatus("error")
        setIsConnected(false)
        setIsTyping(false)
        setIsMockMode(true)
        shouldReconnectRef.current = false
      }

      wsRef.current = ws
    } catch (error) {
      console.error("[Chat] Failed to create WebSocket connection:", error)
      setConnectionStatus("error")
      setIsMockMode(true)
      shouldReconnectRef.current = false
    }
  }, [isMockMode, currentChatId, createNewChat])

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
    async (content: string) => {
      // Check if this message was already sent recently to prevent duplicates
      const recentMessages = messages.slice(-5) // Check last 5 messages
      const isDuplicate = recentMessages.some(msg => 
        msg.content === content && msg.sender === "user" && 
        (Date.now() - new Date(msg.timestamp).getTime()) < 5000 // Within last 5 seconds
      )
      
      if (isDuplicate) {
        console.log("[Chat] Duplicate message detected, skipping...")
        return
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: "user",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsTyping(true)

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isMockMode && currentChatId) {
        // Send message via WebSocket
        wsRef.current.send(
          JSON.stringify({
            mt: "message_upload",
            message: content,
            content: content,
            timestamp: new Date().toISOString(),
            userId: "1", // Default user ID
            timezone: "UTC",
            selectedLanguage: "en",
            documentId: documentId || null // Include document ID
          }),
        )

        // Also save to database
        try {
          await chatService.createMessage({
            chat_id: currentChatId,
            message: content,
            is_bot: false,
            type: 'text'
          })
        } catch (error) {
          console.error('Failed to save user message:', error)
        }
      } else {
        // Mock mode - simulate realistic delay
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
          2000 + Math.random() * 3000, // Increased delay to 2-5 seconds
        )
      }
    },
    [isMockMode, currentChatId, getMockResponse, documentId, messages],
  )

  const clearMessages = useCallback(async () => {
    try {
      if (!isMockMode && currentChatId) {
        // Delete the current chat and create a new one
        await chatService.deleteChat(currentChatId)
        const newChatId = await createNewChat()
        if (newChatId) {
          setCurrentChatId(newChatId)
        }
      }

      const initialMessage: Message = {
        id: "1",
        content: documentId 
          ? `Hello! I'm your AI assistant. I'm ready to help you with your document. You can ask me questions about the content, request summaries, or get insights. What would you like to know?`
          : "Hello! I'm your AI assistant with document knowledge. Upload documents to get more accurate answers, or ask me anything!",
        sender: "bot",
        timestamp: new Date().toISOString(),
      }
      setMessages([initialMessage])
      setIsTyping(false)
    } catch (error) {
      console.log("[Chat] Could not reset server conversation (expected if backend not running)")
      const initialMessage: Message = {
        id: "1",
        content: documentId 
          ? `Hello! I'm your AI assistant. I'm ready to help you with your document. You can ask me questions about the content, request summaries, or get insights. What would you like to know?`
          : "Hello! I'm your AI assistant with document knowledge. Upload documents to get more accurate answers, or ask me anything!",
        sender: "bot",
        timestamp: new Date().toISOString(),
      }
      setMessages([initialMessage])
      setIsTyping(false)
    }
  }, [isMockMode, currentChatId, createNewChat, documentId])

  const exportMessages = useCallback(() => {
    const chatData = {
      exportDate: new Date().toISOString(),
      chatId: currentChatId,
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
  }, [messages, currentChatId])

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only connect if not already connected and not in mock mode
      if (!isConnected && !isMockMode && connectionStatus !== "connecting") {
        const connectKey = documentId || "general"
        if (hasAttemptedConnect.current !== connectKey) {
          console.log("[Chat] Attempting to connect for:", connectKey)
          hasAttemptedConnect.current = connectKey
          connect()
        }
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [documentId, isConnected, isMockMode, connectionStatus, connect])

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
    currentChatId,
    createNewChat,
  }
}

