"use client"

import React, { useEffect } from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

export type ToastVariant = 'error' | 'success' | 'info' | 'warning'

export interface ToastProps {
  message: string
  title?: string
  variant?: ToastVariant
  onDismiss: () => void
  duration?: number
  className?: string
}

const toastConfig: Record<
  ToastVariant,
  {
    icon: React.ReactNode
    borderColor: string
    iconColor: string
  }
> = {
  error: {
    icon: <AlertCircle className="w-5 h-5" strokeWidth={1.75} />,
    borderColor: 'border-danger/30',
    iconColor: 'text-danger',
  },
  success: {
    icon: <CheckCircle className="w-5 h-5" strokeWidth={1.75} />,
    borderColor: 'border-success/30',
    iconColor: 'text-success',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" strokeWidth={1.75} />,
    borderColor: 'border-warning/30',
    iconColor: 'text-warning',
  },
  info: {
    icon: <Info className="w-5 h-5" strokeWidth={1.75} />,
    borderColor: 'border-border',
    iconColor: 'text-brand',
  },
}

export function Toast({
  message,
  title,
  variant = 'error',
  onDismiss,
  duration = 4000,
  className = '',
}: ToastProps) {
  useEffect(() => {
    if (!duration) return
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [onDismiss, duration])

  const config = toastConfig[variant]

  return (
    <div
      className={`fixed top-5 right-5 z-toast flex max-w-sm w-full pointer-events-auto px-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div
        className={`w-full bg-surface border ${config.borderColor} shadow-modal rounded-xl p-3.5 flex items-start gap-3 animate-in slide-in-from-top-4 duration-base`}
      >
        <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>{config.icon}</div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-heading text-xs font-bold text-text-primary leading-tight">
              {title}
            </h4>
          )}
          <p className="font-body text-xs text-text-secondary mt-0.5 leading-normal">{message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 p-1 text-text-meta hover:text-text-primary transition-colors duration-fast cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
