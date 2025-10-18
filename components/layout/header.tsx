"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { useWallet } from "@/components/wallet-provider"

interface HeaderProps {
}

export default function Header({}: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isConnected } = useWallet()

  const isActiveTab = (tab: string) => {
    if (tab === "agents") {
      return pathname === "/" || pathname?.includes("/agents")
    }
    return pathname?.includes(tab)
  }

  const showBackButton = () => {
    return pathname === "/dashboard" || pathname?.startsWith("/dashboard/")
  }

  return (
    <div className="h-12 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {showBackButton() && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}

        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/")}
            className={`text-sm font-medium transition-colors ${
              isActiveTab("agents")
                ? "text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Agents
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className={`text-sm font-medium transition-colors ${
              isActiveTab("dashboard")
                ? "text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Dashboard
          </button>
        </div>
      </div>

     <div className="flex items-center gap-3">
       <ConnectWalletButton />
     </div>
    </div>
  )
}
