"use client"

import type { FileSystemTree } from "@webcontainer/api"

export const algorandBoltFileTree: FileSystemTree = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "algorand-bolt",
          private: true,
          version: "0.0.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "tsc && vite build",
            lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
            preview: "vite preview",
          },
          dependencies: {
            "@algorandfoundation/algokit-utils": "^6.0.4",
            "@blockshake/defly-connect": "^1.1.6",
            "@perawallet/connect": "^1.3.4",
            "@txnlab/use-wallet-react": "^3.0.1",
            "@txnlab/use-wallet-ui-react": "^3.0.1",
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
          },
        },
        null,
        2,
      ),
    },
  },
  "vite.config.ts": {
    file: {
      contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
  },
})
`,
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
</html>
`,
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
}
`,
    },
  },
  "postcss.config.js": {
    file: {
      contents: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`,
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
  "tsconfig.node.json": {
    file: {
      contents: JSON.stringify(
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
  },
  "README.md": {
    file: {
      contents: `# Algorand React Starter

A React starter template for building Algorand applications with TypeScript, Vite, and TailwindCSS.

## Features

- React 18 with TypeScript
- Vite for fast development
- TailwindCSS for styling
- Algorand wallet integration
- AlgoKit Utils for blockchain interactions

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Wallet Integration

This template includes integration with:
- Pera Wallet
- Defly Wallet
- Other Algorand wallets via use-wallet

## Learn More

- [Algorand Developer Portal](https://developer.algorand.org/)
- [AlgoKit Documentation](https://github.com/algorandfoundation/algokit-cli)
`,
    },
  },
  public: {
    directory: {
      "algorand.svg": {
        file: {
          contents: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="black"/>
<path d="M12.5 8L19.5 24H17L15.5 20H10.5L12.5 8ZM13.5 18H14.5L13 14L13.5 18Z" fill="white"/>
</svg>`,
        },
      },
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
)
`,
        },
      },
      "App.tsx": {
        file: {
          contents: `import { useState, useEffect } from "react";
import {
  WalletProvider,
  useInitializeProviders,
  PROVIDER_ID,
} from "@txnlab/use-wallet-react";
import { WalletUIProvider, WalletButton } from "@txnlab/use-wallet-ui-react";
import { WalletInfo } from "./components/WalletInfo";
import { TextWithCopy } from "./components/TextWithCopy";

export default function App() {
  const [walletManager, setWalletManager] = useState(null);

  useEffect(() => {
    const initWalletManager = async () => {
      const { WalletManager, NetworkId } = await import("@txnlab/use-wallet-react");
      
      const manager = new WalletManager({
        wallets: [
          PROVIDER_ID.PERA,
          PROVIDER_ID.DEFLY,
          PROVIDER_ID.LUTE,
          PROVIDER_ID.EXODUS,
          {
            id: PROVIDER_ID.WALLETCONNECT,
            options: { projectId: "fcfde071d3d43bae0d23e0773c80a2b1" },
          },
        ],
        network: NetworkId.TESTNET,
      });
      
      setWalletManager(manager);
    };

    initWalletManager();
  }, []);

  if (!walletManager) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="flex justify-center items-center h-16">
          <span className="text-lg font-semibold">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <WalletProvider manager={walletManager}>
      <WalletUIProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <header className="w-full bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex-shrink-0">
                  <span className="text-lg font-semibold">Algorand React Starter</span>
                </div>
                <div>
                  <WalletButton />
                </div>
              </div>
            </div>
          </header>
          
          <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <WalletInfo />
          </main>
        </div>
      </WalletUIProvider>
    </WalletProvider>
  );
}
`,
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

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
`,
        },
      },
      components: {
        directory: {
          "WalletInfo.tsx": {
            file: {
              contents: `import { useWallet } from "@txnlab/use-wallet-react";
import { TextWithCopy } from "./TextWithCopy";

export function WalletInfo() {
  const { activeAccount, activeWallet } = useWallet();

  if (!activeWallet) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Welcome to Algorand React Starter</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Connect your wallet to get started with Algorand development
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Features</h3>
          <ul className="text-left space-y-2">
            <li>• Wallet integration with Pera, Defly, and more</li>
            <li>• AlgoKit Utils for blockchain interactions</li>
            <li>• TypeScript and React 18</li>
            <li>• TailwindCSS for styling</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wallet Provider
            </label>
            <p className="text-lg font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">
              {activeWallet.metadata.name}
            </p>
          </div>
          
          {activeAccount && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Address
                </label>
                <TextWithCopy text={activeAccount.address} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Balance
                </label>
                <p className="text-lg font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {(activeAccount.minBalance / 1000000).toFixed(6)} ALGO
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Ready to Build!
        </h3>
        <p className="text-blue-800 dark:text-blue-200">
          Your wallet is connected and ready for Algorand development. 
          Start building your decentralized application!
        </p>
      </div>
    </div>
  );
}
`,
            },
          },
          "TextWithCopy.tsx": {
            file: {
              contents: `import { useState } from "react";

interface TextWithCopyProps {
  text: string;
  className?: string;
}

export function TextWithCopy({ text, className = "" }: TextWithCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className={\`flex items-center space-x-2 \${className}\`}>
      <code className="flex-1 bg-gray-50 dark:bg-gray-700 p-2 rounded font-mono text-sm break-all">
        {text}
      </code>
      <button
        onClick={handleCopy}
        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
`,
            },
          },
        },
      },
    },
  },
}

export function convertStaticTreeToFileNodes(tree: FileSystemTree, path = "") {
  const nodes = []

  for (const [name, item] of Object.entries(tree)) {
    const fullPath = path ? `${path}/${name}` : name

    if ("file" in item) {
      nodes.push({
        name,
        path: fullPath,
        type: "file",
        content: item.file.contents,
      })
    } else if ("directory" in item) {
      nodes.push({
        name,
        path: fullPath,
        type: "directory",
        children: convertStaticTreeToFileNodes(item.directory, fullPath),
      })
    }
  }

  return nodes
}
