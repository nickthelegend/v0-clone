"use client"

export const ALGORAND_TEMPLATE_FILES = {
  "package.json": `{
  "name": "algorand-react-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@algorandfoundation/algokit-utils": "^6.0.0",
    "@blockshake/defly-connect": "^1.1.6",
    "@perawallet/connect": "^1.3.4",
    "@walletconnect/modal": "^2.6.2",
    "@walletconnect/sign-client": "^2.11.0",
    "algosdk": "^2.7.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@typescript-eslint/eslint-plugin": "^7.2.0",
    "@typescript-eslint/parser": "^7.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}`,
  "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Algorand React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  "vite.config.ts": `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
  },
})`,
  "tailwind.config.js": `/** @type {import('tailwindcss').Config} */
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
  "postcss.config.js": `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
  "src/main.tsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
  "src/App.tsx": `import { useState } from 'react'
import { WalletProvider } from './components/WalletProvider'
import { ConnectWallet } from './components/ConnectWallet'
import { AlgorandLogo } from './components/AlgorandLogo'

function App() {
  const [count, setCount] = useState(0)

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <AlgorandLogo className="mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Algorand React App
            </h1>
            <p className="text-gray-600">
              Build decentralized applications on Algorand
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <ConnectWallet />
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setCount((count) => count + 1)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Count is {count}
              </button>
            </div>
          </div>
        </div>
      </div>
    </WalletProvider>
  )
}

export default App`,
  "src/index.css": `@tailwind base;
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
}`,
  "src/components/WalletProvider.tsx": `import React, { createContext, useContext, useState, useEffect } from 'react'
import { PeraWalletConnect } from '@perawallet/connect'

interface WalletContextType {
  account: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isConnected: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const peraWallet = new PeraWalletConnect()

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)

  useEffect(() => {
    // Reconnect to session if exists
    peraWallet.reconnectSession().then((accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0])
      }
    })

    peraWallet.connector?.on('disconnect', () => {
      setAccount(null)
    })
  }, [])

  const connect = async () => {
    try {
      const accounts = await peraWallet.connect()
      setAccount(accounts[0])
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const disconnect = () => {
    peraWallet.disconnect()
    setAccount(null)
  }

  return (
    <WalletContext.Provider
      value={{
        account,
        connect,
        disconnect,
        isConnected: !!account,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}`,
  "src/components/ConnectWallet.tsx": `import { useWallet } from './WalletProvider'

export function ConnectWallet() {
  const { account, connect, disconnect, isConnected } = useWallet()

  if (isConnected) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Connected to:</p>
        <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
          {account}
        </p>
        <button
          onClick={disconnect}
          className="mt-3 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <button
        onClick={connect}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  )
}`,
  "src/components/AlgorandLogo.tsx": `interface AlgorandLogoProps {
  className?: string
}

export function AlgorandLogo({ className = "" }: AlgorandLogoProps) {
  return (
    <svg
      className={\`w-16 h-16 \${className}\`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="50" fill="#000000" />
      <path
        d="M25 75L35 45L45 75H55L65 45L75 75H85L70 25H60L50 55L40 25H30L15 75H25Z"
        fill="#FFFFFF"
      />
    </svg>
  )
}`,
}

export function convertTemplateToFileNodes(template: Record<string, string>) {
  const nodes: any[] = []
  const directories = new Map<string, any>()

  // Sort files to ensure directories are processed first
  const sortedFiles = Object.keys(template).sort()

  for (const filePath of sortedFiles) {
    const parts = filePath.split("/")
    const fileName = parts[parts.length - 1]

    if (parts.length === 1) {
      // Root level file
      nodes.push({
        name: fileName,
        path: filePath,
        type: "file",
      })
    } else {
      // File in directory
      const dirPath = parts.slice(0, -1).join("/")

      if (!directories.has(dirPath)) {
        const dirNode = {
          name: parts[0],
          path: dirPath,
          type: "directory",
          children: [],
        }
        directories.set(dirPath, dirNode)
        nodes.push(dirNode)
      }

      const dirNode = directories.get(dirPath)
      if (dirNode) {
        dirNode.children.push({
          name: fileName,
          path: filePath,
          type: "file",
        })
      }
    }
  }

  return nodes
}
