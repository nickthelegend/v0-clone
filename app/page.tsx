"use client"

import { useState, useEffect } from "react"
import Header from "@/components/layout/header"
import SimpleChatInterface from "@/components/simple-chat-interface"
import AILoadingState from "@/components/ai-loading-state"
import IDEInterface from "@/components/ide-interface"
import { TemplateLoader } from "@/lib/template-loader"
import { WebContainerService } from "@/lib/webcontainer"

type AppMode = "chat" | "loading" | "ide"

export default function Home() {
  const [currentMode, setCurrentMode] = useState<AppMode>("chat")
  const [isChatMinimized, setIsChatMinimized] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({})
  const [projectStructure, setProjectStructure] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [serverUrl, setServerUrl] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  const handleFileChange = (path: string, content: string) => {
    setGeneratedFiles(prev => ({ ...prev, [path]: content }))
  }

  const handleCreateFile = (name: string) => {
    setGeneratedFiles(prev => ({ ...prev, [name]: '' }))
    setProjectStructure(createProjectStructure({ ...generatedFiles, [name]: '' }))
  }

  const handleDeleteFile = (path: string) => {
    const newFiles = { ...generatedFiles }
    delete newFiles[path]
    setGeneratedFiles(newFiles)
    setProjectStructure(createProjectStructure(newFiles))
  }

  // Initialize with template on mount
  useEffect(() => {
    const initializeTemplate = async () => {
      try {
        const templates = await TemplateLoader.loadAlgorandTemplate()
        const files: Record<string, string> = {}
        templates.forEach(file => {
          files[file.path] = file.content
        })
        setGeneratedFiles(files)
        setProjectStructure(createProjectStructure(files))
        setCurrentMode("ide")
      } catch (error) {
        console.error('Failed to load template:', error)
      }
    }
    initializeTemplate()
  }, [])

  // Helper function to create project structure (moved up for initialization)
  function createProjectStructure(files: Record<string, string>) {
    const structure: any[] = []
    const folderMap: Record<string, any> = {}
    
    Object.keys(files).forEach(filePath => {
      const parts = filePath.split('/')
      
      if (parts.length === 1) {
        // Root file
        structure.push({
          name: parts[0],
          type: 'file',
          path: filePath,
          content: files[filePath]
        })
      } else {
        // File in nested folder(s)
        const folderName = parts[0]
        const fileName = parts[parts.length - 1]
        
        // Create folder if it doesn't exist
        if (!folderMap[folderName]) {
          folderMap[folderName] = {
            name: folderName,
            type: 'folder',
            path: folderName,
            children: []
          }
          structure.push(folderMap[folderName])
        }
        
        // Add file to folder
        folderMap[folderName].children.push({
          name: fileName,
          type: 'file',
          path: filePath,
          content: files[filePath]
        })
      }
    })
    
    return structure
  }

  const handleRunProject = async () => {
    if (isRunning) return
    
    setIsRunning(true)
    setIsInitializing(true)
    
    try {
      const webContainer = WebContainerService.getInstance()
      
      // Convert files to WebContainer format
      const webContainerFiles = TemplateLoader.convertToWebContainerFiles(
        Object.entries(generatedFiles).map(([path, content]) => ({
          path,
          content,
          type: 'file' as const
        }))
      )
      
      // Mount files
      await webContainer.mountFiles(webContainerFiles)
      
      // Install dependencies
      await webContainer.installDependencies()
      
      // Start dev server
      const url = await webContainer.startDevServer()
      setServerUrl(url)
      
      console.log('Project running at:', url)
    } catch (error) {
      console.error('Failed to run project:', error)
      setIsRunning(false)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleStopProject = async () => {
    try {
      const webContainer = WebContainerService.getInstance()
      await webContainer.stopDevServer()
      setServerUrl(null)
      setIsRunning(false)
      console.log('Project stopped')
    } catch (error) {
      console.error('Failed to stop project:', error)
    }
  }

  const handlePromptSubmit = async (prompt: string) => {
    console.log("Prompt submitted:", prompt)
    setCurrentMode("loading")

    try {
      // Call the chat API with current project context
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
          fileTree: projectStructure,
          fileContents: generatedFiles,
        }),
      })

      if (response.ok) {
        const aiResponse = await response.text()
        
        // Parse AI response for files and merge with existing
        const newFiles = parseAIResponse(aiResponse)
        const mergedFiles = { ...generatedFiles, ...newFiles }
        setGeneratedFiles(mergedFiles)
        setProjectStructure(createProjectStructure(mergedFiles))
        
        setTimeout(() => {
          setCurrentMode("ide")
          setIsChatMinimized(true)
        }, 1000)
      } else {
        console.error("API call failed")
        setCurrentMode("chat")
      }
    } catch (error) {
      console.error("Error calling API:", error)
      setCurrentMode("chat")
    }
  }

  const parseAIResponse = (response: string): Record<string, string> => {
    const files: Record<string, string> = {}
    
    // Look for algocraft-write tags first (AI's preferred format)
    const algocraftRegex = /<algocraft-write path="([^"]+)"[^>]*>([\s\S]*?)<\/algocraft-write>/g
    let match
    
    while ((match = algocraftRegex.exec(response)) !== null) {
      const filePath = match[1]
      const content = match[2].trim()
      files[filePath] = content
    }
    
    // Fallback: Look for markdown code blocks
    if (Object.keys(files).length === 0) {
      const codeBlockRegex = /```(?:typescript|tsx|javascript|jsx|json|html|css)\n([\s\S]*?)```/g
      let fileIndex = 0
      
      while ((match = codeBlockRegex.exec(response)) !== null) {
        const content = match[1].trim()
        const fileName = content.includes('export default') && content.includes('App') ? `src/App.tsx` : 
                        content.includes('algosdk') || content.includes('algorand') ? 'src/algorand.ts' :
                        content.includes('package.json') ? 'package.json' :
                        content.includes('<html') ? 'index.html' :
                        content.includes('README') ? 'README.md' :
                        `src/file${fileIndex}.tsx`
        files[fileName] = content
        fileIndex++
      }
    }
    
    return files
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
          <>
            <div className="w-96 flex-shrink-0">
              <SimpleChatInterface
                onPromptSubmit={handlePromptSubmit}
              />
            </div>
            <div className="w-px bg-zinc-800 flex-shrink-0"></div>
          </>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {currentMode === "chat" && (
            <div className="flex-1">
              <SimpleChatInterface
                onPromptSubmit={handlePromptSubmit}
              />
            </div>
          )}

          {currentMode === "loading" && (
            <AILoadingState />
          )}

          {currentMode === "ide" && (
            <IDEInterface
              files={generatedFiles}
              projectStructure={projectStructure}
              onRun={handleRunProject}
              onStop={handleStopProject}
              isRunning={isRunning}
              serverUrl={serverUrl}
              isInitializing={isInitializing}
              onFileChange={handleFileChange}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
            />
          )}
        </div>
      </div>
    </div>
  )
}
