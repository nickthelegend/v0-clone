"use client"

export interface TemplateFile {
  path: string
  content: string
  type: "file" | "directory"
}

export class TemplateLoader {
  private static readonly ALGORAND_TEMPLATE_FILES: TemplateFile[] = [
    {
      path: "package.json",
      type: "file",
      content: JSON.stringify(
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
    {
      path: "vite.config.ts",
      type: "file",
      content: `import react from '@vitejs/plugin-react'
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
    {
      path: "index.html",
      type: "file",
      content: `<!doctype html>
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
    {
      path: "src/main.tsx",
      type: "file",
      content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
    },
    {
      path: "src/App.tsx",
      type: "file",
      content: `import React from 'react'
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
    {
      path: "src/index.css",
      type: "file",
      content: `@tailwind base;
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
    {
      path: "tailwind.config.js",
      type: "file",
      content: `/** @type {import('tailwindcss').Config} */
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
    {
      path: "tsconfig.json",
      type: "file",
      content: JSON.stringify(
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
    {
      path: "tsconfig.node.json",
      type: "file",
      content: JSON.stringify(
        {
          compilerOptions: {
            composite: true,
            skipLibCheck: true,
            module: "ESNext",
            moduleResolution: "bundler",
            allowSyntheticDefaultImports: true,
          },
          include: ["vite.config.ts"],
        },
        null,
        2,
      ),
    },
    {
      path: "public/algorand.svg",
      type: "file",
      content: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#000"/>
<path d="M12.5 8L19.5 24H16.5L15 20H9L10.5 16H13.5L12.5 8Z" fill="#FFF"/>
<path d="M19.5 8L22.5 16H19.5L18.5 13H15.5L17 9H20L19.5 8Z" fill="#FFF"/>
</svg>`,
    },
  ]

  static async loadAlgorandTemplate(): Promise<TemplateFile[]> {
    console.log("[v0] Loading Algorand template files...")
    return this.ALGORAND_TEMPLATE_FILES
  }

  static async fetchFromGitHub(repoUrl: string): Promise<TemplateFile[]> {
    try {
      // This would be used if we want to fetch from GitHub API in the future
      console.log("[v0] Fetching template from GitHub:", repoUrl)

      // For now, return the static template
      return this.loadAlgorandTemplate()
    } catch (error) {
      console.error("[v0] Failed to fetch from GitHub:", error)
      // Fallback to static template
      return this.loadAlgorandTemplate()
    }
  }

  static convertToWebContainerFiles(templateFiles: TemplateFile[]) {
    const files: any = {}

    templateFiles.forEach((file) => {
      const pathParts = file.path.split("/")
      let current = files

      // Create nested structure
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]
        if (!current[part]) {
          current[part] = { directory: {} }
        }
        current = current[part].directory
      }

      // Add the file
      const fileName = pathParts[pathParts.length - 1]
      current[fileName] = {
        file: {
          contents: file.content,
        },
      }
    })

    return files
  }
}
