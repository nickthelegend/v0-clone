"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"

// Lazy import to avoid SSR issues if the lib is missing during build
type PeraCtor = new (...args: any[]) => { connect: () => Promise<string[]>; disconnect: () => Promise<void> }
let PeraWalletConnect: PeraCtor | null = null
if (typeof window !== "undefined") {
  // Optional dynamic import — app still works in mock mode if package is unavailable
  import("@perawallet/connect")
    .then((m) => {
      // @ts-expect-error loose type to support Next.js
      PeraWalletConnect = m.PeraWalletConnect
    })
    .catch(() => {
      PeraWalletConnect = null
    })
}

type WalletContextType = {
  address: string | null
  isConnected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("algokit:wallet:address")
    if (saved) {
      setAddress(saved)
      // Set user cookie to prevent middleware redirect
      document.cookie = `user=${JSON.stringify({ walletAddress: saved })}; path=/`
    }
  }, [])

  const connect = useCallback(async () => {
    setConnecting(true)
    try {
      // Try real Pera first
      if (PeraWalletConnect) {
        // @ts-expect-error loose type
        const pera = new PeraWalletConnect()
        const accounts: string[] = await pera.connect()
        if (accounts && accounts.length > 0) {
          const addr = accounts[0]
          localStorage.setItem("algokit:wallet:address", addr)
          // Set user cookie to prevent middleware redirect
          document.cookie = `user=${JSON.stringify({ walletAddress: addr })}; path=/`
          setAddress(addr)
          router.refresh()
          return
        }
      }
      // If Pera is not available, throw error to show proper message
      throw new Error("Wallet connection failed")
    } catch (error) {
      console.error("Wallet connection error:", error)
      throw error // Re-throw to let the modal handle the error
    } finally {
      setConnecting(false)
    }
  }, [router])

  const disconnect = useCallback(async () => {
    localStorage.removeItem("algokit:wallet:address")
    // Remove user cookie
    document.cookie = "user=; path=/; max-age=0"
    setAddress(null)
    router.push("/") // send back home
  }, [router])

  const value = useMemo(
    () => ({ address, isConnected: !!address, connecting, connect, disconnect }),
    [address, connecting, connect, disconnect],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within WalletProvider")
  return ctx
}