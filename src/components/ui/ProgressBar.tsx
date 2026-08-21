import React from 'react'

export type ProgressBarVariant = 'brand' | 'success' | 'warning' | 'danger' | 'attendance'
export type ProgressBarSize = 'sm' | 'md' | 'lg'

export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValueText?: boolean
  variant?: ProgressBarVariant
  size?: ProgressBarSize
  className?: string
}

const trackHeight: Record<ProgressBarSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

const variantFill: Record<ProgressBarVariant, string> = {
  brand: 'bg-brand',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  attendance: 'bg-attendance-present',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValueText = false,
  variant = 'brand',
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  // Dynamic status color if variant is attendance
  const resolvedFill =
    variant === 'attendance'
      ? percentage >= 75
        ? 'bg-attendance-present'
        : percentage >= 50
        ? 'bg-attendance-late'
        : 'bg-attendance-absent'
      : variantFill[variant]

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showValueText) && (
        <div className="flex items-center justify-between text-xs font-body">
          {label && <span className="font-semibold text-text-secondary uppercase tracking-wide">{label}</span>}
          {showValueText && <span className="font-bold text-text-primary tabular-nums">{percentage}%</span>}
        </div>
      )}
      <div
        className={`w-full bg-sunken rounded-full overflow-hidden border border-border/40 ${trackHeight[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`h-full rounded-full transition-all duration-base ease-out ${resolvedFill}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
