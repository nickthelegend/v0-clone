"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { User, Bot, Copy, Check, Play, FileText } from "lucide-react"
import type { Message } from "@/lib/types"
import ChatInput from "./chat-input"

interface ChatInterfaceProps {
  onCodeGenerated?: (code: string, filename: string) => void
}

interface CodeBlock {
  language: string
  code: string
  filename?: string
}

export default function ChatInterface({ onCodeGenerated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI coding assistant powered by Mistral AI. I can help you build web applications with React, Next.js, and more. Here are some things I can help you with:\n\n• Generate React components\n• Create API endpoints\n• Write utility functions\n• Build complete applications\n• Debug and optimize code\n\nWhat would you like to create today?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedBlocks, setCopiedBlocks] = useState<Set<string>>(new Set())

  const extractCodeBlocks = (content: string): CodeBlock[] => {
    const codeBlockRegex = /```(\w+)?\s*(?:file="([^"]+)")?\n([\s\S]*?)```/g
    const blocks: CodeBlock[] = []
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const [, language = "javascript", filename, code] = match
      blocks.push({
        language,
        code: code.trim(),
        filename: filename || `generated.${language === "tsx" ? "tsx" : language === "typescript" ? "ts" : "js"}`,
      })
    }

    return blocks
  }

  const handleCopyCode = async (code: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedBlocks((prev) => new Set(prev).add(blockId))
      setTimeout(() => {
        setCopiedBlocks((prev) => {
          const newSet = new Set(prev)
          newSet.delete(blockId)
          return newSet
        })
      }, 2000)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  const handleApplyCode = (code: string, filename: string) => {
    if (onCodeGenerated) {
      onCodeGenerated(code, filename)
    }
  }

  const renderMessageContent = (content: string, messageId: string) => {
    const codeBlocks = extractCodeBlocks(content)

    if (codeBlocks.length === 0) {
      return <div className="text-sm text-zinc-300 whitespace-pre-wrap break-words">{content}</div>
    }

    const parts = content.split(/```[\s\S]*?```/)
    const result = []
    let codeBlockIndex = 0

    for (let i = 0; i < parts.length; i++) {
      if (parts[i].trim()) {
        result.push(
          <div key={`text-${i}`} className="text-sm text-zinc-300 whitespace-pre-wrap break-words mb-4">
            {parts[i].trim()}
          </div>,
        )
      }

      if (codeBlockIndex < codeBlocks.length) {
        const block = codeBlocks[codeBlockIndex]
        const blockId = `${messageId}-${codeBlockIndex}`
        const isCopied = copiedBlocks.has(blockId)

        result.push(
          <div key={`code-${codeBlockIndex}`} className="mb-4">
            <div className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-700 border-b border-zinc-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">{block.filename}</span>
                  <span className="text-xs text-zinc-500 bg-zinc-600 px-2 py-1 rounded">{block.language}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyCode(block.code, blockId)}
                    className="h-7 text-zinc-400 hover:text-white"
                  >
                    {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {isCopied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApplyCode(block.code, block.filename)}
                    className="h-7 bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                </div>
              </div>
              <pre className="p-4 text-sm text-zinc-300 overflow-x-auto">
                <code>{block.code}</code>
              </pre>
            </div>
          </div>,
        )
        codeBlockIndex++
      }
    }

    return <div>{result}</div>
  }

  const handleSubmit = async (input: string, agent: string) => {
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
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) throw new Error("Failed to get response")

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

        setMessages((prev) => prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: assistantContent } : m)))
      }

      console.log("[v0] Final assistant content:", assistantContent)

      // Auto-apply code blocks if there's only one
      const codeBlocks = extractCodeBlocks(assistantContent)
      if (codeBlocks.length === 1 && onCodeGenerated) {
        const block = codeBlocks[0]
        setTimeout(() => {
          onCodeGenerated(block.code, block.filename)
        }, 1000)
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

  const quickPrompts = [
    "Create a React component for a todo list",
    "Build a responsive navbar with Tailwind CSS",
    "Generate a contact form with validation",
    "Create a dashboard layout with sidebar",
    "Build a product card component",
    "Generate API endpoints for user management",
  ]

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
        <p className="text-sm text-zinc-400">Powered by Mistral AI</p>
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">Quick Start</h3>
          <div className="space-y-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleSubmit(prompt, "Agent")}
                disabled={isLoading}
                className="w-full justify-start text-left text-zinc-400 hover:text-white hover:bg-zinc-800 h-auto py-2 px-3"
              >
                <span className="text-xs">{prompt}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
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
                {renderMessageContent(message.content, message.id)}
                <div className="text-xs text-zinc-500 mt-2">{message.timestamp.toLocaleTimeString()}</div>
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
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-800">
        <ChatInput onSubmit={handleSubmit} disabled={isLoading} />
      </div>
    </div>
  )
}
