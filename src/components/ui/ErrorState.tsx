import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

export interface ErrorStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  retryAction?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorState({
  icon,
  title = 'Something went wrong',
  description = 'An error occurred while loading this data. Please try again.',
  retryAction,
  retryLabel = 'Try again',
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-danger-subtle/50 rounded-xl border border-danger/20 shadow-card ${className}`}
      role="alert"
    >
      <div className="w-12 h-12 rounded-full bg-danger-subtle flex items-center justify-center text-danger mb-4">
        {icon || <AlertCircle className="w-6 h-6" strokeWidth={1.75} />}
      </div>
      <h3 className="font-heading text-base sm:text-lg font-bold text-text-primary mb-1 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="font-body text-xs sm:text-sm text-text-secondary max-w-sm mb-6">
          {description}
        </p>
      )}
      {retryAction && (
        <Button
          variant="secondary"
          size="md"
          onClick={retryAction}
          leftIcon={<RefreshCw className="w-4 h-4" strokeWidth={1.75} />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
