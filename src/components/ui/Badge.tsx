"use client"

import React from 'react'

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'brand'
  | 'present'
  | 'absent'
  | 'late'
  | 'excused'

export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-subtle text-success border-success/20',
  warning: 'bg-warning-subtle text-warning border-warning/20',
  danger: 'bg-danger-subtle text-danger border-danger/20',
  info: 'bg-info-subtle text-info border-info/20',
  neutral: 'bg-sunken text-text-secondary border-border',
  brand: 'bg-brand-subtle text-brand border-brand/20',
  present: 'bg-attendance-present-subtle text-attendance-present border-attendance-present/20',
  absent: 'bg-attendance-absent-subtle text-attendance-absent border-attendance-absent/20',
  late: 'bg-attendance-late-subtle text-attendance-late border-attendance-late/20',
  excused: 'bg-attendance-excused-subtle text-attendance-excused border-attendance-excused/20',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-2xs px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center font-body font-semibold rounded-full border whitespace-nowrap leading-none transition-colors duration-fast ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
