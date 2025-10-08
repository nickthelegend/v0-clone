import { WebContainerService } from "./webcontainer"
import {
  getAlgoCraftWriteTags,
  getAlgoCraftRenameTags,
  getAlgoCraftDeleteTags,
  getAlgoCraftInstallTags,
} from "./tag-parser"

export interface ProcessResult {
  success: boolean
  writtenFiles: string[]
  renamedFiles: string[]
  deletedFiles: string[]
  installedPackages: string[]
  errors: string[]
}

export class ResponseProcessor {
  private webcontainer: WebContainerService

  constructor(webcontainer: WebContainerService) {
    this.webcontainer = webcontainer
  }

  async processResponse(fullResponse: string): Promise<ProcessResult> {
    const writtenFiles: string[] = []
    const renamedFiles: string[] = []
    const deletedFiles: string[] = []
    const installedPackages: string[] = []
    const errors: string[] = []

    try {
      // Extract all tags
      const writeTags = getAlgoCraftWriteTags(fullResponse)
      const renameTags = getAlgoCraftRenameTags(fullResponse)
      const deletePaths = getAlgoCraftDeleteTags(fullResponse)
      const installPackages = getAlgoCraftInstallTags(fullResponse)

      // Process in order: delete → rename → write → install

      // 1. Delete files
      for (const filePath of deletePaths) {
        try {
          await this.webcontainer.deleteFile(filePath)
          deletedFiles.push(filePath)
          console.log(`[AlgoCraft] Deleted: ${filePath}`)
        } catch (error) {
          errors.push(`Failed to delete ${filePath}: ${error}`)
        }
      }

      // 2. Rename files
      for (const tag of renameTags) {
        try {
          const content = await this.webcontainer.readFile(tag.from)
          await this.webcontainer.writeFile(tag.to, content)
          await this.webcontainer.deleteFile(tag.from)
          renamedFiles.push(tag.to)
          console.log(`[AlgoCraft] Renamed: ${tag.from} → ${tag.to}`)
        } catch (error) {
          errors.push(`Failed to rename ${tag.from} to ${tag.to}: ${error}`)
        }
      }

      // 3. Write files
      for (const tag of writeTags) {
        try {
          await this.webcontainer.writeFile(tag.path, tag.content)
          writtenFiles.push(tag.path)
          console.log(`[AlgoCraft] Wrote: ${tag.path}`)
        } catch (error) {
          errors.push(`Failed to write ${tag.path}: ${error}`)
        }
      }

      // 4. Install packages
      if (installPackages.length > 0) {
        try {
          for (const pkg of installPackages) {
            await this.webcontainer.installPackage(pkg)
            installedPackages.push(pkg)
          }
          console.log(`[AlgoCraft] Installed: ${installPackages.join(", ")}`)
        } catch (error) {
          errors.push(`Failed to install packages: ${error}`)
        }
      }

      return {
        success: errors.length === 0,
        writtenFiles,
        renamedFiles,
        deletedFiles,
        installedPackages,
        errors,
      }
    } catch (error) {
      console.error("[AlgoCraft] Processing error:", error)
      return {
        success: false,
        writtenFiles,
        renamedFiles,
        deletedFiles,
        installedPackages,
        errors: [error instanceof Error ? error.message : String(error)],
      }
    }
  }
}
