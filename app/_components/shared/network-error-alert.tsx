"use client";

import React from "react";
import { WifiOff } from "lucide-react";

interface NetworkErrorAlertProps {
  message: string;
  isVisible: boolean;
}

const NetworkErrorAlert: React.FC<NetworkErrorAlertProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-red-100 border-b border-red-300 text-red-800 flex items-center gap-3">
      <WifiOff className="h-5 w-5" />
      <div>
        <p className="font-medium">{message || "Network connectivity issue"}</p>
        <p className="text-xs mt-1">
          Please check your internet connection and ensure you can reach api.openai.com. 
          Try refreshing the page or switching to a different network.
        </p>
      </div>
    </div>
  );
};

export default NetworkErrorAlert; 