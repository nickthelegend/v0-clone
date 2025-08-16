"use client"

import { WebContainer } from "@webcontainer/api"

export class WebContainerService {
  private static instance: WebContainerService
  private webcontainer: WebContainer | null = null
  private isBooting = false

  static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService()
    }
    return WebContainerService.instance
  }

  async boot(): Promise<WebContainer> {
    if (this.webcontainer) {
      return this.webcontainer
    }

    if (this.isBooting) {
      // Wait for existing boot process
      while (this.isBooting) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      return this.webcontainer!
    }

    this.isBooting = true

    try {
      console.log("[v0] Booting WebContainer...")
      this.webcontainer = await WebContainer.boot()
      console.log("[v0] WebContainer booted successfully")

      // Mount initial files
      await this.mountInitialFiles()

      return this.webcontainer
    } catch (error) {
      console.error("[v0] Failed to boot WebContainer:", error)
      throw error
    } finally {
      this.isBooting = false
    }
  }

  private async mountInitialFiles() {
    if (!this.webcontainer) return

    const files = {
      "package.json": {
        file: {
          contents: JSON.stringify(
            {
              name: "v0-clone-project",
              type: "module",
              dependencies: {
                react: "^18.2.0",
                "react-dom": "^18.2.0",
                vite: "^4.4.5",
                "@vitejs/plugin-react": "^4.0.3",
              },
              scripts: {
                dev: "vite",
                build: "vite build",
                preview: "vite preview",
              },
            },
            null,
            2,
          ),
        },
      },
      "vite.config.js": {
        file: {
          contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
})`,
        },
      },
      "index.html": {
        file: {
          contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>v0 Clone Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
        },
      },
      src: {
        directory: {
          "main.jsx": {
            file: {
              contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
            },
          },
          "App.jsx": {
            file: {
              contents: `import React from 'react'

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Welcome to v0 Clone!</h1>
      <p>Start chatting with the AI to generate code.</p>
      <p>Your generated components will appear here.</p>
    </div>
  )
}

export default App`,
            },
          },
        },
      },
    }

    await this.webcontainer.mount(files)
    console.log("[v0] Initial files mounted")
  }

  async writeFile(path: string, content: string) {
    if (!this.webcontainer) {
      await this.boot()
    }

    await this.webcontainer!.fs.writeFile(path, content)
    console.log(`[v0] File written: ${path}`)
  }

  async readFile(path: string): Promise<string> {
    if (!this.webcontainer) {
      await this.boot()
    }

    try {
      const content = await this.webcontainer!.fs.readFile(path, "utf-8")
      return content
    } catch (error) {
      console.error(`[v0] Failed to read file ${path}:`, error)
      return ""
    }
  }

  async installDependencies(): Promise<void> {
    if (!this.webcontainer) {
      await this.boot()
    }

    console.log("[v0] Installing dependencies...")
    const installProcess = await this.webcontainer!.spawn("npm", ["install"])

    return new Promise((resolve, reject) => {
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log("[v0] npm install:", data)
          },
        }),
      )

      installProcess.exit.then((code) => {
        if (code === 0) {
          console.log("[v0] Dependencies installed successfully")
          resolve()
        } else {
          console.error("[v0] Failed to install dependencies")
          reject(new Error(`npm install failed with code ${code}`))
        }
      })
    })
  }

  async startDevServer(): Promise<string> {
    if (!this.webcontainer) {
      await this.boot()
    }

    console.log("[v0] Starting dev server...")
    const serverProcess = await this.webcontainer!.spawn("npm", ["run", "dev"])

    return new Promise((resolve, reject) => {
      serverProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log("[v0] dev server:", data)
            // Look for the local server URL
            if (data.includes("Local:")) {
              const match = data.match(/Local:\s+(https?:\/\/[^\s]+)/)
              if (match) {
                resolve(match[1])
              }
            }
          },
        }),
      )

      // Fallback: resolve with default URL after a delay
      setTimeout(() => {
        this.webcontainer!.on("server-ready", (port, url) => {
          console.log("[v0] Server ready:", { port, url })
          resolve(url)
        })
      }, 3000)
    })
  }

  async runCommand(command: string, args: string[] = []): Promise<string> {
    if (!this.webcontainer) {
      await this.boot()
    }

    console.log(`[v0] Running command: ${command} ${args.join(" ")}`)
    const process = await this.webcontainer!.spawn(command, args)

    return new Promise((resolve) => {
      let output = ""

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output += data
            console.log(`[v0] ${command}:`, data)
          },
        }),
      )

      process.exit.then(() => {
        resolve(output)
      })
    })
  }

  async getFileTree(path = "."): Promise<any> {
    if (!this.webcontainer) {
      await this.boot()
    }

    try {
      const entries = await this.webcontainer!.fs.readdir(path, { withFileTypes: true })
      const tree: any = {}

      for (const entry of entries) {
        const fullPath = path === "." ? entry.name : `${path}/${entry.name}`

        if (entry.isDirectory()) {
          tree[entry.name] = {
            type: "directory",
            children: await this.getFileTree(fullPath),
          }
        } else {
          tree[entry.name] = {
            type: "file",
            path: fullPath,
          }
        }
      }

      return tree
    } catch (error) {
      console.error(`[v0] Failed to read directory ${path}:`, error)
      return {}
    }
  }
}
