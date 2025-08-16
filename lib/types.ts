export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface FileNode {
  name: string
  type: "file" | "folder"
  path: string
  children?: FileNode[]
  content?: string
}

export interface ProjectState {
  files: FileNode[]
  activeFile: string | null
  isRunning: boolean
  terminal: {
    history: string[]
    isVisible: boolean
  }
}
