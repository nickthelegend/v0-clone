"use client"

import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { User, Bot, Undo2, Redo2, ChevronDown, ChevronRight } from "lucide-react"
import type { Message } from "@/lib/types"
import ChatInput from "./chat-input"
import { AlgoCraftMarkdownParser } from "./algocraft-markdown-parser"
import { ResponseProcessor, ProcessResult } from "@/lib/response-processor"
import { WebContainerService } from "@/lib/webcontainer"
import { VersionManager } from "@/lib/version-manager"

interface ChatInterfaceProps {
  onCodeGenerated?: () => void
  fileTree?: any[]
  fileContents?: Record<string, string>
}

interface CodeBlock {
  language: string
  code: string
  filename?: string
}

export default function ChatInterface({ onCodeGenerated, fileTree, fileContents }: ChatInterfaceProps) {
  const [versionManager] = useState(() => new VersionManager())
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm AlgoCraft, your AI coding assistant. I can help you build Algorand applications with React, TypeScript, and Vite.\n\nI'll use special tags to make changes to your code:\n\n• `<algocraft-write>` - Create or update files\n• `<algocraft-delete>` - Remove files\n• `<algocraft-rename>` - Rename files\n• `<algocraft-install>` - Install packages\n\nWhat would you like to build?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingResult, setPendingResult] = useState<ProcessResult | null>(null)
  const [pendingResponse, setPendingResponse] = useState<string | null>(null)
  const [showApproval, setShowApproval] = useState(false)
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        })
      }
    }

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, isLoading])

  const handleApproveChanges = async () => {
    if (!pendingResult || !pendingResponse) return

    setShowApproval(false)
    
    // Create version snapshot before changes
    if (fileContents) {
      versionManager.createVersion('Before AI changes', fileContents)
    }
    
    // Execute the changes
    const webcontainer = WebContainerService.getInstance()
    const processor = new ResponseProcessor(webcontainer)
    await processor.executeChanges(pendingResponse)
    
    setPendingResult(null)
    setPendingResponse(null)
    
    // Refresh file tree and preview after changes applied
    if (onCodeGenerated) {
      onCodeGenerated()
    }
  }

  const handleRejectChanges = () => {
    setShowApproval(false)
    setPendingResult(null)
    setPendingResponse(null)
  }

  const handleUndo = async () => {
    const snapshot = versionManager.undo()
    if (!snapshot) return

    const webcontainer = WebContainerService.getInstance()
    for (const [path, content] of Object.entries(snapshot)) {
      await webcontainer.writeFile(path, content)
    }

    if (onCodeGenerated) {
      onCodeGenerated()
    }
  }

  const handleRedo = async () => {
    const snapshot = versionManager.redo()
    if (!snapshot) return

    const webcontainer = WebContainerService.getInstance()
    for (const [path, content] of Object.entries(snapshot)) {
      await webcontainer.writeFile(path, content)
    }

    if (onCodeGenerated) {
      onCodeGenerated()
    }
  }

  const handleSubmit = async (input: string, agent: string, fileTree?: any[], fileContents?: Record<string, string>) => {
    if (!input.trim() || isLoading) return

    console.log("[v0] Chat submission:", { input, agent })

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          agent, // Include selected agent
          fileTree, // Include file tree for context
          fileContents, // Include file contents for context
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) throw new Error("Failed to get response")

      const contentType = response.headers.get("content-type")
      console.log("[v0] Content-Type:", contentType)

      if (contentType?.includes("text/plain")) {
        // Handle plain text response (from Web Agent)
        let text = await response.text()
        
        // Decode HTML entities for display
        text = text
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&')

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: text,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        
        // Process tags for plain text responses too
        setTimeout(async () => {
          console.log("[AlgoCraft] Processing plain text response...")
          console.log("[AlgoCraft] Full content:", text)
          
          const { getAlgoCraftWriteTags } = await import("@/lib/tag-parser")
          const testTags = getAlgoCraftWriteTags(text)
          console.log("[AlgoCraft] Parsed write tags:", testTags.length, testTags)
          
          const webcontainer = WebContainerService.getInstance()
          const processor = new ResponseProcessor(webcontainer)
          const result = await processor.processResponse(text)

          console.log("[AlgoCraft] Process result:", result)

          if (result.writtenFiles.length > 0 || result.deletedFiles.length > 0 || 
              result.renamedFiles.length > 0 || result.installedPackages.length > 0) {
            console.log("[AlgoCraft] Showing approval dialog")
            setPendingResult(result)
            setPendingResponse(text)
            setShowApproval(true)
          } else {
            console.log("[AlgoCraft] No operations found to approve")
          }
        }, 500)
      } else {
        // Handle streaming response (default behavior)
        const reader = response.body?.getReader()
        if (!reader) throw new Error("No reader available")

        let assistantContent = ""
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = new TextDecoder().decode(value)
          assistantContent += chunk

          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: assistantContent } : m)),
          )
        }

        console.log("[v0] Final assistant content:", assistantContent)

        // Process AlgoCraft tags after streaming completes
        setTimeout(async () => {
          console.log("[AlgoCraft] Processing response for tags...")
          console.log("[AlgoCraft] Full content:", assistantContent)
          
          // Test parsing directly
          const { getAlgoCraftWriteTags } = await import("@/lib/tag-parser")
          const testTags = getAlgoCraftWriteTags(assistantContent)
          console.log("[AlgoCraft] Parsed write tags:", testTags.length, testTags)
          
          const webcontainer = WebContainerService.getInstance()
          const processor = new ResponseProcessor(webcontainer)
          const result = await processor.processResponse(assistantContent)

          console.log("[AlgoCraft] Process result:", result)

          if (result.writtenFiles.length > 0 || result.deletedFiles.length > 0 || 
              result.renamedFiles.length > 0 || result.installedPackages.length > 0) {
            console.log("[AlgoCraft] Showing approval dialog")
            setPendingResult(result)
            setPendingResponse(assistantContent)
            setShowApproval(true)
          } else {
            console.log("[AlgoCraft] No operations found to approve")
          }
        }, 500)
      }
    } catch (error) {
      console.error("[v0] Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

 

  return (
    <div className="flex flex-col h-full max-h-full bg-zinc-900 border-r border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleUndo}
              disabled={!versionManager.canUndo()}
              className="h-8 w-8 p-0"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRedo}
              disabled={!versionManager.canRedo()}
              className="h-8 w-8 p-0"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-zinc-400">Powered by Mistral AI</p>
      </div>

      

      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 min-h-0 p-4 [&>div>div]:!block"
        style={{
          scrollBehavior: "smooth",
        }}
      >
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className="flex-shrink-0">
                {message.role === "user" ? (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-zinc-100">
                  <AlgoCraftMarkdownParser content={message.content} />
                </div>
                <div className="text-xs text-zinc-400 mt-2">{message.timestamp.toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="text-sm text-zinc-400">Generating code...</div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </ScrollArea>

      {showApproval && pendingResult && pendingResponse && (
        <div className="border-t border-zinc-700 p-4 bg-zinc-800 flex-shrink-0 max-h-96 overflow-y-auto">
          <h3 className="font-medium mb-3 text-white">Approve Changes?</h3>
          <div className="space-y-2 mb-4">
            {pendingResult.writtenFiles.map((file, i) => {
              const isExpanded = expandedFiles.has(file)
              const { getAlgoCraftWriteTags } = require('@/lib/tag-parser')
              const tags = getAlgoCraftWriteTags(pendingResponse)
              const fileTag = tags.find(t => t.path === file)
              
              return (
                <div key={`write-${i}`} className="border border-blue-500 rounded">
                  <div 
                    className="flex items-center justify-between p-2 cursor-pointer hover:bg-zinc-700"
                    onClick={() => {
                      const newExpanded = new Set(expandedFiles)
                      if (isExpanded) newExpanded.delete(file)
                      else newExpanded.add(file)
                      setExpandedFiles(newExpanded)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <span className="text-sm text-zinc-300">✏️ Write:</span>
                      <code className="text-blue-400 text-sm">{file}</code>
                    </div>
                    <span className="text-xs text-zinc-500">{fileTag?.content.length || 0} chars</span>
                  </div>
                  {isExpanded && fileTag && (
                    <pre className="p-2 bg-zinc-900 text-xs overflow-x-auto max-h-60">
                      <code>{fileTag.content.slice(0, 500)}{fileTag.content.length > 500 ? '...' : ''}</code>
                    </pre>
                  )}
                </div>
              )
            })}
            {pendingResult.deletedFiles.map((file, i) => (
              <div key={`delete-${i}`} className="text-sm text-zinc-300 p-2 border border-red-500 rounded">
                🗑️ Delete: <code className="text-red-400">{file}</code>
              </div>
            ))}
            {pendingResult.renamedFiles.map((file, i) => (
              <div key={`rename-${i}`} className="text-sm text-zinc-300 p-2 border border-purple-500 rounded">
                🔄 Rename: <code className="text-purple-400">{file}</code>
              </div>
            ))}
            {pendingResult.installedPackages.map((pkg, i) => (
              <div key={`install-${i}`} className="text-sm text-zinc-300 p-2 border border-green-500 rounded">
                📦 Install: <code className="text-green-400">{pkg}</code>
              </div>
            ))}
            {pendingResult.errors.length > 0 && (
              <div className="text-sm text-red-400 mt-2 p-2 border border-red-500 rounded">
                ⚠️ Errors: {pendingResult.errors.join(", ")}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleApproveChanges} className="flex-1 bg-green-600 hover:bg-green-700">
              Apply {pendingResult.writtenFiles.length + pendingResult.deletedFiles.length} Changes
            </Button>
            <Button variant="outline" onClick={handleRejectChanges} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-zinc-800 flex-shrink-0">
        <ChatInput 
          onSubmit={(input, agent) => handleSubmit(input, agent, fileTree, fileContents)} 
          disabled={isLoading} 
        />
      </div>
    </div>
  )
}
