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
            "@algorandfoundation/algokit-utils": "^9.1.0",
    "@algorandfoundation/algokit-subscriber": "^3.2.0",
    "@blockshake/defly-connect": "^1.2.1",
    "@perawallet/connect": "^1.4.2",
    "@txnlab/use-wallet-react": "^4.0.1",
    "@txnlab/use-wallet-ui-react": "^0.2.3",
    "@walletconnect/modal": "^2.7.0",
    "@walletconnect/sign-client": "^2.20.2",
            "lucide-react": "^0.508.0",
    "lute-connect": "^1.6.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
            "algosdk": "^3.2.0",
            
          },
          devDependencies: {
            
            "@typescript-eslint/eslint-plugin": "^7.2.0",
            "@typescript-eslint/parser": "^7.2.0",
            "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.4.1",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.26.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "eslint-plugin-tailwindcss": "^3.18.0",
    "globals": "^16.0.0",
    "postcss": "^8.5.3",
    "prettier": "^3.5.3",
    "prettier-plugin-tailwindcss": "^0.6.11",
    "tailwindcss": "^3",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.30.1",
    "vite": "^6.3.4",
    "vite-plugin-node-polyfills": "^0.23.0",
            

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
})`,
    },
  },
  "index.html": {
    file: {
      contents: `<!DOCTYPE html>
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
    './src/**/*.{js,ts,jsx,tsx}',
    // Add this line to scan our components
    './node_modules/@txnlab/use-wallet-ui-react/dist/**/*.{js,ts,jsx,tsx}',
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
          contents: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`,
        },
      },
      "App.tsx": {
        file: {
          contents: `import {
  NetworkId,
  WalletId,
  WalletManager,
  WalletProvider,
} from '@txnlab/use-wallet-react'
import { WalletUIProvider, WalletButton } from '@txnlab/use-wallet-ui-react'
import { WalletInfo } from './components/WalletInfo'
import { TextWithCopy } from './components/TextWithCopy'

const walletManager = new WalletManager({
  wallets: [
    WalletId.PERA,
    WalletId.DEFLY,
    WalletId.LUTE,
    WalletId.EXODUS,
    {
      id: WalletId.WALLETCONNECT,
      options: { projectId: 'fcfde0713d43baa0d23be0773c80a72b' },
    },
  ],
  defaultNetwork: NetworkId.TESTNET,
})

function App() {
  return (
    <WalletProvider manager={walletManager}>
      <WalletUIProvider>
        <div className="min-h-screen bg-white dark:bg-[#001324] text-gray-900 dark:text-gray-100">
          {/* Header */}
          <header className="w-full bg-white dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700/50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex-shrink-0">
                  <span className="text-lg font-semibold ">
                    Algorand React Starter
                  </span>
                </div>
                <div>
                  <WalletButton />
                </div>
              </div>
            </div>
          </header>
          {/* Main content area */}
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <WalletInfo />
            <div className="mt-8">
            <h1 className="text-3xl font-bold  mb-4">Algorand Resources</h1>
              <div className="flex flex-col gap-2 my-4">
                <p className=" mx-auto">
                  This example demonstrates a foundation for building a web app
                  with connectivity to the Algorand blockchain. It includes
                  prompts to guide Bolt in building with you. The instructions
                  and resources below can be ripped out as you start crafting
                  your own app. Note that  the AlgoKit Subscriber and Utils libraries 
                  are available in both TypeScript and Python.
                </p>
              </div>  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3">Learning Resources</h2>
                  <ul className="space-y-2">
                    <li>
                      <a href="https://dev.algorand.co/" 
                         className="text-blue-500 hover:underline" target="_blank">
                        Developer Portal & Docs
                      </a>
                    </li>
                    <li>
                      <a href="https://examples.dev.algorand.co/" 
                         className="text-blue-500 hover:underline" target="_blank">
                        Example Gallery
                      </a>
                    </li>
                    <li>
                      <a href="https://tutorials.dev.algorand.co/" 
                         className="text-blue-500 hover:underline" target="_blank">
                        Interactive AlgoKit Code Tutorials
                      </a>
                    </li>
                    <li>
                      <a href="https://dev.algorand.co/arc-standards/" 
                         className="text-blue-500 hover:underline" target="_blank">
                        ARC Standards
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3">Core Tools</h2>
                  <ul className="space-y-2">
                    <li>
                      <a href="https://dev.algorand.co/algokit/algokit-intro/" 
                         className="text-blue-500 hover:underline" target="_blank">
                        AlgoKit Developer Kit
                      </a>
                    </li>
                    <li>
                      <a href="https://lora.algokit.io/" 
                         className="text-blue-500 hover:underline" target="_blank">
                        Lora Block Explorer
                      </a>
                    </li>
                    <li>
                      <a href="https://www.npmjs.com/package/@algorandfoundation/algokit-utils" 
                         className="text-blue-500 hover:underline" target="_blank">
                        AlgoKit Utils (v9.0.1)
                      </a>
                    </li>
                    <li>
                      <a href="https://www.npmjs.com/package/@algorandfoundation/algokit-subscriber" 
                         className="text-blue-500 hover:underline" target="_blank">
                        AlgoKit Subscriber (v3.2.0) 
                      </a>
                    </li>
                    <li>
                      <a href="https://www.npmjs.com/package/@txnlab/use-wallet-ui-react" 
                         className="text-blue-500 hover:underline" target="_blank">
                        use-wallet-ui-react (v0.2.2)
                      </a>
                    </li>
                  </ul>
                </div>


                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3">Community</h2>
                  <ul className="space-y-2">
                    <li>
                      <a href="https://discord.com/invite/algorand" 
                         className="text-blue-500 hover:underline" target="_blank">
                        Algorand Discord
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3">Smart Contract Languages</h2>
                  <ul className="space-y-2">
                    <li>
                      <a href="https://dev.algorand.co/algokit/languages/python/overview/" 
                         className="text-blue-500 hover:underline" target="_blank">
                        Algorand Python
                      </a>
                    </li>
                    <li>
                      <a href="https://dev.algorand.co/algokit/languages/typescript/overview/" 
                         className="text-blue-500 hover:underline" target="_blank">
                        Algorand Typescript
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="my-8">
              <h1 className="text-3xl font-bold my-8">Bolt.new Integration Guide</h1>
              <div className="flex flex-col gap-4 my-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">Initial Setup Prompt</h2>
                  <p className="mb-2">Use this in discussion mode to configure Bolt for Algorand development:</p>

                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">Common Use Case Prompts</h2>
                  <div className="space-y-3">
                      <h3 className="font-medium">Transaction Sending</h3>
                    </div>
                    <div>
                      <h3 className="font-medium">Account Management</h3>
                    </div>
                    <div>
                    <div>
                      <h3 className="font-medium">Contract Interaction</h3>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">AlgoKit Implementation Note</h2>
                  <p>Because Bolt.new doesn't support AlgoKit LocalNet, you can use this workaround:</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </WalletUIProvider>
    </WalletProvider>
  )
}

export default App
`,
        },
      },
      "index.css": {
        file: {
          contents: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
        },
      },
      components: {
        directory: {
          "WalletInfo.tsx": {
            file: {
              contents: `import { useWallet } from '@txnlab/use-wallet-react';
import { useAccountInfo, useNfd, NfdAvatar } from '@txnlab/use-wallet-ui-react';
import { formatNumber, formatShortAddress } from '@txnlab/utils-ts';

export function WalletInfo() {
  const { activeAddress } = useWallet();
  const nfdQuery = useNfd();
  const accountQuery = useAccountInfo();

  if (!activeAddress) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Connect your Algorand wallet to view your NFD profile and balance
        </p>
      </div>
    );
  }

  if (nfdQuery.isLoading || accountQuery.isLoading) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300">
          Loading wallet data...
        </p>
      </div>
    );
  }

  const nfd = nfdQuery.data ?? null;
  const accountInfo = accountQuery.data;
  const algoBalance = accountInfo ? Number(accountInfo.amount) / 1_000_000 : 0;

  return (
    <div className="p-8 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <NfdAvatar nfd={nfd} size={64} className="rounded-xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {nfd?.name || formatShortAddress(activeAddress)}
            </h2>
            {nfd?.name && (
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                {formatShortAddress(activeAddress)}
              </p>
            )}
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(algoBalance, { fractionDigits: 4 })} ALGO
          </p>
        </div>
      </div>

      {nfd?.properties?.userDefined &&
        Object.keys(nfd.properties.userDefined).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              NFD Properties
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(nfd.properties.userDefined).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {key}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {value}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
}
  `,
            },
          },
          "TextWithCopy.tsx": {
            file: {
              contents: `import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const TextWithCopy = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
      <pre className="whitespace-pre-wrap text-sm text-left bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-300 dark:border-gray-700 overflow-x-auto">
        {text}
      </pre>
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
        onClick={copyToClipboard}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Copied!' : 'Copy to clipboard'}
      </button>
    </div>
  );
};
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
