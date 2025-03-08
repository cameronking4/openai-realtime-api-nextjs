"use client"

import React from "react";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useTranslations } from "@/app/_components/shared/translations-context"

interface StatusDisplayProps {
  status: string
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
  const { t } = useTranslations();
  useEffect(() => {
    if (status.startsWith("Error")) {
      toast.error(t('status.error'), {
        description: status,
        duration: 3000,
      })
    } 
    else if (status.startsWith("Session established")) {
        toast.success(t('status.success'), {
            description: status,
            duration: 5000,
        })
    }
    else {
      toast.info(t('status.info'), {
        description: status,
        duration: 3000,
      })
    }
  }, [status, t])

  // Check if the status contains network connectivity error
  const isNetworkError = status.toLowerCase().includes('network connectivity') || 
                         status.toLowerCase().includes('cannot reach') ||
                         status.toLowerCase().includes('enotfound');
  
  // Check if it's a general error
  const isError = status.toLowerCase().includes('error') && !isNetworkError;
  
  return (
    <div className={`mt-4 p-2 rounded-md text-sm flex items-center gap-2 ${
      isNetworkError 
        ? 'bg-red-100 text-red-800 border border-red-300' 
        : isError
          ? 'bg-amber-100 text-amber-800 border border-amber-300'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    }`}>
      {isNetworkError ? (
        <>
          <WifiOff className="h-4 w-4" />
          <div>
            <p className="font-medium">{status}</p>
            <p className="text-xs mt-1">
              Please check your internet connection and ensure you can reach api.openai.com. 
              Try refreshing the page or switching to a different network.
            </p>
          </div>
        </>
      ) : isError ? (
        <>
          <AlertCircle className="h-4 w-4" />
          <span>{status}</span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4" />
          <span>{status}</span>
        </>
      )}
    </div>
  );
} 