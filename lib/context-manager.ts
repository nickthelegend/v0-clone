export interface FileContext {
  path: string
  content: string
}

export function formatContextForAI(
  fileTree: any[],
  fileContents: Record<string, string>
): string {
  const files = Object.entries(fileContents)
    .filter(([path]) => !path.includes('node_modules'))
    .slice(0, 20) // Limit to 20 files to avoid token limits

  if (files.length === 0) return ''

  const fileList = files.map(([path]) => `- ${path}`).join('\n')
  
  const fileContentsFormatted = files
    .map(([path, content]) => {
      const ext = path.split('.').pop()
      return `## ${path}\n\`\`\`${ext}\n${content.slice(0, 2000)}\n\`\`\`\n`
    })
    .join('\n')

  return `# Current Project Files\n\n${fileList}\n\n# File Contents\n\n${fileContentsFormatted}`
}
