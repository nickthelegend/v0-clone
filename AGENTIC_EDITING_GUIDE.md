# Agentic File Editing Implementation Guide

## 🎯 The Solution: algocraft-Style XML Tags

Based on [algocraft's architecture](https://github.com/algocraft-sh/algocraft), the best approach for agentic file editing is **NOT** using traditional tool calling, but instead using **XML-like tags** that the AI generates in its response.

### Why XML Tags > Tool Calling?

1. **Multiple operations at once** - AI can write multiple files, delete files, install packages all in one response
2. **Better code quality** - Forcing LLMs to return code in JSON (tool calling) [degrades quality](https://aider.chat/2024/08/14/code-in-json.html)
3. **Simpler parsing** - Stream response and parse tags as they come
4. **Used by production apps** - v0, Bolt, Lovable all use this approach

---

## 🏗️ Architecture Overview

```
User Prompt
    ↓
AI generates response with <algocraft-*> tags
    ↓
Stream response to UI (show tags in nice format)
    ↓
User approves changes
    ↓
Response Processor executes tags
    ↓
Files updated in WebContainer
    ↓
Preview refreshes automatically
```

---

## 📝 Step-by-Step Implementation

### Step 1: Define XML Tags (System Prompt)

Create `lib/prompts/system-prompt.ts`:

```typescript
export const SYSTEM_PROMPT = `You are an expert full-stack developer. You help users build web applications by editing code files.

When making changes, use these XML-like tags:

<algocraft-write path="path/to/file.tsx">
// Full file content here
export default function Component() {
  return <div>Hello</div>
}
</algocraft-write>

<algocraft-delete path="path/to/file.tsx" />

<algocraft-install package="react-icons" />

<algocraft-shell command="npm run build" />

<algocraft-thinking>
Explain your reasoning here before making changes
</algocraft-thinking>

IMPORTANT RULES:
1. Always use <algocraft-thinking> to explain your plan first
2. Use <algocraft-write> for creating or updating files
3. Include FULL file content in <algocraft-write>, not just changes
4. Use proper file paths (e.g., src/components/Button.tsx)
5. Ensure all imports are correct
6. Follow the existing code style

Current project structure:
{{FILE_TREE}}

Current file contents:
{{FILE_CONTENTS}}
`
```

### Step 2: Create Response Processor

Create `lib/response-processor.ts`:

```typescript
interface algocraftTag {
  type: 'write' | 'delete' | 'install' | 'shell' | 'thinking'
  path?: string
  content?: string
  package?: string
  command?: string
}

export class ResponseProcessor {
  private webcontainer: WebContainerService
  
  constructor(webcontainer: WebContainerService) {
    this.webcontainer = webcontainer
  }
  
  // Parse AI response and extract tags
  parseTags(response: string): algocraftTag[] {
    const tags: algocraftTag[] = []
    
    // Parse <algocraft-write>
    const writeRegex = /<algocraft-write path="([^"]+)">([\s\S]*?)<\/algocraft-write>/g
    let match
    while ((match = writeRegex.exec(response)) !== null) {
      tags.push({
        type: 'write',
        path: match[1],
        content: match[2].trim()
      })
    }
    
    // Parse <algocraft-delete>
    const deleteRegex = /<algocraft-delete path="([^"]+)"\s*\/>/g
    while ((match = deleteRegex.exec(response)) !== null) {
      tags.push({
        type: 'delete',
        path: match[1]
      })
    }
    
    // Parse <algocraft-install>
    const installRegex = /<algocraft-install package="([^"]+)"\s*\/>/g
    while ((match = installRegex.exec(response)) !== null) {
      tags.push({
        type: 'install',
        package: match[1]
      })
    }
    
    // Parse <algocraft-shell>
    const shellRegex = /<algocraft-shell command="([^"]+)"\s*\/>/g
    while ((match = shellRegex.exec(response)) !== null) {
      tags.push({
        type: 'shell',
        command: match[1]
      })
    }
    
    return tags
  }
  
  // Execute all tags
  async executeTags(tags: algocraftTag[]): Promise<ExecutionResult> {
    const results: TagResult[] = []
    
    for (const tag of tags) {
      try {
        switch (tag.type) {
          case 'write':
            await this.webcontainer.writeFile(tag.path!, tag.content!)
            results.push({ 
              type: 'write', 
              path: tag.path!, 
              success: true 
            })
            break
            
          case 'delete':
            await this.webcontainer.deleteFile(tag.path!)
            results.push({ 
              type: 'delete', 
              path: tag.path!, 
              success: true 
            })
            break
            
          case 'install':
            await this.webcontainer.installPackage(tag.package!)
            results.push({ 
              type: 'install', 
              package: tag.package!, 
              success: true 
            })
            break
            
          case 'shell':
            const output = await this.webcontainer.runCommand(tag.command!)
            results.push({ 
              type: 'shell', 
              command: tag.command!, 
              output,
              success: true 
            })
            break
        }
      } catch (error) {
        results.push({
          type: tag.type,
          success: false,
          error: error.message
        })
      }
    }
    
    return { results, success: results.every(r => r.success) }
  }
}
```

### Step 3: Update Chat API

Modify `app/api/chat/route.ts`:

```typescript
import { streamText } from "ai"
import { mistral } from "@ai-sdk/mistral"
import { SYSTEM_PROMPT } from "@/lib/prompts/system-prompt"

export async function POST(req: Request) {
  const { messages, fileTree, fileContents } = await req.json()
  
  // Build context
  const fileTreeStr = JSON.stringify(fileTree, null, 2)
  const fileContentsStr = Object.entries(fileContents)
    .map(([path, content]) => `// ${path}\n${content}`)
    .join('\n\n---\n\n')
  
  const systemPrompt = SYSTEM_PROMPT
    .replace('{{FILE_TREE}}', fileTreeStr)
    .replace('{{FILE_CONTENTS}}', fileContentsStr)
  
  const result = await streamText({
    model: mistral("mistral-large-latest"),
    messages,
    system: systemPrompt,
  })
  
  return result.toTextStreamResponse()
}
```

### Step 4: Create algocraft Markdown Parser

Create `components/algocraft-markdown-parser.tsx`:

```typescript
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { FileText, Trash2, Package, Terminal, Lightbulb } from 'lucide-react'

export function algocraftMarkdownParser({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const codeString = String(children).replace(/\n$/, '')
          
          // Check if it's a algocraft tag
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
            const pkgMatch = codeString.match(/package="([^"]+)"/)
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
          
          if (codeString.startsWith('<algocraft-shell')) {
            const cmdMatch = codeString.match(/command="([^"]+)"/)
            return (
              <div className="my-4 border border-purple-500 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">Run Command</span>
                  <code className="ml-auto text-xs">{cmdMatch?.[1]}</code>
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
          
          // Regular code block
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
      {content}
    </ReactMarkdown>
  )
}
```

### Step 5: Update Chat Interface

Modify `components/chat-interface.tsx`:

```typescript
import { algocraftMarkdownParser } from './algocraft-markdown-parser'
import { ResponseProcessor } from '@/lib/response-processor'

export default function ChatInterface({ onCodeGenerated }: ChatInterfaceProps) {
  const [pendingChanges, setPendingChanges] = useState<algocraftTag[]>([])
  const [showApproval, setShowApproval] = useState(false)
  
  const handleSubmit = async (input: string, agent: string) => {
    // ... existing code ...
    
    // After streaming completes
    const processor = new ResponseProcessor(webcontainer)
    const tags = processor.parseTags(assistantContent)
    
    if (tags.length > 0) {
      setPendingChanges(tags)
      setShowApproval(true)
    }
  }
  
  const handleApproveChanges = async () => {
    const processor = new ResponseProcessor(webcontainer)
    const result = await processor.executeTags(pendingChanges)
    
    if (result.success) {
      // Refresh file tree and preview
      onCodeGenerated()
    }
    
    setShowApproval(false)
    setPendingChanges([])
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1">
        {messages.map((message) => (
          <div key={message.id}>
            <algocraftMarkdownParser content={message.content} />
          </div>
        ))}
      </ScrollArea>
      
      {/* Approval Dialog */}
      {showApproval && (
        <div className="border-t border-zinc-700 p-4 bg-zinc-800">
          <h3 className="font-medium mb-2">Approve Changes?</h3>
          <div className="space-y-2 mb-4">
            {pendingChanges.map((tag, i) => (
              <div key={i} className="text-sm">
                {tag.type === 'write' && `✏️ Write ${tag.path}`}
                {tag.type === 'delete' && `🗑️ Delete ${tag.path}`}
                {tag.type === 'install' && `📦 Install ${tag.package}`}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleApproveChanges}>Apply Changes</Button>
            <Button variant="outline" onClick={() => setShowApproval(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {/* Input */}
      <ChatInput onSubmit={handleSubmit} />
    </div>
  )
}
```

### Step 6: Add WebContainer Methods

Update `lib/webcontainer.ts`:

```typescript
export class WebContainerService {
  // ... existing methods ...
  
  async deleteFile(path: string): Promise<void> {
    if (!this.webcontainer) await this.boot()
    await this.webcontainer!.fs.rm(path)
    console.log(`[v0] File deleted: ${path}`)
  }
  
  async installPackage(packageName: string): Promise<void> {
    if (!this.webcontainer) await this.boot()
    
    console.log(`[v0] Installing package: ${packageName}`)
    const process = await this.webcontainer!.spawn('npm', [
      'install',
      packageName,
      '--save'
    ])
    
    await process.exit
    console.log(`[v0] Package installed: ${packageName}`)
  }
}
```

---

## 🎨 UI Improvements

### Change Preview Panel

Create `components/change-preview.tsx`:

```typescript
export function ChangePreview({ tags }: { tags: algocraftTag[] }) {
  const fileChanges = tags.filter(t => t.type === 'write' || t.type === 'delete')
  const packageChanges = tags.filter(t => t.type === 'install')
  
  return (
    <div className="space-y-4">
      {fileChanges.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">File Changes</h4>
          <div className="space-y-1">
            {fileChanges.map((tag, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {tag.type === 'write' ? (
                  <>
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>{tag.path}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span className="line-through">{tag.path}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {packageChanges.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Package Changes</h4>
          <div className="space-y-1">
            {packageChanges.map((tag, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-green-400" />
                <span>{tag.package}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## 🚀 Advanced Features

### Auto-fix TypeScript Errors (Like algocraft)

```typescript
async function autoFixTypeScriptErrors() {
  const errors = await getTypeScriptErrors()
  
  if (errors.length === 0) return
  
  const fixPrompt = `
Fix these TypeScript errors:

${errors.map(e => `${e.file}:${e.line} - ${e.message}`).join('\n')}

Use <algocraft-write> tags to fix the files.
`
  
  const response = await generateText({
    model: mistral("mistral-large-latest"),
    prompt: fixPrompt,
    system: SYSTEM_PROMPT
  })
  
  const processor = new ResponseProcessor(webcontainer)
  const tags = processor.parseTags(response.text)
  await processor.executeTags(tags)
}
```

### Smart Context (algocraft's Approach)

Instead of sending entire codebase, use a smaller model to filter relevant files:

```typescript
async function getRelevantFiles(userPrompt: string, allFiles: string[]) {
  const response = await generateText({
    model: mistral("mistral-small-latest"), // Cheaper model
    prompt: `
User wants to: ${userPrompt}

Available files:
${allFiles.join('\n')}

Return ONLY the file paths that are relevant (one per line).
`
  })
  
  return response.text.split('\n').filter(Boolean)
}
```

---

## 📊 Cost Optimization (algocraft's Philosophy)

### Why algocraft Avoids Complex Agentic Loops

- **Single request** instead of dozens of tool calls
- **User approval** before executing changes
- **Smart context** to reduce token usage
- **Cheaper models** for filtering/analysis

### Your Implementation Strategy

1. **Start simple**: Single AI request → Parse tags → Execute
2. **Add approval step**: Show changes before applying
3. **Optimize context**: Only send relevant files
4. **Add auto-fix**: Optional TypeScript error fixing

---

## ✅ Implementation Checklist

- [ ] Create `lib/prompts/system-prompt.ts` with XML tag definitions
- [ ] Create `lib/response-processor.ts` to parse and execute tags
- [ ] Update `app/api/chat/route.ts` to include file context
- [ ] Create `components/algocraft-markdown-parser.tsx` for nice UI
- [ ] Update `components/chat-interface.tsx` with approval flow
- [ ] Add `deleteFile()` and `installPackage()` to WebContainer service
- [ ] Create `components/change-preview.tsx` for showing pending changes
- [ ] Test with simple prompts: "Create a Button component"
- [ ] Test with complex prompts: "Add dark mode to the entire app"
- [ ] Add TypeScript error auto-fix (optional)
- [ ] Add smart context filtering (optional)

---

## 🎯 Example Usage

**User**: "Add a login form with email and password fields"

**AI Response**:
```xml
<algocraft-thinking>
I'll create a LoginForm component with email and password inputs,
then import it in the App.tsx file.
</algocraft-thinking>

<algocraft-write path="src/components/LoginForm.tsx">
import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  return (
    <form className="space-y-4">
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  )
}
</algocraft-write>

<algocraft-write path="src/App.tsx">
import LoginForm from './components/LoginForm'

export default function App() {
  return (
    <div>
      <h1>Welcome</h1>
      <LoginForm />
    </div>
  )
}
</algocraft-write>
```

**UI Shows**:
- 💡 AI Thinking: "I'll create a LoginForm component..."
- ✏️ Write File: `src/components/LoginForm.tsx`
- ✏️ Write File: `src/App.tsx`
- [Apply Changes] [Cancel] buttons

**User clicks "Apply Changes"** → Files written to WebContainer → Preview updates

---

## 🔗 References

- [algocraft Architecture](https://github.com/algocraft-sh/algocraft/blob/main/docs/architecture.md)
- [algocraft System Prompt](https://github.com/algocraft-sh/algocraft/blob/main/src/prompts/system_prompt.ts)
- [algocraft Response Processor](https://github.com/algocraft-sh/algocraft/blob/main/src/ipc/processors/response_processor.ts)
- [Why Code in JSON is Bad](https://aider.chat/2024/08/14/code-in-json.html)
- [AI App Builder System Prompts](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools)

---

**This is the proven approach used by production AI code editors. Start with the basics and iterate!**
