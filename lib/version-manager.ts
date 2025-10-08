interface FileSnapshot {
  [path: string]: string
}

interface Version {
  id: string
  timestamp: Date
  message: string
  files: FileSnapshot
}

export class VersionManager {
  private versions: Version[] = []
  private currentIndex = -1

  createVersion(message: string, files: Record<string, string>) {
    // Remove any versions after current (if we undid and made new changes)
    this.versions = this.versions.slice(0, this.currentIndex + 1)
    
    const version: Version = {
      id: Date.now().toString(),
      timestamp: new Date(),
      message,
      files: { ...files }
    }
    
    this.versions.push(version)
    this.currentIndex = this.versions.length - 1
    
    console.log(`[VersionManager] Created version: ${message}`)
  }

  canUndo(): boolean {
    return this.currentIndex > 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.versions.length - 1
  }

  getCurrentVersion(): Version | null {
    return this.versions[this.currentIndex] || null
  }

  undo(): FileSnapshot | null {
    if (!this.canUndo()) return null
    
    this.currentIndex--
    const version = this.versions[this.currentIndex]
    console.log(`[VersionManager] Undo to: ${version.message}`)
    return version.files
  }

  redo(): FileSnapshot | null {
    if (!this.canRedo()) return null
    
    this.currentIndex++
    const version = this.versions[this.currentIndex]
    console.log(`[VersionManager] Redo to: ${version.message}`)
    return version.files
  }

  getVersionHistory(): Version[] {
    return this.versions.map((v, i) => ({
      ...v,
      isCurrent: i === this.currentIndex
    }))
  }
}
