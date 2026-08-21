"use client"

import React, { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const maxWidthStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
  className = '',
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-modal flex items-end sm:items-center justify-center p-0 sm:p-4 bg-text-primary/40 backdrop-blur-sm animate-in fade-in duration-fast"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={`w-full bg-surface rounded-t-2xl sm:rounded-2xl border border-border shadow-modal max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-base ${maxWidthStyles[maxWidth]} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between p-5 pb-3 border-b border-border">
            <div className="space-y-0.5">
              {title && (
                <h3
                  id="modal-title"
                  className="font-heading text-lg font-bold text-text-primary tracking-tight"
                >
                  {title}
                </h3>
              )}
              {subtitle && <p className="font-body text-xs text-text-secondary">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-text-meta hover:text-text-primary hover:bg-sunken transition-colors duration-fast cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5 overflow-y-auto font-body text-sm text-text-secondary flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 bg-sunken/40 border-t border-border flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
