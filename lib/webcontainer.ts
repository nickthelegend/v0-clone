"use client"

import { WebContainer } from "@webcontainer/api"

export class WebContainerService {
  private static instance: WebContainerService | null = null
  private webcontainer: WebContainer | null = null
  private isBooting = false
  private bootPromise: Promise<WebContainer> | null = null
  private devServerProcess: any = null
  private serverUrl: string | null = null
  private initializationFailed = false

  static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService()
    }
    return WebContainerService.instance
  }

  private checkCrossOriginIsolation(): boolean {
    return typeof window !== "undefined" && window.crossOriginIsolated === true
  }

  async boot(): Promise<WebContainer> {
    // Return existing instance if available
    if (this.webcontainer) {
      return this.webcontainer
    }

    // Return existing boot promise if already booting
    if (this.bootPromise) {
      return this.bootPromise
    }

    // Don't retry if initialization previously failed
    if (this.initializationFailed) {
      throw new Error("WebContainer initialization previously failed. Please refresh the page.")
    }

    if (!this.checkCrossOriginIsolation()) {
      this.initializationFailed = true
      throw new Error(
        "WebContainer requires cross-origin isolation. Please ensure the page is served with proper headers.",
      )
    }

    // Create and store the boot promise
    this.bootPromise = this.performBoot()

    try {
      const container = await this.bootPromise
      this.webcontainer = container
      return container
    } catch (error) {
      this.initializationFailed = true
      this.bootPromise = null
      throw error
    }
  }

  private async performBoot(): Promise<WebContainer> {
    console.log("[v0] Booting WebContainer...")

    try {
      const container = await WebContainer.boot()
      console.log("[v0] WebContainer booted successfully")

      // Mount Algorand template files
      await this.mountAlgorandTemplate(container)

      return container
    } catch (error) {
      console.error("[v0] Failed to boot WebContainer:", error)
      throw error
    }
  }

  private async mountAlgorandTemplate(container: WebContainer) {
    const files = {
      "package.json": {
        file: {
          contents: JSON.stringify(
            {
              name: "algorand-react-starter",
              private: true,
              version: "0.0.0",
              type: "module",
              scripts: {
                dev: "vite",
                build: "vite build",
                lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
                preview: "vite preview",
              },
              dependencies: {
                "@algorandfoundation/algokit-utils": "^6.0.4",
                "@blockshake/defly-connect": "^1.1.6",
                "@perawallet/connect": "^1.3.4",
                "@txnlab/use-wallet": "^2.6.1",
                "@walletconnect/modal": "^2.6.2",
                algosdk: "^2.7.0",
                react: "^18.2.0",
                "react-dom": "^18.2.0",
              },
              devDependencies: {
                "@types/react": "^18.2.66",
                "@types/react-dom": "^18.2.22",
                "@typescript-eslint/eslint-plugin": "^7.2.0",
                "@typescript-eslint/parser": "^7.2.0",
                "@vitejs/plugin-react": "^4.2.1",
                autoprefixer: "^10.4.19",
                eslint: "^8.57.0",
                "eslint-plugin-react-hooks": "^4.6.0",
                "eslint-plugin-react-refresh": "^0.4.6",
                postcss: "^8.4.38",
                tailwindcss: "^3.4.3",
                typescript: "^5.2.2",
                vite: "^5.2.0",
                "vite-plugin-node-polyfills": "^0.21.0",
              },
            },
            null,
            2,
          ),
        },
      },
      "vite.config.ts": {
        file: {
          contents: `import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
  },
})`,
        },
      },
      "index.html": {
        file: {
          contents: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/algorand.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Algorand React Starter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
        },
      },
      "tailwind.config.js": {
        file: {
          contents: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
        },
      },
      "postcss.config.js": {
        file: {
          contents: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
        },
      },
      "tsconfig.json": {
        file: {
          contents: JSON.stringify(
            {
              compilerOptions: {
                target: "ES2020",
                useDefineForClassFields: true,
                lib: ["ES2020", "DOM", "DOM.Iterable"],
                module: "ESNext",
                skipLibCheck: true,
                moduleResolution: "bundler",
                allowImportingTsExtensions: true,
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: true,
                jsx: "react-jsx",
                strict: true,
                noUnusedLocals: true,
                noUnusedParameters: true,
                noFallthroughCasesInSwitch: true,
              },
              include: ["src"],
              references: [{ path: "./tsconfig.node.json" }],
            },
            null,
            2,
          ),
        },
      },
      src: {
        directory: {
          "main.tsx": {
            file: {
              contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
            },
          },
          "App.tsx": {
            file: {
              contents: `import React from 'react'
import { WalletProvider } from '@txnlab/use-wallet'
import { DeflyWalletConnect } from '@blockshake/defly-connect'
import { PeraWalletConnect } from '@perawallet/connect'

const walletConnectors = [
  {
    id: 'defly',
    name: 'Defly',
    connector: new DeflyWalletConnect(),
  },
  {
    id: 'pera',
    name: 'Pera',
    connector: new PeraWalletConnect(),
  },
]

function App() {
  return (
    <WalletProvider value={{ connectors: walletConnectors }}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Algorand React Starter
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    Welcome to Algorand Development!
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Start building your decentralized application with Algorand blockchain.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
                      • Connect your wallet to get started
                    </p>
                    <p className="text-sm text-gray-400">
                      • Build smart contracts with ease
                    </p>
                    <p className="text-sm text-gray-400">
                      • Deploy to Algorand TestNet or MainNet
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </WalletProvider>
  )
}

export default App`,
            },
          },
          "index.css": {
            file: {
              contents: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}`,
            },
          },
        },
      },
      public: {
        directory: {
          "algorand.svg": {
            file: {
              contents: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#000"/>
<path d="M12.5 8L19.5 24H16.5L15 20H9L10.5 16H13.5L12.5 8Z" fill="#FFF"/>
<path d="M19.5 8L22.5 16H19.5L18.5 13H15.5L17 9H20L19.5 8Z" fill="#FFF"/>
</svg>`,
            },
          },
        },
      },
    }

    await container.mount(files)
    console.log("[v0] Algorand template files mounted")
  }

  async mountFiles(fileSystemTree: any): Promise<void> {
    try {
      if (!this.webcontainer) {
        await this.boot()
      }

      console.log("[v0] Mounting external files to WebContainer...")
      await this.webcontainer!.mount(fileSystemTree)
      console.log("[v0] External files mounted successfully")
    } catch (error) {
      console.error("[v0] Failed to mount external files:", error)
      throw error
    }
  }

  async connectToEndpoint(endpoint: string): Promise<void> {
    try {
      console.log(`[v0] Connecting to WebContainer endpoint: ${endpoint}`)

      if (!this.webcontainer) {
        await this.boot()
      }

      // WebContainer connection logic would go here
      // This is a placeholder for the actual connection implementation
      console.log(`[v0] Connected to endpoint: ${endpoint}`)
    } catch (error) {
      console.error(`[v0] Failed to connect to endpoint ${endpoint}:`, error)
      throw error
    }
  }

  async writeFile(path: string, content: string) {
    try {
      if (!this.webcontainer) {
        await this.boot()
      }

      await this.webcontainer!.fs.writeFile(path, content)
      console.log(`[v0] File written: ${path}`)
    } catch (error) {
      console.error(`[v0] Failed to write file ${path}:`, error)
      throw error
    }
  }

  async readFile(path: string): Promise<string> {
    try {
      if (!this.webcontainer) {
        await this.boot()
      }

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

    try {
      // Use npm install with specific flags for better compatibility
      const installProcess = await this.webcontainer!.spawn("npm", ["install", "--legacy-peer-deps"])

      return new Promise((resolve, reject) => {
        let output = ""

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              output += data
              console.log("[v0] npm install:", data)
            },
          }),
        )

        installProcess.exit.then((code) => {
          if (code === 0) {
            console.log("[v0] Dependencies installed successfully")
            resolve()
          } else {
            console.error("[v0] Failed to install dependencies, exit code:", code)
            console.error("[v0] Install output:", output)
            reject(new Error(`npm install failed with code ${code}`))
          }
        })
      })
    } catch (error) {
      console.error("[v0] Error during dependency installation:", error)
      throw error
    }
  }

  async startDevServer(): Promise<string> {
    if (!this.webcontainer) {
      await this.boot()
    }

    // Stop existing server if running
    if (this.devServerProcess) {
      try {
        this.devServerProcess.kill()
      } catch (error) {
        console.log("[v0] Error stopping existing server:", error)
      }
    }

    console.log("[v0] Starting dev server with WebContainer spawn...")

    return new Promise((resolve, reject) => {
      // Listen for server-ready event first
      this.webcontainer!.on("server-ready", (port, url) => {
        console.log(`[v0] Server ready on port ${port}, URL: ${url}`)
        this.serverUrl = url
        resolve(url)
      })

      // Then spawn the dev server
      this.webcontainer!.spawn("npm", ["run", "dev"])
        .then((process) => {
          this.devServerProcess = process

          process.output.pipeTo(
            new WritableStream({
              write: (data) => {
                console.log("[v0] dev server output:", data)
              },
            }),
          )

          // Handle server exit
          process.exit.then((code: number) => {
            console.log(`[v0] Dev server exited with code ${code}`)
            if (code !== 0) {
              reject(new Error(`Dev server failed to start with code ${code}`))
            }
          })
        })
        .catch((error) => {
          console.error("[v0] Failed to spawn dev server:", error)
          reject(error)
        })

      // Fallback timeout
      setTimeout(() => {
        if (!this.serverUrl) {
          reject(new Error("Server failed to start within timeout"))
        }
      }, 30000)
    })
  }

  async stopDevServer(): Promise<void> {
    if (this.devServerProcess) {
      try {
        this.devServerProcess.kill()
        this.devServerProcess = null
        this.serverUrl = null
        console.log("[v0] Dev server stopped")
      } catch (error) {
        console.error("[v0] Error stopping dev server:", error)
      }
    }
  }

  getServerUrl(): string | null {
    return this.serverUrl
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
    try {
      if (!this.webcontainer) {
        await this.boot()
      }

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
      console.error(`[v0] Failed to refresh file tree: ${error}`)
      throw error
    }
  }

  async deleteFile(path: string): Promise<void> {
    if (!this.webcontainer) await this.boot()
    try {
      await this.webcontainer!.fs.rm(path, { recursive: true })
      console.log(`[v0] File deleted: ${path}`)
    } catch (error) {
      console.error(`[v0] Failed to delete ${path}:`, error)
      throw error
    }
  }

  async installPackage(packageName: string): Promise<void> {
    if (!this.webcontainer) await this.boot()
    
    console.log(`[v0] Installing package: ${packageName}`)
    const process = await this.webcontainer!.spawn('npm', [
      'install',
      packageName,
      '--save',
      '--legacy-peer-deps'
    ])
    
    return new Promise((resolve, reject) => {
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(`[v0] npm install ${packageName}:`, data)
          },
        }),
      )

      process.exit.then((code) => {
        if (code === 0) {
          console.log(`[v0] Package installed: ${packageName}`)
          resolve()
        } else {
          reject(new Error(`Failed to install ${packageName}`))
        }
      })
    })
  }
}
