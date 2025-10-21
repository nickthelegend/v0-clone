"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Square, Code, Eye, Plus, Download } from "lucide-react"
import CodeEditor from "@/components/code-editor"
import PreviewPanel from "@/components/preview-panel"
import Terminal from "@/components/terminal"
import FileExplorer from "@/components/file-explorer"
import type { ProjectState } from "@/lib/types"

interface IDEInterfaceProps {
  files?: Record<string, string>
  projectStructure?: any[]
  onRun?: () => void
  onStop?: () => void
  isRunning?: boolean
  serverUrl?: string | null
  isInitializing?: boolean
  onFileChange?: (path: string, content: string) => void
  onCreateFile?: (name: string) => void
  onDeleteFile?: (path: string) => void
}

export default function IDEInterface({ files = {}, projectStructure = [], onRun, onStop, isRunning, serverUrl, isInitializing, onFileChange: onFileChangeParent, onCreateFile: onCreateFileParent, onDeleteFile: onDeleteFileParent }: IDEInterfaceProps) {
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code")
  const [fileContents, setFileContents] = useState<Record<string, string>>(files)
  const [activeFile, setActiveFile] = useState<string>(Object.keys(files)[0] || "")
  const [isTerminalVisible, setIsTerminalVisible] = useState(true)
  const [terminalHeight, setTerminalHeight] = useState(250)

  // Update file contents when props change
  useEffect(() => {
    setFileContents(files)
    if (Object.keys(files).length > 0 && !activeFile) {
      setActiveFile(Object.keys(files)[0])
    }
  }, [files, activeFile])

  const [projectState] = useState<ProjectState>({
    files: projectStructure,
    activeFile: activeFile,
    isRunning: false,
    terminal: {
      history: [],
      isVisible: false,
    },
  })

  const handleFileSelect = useCallback((path: string) => {
    setActiveFile(path)
  }, [])

  const handleFileChange = useCallback((path: string, content: string) => {
    setFileContents(prev => ({ ...prev, [path]: content }))
    if (onFileChangeParent) {
      onFileChangeParent(path, content)
    }
  }, [onFileChangeParent])

  const handleCreateFile = useCallback((name: string) => {
    const newFiles = { ...fileContents, [name]: '' }
    setFileContents(newFiles)
    if (onCreateFileParent) {
      onCreateFileParent(name)
    }
  }, [fileContents, onCreateFileParent])

  const handleCreateFolder = useCallback((name: string) => {
    console.log('Create folder:', name)
  }, [])

  const handleDeleteFile = useCallback((path: string) => {
    const newFiles = { ...fileContents }
    delete newFiles[path]
    setFileContents(newFiles)
    if (onDeleteFileParent) {
      onDeleteFileParent(path)
    }
  }, [fileContents, onDeleteFileParent])

  const handleDownload = useCallback(() => {
    const zip = require('jszip')
    const JSZip = new zip()
    
    Object.entries(fileContents).forEach(([path, content]) => {
      JSZip.file(path, content)
    })
    
    JSZip.generateAsync({ type: 'blob' }).then((blob: Blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'project.zip'
      a.click()
      URL.revokeObjectURL(url)
    })
  }, [fileContents])



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
              onClick={() => {
                const fileName = prompt('Enter file name (e.g., src/utils.ts):')
                if (fileName) handleCreateFile(fileName)
              }}
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
            <Button onClick={onRun} size="sm" className="h-8 bg-green-600 hover:bg-green-700" disabled={isInitializing}>
              <Play className="w-3 h-3 mr-1" />
              {isInitializing ? 'Starting...' : 'Run'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex min-h-0">
        {activeTab === "code" ? (
          <>
            {/* File Explorer */}
            <div className="w-64">
              <FileExplorer
                files={projectStructure}
                activeFile={activeFile}
                onFileSelect={handleFileSelect}
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
                onDeleteFile={handleDeleteFile}
              />
            </div>

            {/* Code Editor */}
            <div className="flex-1">
              <CodeEditor
                files={projectStructure}
                activeFile={activeFile}
                onFileSelect={handleFileSelect}
                onFileChange={handleFileChange}
                onFileClose={(path) => console.log('Close file:', path)}
                fileContents={fileContents}
              />
            </div>
          </>
        ) : (
          /* Preview Panel */
          <div className="flex-1">
            <PreviewPanel
              url={serverUrl || undefined}
              isLoading={isInitializing}
              fileContents={fileContents}
              activeFile={activeFile}
            />
          </div>
        )}
        </div>
        
        {/* Terminal */}
        <Terminal
          isVisible={isTerminalVisible}
          onToggle={() => setIsTerminalVisible(!isTerminalVisible)}
          height={terminalHeight}
          onHeightChange={setTerminalHeight}
        />
      </div>
    </div>
  )
}