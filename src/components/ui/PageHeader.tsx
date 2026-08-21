import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  backHref?: string
  backLabel?: string
  action?: React.ReactNode
  badge?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  backHref,
  backLabel = 'Back',
  action,
  badge,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`space-y-3 mb-6 sm:mb-8 ${className}`}>
      {/* Back button or Breadcrumbs */}
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-xs font-body font-semibold text-text-secondary hover:text-text-primary transition-colors duration-fast group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.75} />
          <span>{backLabel}</span>
        </Link>
      )}

      {breadcrumbs && breadcrumbs.length > 0 && !backHref && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-body text-text-meta">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1
            return (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <span className="text-text-disabled">/</span>}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-text-primary transition-colors duration-fast"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-text-secondary font-medium' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            )
          })}
        </nav>
      )}

      {/* Main title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && <p className="font-body text-sm sm:text-base text-text-secondary">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}
