# Dyad Architecture vs Your v0-Clone

## Files You Need to Add (Based on Dyad's Structure)

### 1. **Context Awareness** (Priority: 🔥 CRITICAL)

#### Dyad Has:
```
src/ipc/utils/dyad_tag_parser.ts          # Advanced tag parsing
src/components/chat/DyadCodebaseContext.tsx  # Shows codebase context in UI
src/hooks/useContextPaths.ts              # Manages context file paths
src/ipc/handlers/context_paths_handlers.ts   # Backend context logic
src/ipc/utils/context_paths_utils.ts      # Context utilities
```

#### You Need to Add:
```
lib/context-manager.ts                    # NEW: Manage file context
components/context-display.tsx            # NEW: Show selected files in UI
hooks/useFileContext.ts                   # NEW: Hook for context state
```

#### Implementation:
**File: `lib/context-manager.ts`**
```typescript
export interface FileContext {
  path: string
  content: string
  language: string
  size: number
}

export class ContextManager {
  private maxTokens = 100000 // Context window limit
  
  selectFilesForContext(
    fileTree: FileNode[],
    activeFile: string | null,
    userQuery: string
  ): FileContext[] {
    // 1. Always include active file
    // 2. Include files mentioned in query
    // 3. Include related files (same directory, imports)
    // 4. Respect token limit
  }
  
  formatContextForAI(files: FileContext[]): string {
    // Format as markdown for AI
    return files.map(f => `
## ${f.path}
\`\`\`${f.language}
${f.content}
\`\`\`
    `).join('\n')
  }
}
```

**File: `app/api/chat/route.ts` - UPDATE**
```typescript
import { ContextManager } from '@/lib/context-manager'

export async function POST(req: Request) {
  const { messages, fileTree, fileContents, activeFile } = await req.json()
  
  // NEW: Add context
  const contextManager = new ContextManager()
  const relevantFiles = contextManager.selectFilesForContext(
    fileTree,
    activeFile,
    messages[messages.length - 1].content
  )
  const contextPrompt = contextManager.formatContextForAI(relevantFiles)
  
  const result = await streamText({
    model: openai("gpt-3.5-turbo"),
    messages,
    system: `${SYSTEM_PROMPT}\n\n## Current Codebase:\n${contextPrompt}`
  })
}
```

---

### 2. **Error Handling & Rollback** (Priority: 🔥 CRITICAL)

#### Dyad Has:
```
src/ipc/processors/response_processor.ts  # Handles errors, rollback
src/components/chat/ChatError.tsx         # Error display component
src/components/chat/ChatErrorBox.tsx      # Error box UI
```

#### You Need to Add:
```
lib/file-history.ts                       # NEW: Track file versions
lib/rollback-manager.ts                   # NEW: Revert changes
components/error-display.tsx              # NEW: Show errors in approval
```

#### Implementation:
**File: `lib/file-history.ts`**
```typescript
export interface FileVersion {
  path: string
  content: string
  timestamp: Date
  operation: 'create' | 'update' | 'delete'
}

export class FileHistory {
  private history: Map<string, FileVersion[]> = new Map()
  
  saveVersion(path: string, content: string, operation: string) {
    if (!this.history.has(path)) {
      this.history.set(path, [])
    }
    this.history.get(path)!.push({
      path,
      content,
      timestamp: new Date(),
      operation: operation as any
    })
  }
  
  getLastVersion(path: string): FileVersion | null {
    const versions = this.history.get(path)
    return versions?.[versions.length - 2] || null // -2 to get previous version
  }
  
  async rollback(path: string, webcontainer: WebContainerService) {
    const lastVersion = this.getLastVersion(path)
    if (lastVersion) {
      await webcontainer.writeFile(path, lastVersion.content)
    }
  }
}
```

**File: `lib/response-processor.ts` - UPDATE**
```typescript
import { FileHistory } from './file-history'

export class ResponseProcessor {
  private history = new FileHistory()
  
  async processResponse(response: string): Promise<ProcessResult> {
    const result: ProcessResult = { /* ... */ }
    
    try {
      // Save current state before changes
      for (const tag of writeTags) {
        const existing = await this.webcontainer.readFile(tag.path)
        if (existing) {
          this.history.saveVersion(tag.path, existing, 'update')
        }
      }
      
      // Execute operations
      // ...
      
    } catch (error) {
      // Rollback on error
      result.errors.push(error.message)
      await this.rollbackChanges(result.writtenFiles)
    }
    
    return result
  }
  
  async rollbackChanges(files: string[]) {
    for (const file of files) {
      await this.history.rollback(file, this.webcontainer)
    }
  }
}
```

---

### 3. **Multi-File Coordination** (Priority: 🎯 HIGH)

#### Dyad Has:
```
src/ipc/utils/file_utils.ts              # File path utilities
src/ipc/utils/path_utils.ts              # Path resolution
src/hooks/useParseRouter.ts              # Parse project structure
```

#### You Need to Add:
```
lib/import-analyzer.ts                    # NEW: Analyze imports
lib/dependency-graph.ts                   # NEW: Track file dependencies
```

#### Implementation:
**File: `lib/import-analyzer.ts`**
```typescript
export class ImportAnalyzer {
  extractImports(code: string, language: string): string[] {
    if (language === 'typescript' || language === 'javascript') {
      const importRegex = /import .* from ['"](.+)['"]/g
      const imports: string[] = []
      let match
      while ((match = importRegex.exec(code)) !== null) {
        imports.push(match[1])
      }
      return imports
    }
    return []
  }
  
  resolveImportPath(importPath: string, currentFile: string): string {
    // Resolve relative imports to absolute paths
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const currentDir = currentFile.split('/').slice(0, -1).join('/')
      return this.resolvePath(currentDir, importPath)
    }
    return importPath
  }
  
  validateImports(code: string, fileTree: FileNode[]): string[] {
    const imports = this.extractImports(code, 'typescript')
    const errors: string[] = []
    
    for (const imp of imports) {
      if (imp.startsWith('.')) {
        const resolved = this.resolveImportPath(imp, 'current/file.ts')
        if (!this.fileExists(resolved, fileTree)) {
          errors.push(`Import not found: ${imp}`)
        }
      }
    }
    
    return errors
  }
}
```

---

### 4. **Undo/Redo System** (Priority: 🎯 HIGH)

#### Dyad Has:
```
src/hooks/useVersions.ts                  # Version management
src/hooks/useCheckoutVersion.ts           # Switch versions
src/components/chat/VersionPane.tsx       # Version UI
src/ipc/handlers/version_handlers.ts      # Version backend
```

#### You Need to Add:
```
lib/version-manager.ts                    # NEW: Version control
components/version-history.tsx            # NEW: Show version history
hooks/useUndo.ts                          # NEW: Undo/redo hook
```

#### Implementation:
**File: `lib/version-manager.ts`**
```typescript
export interface Version {
  id: string
  timestamp: Date
  message: string
  files: Map<string, string> // path -> content
}

export class VersionManager {
  private versions: Version[] = []
  private currentIndex = -1
  
  createVersion(message: string, files: Map<string, string>) {
    const version: Version = {
      id: Date.now().toString(),
      timestamp: new Date(),
      message,
      files: new Map(files) // Clone
    }
    
    // Remove any versions after current (if we undid and made new changes)
    this.versions = this.versions.slice(0, this.currentIndex + 1)
    this.versions.push(version)
    this.currentIndex = this.versions.length - 1
  }
  
  async undo(webcontainer: WebContainerService): Promise<boolean> {
    if (this.currentIndex <= 0) return false
    
    this.currentIndex--
    const version = this.versions[this.currentIndex]
    
    // Restore files from this version
    for (const [path, content] of version.files) {
      await webcontainer.writeFile(path, content)
    }
    
    return true
  }
  
  async redo(webcontainer: WebContainerService): Promise<boolean> {
    if (this.currentIndex >= this.versions.length - 1) return false
    
    this.currentIndex++
    const version = this.versions[this.currentIndex]
    
    for (const [path, content] of version.files) {
      await webcontainer.writeFile(path, content)
    }
    
    return true
  }
  
  canUndo(): boolean {
    return this.currentIndex > 0
  }
  
  canRedo(): boolean {
    return this.currentIndex < this.versions.length - 1
  }
}
```

**File: `components/chat-interface.tsx` - ADD UNDO BUTTONS**
```typescript
import { VersionManager } from '@/lib/version-manager'

export default function ChatInterface() {
  const [versionManager] = useState(() => new VersionManager())
  
  const handleUndo = async () => {
    const webcontainer = WebContainerService.getInstance()
    const success = await versionManager.undo(webcontainer)
    if (success) {
      await refreshFiles()
    }
  }
  
  const handleRedo = async () => {
    const webcontainer = WebContainerService.getInstance()
    const success = await versionManager.redo(webcontainer)
    if (success) {
      await refreshFiles()
    }
  }
  
  // In handleApproveChanges, create version
  const handleApproveChanges = async () => {
    // ... existing code ...
    
    // Create version snapshot
    const filesMap = new Map(Object.entries(fileContents))
    versionManager.createVersion('AI changes applied', filesMap)
  }
  
  return (
    <div>
      {/* Add undo/redo buttons */}
      <div className="flex gap-2">
        <Button 
          onClick={handleUndo} 
          disabled={!versionManager.canUndo()}
        >
          ↶ Undo
        </Button>
        <Button 
          onClick={handleRedo} 
          disabled={!versionManager.canRedo()}
        >
          ↷ Redo
        </Button>
      </div>
      
      {/* ... rest of UI ... */}
    </div>
  )
}
```

---

### 5. **Better Model Support** (Priority: 🎯 HIGH)

#### Dyad Has:
```
src/hooks/useLanguageModelProviders.ts    # Multiple providers
src/hooks/useLanguageModelsByProviders.ts # Model selection
src/components/ModelPicker.tsx            # Model picker UI
src/ipc/utils/get_model_client.ts         # Get AI client
src/ipc/shared/language_model_constants.ts # Model configs
```

#### You Need to Add:
```
lib/model-config.ts                       # NEW: Model configurations
components/model-selector.tsx             # NEW: Model picker UI
hooks/useModelSelection.ts                # NEW: Model state
```

#### Implementation:
**File: `lib/model-config.ts`**
```typescript
export interface ModelConfig {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google'
  contextWindow: number
  costPer1kInput: number
  costPer1kOutput: number
  supportsStreaming: boolean
}

export const MODELS: ModelConfig[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    contextWindow: 16000,
    costPer1kInput: 0.0005,
    costPer1kOutput: 0.0015,
    supportsStreaming: true
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    contextWindow: 128000,
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.01,
    supportsStreaming: true
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    contextWindow: 200000,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    supportsStreaming: true
  }
]

export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find(m => m.id === id)
}
```

**File: `components/model-selector.tsx`**
```typescript
'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MODELS } from '@/lib/model-config'

export function ModelSelector({ value, onChange }: { 
  value: string
  onChange: (value: string) => void 
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        {MODELS.map(model => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex flex-col">
              <span>{model.name}</span>
              <span className="text-xs text-gray-500">
                {model.contextWindow.toLocaleString()} tokens • 
                ${model.costPer1kInput}/1K in
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

**File: `app/api/chat/route.ts` - UPDATE**
```typescript
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { getModelById } from '@/lib/model-config'

export async function POST(req: Request) {
  const { messages, modelId = 'gpt-3.5-turbo' } = await req.json()
  
  const modelConfig = getModelById(modelId)
  if (!modelConfig) {
    return new Response('Invalid model', { status: 400 })
  }
  
  let model
  if (modelConfig.provider === 'openai') {
    model = openai(modelConfig.id)
  } else if (modelConfig.provider === 'anthropic') {
    model = anthropic(modelConfig.id)
  }
  
  const result = await streamText({ model, messages, system: SYSTEM_PROMPT })
  return result.toTextStreamResponse()
}
```

---

## Summary: Files to Create

### Critical (Do First)
1. ✅ `lib/context-manager.ts` - Context awareness
2. ✅ `lib/file-history.ts` - File versioning
3. ✅ `lib/rollback-manager.ts` - Error rollback
4. ✅ `components/error-display.tsx` - Error UI

### High Priority (Do Next)
5. ✅ `lib/import-analyzer.ts` - Import validation
6. ✅ `lib/dependency-graph.ts` - File dependencies
7. ✅ `lib/version-manager.ts` - Undo/redo
8. ✅ `components/version-history.tsx` - Version UI
9. ✅ `lib/model-config.ts` - Model configurations
10. ✅ `components/model-selector.tsx` - Model picker

### Updates Needed
- ✅ `app/api/chat/route.ts` - Add context, model selection
- ✅ `lib/response-processor.ts` - Add error handling, rollback
- ✅ `components/chat-interface.tsx` - Add undo/redo buttons, error display
- ✅ `app/page.tsx` - Pass context to API

---

## Implementation Order

### Week 1: Context Awareness
1. Create `lib/context-manager.ts`
2. Update `app/api/chat/route.ts` to include context
3. Test with file tree context

### Week 2: Error Handling
1. Create `lib/file-history.ts`
2. Update `lib/response-processor.ts` with rollback
3. Create `components/error-display.tsx`
4. Test error scenarios

### Week 3: Undo/Redo
1. Create `lib/version-manager.ts`
2. Add undo/redo buttons to UI
3. Test version switching

### Week 4: Model Selection
1. Create `lib/model-config.ts`
2. Create `components/model-selector.tsx`
3. Update API to support multiple models
4. Add cost tracking

---

## Key Differences from Dyad

### What Dyad Has That You Don't Need:
- ❌ Electron-specific code (you use WebContainer)
- ❌ Git integration (WebContainer limitation)
- ❌ MCP tools (Model Context Protocol)
- ❌ Supabase/Neon integration
- ❌ GitHub sync
- ❌ Vercel deployment
- ❌ Desktop app features

### What You Should Add (Inspired by Dyad):
- ✅ Context awareness (critical)
- ✅ Error handling & rollback (critical)
- ✅ Undo/redo system (high priority)
- ✅ Model selection (high priority)
- ✅ Import validation (medium priority)
- ✅ Better approval UI (medium priority)

---

## Conclusion

Dyad has a much more mature architecture with ~100+ files. You don't need all of them, but the 5 core improvements listed above will bring your v0-clone to production quality.

Focus on:
1. **Context awareness** - So AI knows what files exist
2. **Error handling** - So failures don't break the app
3. **Undo/redo** - So users can revert mistakes
4. **Model selection** - So users can choose quality vs cost
5. **Import validation** - So generated code actually works

These 5 features will make your system 10x more useful! 🚀
