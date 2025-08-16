"use client"

import { Play, Square, Settings, Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  isRunning: boolean
  onRun: () => void
  onStop: () => void
  projectName?: string
}

export default function Header({ isRunning, onRun, onStop, projectName = "My Project" }: HeaderProps) {
  return (
    <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <h1 className="text-lg font-semibold text-white">Algokit IDE</h1>
        </div>
        <div className="flex items-center gap-2">
          {isRunning ? (
            <Button onClick={onStop} size="sm" variant="destructive" className="h-8">
              <Square className="w-3 h-3 mr-1" />
              Stop
            </Button>
          ) : (
            <Button onClick={onRun} size="sm" className="h-8 bg-green-600 hover:bg-green-700">
              <Play className="w-3 h-3 mr-1" />
              Run
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="h-8 text-zinc-400 hover:text-white">
          <Share className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className="h-8 text-zinc-400 hover:text-white">
          <Download className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className="h-8 text-zinc-400 hover:text-white">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
