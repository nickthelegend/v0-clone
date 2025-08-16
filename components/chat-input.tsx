"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, ArrowUp, Settings2, Mic, X, Check, ChevronDown } from "lucide-react"

interface ChatInputProps {
  onSubmit?: (input: string, agent: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState("Agent")
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)

  const agents = [
    { name: "Agent", color: "#2DD4BF", bgColor: "#032827" },
    { name: "Web Agent", color: "#3B82F6", bgColor: "#1E3A8A" },
    { name: "Github Agent", color: "#F59E0B", bgColor: "#92400E" },
  ]

  const currentAgent = agents.find((agent) => agent.name === selectedAgent) || agents[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      if (onSubmit) {
        onSubmit(input, selectedAgent)
      }
      setInput("")
    }
  }

  const handleMicClick = () => {
    setIsRecording(true)
    setTimeout(() => {
      setIsRecording(false)
      setInput("When speech to text feature ?")
    }, 5000)
  }

  const handleCancelRecording = () => {
    setIsRecording(false)
  }

  const handleConfirmRecording = () => {
    setIsRecording(false)
    setInput("When speech to text feature ?")
  }

  const handleAgentSelect = (agentName: string) => {
    setSelectedAgent(agentName)
    setShowAgentDropdown(false)
  }

  const WaveAnimation = () => {
    const [animationKey, setAnimationKey] = useState(0)

    useEffect(() => {
      const interval = setInterval(() => {
        setAnimationKey((prev) => prev + 1)
      }, 100)
      return () => clearInterval(interval)
    }, [])

    const bars = Array.from({ length: 50 }, (_, i) => {
      const height = Math.random() * 20 + 4
      const delay = Math.random() * 2
      return (
        <div
          key={`${i}-${animationKey}`}
          className="bg-gray-400 rounded-sm animate-pulse"
          style={{
            width: "2px",
            height: `${height}px`,
            animationDelay: `${delay}s`,
            animationDuration: "1s",
          }}
        />
      )
    })

    return (
      <div className="flex items-center w-full gap-1">
        <div className="flex-1 border-t-2 border-dotted border-gray-500"></div>
        <div className="flex items-center gap-0.5 justify-center px-8">{bars}</div>
        <div className="flex-1 border-t-2 border-dotted border-gray-500"></div>
      </div>
    )
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className="border border-zinc-700 rounded-2xl p-4 relative transition-all duration-500 ease-in-out overflow-hidden"
          style={{ backgroundColor: "#141415" }}
        >
          {isRecording ? (
            <div className="flex items-center justify-between h-12 animate-in fade-in-0 slide-in-from-top-2 duration-500 w-full">
              <WaveAnimation />
              <div className="flex items-center gap-2 ml-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelRecording}
                  className="h-8 w-8 p-0 text-white hover:text-white hover:bg-zinc-700 rounded-lg transition-all duration-200 hover:scale-110"
                >
                  <X className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirmRecording}
                  className="h-8 w-8 p-0 rounded-lg transition-all duration-200 hover:scale-110"
                  style={{ backgroundColor: "#2DD4BF", color: "#032827" }}
                >
                  <Check className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up..."
                disabled={disabled}
                className="w-full bg-transparent text-gray-300 placeholder-gray-500 resize-none border-none outline-none text-base leading-relaxed min-h-[24px] max-h-32 transition-all duration-200 disabled:opacity-50"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "auto"
                  target.style.height = target.scrollHeight + "px"
                }}
              />

              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:text-white hover:bg-zinc-700 rounded-lg transition-all duration-200 hover:scale-110"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white hover:text-white hover:bg-zinc-700 rounded-lg transition-all duration-200 hover:scale-110"
                  >
                    <Settings2 className="h-5 w-5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleMicClick}
                    className="h-8 w-8 p-0 text-white hover:text-white hover:bg-zinc-700 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 active:bg-red-600/20 active:text-red-400"
                  >
                    <Mic className="h-5 w-5 transition-transform duration-200" />
                  </Button>

                  <div className="relative">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                      className="h-8 px-3 rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-200 hover:scale-105 flex items-center gap-1"
                      style={{ backgroundColor: currentAgent.bgColor, color: currentAgent.color }}
                    >
                      {selectedAgent}
                      <ChevronDown className="h-3 w-3" />
                    </Button>

                    {showAgentDropdown && (
                      <div className="absolute bottom-full mb-2 left-0 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg min-w-[120px] z-50">
                        {agents.map((agent) => (
                          <button
                            key={agent.name}
                            type="button"
                            onClick={() => handleAgentSelect(agent.name)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-700 first:rounded-t-lg last:rounded-b-lg transition-colors duration-200"
                            style={{
                              color: agent.name === selectedAgent ? agent.color : "#9CA3AF",
                              backgroundColor: agent.name === selectedAgent ? `${agent.bgColor}20` : "transparent",
                            }}
                          >
                            {agent.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || disabled}
                  className="h-8 w-8 p-0 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg transition-all duration-200 hover:scale-110 disabled:hover:scale-100"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
