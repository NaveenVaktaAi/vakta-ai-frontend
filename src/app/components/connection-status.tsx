"use client"

import { useWebSocket } from "../hooks/use-websocket"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Wifi, WifiOff, AlertCircle, RefreshCw } from "lucide-react"

export function ConnectionStatus() {
  const { connectionStatus, isConnected, isMockMode, connect, disconnect } = useWebSocket()

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          icon: <Wifi className="h-4 w-4" />,
          text: "Connected",
          variant: "default" as const,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        }
      case "connecting":
        return {
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          text: "Connecting...",
          variant: "secondary" as const,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        }
      case "error":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: "Connection Error",
          variant: "destructive" as const,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        }
      case "disconnected":
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: isMockMode ? "Demo Mode" : "Disconnected",
          variant: "outline" as const,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200"
        }
      default:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: "Unknown",
          variant: "outline" as const,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200"
        }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={statusConfig.variant}
        className={`${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.color} flex items-center gap-1`}
      >
        {statusConfig.icon}
        {statusConfig.text}
      </Badge>
      
      {isMockMode && (
        <Button
          size="sm"
          variant="outline"
          onClick={connect}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
      
      {isConnected && (
        <Button
          size="sm"
          variant="outline"
          onClick={disconnect}
          className="h-6 px-2 text-xs"
        >
          <WifiOff className="h-3 w-3 mr-1" />
          Disconnect
        </Button>
      )}
    </div>
  )
}
