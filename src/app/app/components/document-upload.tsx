"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import {
  UploadIcon,
  FileTextIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  ProcessorIcon,
} from "./icons"

interface Document {
  id: number
  doc_name: string
  original_filename: string
  file_type: string
  file_size: number
  processing_status: string
  chunk_count: number
  upload_date: string
}

interface UploadProgress {
  file: File
  progress: number
  status: "uploading" | "processing" | "completed" | "error"
  error?: string
}

export default function DocumentUpload() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [urlInput, setUrlInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMockMode, setIsMockMode] = useState(false)
  const { toast } = useToast()

  const mockDocuments: Document[] = [
    {
      id: 1,
      doc_name: "Sample Document.pdf",
      original_filename: "sample-document.pdf",
      file_type: "pdf",
      file_size: 2048576,
      processing_status: "completed",
      chunk_count: 15,
      upload_date: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      doc_name: "Research Paper.docx",
      original_filename: "research-paper.docx",
      file_type: "docx",
      file_size: 1536000,
      processing_status: "processing",
      chunk_count: 0,
      upload_date: "2024-01-15T11:45:00Z",
    },
  ]

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch("/api/upload/documents")
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.log("[v0] Backend unavailable, switching to mock mode")
        setIsMockMode(true)
        setDocuments(mockDocuments)
        return
      }
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
        setIsMockMode(false)
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.log("[v0] Failed to fetch documents, using mock data:", error)
      setIsMockMode(true)
      setDocuments(mockDocuments)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      console.log("-------------------------",files)
      const fileArray = Array.from(files)
      if (isMockMode) {
        toast({
          title: "Demo Mode",
          description: "File upload is in demo mode. Backend server is not available.",
          variant: "default",
        })
        return
      }
      const initialProgress = fileArray.map((file) => ({
        file,
        progress: 0,
        status: "uploading" as const,
      }))
      setUploadProgress((prev) => [...prev, ...initialProgress])

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        const formData = new FormData()
        formData.append("file", file)

        try {
          setUploadProgress((prev) =>
            prev.map((p) => (p.file === file ? { ...p, progress: 10, status: "uploading" } : p)),
          )

          const response = await fetch("/api/upload/document", {
            method: "POST",
            body: formData,
          })

          const contentType = response.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Backend server unavailable")
          }

          if (response.ok) {
            const data = await response.json()

            setUploadProgress((prev) =>
              prev.map((p) => (p.file === file ? { ...p, progress: 50, status: "processing" } : p)),
            )

            const processResponse = await fetch(`/api/processing/document/${data.doc_id}`, {
              method: "POST",
            })

            if (processResponse.ok) {
              setUploadProgress((prev) =>
                prev.map((p) => (p.file === file ? { ...p, progress: 100, status: "completed" } : p)),
              )

              toast({
                title: "Document uploaded successfully",
                description: `${file.name} has been uploaded and is being processed.`,
              })
            } else {
              throw new Error("Processing failed")
            }
          } else {
            const errorData = await response.json()
            throw new Error(errorData.detail || "Upload failed")
          }
        } catch (error) {
          setUploadProgress((prev) =>
            prev.map((p) =>
              p.file === file
                ? { ...p, status: "error", error: error instanceof Error ? error.message : "Upload failed" }
                : p,
            ),
          )

          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
            variant: "destructive",
          })
        }
      }

      await fetchDocuments()

      setTimeout(() => {
        setUploadProgress([])
      }, 3000)
    },
    [toast, fetchDocuments, isMockMode],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFileUpload(files)
      }
    },
    [handleFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return

    if (isMockMode) {
      toast({
        title: "Demo Mode",
        description: "URL processing is in demo mode. Backend server is not available.",
      })
      setUrlInput("")
      return
    }

    setIsLoading(true)
    try {
      toast({
        title: "URL processing",
        description: "URL processing feature coming soon!",
      })
    } catch (error) {
      toast({
        title: "URL processing failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setUrlInput("")
    }
  }

  const deleteDocument = async (docId: number) => {
    if (isMockMode) {
      toast({
        title: "Demo Mode",
        description: "Document deletion is in demo mode. Backend server is not available.",
      })
      return
    }

    try {
      const response = await fetch(`/api/upload/document/${docId}`, {
        method: "DELETE",
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend server unavailable")
      }

      if (response.ok) {
        toast({
          title: "Document deleted",
          description: "Document has been successfully deleted.",
        })
        await fetchDocuments()
      } else {
        throw new Error("Delete failed")
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case "processing":
        return <ProcessorIcon className="w-4 h-4 text-blue-500 animate-spin" />
      case "failed":
        return <XCircleIcon className="w-4 h-4 text-red-500" />
      default:
        return <ClockIcon className="w-4 h-4 text-yellow-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">DocSaathi</h1>
        <p className="text-muted-foreground">Upload and process your documents for AI-powered conversations</p>
        {isMockMode && (
          <Badge variant="secondary" className="mt-2">
            Demo Mode - Backend Unavailable
          </Badge>
        )}
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="manage">Manage Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileTextIcon className="w-5 h-5" />
                Upload Files
              </CardTitle>
              <CardDescription>Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT (Max 50MB per file)</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <UploadIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">Drop files here or click to browse</p>
                <p className="text-sm text-muted-foreground">Upload multiple files at once</p>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
              </div>

              {uploadProgress.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-foreground">Upload Progress</h4>
                  {uploadProgress.map((progress, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{progress.file.name}</span>
                        <Badge
                          variant={
                            progress.status === "completed"
                              ? "default"
                              : progress.status === "error"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {progress.status}
                        </Badge>
                      </div>
                      <Progress value={progress.progress} className="h-2" />
                      {progress.error && <p className="text-xs text-destructive">{progress.error}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Process URL
              </CardTitle>
              <CardDescription>Extract content from web pages, articles, or online documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter URL (e.g., https://example.com/article)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUrlSubmit} disabled={!urlInput.trim() || isLoading}>
                  {isLoading ? "Processing..." : "Process URL"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>Manage your uploaded documents and their processing status</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchDocuments} variant="outline" className="mb-4 bg-transparent">
                Refresh List
              </Button>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {documents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No documents uploaded yet</p>
                      <p className="text-sm">Upload your first document to get started</p>
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <Card key={doc.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileTextIcon className="w-8 h-8 text-primary" />
                            <div>
                              <h4 className="font-medium text-foreground">{doc.doc_name}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{formatFileSize(doc.file_size)}</span>
                                <span className="uppercase">{doc.file_type}</span>
                                {doc.chunk_count > 0 && <span>{doc.chunk_count} chunks</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(doc.processing_status)}
                            <Badge
                              variant={
                                doc.processing_status === "completed"
                                  ? "default"
                                  : doc.processing_status === "failed"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {doc.processing_status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteDocument(doc.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
