"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Sparkles, User, Bot, Undo2 } from "lucide-react"
import { AlgoCraftMarkdownParser } from "@/components/algocraft-markdown-parser"
import type { Message } from "@/lib/types"

interface SimpleChatInterfaceProps {
  onPromptSubmit?: (prompt: string) => void
}

interface MessageWithFiles extends Message {
  files?: string[]
}

export default function SimpleChatInterface({
  onPromptSubmit
}: SimpleChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageWithFiles[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI coding assistant. I can help you build Algorand applications with React, TypeScript, and Vite. What would you like to build?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    if (onPromptSubmit) {
      onPromptSubmit(input)
    }

    setIsLoading(false)
  }

  const handleUndo = (messageId: string) => {
    // Add actual undo logic here
    console.log('Undo changes from message:', messageId)
  }

  const handleExampleClick = (example: string) => {
    setInput(example)
  }

  return (
    <div className="flex flex-col h-full max-h-full bg-zinc-900 relative">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
          <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">gpt-4o-mini</span>
        </div>
      </div>

      {messages.length <= 1 ? (
        /* Welcome Screen */
        <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Input Area */}
          <div className="relative mb-8">
            <form onSubmit={handleSubmit} className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AI to build, fix bugs, explore"
                  className="w-full bg-transparent border-0 resize-none p-4 text-white placeholder-zinc-400 focus:outline-none focus:ring-0"
                  rows={1}
                  style={{ minHeight: '56px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />

                {/* Top Row - Model Selector & Icons */}
                <div className="flex items-center justify-between px-4 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 px-3 text-zinc-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {selectedModel}
                    </div>
                  </div>

                  <Button type="submit" size="sm" disabled={!input.trim() || isLoading} className="h-8 w-8 p-0 bg-white text-black hover:bg-zinc-200 disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Example Buttons */}
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-4">Try these examples to get started</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-zinc-400 border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-200 hover:border-zinc-500 flex items-center gap-2 transition-all duration-200"
                onClick={() => handleExampleClick("Add wallet connection")}
              >
                <Sparkles className="w-3 h-3" />
                Add wallet connection
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-zinc-400 border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-200 hover:border-zinc-500 flex items-center gap-2 transition-all duration-200"
                onClick={() => handleExampleClick("Create a smart contract")}
              >
                <Sparkles className="w-3 h-3" />
                Create a smart contract
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-zinc-400 border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-200 hover:border-zinc-500 flex items-center gap-2 transition-all duration-200"
                onClick={() => handleExampleClick("Add transaction history")}
              >
                <Sparkles className="w-3 h-3" />
                Add transaction history
              </Button>
            </div>
          </div>
        </div>
        </div>
      ) : (
        /* Chat History */
        <>
        <ScrollArea className="flex-1 p-4">
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
                  {message.files && message.files.length > 0 && (
                    <div className="mt-3 bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium text-white">Files Updated</span>
                      </div>
                      <div className="space-y-1 mb-2">
                        {message.files.map((file, i) => (
                          <div key={i} className="text-xs text-zinc-400 font-mono">{file}</div>
                        ))}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleUndo(message.id)} className="h-7 px-3 text-xs text-zinc-400 hover:text-white hover:bg-zinc-700">
                        <Undo2 className="w-3 h-3 mr-1" />Undo Changes
                      </Button>
                    </div>
                  )}
                  <div className="text-xs text-zinc-400 mt-2">{message.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="text-sm text-zinc-400">Generating code...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input at bottom when chatting */}
        <div className="p-4 border-t border-zinc-800 flex-shrink-0">
          <form onSubmit={handleSubmit} className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-1">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask AI to build, fix bugs, explore" className="w-full bg-transparent border-0 resize-none p-4 text-white placeholder-zinc-400 focus:outline-none focus:ring-0" rows={1} style={{ minHeight: '56px' }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) } }} />
              <div className="flex items-center justify-between px-4 pb-2">
                <div className="h-8 px-3 text-zinc-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />{selectedModel}
                </div>
                <Button type="submit" size="sm" disabled={!input.trim() || isLoading} className="h-8 w-8 p-0 bg-white text-black hover:bg-zinc-200 disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
        </>
      )}
    </div>
  )
}
