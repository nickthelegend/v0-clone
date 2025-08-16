"use client"

import { useState } from "react"
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  Search,
  MoreHorizontal,
  FilePlus,
  FolderPlus,
  Trash2,
  Edit3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { FileNode } from "@/lib/types"

interface FileExplorerProps {
  files: FileNode[]
  activeFile: string | null
  onFileSelect: (path: string) => void
  onCreateFile: (name: string) => void
  onCreateFolder: (name: string) => void
}

export default function FileExplorer({
  files,
  activeFile,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src"]))
  const [searchQuery, setSearchQuery] = useState("")
  const [newFileName, setNewFileName] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)

  const defaultFiles: FileNode[] =
    files.length > 0
      ? files
      : [
          {
            name: "src",
            type: "folder",
            path: "src",
            children: [
              { name: "App.jsx", type: "file", path: "src/App.jsx" },
              { name: "main.jsx", type: "file", path: "src/main.jsx" },
              {
                name: "components",
                type: "folder",
                path: "src/components",
                children: [
                  { name: "Header.jsx", type: "file", path: "src/components/Header.jsx" },
                  { name: "Footer.jsx", type: "file", path: "src/components/Footer.jsx" },
                  {
                    name: "ui",
                    type: "folder",
                    path: "src/components/ui",
                    children: [
                      { name: "Button.jsx", type: "file", path: "src/components/ui/Button.jsx" },
                      { name: "Input.jsx", type: "file", path: "src/components/ui/Input.jsx" },
                    ],
                  },
                ],
              },
              {
                name: "styles",
                type: "folder",
                path: "src/styles",
                children: [
                  { name: "globals.css", type: "file", path: "src/styles/globals.css" },
                  { name: "components.css", type: "file", path: "src/styles/components.css" },
                ],
              },
              {
                name: "utils",
                type: "folder",
                path: "src/utils",
                children: [
                  { name: "helpers.js", type: "file", path: "src/utils/helpers.js" },
                  { name: "api.js", type: "file", path: "src/utils/api.js" },
                ],
              },
            ],
          },
          {
            name: "public",
            type: "folder",
            path: "public",
            children: [
              { name: "favicon.ico", type: "file", path: "public/favicon.ico" },
              { name: "logo.svg", type: "file", path: "public/logo.svg" },
            ],
          },
          { name: "package.json", type: "file", path: "package.json" },
          { name: "vite.config.js", type: "file", path: "vite.config.js" },
          { name: "index.html", type: "file", path: "index.html" },
          { name: "README.md", type: "file", path: "README.md" },
        ]

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const getFileIcon = (node: FileNode) => {
    if (node.type === "folder") {
      return expandedFolders.has(node.path) ? (
        <FolderOpen className="w-4 h-4 text-blue-400" />
      ) : (
        <Folder className="w-4 h-4 text-blue-400" />
      )
    }

    const ext = node.name.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "tsx":
      case "jsx":
        return <FileText className="w-4 h-4 text-cyan-400" />
      case "ts":
        return <FileText className="w-4 h-4 text-blue-400" />
      case "js":
        return <FileText className="w-4 h-4 text-yellow-400" />
      case "css":
        return <FileText className="w-4 h-4 text-pink-400" />
      case "scss":
      case "sass":
        return <FileText className="w-4 h-4 text-pink-300" />
      case "html":
        return <FileText className="w-4 h-4 text-orange-400" />
      case "json":
        return <FileText className="w-4 h-4 text-green-400" />
      case "md":
        return <FileText className="w-4 h-4 text-gray-400" />
      case "svg":
        return <FileText className="w-4 h-4 text-purple-400" />
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return <FileText className="w-4 h-4 text-indigo-400" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim())
      setNewFileName("")
      setIsCreateFileOpen(false)
    }
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName("")
      setIsCreateFolderOpen(false)
    }
  }

  const filteredFiles = (nodes: FileNode[]): FileNode[] => {
    if (!searchQuery) return nodes

    return nodes.filter((node) => {
      if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true
      }
      if (node.type === "folder" && node.children) {
        const filteredChildren = filteredFiles(node.children)
        return filteredChildren.length > 0
      }
      return false
    })
  }

  const renderFileNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path)
    const isActive = activeFile === node.path
    const paddingLeft = depth * 16 + 8

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-zinc-800 transition-colors group ${
            isActive ? "bg-zinc-700 text-white" : "text-zinc-300"
          }`}
          style={{ paddingLeft }}
          onClick={(e) => {
            e.stopPropagation()
            if (node.type === "folder") {
              toggleFolder(node.path)
            } else {
              onFileSelect(node.path)
            }
          }}
        >
          {node.type === "folder" && (
            <div className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </div>
          )}
          {node.type !== "folder" && <div className="w-4 h-4" />}
          {getFileIcon(node)}
          <span className="text-sm truncate flex-1">{node.name}</span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {node.type === "folder" ? (
                <>
                  <DropdownMenuItem onClick={() => setIsCreateFileOpen(true)}>
                    <FilePlus className="w-4 h-4 mr-2" />
                    New File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsCreateFolderOpen(true)}>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    New Folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => onFileSelect(node.path)}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem className="text-red-400">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {node.type === "folder" && isExpanded && node.children && node.children.length > 0 && (
          <div>{node.children.map((child) => renderFileNode(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  const fileCount = defaultFiles.reduce((count, node) => {
    const countFiles = (n: FileNode): number => {
      if (n.type === "file") return 1
      if (n.type === "folder" && n.children) {
        return n.children.reduce((acc, child) => acc + countFiles(child), 0)
      }
      return 0
    }
    return count + countFiles(node)
  }, 0)

  return (
    <div className="h-full bg-zinc-900 border-r border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white">Explorer</h3>
          <div className="flex gap-1">
            <Dialog open={isCreateFileOpen} onOpenChange={setIsCreateFileOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-zinc-400 hover:text-white">
                  <FilePlus className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New File</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter file name (e.g., component.jsx)"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateFile()}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateFile} className="flex-1">
                      Create File
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateFileOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-zinc-400 hover:text-white">
                  <FolderPlus className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateFolder} className="flex-1">
                      Create Folder
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-zinc-400 hover:text-white">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Collapse All</DropdownMenuItem>
                <DropdownMenuItem>Refresh</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sort by Name</DropdownMenuItem>
                <DropdownMenuItem>Sort by Type</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-zinc-400" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-xs bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
          />
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="py-2">{filteredFiles(defaultFiles).map((node) => renderFileNode(node))}</div>
      </ScrollArea>

      {/* Stats */}
      <div className="p-2 border-t border-zinc-800 text-xs text-zinc-500">
        <div className="flex justify-between">
          <span>{fileCount} files</span>
          <span>v0 Clone</span>
        </div>
      </div>
    </div>
  )
}
