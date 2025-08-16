"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Editor from "@monaco-editor/react"
import { X, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { FileNode } from "@/lib/types"

interface CodeEditorProps {
  files: FileNode[]
  activeFile: string | null
  onFileSelect: (path: string) => void
  onFileChange: (path: string, content: string) => void
  onFileClose: (path: string) => void
  fileContents?: Record<string, string>
  isLoading?: boolean
}

export default function CodeEditor({
  files,
  activeFile,
  onFileSelect,
  onFileChange,
  onFileClose,
  fileContents = {},
  isLoading = false,
}: CodeEditorProps) {
  const [openTabs, setOpenTabs] = useState<string[]>([])

  // Initialize with some default files if empty
  useEffect(() => {
    if (files.length === 0) {
      const defaultContent = `// Welcome to your v0 clone!
// Start chatting with the AI to generate code

export default function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Hello World!</h1>
      <p className="text-gray-600 mt-2">
        Your generated code will appear here.
      </p>
    </div>
  )
}`
      setOpenTabs(["app.tsx"])
      onFileSelect("app.tsx")
    }
  }, [files.length, onFileSelect])

  const handleEditorChange = (value: string | undefined, path: string) => {
    if (value !== undefined) {
      onFileChange(path, value)
    }
  }

  const handleTabClose = (path: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenTabs((prev) => prev.filter((tab) => tab !== path))
    onFileClose(path)

    // Select another tab if this was the active one
    if (activeFile === path && openTabs.length > 1) {
      const remainingTabs = openTabs.filter((tab) => tab !== path)
      onFileSelect(remainingTabs[0])
    }
  }

  const getLanguageFromPath = (path: string) => {
    const ext = path.split(".").pop()
    switch (ext) {
      case "tsx":
      case "jsx":
        return "typescript"
      case "ts":
        return "typescript"
      case "js":
        return "javascript"
      case "css":
        return "css"
      case "html":
        return "html"
      case "json":
        return "json"
      case "md":
        return "markdown"
      default:
        return "typescript"
    }
  }

  const getFileIcon = (path: string) => {
    const ext = path.split(".").pop()
    return <FileText className="w-4 h-4" />
  }

  const LoadingSkeleton = () => (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Tabs skeleton */}
      <div className="flex bg-zinc-800 border-b border-zinc-700 p-2 gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Editor skeleton */}
      <div className="flex-1 p-4 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          <span className="text-sm text-zinc-400">Loading editor...</span>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Tabs */}
      <div className="flex bg-zinc-800 border-b border-zinc-700 overflow-x-auto">
        {openTabs.map((path) => (
          <div
            key={path}
            className={`flex items-center gap-2 px-3 py-2 border-r border-zinc-700 cursor-pointer hover:bg-zinc-700 transition-colors ${
              activeFile === path ? "bg-zinc-900 text-white" : "text-zinc-400"
            }`}
            onClick={() => onFileSelect(path)}
          >
            {getFileIcon(path)}
            <span className="text-sm">{path.split("/").pop()}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0 hover:bg-zinc-600"
              onClick={(e) => handleTabClose(path, e)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1">
        {activeFile ? (
          <Editor
            height="100%"
            language={getLanguageFromPath(activeFile)}
            value={fileContents[activeFile] || ""}
            onChange={(value) => handleEditorChange(value, activeFile)}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: "on",
              contextmenu: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: "on",
              bracketPairColorization: { enabled: true },
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No file selected</p>
              <p className="text-sm mt-1">Open a file from the explorer or start chatting to generate code</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
