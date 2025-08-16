"use client"

import { useState, useRef } from "react"
import { Monitor, Smartphone, Tablet, RotateCcw, ExternalLink, Maximize2, AlertCircle, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PreviewPanelProps {
  url?: string
  isLoading?: boolean
  fileContents?: Record<string, string>
  activeFile?: string | null
}

export default function PreviewPanel({ url, isLoading = false, fileContents = {}, activeFile }: PreviewPanelProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

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

  const handleRefresh = async () => {
    if (!url || isRefreshing) return

    setIsRefreshing(true)
    setHasError(false)

    // Refresh the iframe
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }

    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleOpenExternal = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleIframeError = () => {
    setHasError(true)
    setIsRefreshing(false)
  }

  const handleIframeLoad = () => {
    setHasError(false)
    setIsRefreshing(false)
  }

  const { width, height } = getViewportSize()

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50" : "h-full"} bg-zinc-900 flex flex-col`}>
      {/* Header */}
      <div className="h-12 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-medium text-white">Preview</h3>
          </div>
          {url && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 bg-zinc-700 px-2 py-1 rounded font-mono">{new URL(url).host}</span>
              {hasError && (
                <div className="flex items-center gap-1 text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-xs">Connection Error</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Controls */}
          <div className="flex bg-zinc-700 rounded p-1">
            <Button
              size="sm"
              variant={viewport === "desktop" ? "default" : "ghost"}
              onClick={() => setViewport("desktop")}
              className="h-6 w-6 p-0 text-xs"
              title="Desktop View"
            >
              <Monitor className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={viewport === "tablet" ? "default" : "ghost"}
              onClick={() => setViewport("tablet")}
              className="h-6 w-6 p-0 text-xs"
              title="Tablet View"
            >
              <Tablet className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={viewport === "mobile" ? "default" : "ghost"}
              onClick={() => setViewport("mobile")}
              className="h-6 w-6 p-0 text-xs"
              title="Mobile View"
            >
              <Smartphone className="w-3 h-3" />
            </Button>
          </div>

          {/* Actions */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={!url || isRefreshing}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
            title="Refresh"
          >
            <RotateCcw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleFullscreen}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <Maximize2 className="w-3 h-3" />
          </Button>

          {url && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleOpenExternal}
              className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
              title="Open in New Tab"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Viewport Size Indicator */}
      {viewport !== "desktop" && (
        <div className="h-8 bg-zinc-800 border-b border-zinc-700 flex items-center justify-center">
          <span className="text-xs text-zinc-400 font-mono">
            {viewport === "mobile" ? "375 × 667" : "768 × 1024"} • {viewport}
          </span>
        </div>
      )}

      {/* Preview Content */}
      <div className="flex-1 p-4 bg-zinc-800 overflow-hidden">
        <div className="h-full flex items-center justify-center">
          {isLoading ? (
            <div className="text-center text-zinc-400">
              <div className="relative">
                <div className="animate-spin w-12 h-12 border-3 border-zinc-600 border-t-blue-500 rounded-full mx-auto mb-4"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-zinc-800 rounded-full"></div>
                </div>
              </div>
              <p className="font-medium">Starting Algorand App...</p>
              <p className="text-sm mt-1 text-zinc-500">Installing dependencies and building</p>
            </div>
          ) : hasError ? (
            <div className="text-center text-red-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p className="font-medium">Failed to Load Preview</p>
              <p className="text-sm mt-1 text-zinc-400">The development server might not be running</p>
              <Button onClick={handleRefresh} size="sm" className="mt-4 bg-red-600 hover:bg-red-700">
                Try Again
              </Button>
            </div>
          ) : url ? (
            <div
              className="bg-white rounded-lg shadow-2xl overflow-hidden border border-zinc-600 transition-all duration-300"
              style={{
                width: viewport === "desktop" ? "100%" : width,
                height: viewport === "desktop" ? "100%" : height,
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            >
              {/* Browser-like header for non-desktop views */}
              {viewport !== "desktop" && (
                <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="bg-white rounded px-2 py-0.5 text-xs text-gray-600 font-mono truncate">{url}</div>
                  </div>
                </div>
              )}

              <iframe
                ref={iframeRef}
                src={url}
                className="w-full border-0"
                style={{ height: viewport !== "desktop" ? "calc(100% - 32px)" : "100%" }}
                title="Algorand App Preview"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            </div>
          ) : (
            <div className="text-center text-zinc-400">
              <div className="relative mb-6">
                <Monitor className="w-16 h-16 mx-auto opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded opacity-20"></div>
                </div>
              </div>
              <h3 className="text-lg font-medium text-zinc-300 mb-2">Algorand Repository Loaded</h3>
              <p className="text-zinc-500 mb-1">Real files from algorand-devrel/algorand-bolt are now available</p>
              <p className="text-sm text-zinc-600">Browse the files in the Code tab to explore the Algorand template</p>
              <div className="mt-4 text-xs text-zinc-600">
                <p>Files loaded: {Object.keys(fileContents).length}</p>
                {activeFile && <p>Active: {activeFile}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-zinc-900 border-t border-zinc-700 flex items-center justify-between px-4 text-xs text-zinc-500 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span>Algorand React Starter</span>
          {url && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {viewport !== "desktop" && <span>{viewport.charAt(0).toUpperCase() + viewport.slice(1)} View</span>}
          <span>GitHub Repository</span>
        </div>
      </div>
    </div>
  )
}
