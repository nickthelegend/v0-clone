"use client"

import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import ChatInterface from "@/components/chat-interface"
import CodeEditor from "@/components/code-editor"
import FileExplorer from "@/components/file-explorer"
import Terminal from "@/components/terminal"
import PreviewPanel from "@/components/preview-panel"
import ResizablePanels from "@/components/layout/resizable-panels"
import Header from "@/components/layout/header"
import type { ProjectState } from "@/lib/types"
import { WebContainerService } from "@/lib/webcontainer"

export default function Home() {
  const [projectState, setProjectState] = useState<ProjectState>({
    files: [],
    activeFile: null,
    isRunning: false,
    terminal: {
      history: [],
      isVisible: false,
    },
  })
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code")
  const [fileContents, setFileContents] = useState<Record<string, string>>({})

  const webcontainerRef = useRef<WebContainerService | null>(null)

  const webcontainer = useMemo(() => {
    if (!webcontainerRef.current) {
      webcontainerRef.current = WebContainerService.getInstance()
    }
    return webcontainerRef.current
  }, [])

  const fileUpdateTimeoutRef = useRef<NodeJS.Timeout>()

  const refreshFileTree = useCallback(async () => {
    try {
      const tree = await webcontainer.getFileTree()
      const files = convertTreeToFileNodes(tree)
      setProjectState((prev) => ({ ...prev, files }))
    } catch (error) {
      console.error("[v0] Failed to refresh file tree:", error)
    }
  }, [webcontainer])

  const convertTreeToFileNodes = (tree: any, basePath = ""): any[] => {
    const nodes: any[] = []

    for (const [name, entry] of Object.entries(tree)) {
      const fullPath = basePath ? `${basePath}/${name}` : name

      if ((entry as any).type === "directory") {
        nodes.push({
          name,
          path: fullPath,
          type: "directory",
          children: convertTreeToFileNodes((entry as any).children, fullPath),
        })
      } else {
        nodes.push({
          name,
          path: fullPath,
          type: "file",
        })
      }
    }

    return nodes
  }

  useEffect(() => {
    const initializeProject = async () => {
      try {
        await webcontainer.boot()
        await refreshFileTree()
      } catch (error) {
        console.error("[v0] Failed to initialize project:", error)
      }
    }

    initializeProject()
  }, [webcontainer, refreshFileTree])

  const handleCodeGenerated = useCallback(
    async (code: string, filename: string) => {
      console.log("[v0] Generated code:", { code, filename })

      try {
        // Determine the correct path based on file type
        let filePath = filename
        if (!filename.includes("/")) {
          if (
            filename.endsWith(".jsx") ||
            filename.endsWith(".tsx") ||
            filename.endsWith(".js") ||
            filename.endsWith(".ts")
          ) {
            filePath = `src/${filename}`
          }
        }

        // Write the generated code to WebContainer
        await webcontainer.writeFile(filePath, code)
        setFileContents((prev) => ({ ...prev, [filePath]: code }))
        await refreshFileTree()

        setProjectState((prev) => ({
          ...prev,
          activeFile: filePath,
        }))

        console.log(`[v0] Code applied to ${filePath}`)
      } catch (error) {
        console.error("[v0] Failed to write generated code:", error)
      }
    },
    [webcontainer, refreshFileTree],
  )

  const handleFileSelect = useCallback(
    async (path: string) => {
      setProjectState((prev) => ({ ...prev, activeFile: path }))

      if (!fileContents[path]) {
        try {
          const content = await webcontainer.readFile(path)
          setFileContents((prev) => ({ ...prev, [path]: content }))
        } catch (error) {
          console.error(`[v0] Failed to load file ${path}:`, error)
        }
      }
    },
    [webcontainer, fileContents],
  )

  const handleFileChange = useCallback(
    async (path: string, content: string) => {
      console.log("[v0] File changed:", { path, content: content.substring(0, 100) + "..." })

      // Clear existing timeout
      if (fileUpdateTimeoutRef.current) {
        clearTimeout(fileUpdateTimeoutRef.current)
      }

      // Debounce file updates to prevent excessive WebContainer writes
      fileUpdateTimeoutRef.current = setTimeout(async () => {
        try {
          await webcontainer.writeFile(path, content)
          // Update file contents state
          setFileContents((prev) => ({ ...prev, [path]: content }))
        } catch (error) {
          console.error("[v0] Failed to save file changes:", error)
        }
      }, 500)
    },
    [webcontainer],
  )

  const handleFileClose = useCallback((path: string) => {
    setProjectState((prev) => ({
      ...prev,
      activeFile: prev.activeFile === path ? null : prev.activeFile,
    }))
  }, [])

  const handleCreateFile = useCallback(
    async (name: string) => {
      console.log("[v0] Creating file:", name)

      try {
        const filePath = `src/${name}`
        const defaultContent =
          name.endsWith(".jsx") || name.endsWith(".tsx")
            ? `import React from 'react'\n\nexport default function ${name.split(".")[0]}() {\n  return (\n    <div>\n      <h1>New Component</h1>\n    </div>\n  )\n}`
            : ""

        await webcontainer.writeFile(filePath, defaultContent)
        setFileContents((prev) => ({ ...prev, [filePath]: defaultContent }))
        await refreshFileTree()
        setProjectState((prev) => ({ ...prev, activeFile: filePath }))
      } catch (error) {
        console.error("[v0] Failed to create file:", error)
      }
    },
    [webcontainer, refreshFileTree],
  )

  const handleCreateFolder = useCallback(async (name: string) => {
    console.log("[v0] Creating folder:", name)
    // WebContainer will create folders automatically when files are written to them
  }, [])

  const handleRun = useCallback(async () => {
    if (isLoading || projectState.isRunning) return

    setProjectState((prev) => ({ ...prev, isRunning: true }))
    setIsLoading(true)

    try {
      console.log("[v0] Starting project...")
      await webcontainer.installDependencies()
      const url = await webcontainer.startDevServer()
      setPreviewUrl(url)
      console.log("[v0] Project started at:", url)
    } catch (error) {
      console.error("[v0] Failed to start project:", error)
      setProjectState((prev) => ({ ...prev, isRunning: false }))
    } finally {
      setIsLoading(false)
    }
  }, [webcontainer, isLoading, projectState.isRunning])

  const handleStop = useCallback(() => {
    setProjectState((prev) => ({ ...prev, isRunning: false }))
    setPreviewUrl(undefined)
    console.log("[v0] Stopping project...")
  }, [])

  const handleToggleTerminal = useCallback(() => {
    setProjectState((prev) => ({
      ...prev,
      terminal: { ...prev.terminal, isVisible: !prev.terminal.isVisible },
    }))
  }, [])

  const leftPanel = <ChatInterface onCodeGenerated={handleCodeGenerated} />

  const rightPanel = (
    <div className="h-full flex flex-col">
      <div className="flex border-b border-zinc-700 bg-zinc-900">
        <button
          onClick={() => setActiveTab("code")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "code"
              ? "text-white border-b-2 border-blue-500 bg-zinc-800"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "text-white border-b-2 border-blue-500 bg-zinc-800"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          Preview
        </button>
      </div>

      <div className="flex-1 flex">
        {activeTab === "code" ? (
          <>
            <div className="w-64 flex-shrink-0">
              <FileExplorer
                files={projectState.files}
                activeFile={projectState.activeFile}
                onFileSelect={handleFileSelect}
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
              />
            </div>
            <div className="flex-1">
              <CodeEditor
                files={projectState.files}
                activeFile={projectState.activeFile}
                onFileSelect={handleFileSelect}
                onFileChange={handleFileChange}
                onFileClose={handleFileClose}
                fileContents={fileContents}
              />
            </div>
          </>
        ) : (
          <div className="flex-1">
            <PreviewPanel url={previewUrl} isLoading={isLoading} />
          </div>
        )}
      </div>

      <Terminal isVisible={projectState.terminal.isVisible} onToggle={handleToggleTerminal} />
    </div>
  )

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      <Header isRunning={projectState.isRunning} onRun={handleRun} onStop={handleStop} projectName="Algokit IDE" />

      <div className="flex-1 overflow-hidden">
        <ResizablePanels
          leftPanel={leftPanel}
          rightPanel={rightPanel}
          defaultLeftWidth={35}
          minLeftWidth={25}
          maxLeftWidth={50}
        />
      </div>
    </div>
  )
}
