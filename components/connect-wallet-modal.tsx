"use client"

import { useWallet } from "./wallet-provider"
import { toast } from "react-toastify"

const ConnectWalletModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const { address, connect } = useWallet()

  if (!isOpen) return null

  const handleConnect = async () => {
    try {
      await connect()
      toast.success("Wallet connected successfully")
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Failed to connect wallet")
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50" onClick={onClose}>
      <div
        className="bg-zinc-900 text-zinc-100 rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center w-full mb-4">
          <h3 className="text-lg font-semibold text-zinc-100">Connect to a wallet</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200"
          >
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 w-full">
          <button
            onClick={handleConnect}
            className="flex justify-between items-center p-4 rounded-lg cursor-pointer transition-colors w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600"
          >
            <span className="font-medium">
              Pera Wallet
              {address && ` [${address.slice(0, 4)}...${address.slice(-4)}]`}
            </span>
            <img
              src="/pera-icon.svg"
              alt="Pera Wallet Icon"
              className="h-6 w-6"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </button>

          <button
            onClick={handleConnect}
            className="flex justify-between items-center p-4 rounded-lg cursor-pointer transition-colors w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-600"
          >
            <span className="font-medium">Defly Wallet</span>
            <img
              src="/defly-icon.svg"
              alt="Defly Wallet Icon"
              className="h-6 w-6"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-700 text-sm text-center text-zinc-400 w-full">
          <span>New to Algorand? </span>
          <a
            href="https://algorand.com/wallets"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:opacity-90"
          >
            Learn more about wallets
          </a>
        </div>
      </div>
    </div>
  )
}

export default ConnectWalletModal