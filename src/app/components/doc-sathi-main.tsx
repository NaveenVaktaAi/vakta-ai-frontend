"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { ScrollArea } from "../components/ui/scroll-area"
import { useToast } from "../hooks/use-toast"
import { 
  UploadIcon, 
  FileTextIcon, 
  LinkIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  PlayIcon,
  FolderIcon,
  BotIcon,
  PieChartIcon,
  BookmarkIcon,
  ListIcon
} from "./icons"
import ChatInterface from "./chat-interface"
import { uploadDocument, uploadWebsiteUrl, uploadYoutubeUrl, getUploadedDocuments } from "../services/api"
import helperInstance from "./helper"

interface Document {
  _id: string
  user_id: number
  name: string
  url: string
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled'
  document_format: string
  type?: string
  created_ts: string
  updated_ts: string
  summary?: string
}

interface UploadProgress {
  file: File
  progress: number
  status: "uploading" | "processing" | "completed" | "error"
  error?: string
}

export default function DocSathiMain() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [urlInput, setUrlInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [currentChatDocId, setCurrentChatDocId] = useState<string | null>(null)
  const { toast } = useToast()

  // Function to truncate document names
  const truncateName = (name: string, maxLength: number = 50) => {
    if (name.length <= maxLength) return name
    return name.substring(0, maxLength) + "..."
  }

  // Mock documents for demo
  const mockDocuments: Document[] = [
    {
      _id: "1",
      user_id: 1,
      name: "Chemistry Class A - Advanced Organic Chemistry Notes and Practice Problems",
      url: "https://example.com/chemistry-class-a.pdf",
      status: "completed",
      document_format: "pdf",
      created_ts: "2024-01-15T10:30:00Z",
      updated_ts: "2024-01-15T10:30:00Z",
      summary: "Chemistry class notes"
    },
    {
      _id: "2", 
      user_id: 1,
      name: "5-pass-resrer-card.pdf",
      url: "https://example.com/5-pass-resrer-card.pdf",
      status: "completed",
      document_format: "pdf",
      created_ts: "2024-01-15T11:45:00Z",
      updated_ts: "2024-01-15T11:45:00Z",
      summary: "Resume card"
    },
    {
      _id: "3",
      user_id: 1,
      name: "Video: In this course youll learn the API design skills that separate junior developers from seniors",
      url: "https://www.youtube.com/watch?v=DIKTR5XdMGs",
      status: "completed",
      document_format: "videoUrl",
      type: "youtube",
      created_ts: "2024-01-15T12:00:00Z",
      updated_ts: "2024-01-15T12:00:00Z"
    }
  ]

  // Fetch documents from API
  const fetchDocuments = useCallback(async () => {
    try {
      const response = await getUploadedDocuments()
      if (response?.data?.success && response.data.data) {
        // Process documents and truncate names
        const processedDocuments = response.data.data.map((doc: Document) => ({
          ...doc,
          name: truncateName(doc.name, 50)
        }))
        setDocuments(processedDocuments)
      } else {
        // Fallback to mock data if API fails
        setDocuments(mockDocuments)
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error)
      // Fallback to mock data
      setDocuments(mockDocuments)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files)
      
      // Create upload progress entries
      const initialProgress = fileArray.map((file) => ({
        file,
        progress: 0,
        status: "uploading" as const,
      }))
      setUploadProgress((prev) => [...prev, ...initialProgress])

      // Process each file
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        
        try {
          // Step 1: Upload to S3 using presigned URL
          setUploadProgress((prev) =>
            prev.map((p) => (p.file === file ? { ...p, progress: 25, status: "uploading" } : p)),
          )

          const s3Results = await helperInstance.uploadFileOnS3(file)
          
          if (s3Results && s3Results.length > 0) {
            setUploadProgress((prev) =>
              prev.map((p) => (p.file === file ? { ...p, progress: 50, status: "processing" } : p)),
            )

            // Step 2: Call upload document API
            const documentData = s3Results[0]
            const fileType = file.type.includes('pdf') ? 'pdf' : 
                           file.type.includes('docx') ? 'docx' : 
                           file.type.includes('doc') ? 'doc' : 'pdf'

            const response = await uploadDocument(documentData, fileType)
            
            if (response?.data?.success) {
              setUploadProgress((prev) =>
                prev.map((p) => (p.file === file ? { ...p, progress: 100, status: "completed" } : p)),
              )

              toast({
                title: "Document uploaded successfully",
                description: `${file.name} has been uploaded and is being processed.`,
              })

              // Refresh documents list
              await fetchDocuments()
            } else {
              throw new Error("Upload failed")
            }
          } else {
            throw new Error("S3 upload failed")
          }
        } catch (error) {
          console.error("Upload error:", error)
          setUploadProgress((prev) =>
            prev.map((p) => (p.file === file ? { ...p, status: "error", error: error instanceof Error ? error.message : "Upload failed" } : p)),
          )

          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
            variant: "destructive",
          })
        }
      }

      // Clear progress after 5 seconds
      setTimeout(() => {
        setUploadProgress([])
      }, 5000)
    },
    [toast, fetchDocuments]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFileUpload(files)
      }
    },
    [handleFileUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return

    setIsLoading(true)
    
    try {
      let response
      
      if (urlInput.includes('youtube')) {
        // Upload YouTube URL
        response = await uploadYoutubeUrl(urlInput, 'youtube')
      } else {
        // Upload Website URL
        response = await uploadWebsiteUrl(urlInput, 'website')
      }
      
      if (response?.data?.success) {
        toast({
          title: "URL processed successfully",
          description: "Content has been extracted and is being processed.",
        })
        
        // Refresh documents list
        await fetchDocuments()
        setUrlInput("")
      } else {
        throw new Error("URL processing failed")
      }
    } catch (error) {
      console.error("URL processing error:", error)
      toast({
        title: "URL processing failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startChat = (docId: string) => {
    // Use the actual document ID from the backend
    setCurrentChatDocId(docId)
    setShowChat(true)
    setSelectedDocument(docId)
  }

  const getFileIcon = (documentFormat: string, type?: string) => {
    if (type === 'youtube' || documentFormat === 'videoUrl') {
      return <PlayIcon className="w-4 h-4 text-red-500" />
    }
    
    switch (documentFormat) {
      case 'pdf':
        return <FileTextIcon className="w-4 h-4 text-red-500" />
      case 'docx':
      case 'doc':
        return <FileTextIcon className="w-4 h-4 text-blue-500" />
      case 'website':
        return <LinkIcon className="w-4 h-4 text-green-500" />
      default:
        return <FileTextIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case "processing":
        return <ClockIcon className="w-4 h-4 text-yellow-500 animate-spin" />
      case "failed":
        return <XCircleIcon className="w-4 h-4 text-red-500" />
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />
    }
  }

  if (showChat) {
    return (
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-64 bg-slate-800 text-white p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DS</span>
            </div>
            <span className="text-xl font-bold">DocSathi</span>
          </div>
          
          <nav className="space-y-2">
            <button 
              onClick={() => setShowChat(false)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Home
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg bg-blue-600 text-white">
              DocSathi
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
              Notes
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
              Quiz
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
              Study Planner
            </button>
          </nav>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatInterface documentId={currentChatDocId} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 bg-slate-800 text-white p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DS</span>
          </div>
          <span className="text-xl font-bold">DocSathi</span>
        </div>
        
        <nav className="space-y-2">
          <button className="w-full text-left px-3 py-2 rounded-lg bg-blue-600 text-white">
            Home
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
            DocSathi
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
            Notes
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
            Quiz
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors">
            Study Planner
          </button>
        </nav>

        <div className="mt-auto">
          <button className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors">
            <span className="text-white">↑</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Center Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Hello! Upload & chat with your document
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload notes, lectures, articles, or YouTube videos and let DocSathi help you understand them. 
                Chat with multiple sources at one time.
              </p>
            </div>

            {/* Upload Section */}
            <div className="mb-8">
              <div className="flex gap-4 mb-6">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg">
                  Upload
                </Button>
                <Button variant="outline" className="px-8 py-3 rounded-lg">
                  Previous Sources
                </Button>
              </div>

              {/* Drag & Drop Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById("url-input")?.focus()}
              >
                <div className="flex justify-center gap-4 mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <FileTextIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <FileTextIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <PlayIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <FileTextIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <FolderIcon className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
                <p className="text-gray-600 mb-4">Drag & Drop for your</p>
                
                <div className="flex gap-2 max-w-md mx-auto">
                  <Input
                    id="url-input"
                    placeholder="Drag & drop to upload or paste a file URL"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    + Add
                  </Button>
                </div>
                
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
              </div>

              {/* Upload Progress */}
              {uploadProgress.length > 0 && (
                <div className="mt-6 space-y-3">
                  {uploadProgress.map((progress, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{progress.file.name}</span>
                        <Badge variant={progress.status === "completed" ? "default" : "secondary"}>
                          {progress.status}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents List */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Documents</h3>
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded yet</p>
                  <p className="text-sm">Upload your first document to get started</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc._id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                      selectedDocument === doc._id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedDocument(doc._id)}
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.document_format, doc.type)}
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-medium text-gray-800 truncate cursor-pointer" 
                          title={doc.name}
                          onClick={(e) => {
                            e.stopPropagation()
                            // Show full name in a tooltip or alert
                            toast({
                              title: "Document Name",
                              description: doc.name,
                              duration: 3000
                            })
                          }}
                        >
                          {doc.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {getStatusIcon(doc.status)}
                          <span className="capitalize">{doc.status}</span>
                          {doc.document_format && (
                            <span className="text-xs">• {doc.document_format}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {doc.status === 'completed' && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          startChat(doc._id)
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex-shrink-0"
                      >
                        Start Chat
                      </Button>
                    )}
                  </div>
                ))
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Assistant */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Hi there! How I assist you?</p>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mx-auto flex items-center justify-center">
              <BotIcon className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Quick Insights</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <PieChartIcon className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Summary</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <BookmarkIcon className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Highlights</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <ListIcon className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Generate Quiz</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
