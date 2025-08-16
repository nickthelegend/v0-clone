"use client"

import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { User, Bot, Copy, Check, Play, FileText } from "lucide-react"
import type { Message } from "@/lib/types"
import ChatInput from "./chat-input"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

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
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : ""
            const codeString = String(children).replace(/\n$/, "")

            if (!inline && language) {
              const blockId = `${messageId}-${language}-${Math.random()}`
              const isCopied = copiedBlocks.has(blockId)

              // Extract filename from code comment if present
              const filenameMatch = codeString.match(/^\/\/ file: (.+)$/m)
              const filename = filenameMatch ? filenameMatch[1] : `code.${language}`

              return (
                <div className="mb-4">
                  <div className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                    <div className="flex items-center justify-between px-4 py-2 bg-zinc-700 border-b border-zinc-600">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm text-zinc-300">{filename}</span>
                        <span className="text-xs text-zinc-500 bg-zinc-600 px-2 py-1 rounded">{language}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyCode(codeString, blockId)}
                          className="h-7 text-zinc-400 hover:text-white"
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {isCopied ? "Copied" : "Copy"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApplyCode(codeString, filename)}
                          className="h-7 bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Apply
                        </Button>
                      </div>
                    </div>
                    <SyntaxHighlighter
                      style={oneDark}
                      language={language}
                      PreTag="div"
                      className="!m-0 !bg-transparent"
                      customStyle={{
                        margin: 0,
                        padding: "1rem",
                        background: "transparent",
                        fontSize: "0.875rem",
                      }}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )
            }

            return (
              <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            )
          },
          h1: ({ children }) => <h1 className="text-xl font-bold text-zinc-100 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-zinc-200 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-medium text-zinc-200 mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-zinc-300 mb-3 leading-relaxed">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-sm text-zinc-300 mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-sm text-zinc-300 mb-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="text-zinc-300">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-zinc-600 pl-4 italic text-zinc-400 mb-3">{children}</blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-400 hover:text-blue-300 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    )
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
          agent, // Include selected agent
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) throw new Error("Failed to get response")

      const contentType = response.headers.get("content-type")

      if (contentType?.includes("text/plain")) {
        // Handle plain text response (from Web Agent)
        const text = await response.text()

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: text,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
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

        // Auto-apply code blocks if there's only one
        const codeBlocks = assistantContent.match(/```(\w+)?\s*(?:file="([^"]+)")?\n([\s\S]*?)```/g)
        if (codeBlocks && codeBlocks.length === 1 && onCodeGenerated) {
          const block = codeBlocks[0]
          setTimeout(() => {
            onCodeGenerated(block, "generated.tsx")
          }, 1000)
        }
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
        <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
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
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-800 flex-shrink-0">
        <ChatInput onSubmit={handleSubmit} disabled={isLoading} />
      </div>
    </div>
  )
}
