"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Coins, ShoppingCart, TrendingUp, Calendar, ArrowLeft } from "lucide-react"

interface Purchase {
  id: string
  tokens: number
  amount: number
  createdAt: string
  plan: {
    name: string
  }
}

interface DashboardData {
  user: {
    email: string
    tokens: number
    createdAt: string
  }
  purchases: Purchase[]
  stats: {
    totalSpent: number
    totalTokensPurchased: number
    purchaseCount: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userData)
    fetch(`/api/dashboard?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Loading dashboard...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-red-500">Failed to load dashboard</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-zinc-400">{data.user.email}</p>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to IDE
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Coins className="w-5 h-5 text-green-500" />
              <span className="text-zinc-400 text-sm">Current Balance</span>
            </div>
            <p className="text-3xl font-bold text-white">{data.user.tokens}</p>
            <p className="text-xs text-zinc-500 mt-1">tokens</p>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              <span className="text-zinc-400 text-sm">Total Purchases</span>
            </div>
            <p className="text-3xl font-bold text-white">{data.stats.purchaseCount}</p>
            <p className="text-xs text-zinc-500 mt-1">transactions</p>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-zinc-400 text-sm">Tokens Purchased</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {data.stats.totalTokensPurchased.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500 mt-1">total</p>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <span className="text-zinc-400 text-sm">Total Spent</span>
            </div>
            <p className="text-3xl font-bold text-white">
              ${data.stats.totalSpent.toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">USD</p>
          </Card>
        </div>

        {/* Purchase History */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Purchase History</h2>
            <Button size="sm" onClick={() => router.push("/pricing")}>
              Buy More Tokens
            </Button>
          </div>

          {data.purchases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400 mb-4">No purchases yet</p>
              <Button onClick={() => router.push("/pricing")}>
                View Pricing Plans
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Plan</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">Tokens</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.purchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-zinc-800/50">
                      <td className="py-3 px-4 text-zinc-300">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-white">{purchase.plan.name}</td>
                      <td className="py-3 px-4 text-right text-green-500">
                        +{purchase.tokens.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-white">
                        ${purchase.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Account Info */}
        <Card className="bg-zinc-900 border-zinc-800 p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">Email</span>
              <span className="text-white">{data.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Member Since</span>
              <span className="text-white">
                {new Date(data.user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Account Status</span>
              <span className="text-green-500">Active</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
