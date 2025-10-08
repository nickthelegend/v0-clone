export interface AlgoCraftWriteTag {
  path: string
  content: string
  description?: string
}

export interface AlgoCraftRenameTag {
  from: string
  to: string
}

export function getAlgoCraftWriteTags(fullResponse: string): AlgoCraftWriteTag[] {
  // Decode HTML entities first
  const decoded = fullResponse
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

  const regex = /<algocraft-write([^>]*)>([\s\S]*?)<\/algocraft-write>/gi
  const pathRegex = /path="([^"]+)"/
  const descriptionRegex = /description="([^"]+)"/

  const tags: AlgoCraftWriteTag[] = []
  let match

  while ((match = regex.exec(decoded)) !== null) {
    const attributesString = match[1]
    let content = match[2].trim()

    const pathMatch = pathRegex.exec(attributesString)
    const descriptionMatch = descriptionRegex.exec(attributesString)

    if (pathMatch?.[1]) {
      const path = pathMatch[1]
      const description = descriptionMatch?.[1]

      // Remove markdown code blocks if present
      const contentLines = content.split("\n")
      if (contentLines[0]?.startsWith("```")) contentLines.shift()
      if (contentLines[contentLines.length - 1]?.startsWith("```")) contentLines.pop()
      content = contentLines.join("\n")

      tags.push({ path, content, description })
    }
  }
  return tags
}

export function getAlgoCraftRenameTags(fullResponse: string): AlgoCraftRenameTag[] {
  const decoded = fullResponse
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

  const regex = /<algocraft-rename from="([^"]+)" to="([^"]+)"[^>]*>([\s\S]*?)<\/algocraft-rename>/g
  const tags: AlgoCraftRenameTag[] = []
  let match

  while ((match = regex.exec(decoded)) !== null) {
    tags.push({ from: match[1], to: match[2] })
  }
  return tags
}

export function getAlgoCraftDeleteTags(fullResponse: string): string[] {
  const decoded = fullResponse
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

  const regex = /<algocraft-delete path="([^"]+)"[^>]*>([\s\S]*?)<\/algocraft-delete>/g
  const paths: string[] = []
  let match

  while ((match = regex.exec(decoded)) !== null) {
    paths.push(match[1])
  }
  return paths
}

export function getAlgoCraftInstallTags(fullResponse: string): string[] {
  const decoded = fullResponse
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

  const regex = /<algocraft-install packages="([^"]+)">[^<]*<\/algocraft-install>/g
  const packages: string[] = []
  let match

  while ((match = regex.exec(decoded)) !== null) {
    packages.push(...match[1].split(" "))
  }
  return packages
}

export function getAlgoCraftThinkingTag(fullResponse: string): string | null {
  const decoded = fullResponse
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

  const regex = /<algocraft-thinking>([\s\S]*?)<\/algocraft-thinking>/
  const match = regex.exec(decoded)
  return match?.[1]?.trim() || null
}
