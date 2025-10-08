"use client"

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { FileText, Trash2, Package, Lightbulb, RefreshCw } from 'lucide-react'

// Decode HTML entities (works on both client and server)
function decodeHtml(html: string): string {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

export function AlgoCraftMarkdownParser({ content }: { content: string }) {
  // Ensure text is visible on dark background
  // Pre-process content to wrap AlgoCraft tags in code blocks for ReactMarkdown
  const processedContent = content.replace(
    /(<algocraft-(?:write|delete|rename|install|thinking)[^>]*>[\s\S]*?<\/algocraft-(?:write|delete|rename|install|thinking)>)/g,
    (match) => `\n\`\`\`\n${match}\n\`\`\`\n`
  )
  
  return (
    <div className="text-zinc-100 prose prose-invert max-w-none">
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const codeString = decodeHtml(String(children).replace(/\n$/, ''))
          
          if (codeString.startsWith('<algocraft-write')) {
            const pathMatch = codeString.match(/path="([^"]+)"/)
            const contentMatch = codeString.match(/>([\s\S]*?)<\/algocraft-write>/)
            
            if (pathMatch && contentMatch) {
              return (
                <div className="my-4 border border-blue-500 rounded-lg overflow-hidden">
                  <div className="bg-blue-500/10 px-4 py-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">Write File</span>
                    <code className="ml-auto text-xs">{pathMatch[1]}</code>
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language="typescript"
                    customStyle={{ margin: 0 }}
                  >
                    {contentMatch[1].trim()}
                  </SyntaxHighlighter>
                </div>
              )
            }
          }
          
          if (codeString.startsWith('<algocraft-delete')) {
            const pathMatch = codeString.match(/path="([^"]+)"/)
            return (
              <div className="my-4 border border-red-500 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium">Delete File</span>
                  <code className="ml-auto text-xs">{pathMatch?.[1]}</code>
                </div>
              </div>
            )
          }
          
          if (codeString.startsWith('<algocraft-install')) {
            const pkgMatch = codeString.match(/packages="([^"]+)"/)
            return (
              <div className="my-4 border border-green-500 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">Install Package</span>
                  <code className="ml-auto text-xs">{pkgMatch?.[1]}</code>
                </div>
              </div>
            )
          }
          
          if (codeString.startsWith('<algocraft-rename')) {
            const fromMatch = codeString.match(/from="([^"]+)"/)
            const toMatch = codeString.match(/to="([^"]+)"/)
            return (
              <div className="my-4 border border-purple-500 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">Rename File</span>
                  <code className="ml-auto text-xs">{fromMatch?.[1]} → {toMatch?.[1]}</code>
                </div>
              </div>
            )
          }
          
          if (codeString.startsWith('<algocraft-thinking')) {
            const thinkingMatch = codeString.match(/>([\s\S]*?)<\/algocraft-thinking>/)
            return (
              <div className="my-4 border border-yellow-500 rounded-lg p-4 bg-yellow-500/5">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400 mt-1" />
                  <div>
                    <span className="text-sm font-medium block mb-2">AI Thinking</span>
                    <p className="text-sm text-gray-300">{thinkingMatch?.[1]}</p>
                  </div>
                </div>
              </div>
            )
          }
          
          if (!inline) {
            const match = /language-(\w+)/.exec(className || '')
            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match ? match[1] : 'text'}
                PreTag="div"
              >
                {codeString}
              </SyntaxHighlighter>
            )
          }
          
          return <code className="bg-zinc-800 px-1 py-0.5 rounded">{children}</code>
        }
      }}
    >
      {processedContent}
    </ReactMarkdown>
    </div>
  )
}
