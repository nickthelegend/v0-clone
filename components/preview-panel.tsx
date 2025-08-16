"use client"

import { useState } from "react"
import { Monitor, Smartphone, Tablet, RotateCcw, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PreviewPanelProps {
  url?: string
  isLoading?: boolean
}

export default function PreviewPanel({ url, isLoading = false }: PreviewPanelProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop")

  const getViewportSize = () => {
    switch (viewport) {
      case "mobile":
        return { width: "375px", height: "667px" }
      case "tablet":
        return { width: "768px", height: "1024px" }
      default:
        return { width: "100%", height: "100%" }
    }
  }

  const { width, height } = getViewportSize()

  return (
    <div className="h-full bg-zinc-900 flex flex-col">
      {/* Header */}
      <div className="h-12 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-white">Preview</h3>
          {url && <span className="text-xs text-zinc-400 bg-zinc-700 px-2 py-1 rounded">{new URL(url).host}</span>}
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Controls */}
          <div className="flex bg-zinc-700 rounded p-1">
            <Button
              size="sm"
              variant={viewport === "desktop" ? "default" : "ghost"}
              onClick={() => setViewport("desktop")}
              className="h-6 w-6 p-0"
            >
              <Monitor className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={viewport === "tablet" ? "default" : "ghost"}
              onClick={() => setViewport("tablet")}
              className="h-6 w-6 p-0"
            >
              <Tablet className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={viewport === "mobile" ? "default" : "ghost"}
              onClick={() => setViewport("mobile")}
              className="h-6 w-6 p-0"
            >
              <Smartphone className="w-3 h-3" />
            </Button>
          </div>

          {/* Actions */}
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-zinc-400 hover:text-white">
            <RotateCcw className="w-3 h-3" />
          </Button>
          {url && (
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-zinc-400 hover:text-white">
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-4 bg-zinc-800">
        <div className="h-full flex items-center justify-center">
          {isLoading ? (
            <div className="text-center text-zinc-400">
              <div className="animate-spin w-8 h-8 border-2 border-zinc-600 border-t-blue-500 rounded-full mx-auto mb-4"></div>
              <p>Loading preview...</p>
            </div>
          ) : url ? (
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              style={{
                width: viewport === "desktop" ? "100%" : width,
                height: viewport === "desktop" ? "100%" : height,
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            >
              <iframe
                src={url}
                className="w-full h-full border-0"
                title="Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          ) : (
            <div className="text-center text-zinc-400">
              <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No preview available</p>
              <p className="text-sm mt-1">Start the development server to see your app</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
