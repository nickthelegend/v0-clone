"use client"

import { useState, useCallback } from "react"
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
  RefreshCw,
  SortAsc,
  Package,
  Code,
  ImageIcon,
  FileCode,
  Settings,
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
  onDeleteFile?: (path: string) => void
  onRefresh?: () => void
}

export default function FileExplorer({
  files,
  activeFile,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onRefresh,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["src", "public"]))
  const [searchQuery, setSearchQuery] = useState("")
  const [newFileName, setNewFileName] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "type">("name")

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
    if (node.type === "folder" || node.type === "directory") {
      const isExpanded = expandedFolders.has(node.path)

      // Special folder icons
      if (node.name === "src")
        return isExpanded ? (
          <FolderOpen className="w-4 h-4 text-blue-400" />
        ) : (
          <Folder className="w-4 h-4 text-blue-400" />
        )
      if (node.name === "public")
        return isExpanded ? (
          <FolderOpen className="w-4 h-4 text-green-400" />
        ) : (
          <Folder className="w-4 h-4 text-green-400" />
        )
      if (node.name === "components")
        return isExpanded ? (
          <FolderOpen className="w-4 h-4 text-cyan-400" />
        ) : (
          <Folder className="w-4 h-4 text-cyan-400" />
        )
      if (node.name === "utils" || node.name === "lib")
        return isExpanded ? (
          <FolderOpen className="w-4 h-4 text-purple-400" />
        ) : (
          <Folder className="w-4 h-4 text-purple-400" />
        )
      if (node.name === "styles" || node.name === "css")
        return isExpanded ? (
          <FolderOpen className="w-4 h-4 text-pink-400" />
        ) : (
          <Folder className="w-4 h-4 text-pink-400" />
        )

      return isExpanded ? (
        <FolderOpen className="w-4 h-4 text-yellow-400" />
      ) : (
        <Folder className="w-4 h-4 text-yellow-400" />
      )
    }

    const ext = node.name.split(".").pop()?.toLowerCase()
    const fileName = node.name.toLowerCase()

    // Special file icons
    if (fileName === "package.json") return <Package className="w-4 h-4 text-green-500" />
    if (fileName === "vite.config.ts" || fileName === "vite.config.js")
      return <Settings className="w-4 h-4 text-purple-500" />
    if (fileName === "tailwind.config.js" || fileName === "tailwind.config.ts")
      return <Settings className="w-4 h-4 text-cyan-500" />
    if (fileName === "tsconfig.json") return <Settings className="w-4 h-4 text-blue-500" />
    if (fileName === "postcss.config.js") return <Settings className="w-4 h-4 text-orange-500" />

    switch (ext) {
      case "tsx":
        return <FileCode className="w-4 h-4 text-cyan-400" />
      case "jsx":
        return <FileCode className="w-4 h-4 text-cyan-300" />
      case "ts":
        return <FileCode className="w-4 h-4 text-blue-400" />
      case "js":
        return <FileCode className="w-4 h-4 text-yellow-400" />
      case "css":
        return <Code className="w-4 h-4 text-pink-400" />
      case "scss":
      case "sass":
        return <Code className="w-4 h-4 text-pink-300" />
      case "html":
        return <FileText className="w-4 h-4 text-orange-400" />
      case "json":
        return <FileText className="w-4 h-4 text-green-400" />
      case "md":
        return <FileText className="w-4 h-4 text-gray-400" />
      case "svg":
        return <ImageIcon className="w-4 h-4 text-purple-400" />
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
        return <ImageIcon className="w-4 h-4 text-indigo-400" />
      case "ico":
        return <ImageIcon className="w-4 h-4 text-gray-500" />
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

  const handleDelete = useCallback(
    (path: string) => {
      if (onDeleteFile && confirm(`Are you sure you want to delete ${path}?`)) {
        onDeleteFile(path)
      }
    },
    [onDeleteFile],
  )

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh()
    }
  }, [onRefresh])

  const handleCollapseAll = () => {
    setExpandedFolders(new Set())
  }

  const sortFiles = (nodes: FileNode[]): FileNode[] => {
    return [...nodes].sort((a, b) => {
      if (sortBy === "type") {
        // Folders first, then files
        if (a.type !== b.type) {
          return a.type === "directory" || a.type === "folder" ? -1 : 1
        }
      }
      return a.name.localeCompare(b.name)
    })
  }

  const filteredFiles = (nodes: FileNode[]): FileNode[] => {
    if (!searchQuery) return sortFiles(nodes)

    const filtered = nodes.filter((node) => {
      if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true
      }
      if ((node.type === "folder" || node.type === "directory") && node.children) {
        const filteredChildren = filteredFiles(node.children)
        return filteredChildren.length > 0
      }
      return false
    })

    return sortFiles(filtered)
  }

  const renderFileNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path)
    const isActive = activeFile === node.path
    const paddingLeft = depth * 16 + 8
    const isFolder = node.type === "folder" || node.type === "directory"

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-zinc-800 transition-colors group ${
            isActive ? "bg-zinc-700 text-white" : "text-zinc-300"
          }`}
          style={{ paddingLeft }}
          onClick={(e) => {
            e.stopPropagation()
            if (isFolder) {
              toggleFolder(node.path)
            } else {
              onFileSelect(node.path)
            }
          }}
        >
          {isFolder && (
            <div className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </div>
          )}
          {!isFolder && <div className="w-4 h-4" />}
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
              {isFolder ? (
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
              {onDeleteFile && (
                <DropdownMenuItem className="text-red-400 focus:text-red-400" onClick={() => handleDelete(node.path)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isFolder && isExpanded && node.children && node.children.length > 0 && (
          <div>{sortFiles(node.children).map((child) => renderFileNode(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  const fileCount = files.reduce((count, node) => {
    const countFiles = (n: FileNode): number => {
      if (n.type === "file") return 1
      if ((n.type === "folder" || n.type === "directory") && n.children) {
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
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                  title="New File"
                >
                  <FilePlus className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New File</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter file name (e.g., Component.tsx)"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateFile()}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateFile} className="flex-1" disabled={!newFileName.trim()}>
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
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                  title="New Folder"
                >
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
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateFolder} className="flex-1" disabled={!newFolderName.trim()}>
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
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                  title="More Options"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCollapseAll}>
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Collapse All
                </DropdownMenuItem>
                {onRefresh && (
                  <DropdownMenuItem onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  <SortAsc className="w-4 h-4 mr-2" />
                  Sort by Name {sortBy === "name" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("type")}>
                  <Folder className="w-4 h-4 mr-2" />
                  Sort by Type {sortBy === "type" && "✓"}
                </DropdownMenuItem>
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
        <div className="py-2">
          {files.length > 0 ? (
            filteredFiles(files).map((node) => renderFileNode(node))
          ) : (
            <div className="p-4 text-center text-zinc-500">
              <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No files found</p>
              <p className="text-xs mt-1">Files will appear here once loaded</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Stats */}
      <div className="p-2 border-t border-zinc-800 text-xs text-zinc-500">
        <div className="flex justify-between">
          <span>{fileCount} files</span>
          <span>Algorand Project</span>
        </div>
      </div>
    </div>
  )
}
