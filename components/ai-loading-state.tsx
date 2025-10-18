"use client"

import { Bot, Code, FileText, Terminal, Globe } from "lucide-react"

interface AILoadingStateProps {
  currentStep?: string
  progress?: number
}

export default function AILoadingState({ currentStep = "Thinking", progress = 0 }: AILoadingStateProps) {
  const steps = [
    { name: "Analyzing", icon: Bot, duration: 1000 },
    { name: "Planning", icon: FileText, duration: 1500 },
    { name: "Coding", icon: Code, duration: 2000 },
    { name: "Testing", icon: Terminal, duration: 1000 },
    { name: "Deploying", icon: Globe, duration: 800 },
  ]

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.name === currentStep)
  }

  const getAnimatedProgress = () => {
    const stepIndex = getCurrentStepIndex()
    const baseProgress = (stepIndex / steps.length) * 100
    const stepProgress = progress * (100 / steps.length)
    return Math.min(baseProgress + stepProgress, 100)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-950 p-8">
      <div className="w-full max-w-md mx-auto">
        {/* Animated Bot Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-30 animate-pulse"></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${getAnimatedProgress()}%` }}
            ></div>
          </div>
          <div className="text-center">
            <p className="text-white text-lg font-medium mb-1">
              {currentStep === "Thinking" ? "AI is thinking..." :
               currentStep === "Analyzing" ? "Analyzing your request..." :
               currentStep === "Planning" ? "Planning the solution..." :
               currentStep === "Coding" ? "Writing code..." :
               currentStep === "Testing" ? "Testing the code..." :
               "Deploying the solution..."}
            </p>
            <p className="text-zinc-400 text-sm">
              {Math.round(getAnimatedProgress())}% complete
            </p>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = step.name === currentStep
            const isCompleted = index < getCurrentStepIndex()

            return (
              <div
                key={step.name}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-blue-500/20 border border-blue-500/50"
                    : isCompleted
                    ? "bg-green-500/20 border border-green-500/50"
                    : "bg-zinc-800/50 border border-zinc-700/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-blue-500 text-white animate-pulse"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-zinc-700 text-zinc-400"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-sm font-medium ${
                  isActive
                    ? "text-blue-300"
                    : isCompleted
                    ? "text-green-300"
                    : "text-zinc-400"
                }`}>
                  {step.name}
                </span>
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Loading Animation */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-zinc-400">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">Generating your code...</span>
          </div>
        </div>
      </div>
    </div>
  )
}