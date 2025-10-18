"use client"

import { useState } from "react"
import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import ConnectWalletModal from "./connect-wallet-modal"

export function ConnectWalletButton() {
  const { address, isConnected, disconnect } = useWallet()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error("Failed to disconnect:", error)
    }
  }

  if (isConnected && address) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-8 text-zinc-400 hover:text-zinc-200"
            onClick={openModal}
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-medium text-white mr-2">
              {address.slice(0, 2).toUpperCase()}
            </div>
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-zinc-400 hover:text-zinc-200"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <Button
        onClick={openModal}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-8 px-4"
      >
        Connect Wallet
      </Button>

      <ConnectWalletModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  )
}