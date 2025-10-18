"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Square, Code, Eye, FolderOpen, Plus, Trash2, Download, FileText } from "lucide-react"
import type { ProjectState } from "@/lib/types"

interface IDEInterfaceProps {
  onRun?: () => void
  onStop?: () => void
  isRunning?: boolean
}

export default function IDEInterface({ onRun, onStop, isRunning }: IDEInterfaceProps) {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code")
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    "src/App.tsx": `import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Hello World!</h1>
        <p className="text-gray-600">Your AI-generated app is ready!</p>
      </div>
    </div>
  )
}`,
    "src/index.tsx": `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root')!)
root.render(<App />)`,
    "package.json": `{
  "name": "ai-generated-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "vite": "^4.0.0"
  }
}`
  })

  const [projectState] = useState<ProjectState>({
    files: [
      { name: "src", type: "folder", path: "src", children: [
        { name: "App.tsx", type: "file", path: "src/App.tsx", content: fileContents["src/App.tsx"] },
        { name: "index.tsx", type: "file", path: "src/index.tsx", content: fileContents["src/index.tsx"] }
      ]},
      { name: "public", type: "folder", path: "public", children: [
        { name: "index.html", type: "file", path: "public/index.html" }
      ]},
      { name: "package.json", type: "file", path: "package.json", content: fileContents["package.json"] },
      { name: "README.md", type: "file", path: "README.md" }
    ],
    activeFile: "src/App.tsx",
    isRunning: false,
    terminal: {
      history: [],
      isVisible: false,
    },
  })

  const handleFileSelect = useCallback((path: string) => {
    // Update active file logic here
  }, [])

  const handleFileChange = useCallback((path: string, content: string) => {
    setFileContents(prev => ({ ...prev, [path]: content }))
  }, [])

  const handleCreateFile = useCallback(() => {
    // Create file logic here
  }, [])

  const handleDownload = useCallback(() => {
    // Download project logic here
  }, [])

  const renderFileTree = (files: any[], level = 0) => {
    return files.map((file) => (
      <div key={file.name}>
        <div
          className={`flex items-center gap-2 py-1 px-2 hover:bg-zinc-800 cursor-pointer text-sm ${
            projectState.activeFile === file.name ? 'bg-zinc-800 text-white' : 'text-zinc-300'
          }`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => handleFileSelect(file.name)}
        >
          {file.type === 'directory' ? (
            <FolderOpen className="w-4 h-4 text-zinc-400" />
          ) : (
            <FileText className="w-4 h-4 text-zinc-400" />
          )}
          <span>{file.name}</span>
        </div>
        {file.children && renderFileTree(file.children, level + 1)}
      </div>
    ))
  }

  return (
    <div className="h-full bg-zinc-950 flex flex-col">
      {/* Top Toolbar */}
      <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              onClick={() => setActiveTab("code")}
              size="sm"
              variant={activeTab === "code" ? "default" : "ghost"}
              className="h-8"
            >
              <Code className="w-3 h-3 mr-1" />
              Code
            </Button>
            <Button
              onClick={() => setActiveTab("preview")}
              size="sm"
              variant={activeTab === "preview" ? "default" : "ghost"}
              className="h-8"
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <Button onClick={onStop} size="sm" variant="destructive" className="h-8">
              <Square className="w-3 h-3 mr-1" />
              Stop
            </Button>
          ) : (
            <Button onClick={onRun} size="sm" className="h-8 bg-green-600 hover:bg-green-700">
              <Play className="w-3 h-3 mr-1" />
              Run
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {activeTab === "code" ? (
          <>
            {/* File Explorer */}
            <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
              <div className="p-3 border-b border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-200">Files</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {renderFileTree(projectState.files)}
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 flex flex-col">
              <div className="h-8 bg-zinc-900 border-b border-zinc-800 flex items-center px-3">
                <span className="text-sm text-zinc-400">{projectState.activeFile}</span>
              </div>
              <div className="flex-1 p-4">
                <textarea
                  value={fileContents[projectState.activeFile || ""] || ""}
                  onChange={(e) => handleFileChange(projectState.activeFile || "", e.target.value)}
                  className="w-full h-full bg-zinc-950 text-zinc-100 border border-zinc-700 rounded resize-none focus:outline-none focus:border-zinc-500 p-3 font-mono text-sm"
                  placeholder="Select a file to start editing..."
                />
              </div>
            </div>
          </>
        ) : (
          /* Preview Panel */
          <div className="flex-1 flex flex-col">
            <div className="h-8 bg-zinc-900 border-b border-zinc-800 flex items-center px-3">
              <span className="text-sm text-zinc-400">Preview</span>
            </div>
            <div className="flex-1 bg-white flex items-center justify-center">
              <div className="text-center text-zinc-500">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Preview will appear here</p>
                <p className="text-sm mt-1">Click Run to start the development server</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}