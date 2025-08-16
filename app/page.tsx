"use client"

import { useState, useCallback, useEffect } from "react"
import ChatInterface from "@/components/chat-interface"
import CodeEditor from "@/components/code-editor"
import FileExplorer from "@/components/file-explorer"
import Terminal from "@/components/terminal"
import PreviewPanel from "@/components/preview-panel"
import ResizablePanels from "@/components/layout/resizable-panels"
import Header from "@/components/layout/header"
import type { ProjectState } from "@/lib/types"
import { GitHubRepositoryFetcher, convertGitHubFilesToFileNodes } from "@/lib/github-fetcher"

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

  const refreshFiles = useCallback(async () => {
    try {
      console.log("[v0] Refreshing files from GitHub...")
      const repositoryFiles = await GitHubRepositoryFetcher.fetchRepositoryStructure()
      const files = convertGitHubFilesToFileNodes(repositoryFiles)

      setProjectState((prev) => ({ ...prev, files }))
      setFileContents(repositoryFiles)

      console.log("[v0] Files refreshed and synced successfully")
    } catch (error) {
      console.error("[v0] Failed to refresh files:", error)
    }
  }, [])

  useEffect(() => {
    const initializeProject = async () => {
      try {
        console.log("[v0] Loading Algorand repository from GitHub...")

        const repositoryFiles = await GitHubRepositoryFetcher.fetchRepositoryStructure()
        const files = convertGitHubFilesToFileNodes(repositoryFiles)

        setProjectState((prev) => ({ ...prev, files }))
        setFileContents(repositoryFiles)

        // Set active file to App.tsx or index.html if available
        const defaultFile = repositoryFiles["src/App.tsx"]
          ? "src/App.tsx"
          : repositoryFiles["index.html"]
            ? "index.html"
            : Object.keys(repositoryFiles)[0]

        if (defaultFile) {
          setProjectState((prev) => ({ ...prev, activeFile: defaultFile }))
        }

        console.log("[v0] Algorand repository loaded successfully")
      } catch (error) {
        console.error("[v0] Failed to initialize project:", error)

        setProjectState((prev) => ({
          ...prev,
          terminal: {
            ...prev.terminal,
            history: [
              {
                id: Date.now().toString(),
                type: "error" as const,
                content: `❌ Failed to load Algorand repository: ${error.message}`,
                timestamp: new Date(),
              },
            ],
          },
        }))
      }
    }

    initializeProject()
  }, [])

  const handleCodeGenerated = useCallback(
    async (code: string, filename: string) => {
      console.log("[v0] Generated code:", { code, filename })

      try {
        let filePath = filename

        if (!filename.includes("/")) {
          if (
            filename.endsWith(".jsx") ||
            filename.endsWith(".tsx") ||
            filename.endsWith(".js") ||
            filename.endsWith(".ts")
          ) {
            if (
              code.includes("export default") &&
              (code.includes("function") || code.includes("const") || code.includes("class"))
            ) {
              filePath = `src/components/${filename}`
            } else {
              filePath = `src/${filename}`
            }
          } else if (filename.endsWith(".css") || filename.endsWith(".scss")) {
            filePath = `src/styles/${filename}`
          } else if (filename.endsWith(".json")) {
            filePath = filename
          } else {
            filePath = `src/${filename}`
          }
        }

        // Update file contents
        setFileContents((prev) => ({ ...prev, [filePath]: code }))

        try {
          const { WebContainerService } = await import("@/lib/webcontainer")
          const webcontainer = WebContainerService.getInstance()
          await webcontainer.writeFile(filePath, code)
          console.log(`[v0] File synced to WebContainer: ${filePath}`)
        } catch (error) {
          console.warn(`[v0] Failed to sync file to WebContainer: ${error}`)
        }

        // Update file tree if it's a new file
        if (!fileContents[filePath]) {
          const updatedFiles = { ...fileContents, [filePath]: code }
          const files = convertGitHubFilesToFileNodes(updatedFiles)
          setProjectState((prev) => ({ ...prev, files }))
        }

        setProjectState((prev) => ({
          ...prev,
          activeFile: filePath,
          terminal: {
            ...prev.terminal,
            history: [
              ...prev.terminal.history,
              {
                id: Date.now().toString(),
                type: "success" as const,
                content: `✅ Generated and applied: ${filePath}`,
                timestamp: new Date(),
              },
            ],
          },
        }))

        console.log(`[v0] Code applied to ${filePath}`)
      } catch (error) {
        console.error("[v0] Failed to write generated code:", error)

        setProjectState((prev) => ({
          ...prev,
          terminal: {
            ...prev.terminal,
            history: [
              ...prev.terminal.history,
              {
                id: Date.now().toString(),
                type: "error" as const,
                content: `❌ Failed to apply code to ${filename}: ${error.message}`,
                timestamp: new Date(),
              },
            ],
          },
        }))
      }
    },
    [fileContents],
  )

  const handleFileSelect = useCallback(async (path: string) => {
    setProjectState((prev) => ({ ...prev, activeFile: path }))
  }, [])

  const handleFileChange = useCallback(async (path: string, content: string) => {
    console.log("[v0] File changed:", { path, content: content.substring(0, 100) + "..." })

    setFileContents((prev) => ({ ...prev, [path]: content }))

    try {
      const { WebContainerService } = await import("@/lib/webcontainer")
      const webcontainer = WebContainerService.getInstance()
      await webcontainer.writeFile(path, content)
      console.log(`[v0] File change synced to WebContainer: ${path}`)
    } catch (error) {
      console.warn(`[v0] Failed to sync file change to WebContainer: ${error}`)
    }
  }, [])

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

        setFileContents((prev) => ({ ...prev, [filePath]: defaultContent }))
        const updatedFiles = { ...fileContents, [filePath]: defaultContent }
        const files = convertGitHubFilesToFileNodes(updatedFiles)
        setProjectState((prev) => ({ ...prev, files, activeFile: filePath }))
      } catch (error) {
        console.error("[v0] Failed to create file:", error)
      }
    },
    [fileContents],
  )

  const handleCreateFolder = useCallback(
    async (name: string) => {
      console.log("[v0] Creating folder:", name)
      try {
        const placeholderPath = `src/${name}/.gitkeep`
        setFileContents((prev) => ({ ...prev, [placeholderPath]: "" }))
        const updatedFiles = { ...fileContents, [placeholderPath]: "" }
        const files = convertGitHubFilesToFileNodes(updatedFiles)
        setProjectState((prev) => ({ ...prev, files }))
      } catch (error) {
        console.error("[v0] Failed to create folder:", error)
      }
    },
    [fileContents],
  )

  const handleDeleteFile = useCallback(
    async (path: string) => {
      try {
        console.log("[v0] Delete file requested:", path)

        setFileContents((prev) => {
          const newContents = { ...prev }
          delete newContents[path]
          return newContents
        })

        if (projectState.activeFile === path) {
          setProjectState((prev) => ({ ...prev, activeFile: null }))
        }

        const updatedFiles = { ...fileContents }
        delete updatedFiles[path]
        const files = convertGitHubFilesToFileNodes(updatedFiles)
        setProjectState((prev) => ({ ...prev, files }))
      } catch (error) {
        console.error("[v0] Failed to delete file:", error)
      }
    },
    [projectState.activeFile, fileContents],
  )

  const handleRun = useCallback(async () => {
    if (isLoading || projectState.isRunning) return

    setIsLoading(true)

    setProjectState((prev) => ({
      ...prev,
      isRunning: true,
      terminal: {
        ...prev.terminal,
        history: [
          ...prev.terminal.history,
          {
            id: Date.now().toString(),
            type: "info" as const,
            content: "📦 Installing dependencies...",
            timestamp: new Date(),
          },
        ],
      },
    }))

    try {
      const { WebContainerService } = await import("@/lib/webcontainer")
      const webcontainer = WebContainerService.getInstance()

      // Install dependencies first
      await webcontainer.installDependencies()

      setProjectState((prev) => ({
        ...prev,
        terminal: {
          ...prev.terminal,
          history: [
            ...prev.terminal.history,
            {
              id: (Date.now() + 1).toString(),
              type: "success" as const,
              content: "✅ Dependencies installed successfully!",
              timestamp: new Date(),
            },
            {
              id: (Date.now() + 2).toString(),
              type: "info" as const,
              content: "🚀 Starting development server...",
              timestamp: new Date(),
            },
          ],
        },
      }))

      // Start dev server and get WebContainer URL
      const serverUrl = await webcontainer.startDevServer()

      setProjectState((prev) => ({
        ...prev,
        terminal: {
          ...prev.terminal,
          history: [
            ...prev.terminal.history,
            {
              id: (Date.now() + 3).toString(),
              type: "success" as const,
              content: `✅ Development server started at: ${serverUrl}`,
              timestamp: new Date(),
            },
          ],
        },
      }))

      setPreviewUrl(serverUrl)
      setIsLoading(false)
    } catch (error) {
      console.error("[v0] Failed to start dev server:", error)

      setProjectState((prev) => ({
        ...prev,
        isRunning: false,
        terminal: {
          ...prev.terminal,
          history: [
            ...prev.terminal.history,
            {
              id: (Date.now() + 4).toString(),
              type: "error" as const,
              content: `❌ Failed to start server: ${error.message}`,
              timestamp: new Date(),
            },
          ],
        },
      }))

      setIsLoading(false)
    }
  }, [isLoading, projectState.isRunning])

  const handleStop = useCallback(async () => {
    try {
      const { WebContainerService } = await import("@/lib/webcontainer")
      const webcontainer = WebContainerService.getInstance()
      await webcontainer.stopDevServer()
    } catch (error) {
      console.error("[v0] Failed to stop server:", error)
    }

    setProjectState((prev) => ({
      ...prev,
      isRunning: false,
      terminal: {
        ...prev.terminal,
        history: [
          ...prev.terminal.history,
          {
            id: Date.now().toString(),
            type: "info" as const,
            content: "🛑 Development session ended",
            timestamp: new Date(),
          },
        ],
      },
    }))
    setPreviewUrl(undefined)
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
                onDeleteFile={handleDeleteFile}
                onRefresh={refreshFiles}
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
            <PreviewPanel
              url={previewUrl}
              isLoading={isLoading}
              fileContents={fileContents}
              activeFile={projectState.activeFile}
            />
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
