"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Image, Paperclip, Send, Sparkles, X, Maximize2, Minimize2 } from "lucide-react"

interface SimpleChatInterfaceProps {
  onPromptSubmit?: (prompt: string) => void
  isMinimized?: boolean
  onToggleMinimize?: () => void
}

export default function SimpleChatInterface({
  onPromptSubmit,
  isMinimized = false,
  onToggleMinimize
}: SimpleChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)

    if (onPromptSubmit) {
      onPromptSubmit(input)
    }

    // For now, just log and clear input
    console.log("Submitting prompt:", input)
    setInput("")
    setIsLoading(false)
  }

  const handleExampleClick = (example: string) => {
    setInput(example)
  }

  if (isMinimized) {
    return (
      <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">AI Chat</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleMinimize}
              className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-200"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="text-center text-zinc-400 text-sm">
            <p>Chat minimized</p>
            <p className="text-xs mt-1">Click to expand</p>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button
              size="sm"
              disabled={!input.trim() || isLoading}
              className="px-3 bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Header with minimize button */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
          <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">gpt-4o-mini</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleMinimize}
          className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200"
        >
          <Minimize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Chat Area */}
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
                  placeholder="Ask Cursor to build, fix bugs, explore"
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

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                    >
                      <Image className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!input.trim() || isLoading}
                      className="h-8 w-8 p-0 bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Loading Text */}
          <div className="text-center mb-8">
            <p className="text-zinc-400 text-sm">Loading repositories...</p>
          </div>

          {/* Example Buttons */}
          <div className="text-center">
            <p className="text-zinc-400 text-sm mb-4">Try these examples to get started</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-zinc-400 border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-200 hover:border-zinc-500 flex items-center gap-2 transition-all duration-200"
                onClick={() => handleExampleClick("Write documentation")}
              >
                <Paperclip className="w-3 h-3" />
                Write documentation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-zinc-400 border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-200 hover:border-zinc-500 flex items-center gap-2 transition-all duration-200"
                onClick={() => handleExampleClick("Optimize performance")}
              >
                <Sparkles className="w-3 h-3" />
                Optimize performance
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-zinc-400 border-zinc-600 hover:bg-zinc-800/50 hover:text-zinc-200 hover:border-zinc-500 flex items-center gap-2 transition-all duration-200"
                onClick={() => handleExampleClick("Find and fix bugs")}
              >
                <Sparkles className="w-3 h-3" />
                Find and fix bugs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}