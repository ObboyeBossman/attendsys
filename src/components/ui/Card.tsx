"use client"

import React from 'react'

export type CardVariant = 'default' | 'raised' | 'flat'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: CardVariant
  padding?: CardPadding
  clickable?: boolean
  as?: 'div' | 'article' | 'section' | 'li'
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-surface border border-border shadow-card',
  raised: 'bg-surface border border-border shadow-raised',
  flat: 'bg-sunken border border-transparent shadow-none',
}

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  clickable = false,
  onClick,
  className = '',
  as = 'div',
  ...props
}: CardProps) {
  const Component = as as keyof React.JSX.IntrinsicElements
  return (
    <Component
      className={`rounded-xl transition-all duration-base ${variantStyles[variant]} ${paddingStyles[padding]} ${
        clickable
          ? 'cursor-pointer hover:shadow-raised hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta'
          : ''
      } ${className}`}
      onClick={onClick as React.MouseEventHandler<any>}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e: React.KeyboardEvent<any>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </Component>
  )
}

export interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div className="space-y-1">
        <h3 className="font-heading text-lg font-bold text-text-primary tracking-tight">{title}</h3>
        {subtitle && <p className="font-body text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export function CardDivider({ className = '' }: { className?: string }) {
  return <hr className={`my-4 border-t border-border ${className}`} />
}

export interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  trend?: {
    value: string
    isPositive?: boolean
  }
  icon?: React.ReactNode
  className?: string
  onClick?: () => void
}

export function StatCard({
  label,
  value,
  subValue,
  trend,
  icon,
  className = '',
  onClick,
}: StatCardProps) {
  return (
    <Card
      clickable={Boolean(onClick)}
      onClick={onClick}
      padding="md"
      className={`relative overflow-hidden flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-body text-xs font-semibold uppercase tracking-wide text-text-meta">{label}</span>
        {icon && <span className="text-text-secondary flex-shrink-0">{icon}</span>}
      </div>
      <div className="space-y-1">
        <div className="font-heading text-2xl sm:text-3xl font-bold text-text-primary tabular-nums tracking-tight">
          {value}
        </div>
        {(subValue || trend) && (
          <div className="flex items-center gap-2 text-xs font-body text-text-secondary">
            {trend && (
              <span
                className={`font-semibold ${
                  trend.isPositive ? 'text-success' : 'text-danger'
                }`}
              >
                {trend.value}
              </span>
            )}
            {subValue && <span>{subValue}</span>}
          </div>
        )}
      </div>
    </Card>
  )
}
