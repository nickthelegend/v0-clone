interface GitHubFile {
  name: string
  path: string
  type: "file" | "dir"
  download_url?: string
  url: string
}

interface GitHubContent {
  name: string
  path: string
  type: "file" | "dir"
  content?: string
  download_url?: string
}

export class GitHubRepositoryFetcher {
  private static readonly REPO_OWNER = "algorand-devrel"
  private static readonly REPO_NAME = "algorand-bolt"
  private static readonly API_BASE = "https://api.github.com"

  static async fetchRepositoryStructure(): Promise<Record<string, string>> {
    try {
      console.log("[v0] Fetching Algorand repository structure...")

      const files: Record<string, string> = {}

      // Get repository contents recursively
      await this.fetchDirectoryContents("", files)

      console.log("[v0] Repository structure fetched successfully")

      await this.syncToWebContainer(files)

      return files
    } catch (error) {
      console.error("[v0] Failed to fetch repository:", error)
      throw error
    }
  }

  private static async fetchDirectoryContents(path: string, files: Record<string, string>): Promise<void> {
    const url = `${this.API_BASE}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents/${path}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.statusText}`)
      }

      const contents: GitHubFile[] = await response.json()

      for (const item of contents) {
        if (item.type === "file") {
          // Fetch file content
          const fileContent = await this.fetchFileContent(item.download_url || item.url)
          files[item.path] = fileContent
        } else if (item.type === "dir") {
          // Recursively fetch directory contents
          await this.fetchDirectoryContents(item.path, files)
        }
      }
    } catch (error) {
      console.error(`[v0] Error fetching directory ${path}:`, error)
      // Continue with other files even if one fails
    }
  }

  private static async fetchFileContent(url: string): Promise<string> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`)
      }

      // Check if it's a binary file by content type
      const contentType = response.headers.get("content-type") || ""
      if (contentType.includes("image/") || contentType.includes("application/")) {
        return "[Binary file]"
      }

      return await response.text()
    } catch (error) {
      console.error("[v0] Error fetching file content:", error)
      return "// Error loading file content"
    }
  }

  private static async syncToWebContainer(files: Record<string, string>): Promise<void> {
    try {
      const { WebContainerService } = await import("@/lib/webcontainer")
      const webcontainer = WebContainerService.getInstance()

      console.log("[v0] Syncing files to WebContainer...")

      for (const [path, content] of Object.entries(files)) {
        try {
          await webcontainer.writeFile(path, content)
        } catch (error) {
          console.warn(`[v0] Failed to write file ${path}:`, error)
        }
      }

      console.log("[v0] Files synced to WebContainer successfully")
    } catch (error) {
      console.warn("[v0] WebContainer sync failed:", error)
    }
  }
}

export function convertGitHubFilesToFileNodes(files: Record<string, string>) {
  const fileNodes: any[] = []
  const pathMap = new Map()

  // Sort paths to ensure directories are created before their contents
  const sortedPaths = Object.keys(files).sort()

  for (const path of sortedPaths) {
    const parts = path.split("/")
    let currentPath = ""

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const parentPath = currentPath
      currentPath = currentPath ? `${currentPath}/${part}` : part

      if (!pathMap.has(currentPath)) {
        const isFile = i === parts.length - 1
        const node = {
          id: currentPath,
          name: part,
          type: isFile ? "file" : "folder",
          path: currentPath,
          children: isFile ? undefined : [],
          content: isFile ? files[path] : undefined,
        }

        pathMap.set(currentPath, node)

        if (parentPath) {
          const parent = pathMap.get(parentPath)
          if (parent && parent.children) {
            parent.children.push(node)
          }
        } else {
          fileNodes.push(node)
        }
      }
    }
  }

  return fileNodes
}
