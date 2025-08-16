"use client"

import { useState } from "react"
import { Wallet, Send, RefreshCw, ExternalLink, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AlgorandPreview() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string>("")
  const [balance, setBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleConnectWallet = async () => {
    setIsLoading(true)
    // Simulate wallet connection
    setTimeout(() => {
      setIsConnected(true)
      setAccount("ABCD...XYZ123")
      setBalance(42.5)
      setIsLoading(false)
    }, 1500)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setAccount("")
    setBalance(0)
  }

  const copyAddress = () => {
    navigator.clipboard.writeText("ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Algorand dApp</h1>
            </div>

            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{balance} ALGO</p>
                    <p className="text-xs text-gray-500">{account}</p>
                  </div>
                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleConnectWallet}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Wallet className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Algorand</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect your wallet to start interacting with the Algorand blockchain. Build decentralized applications
              with fast, secure, and sustainable technology.
            </p>
            <Button
              onClick={handleConnectWallet}
              disabled={isLoading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Connecting Wallet...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Your Wallet
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Balance</p>
                    <p className="text-2xl font-bold text-gray-900">{balance} ALGO</p>
                    <p className="text-sm text-gray-500">≈ ${(balance * 0.25).toFixed(2)} USD</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-mono text-gray-900 truncate">{account}</p>
                      <Button onClick={copyAddress} size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {[
                    { type: "Received", amount: "+5.0 ALGO", from: "ABC...789", time: "2 hours ago" },
                    { type: "Sent", amount: "-2.5 ALGO", to: "XYZ...123", time: "1 day ago" },
                    { type: "Received", amount: "+10.0 ALGO", from: "DEF...456", time: "3 days ago" },
                  ].map((tx, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === "Received" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          <Send
                            className={`w-4 h-4 ${
                              tx.type === "Received" ? "text-green-600 rotate-180" : "text-red-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tx.type}</p>
                          <p className="text-sm text-gray-500">
                            {tx.from || tx.to} • {tx.time}
                          </p>
                        </div>
                      </div>
                      <p className={`font-semibold ${tx.type === "Received" ? "text-green-600" : "text-red-600"}`}>
                        {tx.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Send ALGO
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Balance
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Explorer
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Developer Info</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This is a demo Algorand dApp built with React and TypeScript.
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>• Network: TestNet</p>
                  <p>• SDK: Algorand JavaScript SDK</p>
                  <p>• Wallet: Pera Wallet</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
