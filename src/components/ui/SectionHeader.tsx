import React from 'react'

export interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  badge?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  action,
  badge,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && <p className="font-body text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
    </div>
  )
}
