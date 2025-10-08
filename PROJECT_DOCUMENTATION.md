# V0 Clone - Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Current Implementation](#current-implementation)
3. [Architecture & How It Works](#architecture--how-it-works)
4. [What's Missing - Agentic File Editing](#whats-missing---agentic-file-editing)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Technical Stack](#technical-stack)

---

## 🎯 Project Overview

This is a **v0.vercel.app clone** - an AI-powered code generation and development environment that runs entirely in the browser. The project combines:
- **AI Chat Interface** (Mistral AI) for code generation
- **Monaco Code Editor** for editing files
- **WebContainer** (StackBlitz) for running Node.js in the browser
- **File System Management** for project structure
- **Live Preview** with hot reload

### Current Status
✅ **Working**: AI chat, code generation, file display, WebContainer setup, preview panel  
⚠️ **Partial**: File editing syncs to WebContainer but no agent-driven editing  
❌ **Missing**: Agentic file editing framework (the main TODO)

---

## 🏗️ Current Implementation

### 1. **AI Chat System** (`components/chat-interface.tsx`)
- **Mistral AI Integration**: Uses `mistral-large-latest` model
- **Three Agent Modes**:
  - **Default Agent**: General code generation
  - **Web Agent**: Web search capabilities via MCP (Model Context Protocol)
  - **GitHub Agent**: Code search in repositories via Sourcebot
- **Auto-Apply Feature**: Automatically applies generated code to files
- **Markdown Rendering**: Displays code blocks with syntax highlighting
- **Copy & Apply Buttons**: Manual code application

**How it works:**
```typescript
// User sends message → API route processes → Streams response
const response = await fetch("/api/chat", {
  method: "POST",
  body: JSON.stringify({ messages, agent })
})
// Code blocks are extracted and auto-applied
onCodeGenerated(block.code, block.filename)
```

### 2. **WebContainer Integration** (`lib/webcontainer.ts`)
- **Singleton Pattern**: One WebContainer instance per session
- **File System Operations**: Mount, read, write files
- **Dev Server Management**: Install deps, start Vite server
- **Cross-Origin Isolation**: Required for WebContainer to work

**Key Features:**
```typescript
class WebContainerService {
  async boot()                    // Initialize WebContainer
  async mountFiles(tree)          // Load file structure
  async writeFile(path, content)  // Update files
  async installDependencies()     // npm install
  async startDevServer()          // Start Vite dev server
  async stopDevServer()           // Stop server
}
```

**Current Flow:**
1. Page loads → WebContainer boots
2. Algorand template files mounted
3. User clicks "Run" → Dependencies install → Dev server starts
4. Preview panel shows live app at WebContainer URL

### 3. **File System** (`components/file-explorer.tsx`, `components/code-editor.tsx`)
- **File Explorer**: Tree view with expand/collapse, search, create/delete
- **Monaco Editor**: Full-featured code editor with TypeScript support
- **File Sync**: Changes in editor sync to WebContainer
- **Static File Tree**: Pre-loaded Algorand React starter template

**File Operations:**
```typescript
// User edits file in Monaco
handleFileChange(path, content) → 
  setFileContents() → 
  webcontainer.writeFile(path, content)
```

### 4. **Preview Panel** (`components/preview-panel.tsx`)
- **Responsive Viewport**: Desktop, tablet, mobile views
- **Live Reload**: iframe shows WebContainer dev server
- **Error Handling**: Connection status, retry logic
- **External Link**: Open in new tab

### 5. **API Routes**
- **`/api/chat`**: Main chat endpoint, routes to agents
- **`/api/web-agent`**: Web search via Smithery MCP
- **`/api/github-agent`**: GitHub code search via Sourcebot MCP

---

## 🔧 Architecture & How It Works

### Data Flow Diagram
```
┌─────────────────┐
│   User Input    │
│  (Chat/Editor)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Chat Interface │─────▶│  API Routes  │
│   (Frontend)    │      │  (Mistral AI)│
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│ Code Generation │
│  (AI Response)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  File Contents  │─────▶│ WebContainer │
│   (State Mgmt)  │      │ (File System)│
└────────┬────────┘      └──────┬───────┘
         │                      │
         ▼                      ▼
┌─────────────────┐      ┌──────────────┐
│  Monaco Editor  │      │  Dev Server  │
│  (Code Display) │      │   (Vite)     │
└─────────────────┘      └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │Preview Panel │
                         │   (iframe)   │
                         └──────────────┘
```

### State Management
```typescript
// Main state in app/page.tsx
const [projectState, setProjectState] = useState<ProjectState>({
  files: [],              // File tree structure
  activeFile: null,       // Currently open file
  isRunning: false,       // Dev server status
  terminal: {...}         // Terminal logs
})

const [fileContents, setFileContents] = useState<Record<string, string>>({})
const [previewUrl, setPreviewUrl] = useState<string>()
```

### WebContainer Lifecycle
```
1. Page Load
   ↓
2. WebContainer.boot() - Initialize browser-based Node.js
   ↓
3. Mount Algorand template files
   ↓
4. User clicks "Run"
   ↓
5. npm install --legacy-peer-deps
   ↓
6. npm run dev (Vite server)
   ↓
7. server-ready event → Get URL
   ↓
8. Preview panel loads iframe with URL
```

---

## ❌ What's Missing - Agentic File Editing

### The Problem (Your Friend's Request)
Currently, the AI generates code and it gets applied to files, but there's **no intelligent agent** that can:
1. **Understand the existing codebase** in WebContainer
2. **Make contextual edits** (not just replace entire files)
3. **Execute multi-file changes** as a coordinated operation
4. **Validate changes** before applying
5. **Rollback** if something breaks

### What You Need to Build

#### **Framework for Agentic File Editing**
An agent system that can:
- **Read** the current state of files in WebContainer
- **Analyze** the code structure and dependencies
- **Plan** multi-step edits (e.g., "add a new component and import it in App.tsx")
- **Execute** edits using WebContainer file system
- **Verify** the changes work (run build, check for errors)

### Current vs. Desired Flow

**Current (Dumb Apply):**
```
AI generates code → Extract code block → Replace entire file → Done
```

**Desired (Agentic Editing):**
```
User: "Add a login button to the header"
  ↓
Agent reads: Header.tsx, App.tsx, existing components
  ↓
Agent plans:
  1. Create LoginButton.tsx component
  2. Import in Header.tsx
  3. Add state management if needed
  4. Update styles
  ↓
Agent executes edits in WebContainer
  ↓
Agent validates: Check TypeScript errors, run build
  ↓
Agent reports: "✅ Added login button with 3 file changes"
```

---

## 🚀 Implementation Roadmap

### Phase 1: Agent Framework Foundation

#### 1.1 Create Agent Service (`lib/agent-service.ts`)
```typescript
class AgentService {
  private webcontainer: WebContainerService
  private fileAnalyzer: FileAnalyzer
  
  async analyzeCodebase(): Promise<CodebaseContext> {
    // Read all files from WebContainer
    // Build dependency graph
    // Identify components, imports, exports
  }
  
  async planEdits(userIntent: string): Promise<EditPlan> {
    // Use AI to create step-by-step edit plan
    // Identify which files need changes
    // Determine order of operations
  }
  
  async executeEdits(plan: EditPlan): Promise<EditResult> {
    // Apply changes to WebContainer files
    // Track each change for rollback
    // Validate after each step
  }
  
  async validateChanges(): Promise<ValidationResult> {
    // Run TypeScript compiler
    // Check for build errors
    // Verify imports resolve
  }
  
  async rollback(changeId: string): Promise<void> {
    // Restore previous file states
  }
}
```

#### 1.2 File Analysis System (`lib/file-analyzer.ts`)
```typescript
class FileAnalyzer {
  async parseFile(path: string): Promise<FileAST> {
    // Parse TypeScript/JavaScript with Babel or TS compiler
    // Extract imports, exports, functions, components
  }
  
  async buildDependencyGraph(): Promise<DependencyGraph> {
    // Map which files depend on which
    // Identify circular dependencies
  }
  
  async findReferences(symbol: string): Promise<Reference[]> {
    // Find all usages of a function/component
  }
}
```

#### 1.3 Edit Planner (`lib/edit-planner.ts`)
```typescript
interface EditPlan {
  steps: EditStep[]
  affectedFiles: string[]
  estimatedComplexity: number
}

interface EditStep {
  type: 'create' | 'modify' | 'delete' | 'move'
  file: string
  changes: CodeChange[]
  dependencies: string[] // Which steps must complete first
}

class EditPlanner {
  async createPlan(
    intent: string, 
    context: CodebaseContext
  ): Promise<EditPlan> {
    // Use AI to generate structured edit plan
    // Consider existing code structure
    // Minimize breaking changes
  }
}
```

### Phase 2: AI Integration for Editing

#### 2.1 Create Editing Agent API (`app/api/edit-agent/route.ts`)
```typescript
export async function POST(req: Request) {
  const { intent, files } = await req.json()
  
  // 1. Analyze current codebase
  const context = await agentService.analyzeCodebase()
  
  // 2. Create edit plan
  const plan = await agentService.planEdits(intent, context)
  
  // 3. Get AI approval/refinement
  const refinedPlan = await refineWithAI(plan)
  
  // 4. Execute edits
  const result = await agentService.executeEdits(refinedPlan)
  
  // 5. Validate
  const validation = await agentService.validateChanges()
  
  return Response.json({ result, validation })
}
```

#### 2.2 Prompt Engineering for Edits
```typescript
const EDIT_SYSTEM_PROMPT = `
You are a code editing agent. Given a user's intent and the current codebase context, 
create a detailed edit plan.

Context includes:
- File structure
- Existing components and their props
- Import/export relationships
- Styling approach (Tailwind, CSS modules, etc.)

Your edit plan must:
1. Preserve existing functionality
2. Follow the project's coding patterns
3. Update all dependent files
4. Be executable step-by-step

Output format: JSON with EditPlan structure
`
```

### Phase 3: UI Integration

#### 3.1 Agent Panel Component (`components/agent-panel.tsx`)
```typescript
export function AgentPanel() {
  const [editPlan, setEditPlan] = useState<EditPlan | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  
  return (
    <div className="agent-panel">
      {/* Show edit plan before executing */}
      {editPlan && (
        <div>
          <h3>Proposed Changes</h3>
          {editPlan.steps.map(step => (
            <div key={step.file}>
              <FileIcon /> {step.file}
              <Badge>{step.type}</Badge>
            </div>
          ))}
          <Button onClick={executeEdits}>Apply Changes</Button>
          <Button onClick={rejectPlan}>Cancel</Button>
        </div>
      )}
      
      {/* Show execution progress */}
      {isExecuting && (
        <Progress steps={editPlan.steps} />
      )}
    </div>
  )
}
```

#### 3.2 Diff Viewer (`components/diff-viewer.tsx`)
```typescript
export function DiffViewer({ before, after, filename }) {
  return (
    <div className="diff-viewer">
      <div className="split-view">
        <div className="before">
          <h4>Before</h4>
          <SyntaxHighlighter>{before}</SyntaxHighlighter>
        </div>
        <div className="after">
          <h4>After</h4>
          <SyntaxHighlighter>{after}</SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}
```

### Phase 4: Advanced Features

#### 4.1 Change History & Rollback
```typescript
class ChangeHistory {
  private history: Change[] = []
  
  async recordChange(change: Change): Promise<void> {
    this.history.push({
      id: generateId(),
      timestamp: Date.now(),
      files: change.files,
      beforeState: await this.captureState(change.files),
      afterState: change.afterState
    })
  }
  
  async rollback(changeId: string): Promise<void> {
    const change = this.history.find(c => c.id === changeId)
    await this.restoreState(change.beforeState)
  }
}
```

#### 4.2 Validation & Testing
```typescript
class ChangeValidator {
  async validate(changes: Change[]): Promise<ValidationResult> {
    const results = await Promise.all([
      this.checkTypeScript(),
      this.checkImports(),
      this.checkBuild(),
      this.runTests() // If tests exist
    ])
    
    return {
      isValid: results.every(r => r.success),
      errors: results.flatMap(r => r.errors),
      warnings: results.flatMap(r => r.warnings)
    }
  }
}
```

#### 4.3 Conflict Resolution
```typescript
class ConflictResolver {
  async detectConflicts(
    plan: EditPlan, 
    currentState: FileState
  ): Promise<Conflict[]> {
    // Check if files changed since plan was created
    // Detect merge conflicts
  }
  
  async resolveConflict(conflict: Conflict): Promise<Resolution> {
    // Use AI to merge changes intelligently
    // Preserve both user edits and agent edits
  }
}
```

---

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4.17
- **Components**: Radix UI (shadcn/ui)
- **Editor**: Monaco Editor (VS Code editor)
- **Icons**: Lucide React

### Backend / AI
- **AI SDK**: Vercel AI SDK (`ai` package)
- **LLM**: Mistral AI (`mistral-large-latest`)
- **MCP**: Model Context Protocol SDK
- **Agents**: Smithery SDK for Web/GitHub agents

### Browser Runtime
- **WebContainer**: StackBlitz WebContainer API
- **Node.js**: Runs in browser via WebAssembly
- **Package Manager**: npm (in WebContainer)
- **Dev Server**: Vite (in WebContainer)

### File System
- **Static Tree**: Pre-loaded Algorand template
- **Dynamic Updates**: Real-time file sync
- **Format**: WebContainer FileSystemTree format

### Development
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript strict mode

---

## 📝 Key Files Reference

### Core Application
- `app/page.tsx` - Main application, state management
- `app/layout.tsx` - Root layout, theme provider
- `app/globals.css` - Global styles

### Components
- `components/chat-interface.tsx` - AI chat UI
- `components/code-editor.tsx` - Monaco editor wrapper
- `components/file-explorer.tsx` - File tree navigation
- `components/preview-panel.tsx` - Live preview iframe
- `components/terminal.tsx` - Terminal output display
- `components/layout/header.tsx` - Top navigation bar
- `components/layout/resizable-panels.tsx` - Split view layout

### API Routes
- `app/api/chat/route.ts` - Main chat endpoint
- `app/api/web-agent/route.ts` - Web search agent
- `app/api/github-agent/route.ts` - GitHub code search

### Libraries
- `lib/webcontainer.ts` - WebContainer service
- `lib/static-file-tree.ts` - Algorand template files
- `lib/types.ts` - TypeScript interfaces
- `lib/utils.ts` - Utility functions

### Configuration
- `next.config.mjs` - Next.js config (CORS headers for WebContainer)
- `tailwind.config.ts` - Tailwind CSS config
- `tsconfig.json` - TypeScript config
- `components.json` - shadcn/ui config

---

## 🎯 Next Steps for Agentic File Editing

### Immediate Actions
1. **Create `lib/agent-service.ts`** - Core agent logic
2. **Add TypeScript parser** - Use `@babel/parser` or `typescript` compiler API
3. **Build file analyzer** - Extract imports, exports, components
4. **Create edit planner** - AI-powered edit plan generation
5. **Add validation** - TypeScript checking, build verification

### Integration Points
1. **Chat Interface** - Add "Agent Mode" toggle
2. **File Explorer** - Show pending changes indicator
3. **Editor** - Highlight agent-modified lines
4. **Terminal** - Show agent execution logs
5. **Preview** - Auto-refresh after agent edits

### Testing Strategy
1. **Unit Tests** - Test file analyzer, edit planner
2. **Integration Tests** - Test full agent workflow
3. **E2E Tests** - Test UI interactions
4. **Manual Testing** - Try complex multi-file edits

---

## 🔐 Environment Variables

Required in `.env`:
```bash
# Mistral AI API Key (for chat)
MISTRAL_API_KEY=your_mistral_key

# Smithery API Key (for Web/GitHub agents)
SMITHERY_API_KEY=your_smithery_key
```

---

## 🚨 Important Notes

### WebContainer Requirements
- **Cross-Origin Isolation**: Must serve with these headers:
  ```
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  ```
  (Already configured in `next.config.mjs`)

- **Browser Support**: Chrome, Edge, Opera (not Firefox/Safari yet)

### Performance Considerations
- WebContainer boot time: ~2-3 seconds
- npm install time: ~30-60 seconds (first time)
- File sync: Real-time (< 100ms)
- AI response: 2-10 seconds depending on complexity

### Limitations
- **No Backend**: Everything runs in browser
- **No Persistent Storage**: Files lost on refresh (can add localStorage)
- **Memory Limits**: Browser memory constraints
- **No Native Modules**: Only pure JS/TS packages work

---

## 📚 Resources

### Documentation
- [WebContainer API Docs](https://webcontainers.io/api)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Mistral AI](https://docs.mistral.ai/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

### Similar Projects
- [v0.dev](https://v0.vercel.app/) - Original inspiration
- [bolt.new](https://bolt.new/) - StackBlitz's AI IDE
- [CodeSandbox](https://codesandbox.io/) - Online IDE

---

## 🤝 Contributing

To add the agentic file editing feature:

1. **Fork & Clone** the repository
2. **Install dependencies**: `pnpm install`
3. **Set up environment**: Copy `.env.example` to `.env`
4. **Start dev server**: `pnpm dev`
5. **Implement agent service** following the roadmap above
6. **Test thoroughly** with various edit scenarios
7. **Submit PR** with detailed description

---

## 📄 License

This project is for educational purposes. Check individual package licenses for production use.

---

**Last Updated**: January 2025  
**Version**: 0.1.0  
**Status**: Active Development - Agentic Editing Feature Pending
