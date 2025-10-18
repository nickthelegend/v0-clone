"use client"

import { useState } from "react"
import Header from "@/components/layout/header"
import SimpleChatInterface from "@/components/simple-chat-interface"
import AILoadingState from "@/components/ai-loading-state"
import IDEInterface from "@/components/ide-interface"

type AppMode = "chat" | "loading" | "ide"

export default function Home() {
  const [currentMode, setCurrentMode] = useState<AppMode>("chat")
  const [isChatMinimized, setIsChatMinimized] = useState(false)

  const handlePromptSubmit = async (prompt: string) => {
    console.log("Prompt submitted:", prompt)
    setCurrentMode("loading")

    try {
      // Call the chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          agent: "default",
        }),
      })

      if (response.ok) {
        // Wait for AI processing
        setTimeout(() => {
          setCurrentMode("ide")
          setIsChatMinimized(true)
        }, 2000)
      } else {
        console.error("API call failed")
        setCurrentMode("chat")
      }
    } catch (error) {
      console.error("Error calling API:", error)
      setCurrentMode("chat")
    }
  }

  const handleToggleChat = () => {
    setIsChatMinimized(!isChatMinimized)
  }

  const handleBackToChat = () => {
    setCurrentMode("chat")
    setIsChatMinimized(false)
  }

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Sidebar */}
        {currentMode !== "chat" && (
          <div className={`${isChatMinimized ? 'w-80' : 'w-96'} flex-shrink-0`}>
            <SimpleChatInterface
              onPromptSubmit={handlePromptSubmit}
              isMinimized={isChatMinimized}
              onToggleMinimize={handleToggleChat}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {currentMode === "chat" && (
            <div className="flex-1">
              <SimpleChatInterface
                onPromptSubmit={handlePromptSubmit}
                isMinimized={false}
                onToggleMinimize={handleToggleChat}
              />
            </div>
          )}

          {currentMode === "loading" && (
            <AILoadingState />
          )}

          {currentMode === "ide" && (
            <IDEInterface
              onRun={() => console.log("Running project...")}
              onStop={() => console.log("Stopping project...")}
              isRunning={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}
