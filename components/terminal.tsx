"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Square, Trash2, TerminalIcon, GripHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WebContainerService } from "@/lib/webcontainer"

interface TerminalMessage {
  id: string
  type: "command" | "output" | "error" | "info"
  content: string
  timestamp: Date
}

interface TerminalProps {
  isVisible: boolean
  onToggle: () => void
  height?: number
  onHeightChange?: (height: number) => void
}

export default function TerminalComponent({ isVisible, onToggle, height = 300, onHeightChange }: TerminalProps) {
  const [messages, setMessages] = useState<TerminalMessage[]>([
    {
      id: "1",
      type: "info",
      content:
        "🚀 Welcome to v0 Clone Terminal\n💡 Type 'help' for available commands\n⚡ WebContainer ready for development",
      timestamp: new Date(),
    },
  ])
  const [currentCommand, setCurrentCommand] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const webcontainer = WebContainerService.getInstance()

  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isVisible])

  const addMessage = (type: TerminalMessage["type"], content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        content,
        timestamp: new Date(),
      },
    ])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCurrentCommand("")
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      const suggestions = ["help", "clear", "ls", "cat", "npm install", "npm run dev", "npm run build"]
      const matches = suggestions.filter((cmd) => cmd.startsWith(currentCommand))
      if (matches.length === 1) {
        setCurrentCommand(matches[0])
      } else if (matches.length > 1) {
        addMessage("info", `Suggestions: ${matches.join(", ")}`)
      }
    }
  }

  const handleCommand = async (command: string) => {
    if (!command.trim()) return

    setCommandHistory((prev) => [command, ...prev.slice(0, 49)]) // Keep last 50 commands
    setHistoryIndex(-1)

    addMessage("command", `$ ${command}`)
    setIsRunning(true)

    try {
      const [cmd, ...args] = command.trim().split(" ")

      switch (cmd) {
        case "help":
          addMessage(
            "info",
            `📋 Available commands:
  help              - Show this help message
  clear             - Clear terminal history
  ls [path]         - List files and directories
  cat <file>        - Display file contents
  npm install       - Install project dependencies
  npm run dev       - Start development server
  npm run build     - Build project for production
  npm run preview   - Preview production build
  pwd               - Show current directory
  echo <text>       - Display text
  
🔧 Keyboard shortcuts:
  ↑/↓ Arrow keys   - Navigate command history
  Tab              - Auto-complete commands
  Ctrl+C           - Cancel current operation`,
          )
          break

        case "clear":
          setMessages([])
          addMessage("info", "Terminal cleared ✨")
          break

        case "pwd":
          addMessage("output", "/project")
          break

        case "echo":
          addMessage("output", args.join(" "))
          break

        case "ls":
          try {
            const output = await webcontainer.runCommand("ls", args.length > 0 ? args : ["-la"])
            addMessage("output", output || "📁 No files found")
          } catch (error) {
            addMessage("error", `❌ Error: ${error}`)
          }
          break

        case "cat":
          if (args.length === 0) {
            addMessage("error", "❌ Usage: cat <filename>")
          } else {
            try {
              const content = await webcontainer.readFile(args[0])
              addMessage("output", content || "📄 File not found or empty")
            } catch (error) {
              addMessage("error", `❌ Error reading file: ${error}`)
            }
          }
          break

        case "npm":
          try {
            if (args[0] === "install") {
              addMessage("info", "📦 Installing dependencies...")
              await webcontainer.installDependencies()
              addMessage("output", "✅ Dependencies installed successfully!")
            } else if (args[0] === "run" && args[1] === "dev") {
              addMessage("info", "🚀 Starting development server...")
              const url = await webcontainer.startDevServer()
              addMessage("output", `✅ Development server started at: ${url}`)
            } else if (args[0] === "run" && args[1] === "build") {
              addMessage("info", "🔨 Building project...")
              const output = await webcontainer.runCommand("npm", args)
              addMessage("output", `✅ Build completed!\n${output}`)
            } else {
              const output = await webcontainer.runCommand("npm", args)
              addMessage("output", output)
            }
          } catch (error) {
            addMessage("error", `❌ npm error: ${error}`)
          }
          break

        default:
          try {
            const output = await webcontainer.runCommand(cmd, args)
            addMessage("output", output || "✅ Command executed")
          } catch (error) {
            addMessage("error", `❌ Command not found: ${cmd}\n💡 Type 'help' for available commands`)
          }
      }
    } catch (error) {
      addMessage("error", `❌ Error: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentCommand.trim() && !isRunning) {
      handleCommand(currentCommand)
      setCurrentCommand("")
    }
  }

  const quickActions = [
    { label: "Install", command: "npm install", icon: "📦" },
    { label: "Dev Server", command: "npm run dev", icon: "🚀" },
    { label: "Build", command: "npm run build", icon: "🔨" },
    { label: "List Files", command: "ls", icon: "📁" },
  ]

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !onHeightChange) return

      const newHeight = window.innerHeight - e.clientY
      const minHeight = 150
      const maxHeight = window.innerHeight * 0.6

      const clampedHeight = Math.min(Math.max(newHeight, minHeight), maxHeight)
      onHeightChange(clampedHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "row-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing, onHeightChange])

  if (!isVisible) {
    return (
      <div className="h-8 bg-zinc-800 border-t border-zinc-700 flex items-center px-4">
        <Button size="sm" variant="ghost" onClick={onToggle} className="h-6 text-zinc-400 hover:text-white">
          <TerminalIcon className="w-4 h-4 mr-2" />
          Terminal
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-zinc-900 border-t border-zinc-700 overflow-hidden" style={{ height }}>
      {onHeightChange && (
        <div
          ref={resizeRef}
          className={`h-1 bg-zinc-700 hover:bg-zinc-600 cursor-row-resize transition-colors flex items-center justify-center ${
            isResizing ? "bg-blue-500" : ""
          }`}
          onMouseDown={handleMouseDown}
        >
          <GripHorizontal className="w-4 h-4 text-zinc-500" />
        </div>
      )}

      <div className="h-8 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-green-400" />
          <span className="text-sm text-zinc-300">Terminal</span>
          {isRunning && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>}
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setMessages([])}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
            title="Clear terminal"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggle}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
            title="Hide terminal"
          >
            <Square className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="px-2 py-1 bg-zinc-800 border-b border-zinc-700 flex gap-1 overflow-x-auto flex-shrink-0">
        {quickActions.map((action) => (
          <Button
            key={action.command}
            size="sm"
            variant="ghost"
            onClick={() => !isRunning && handleCommand(action.command)}
            disabled={isRunning}
            className="h-6 text-xs text-zinc-400 hover:text-white whitespace-nowrap flex-shrink-0"
            title={action.command}
          >
            <span className="mr-1">{action.icon}</span>
            {action.label}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-1 min-h-0 p-2" ref={scrollRef}>
        <div className="space-y-1 font-mono text-sm">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`whitespace-pre-wrap break-words ${
                message.type === "command"
                  ? "text-green-400 font-semibold"
                  : message.type === "error"
                    ? "text-red-400"
                    : message.type === "info"
                      ? "text-blue-400"
                      : "text-zinc-300"
              }`}
            >
              {message.content}
            </div>
          ))}
          {isRunning && (
            <div className="text-yellow-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              Running command...
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-zinc-700 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <span className="text-green-400 font-mono text-sm self-center font-semibold">$</span>
          <Input
            ref={inputRef}
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command... (↑↓ for history, Tab for completion)"
            disabled={isRunning}
            className="flex-1 h-8 bg-transparent border-none text-zinc-300 font-mono text-sm focus:ring-0 focus:outline-none placeholder-zinc-500"
          />
        </form>
      </div>
    </div>
  )
}
