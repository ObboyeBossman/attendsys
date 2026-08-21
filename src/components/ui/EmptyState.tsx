import React from 'react'
import { FolderOpen } from 'lucide-react'
import { Button, ButtonProps } from './Button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: ButtonProps['variant']
    icon?: React.ReactNode
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-surface rounded-xl border border-dashed border-border shadow-card ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-sunken flex items-center justify-center text-text-meta mb-4">
        {icon || <FolderOpen className="w-6 h-6" strokeWidth={1.75} />}
      </div>
      <h3 className="font-heading text-base sm:text-lg font-bold text-text-primary mb-1 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="font-body text-xs sm:text-sm text-text-secondary max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          size="md"
          onClick={action.onClick}
          leftIcon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
