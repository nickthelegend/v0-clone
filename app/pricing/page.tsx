"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft } from "lucide-react"

interface Plan {
  id: string
  name: string
  tokens: number
  price: number
  description: string | null
  popular: boolean
}

export default function PricingPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetch("/api/pricing")
      .then((res) => res.json())
      .then((data) => {
        setPlans(data.plans)
        setLoading(false)
      })
  }, [])

  const handlePurchase = async (planId: string) => {
    if (!user) {
      router.push("/login")
      return
    }

    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, planId }),
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
        alert(`Success! ${data.user.tokens} tokens added to your account!`)
      }
    } catch (err) {
      alert("Purchase failed")
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-zinc-400">Get tokens to power your AI development</p>
          {user && (
            <p className="text-green-500 mt-2">Current Balance: {user.tokens} tokens</p>
          )}
        </div>

        {loading ? (
          <p className="text-center text-zinc-400">Loading plans...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`bg-zinc-900 border rounded-lg p-8 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? "border-blue-500 ring-2 ring-blue-500/50"
                    : plan.popular
                    ? "border-blue-500/50"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {plan.popular && (
                  <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                    Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-white mt-4">{plan.name}</h3>
                <p className="text-zinc-400 text-sm mt-2">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{plan.tokens.toLocaleString()} tokens</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>No expiration</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>All features included</span>
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePurchase(plan.id)
                  }}
                  className="w-full mt-8"
                  variant={selectedPlan === plan.id ? "default" : "outline"}
                >
                  Buy Now
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to IDE
          </Button>
        </div>
      </div>
    </div>
  )
}
