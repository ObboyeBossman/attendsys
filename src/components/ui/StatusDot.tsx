import React from 'react'

export type StatusDotColor =
  | 'present'
  | 'absent'
  | 'late'
  | 'excused'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

export type StatusDotSize = 'sm' | 'md' | 'lg'

export interface StatusDotProps {
  color?: StatusDotColor
  size?: StatusDotSize
  pulse?: boolean
  className?: string
  title?: string
}

const colorStyles: Record<StatusDotColor, string> = {
  present: 'bg-attendance-present',
  absent: 'bg-attendance-absent',
  late: 'bg-attendance-late',
  excused: 'bg-attendance-excused',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

const sizeStyles: Record<StatusDotSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
}

export function StatusDot({
  color = 'present',
  size = 'md',
  pulse = false,
  className = '',
  title,
}: StatusDotProps) {
  return (
    <span className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`} title={title}>
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${colorStyles[color]}`}
        />
      )}
      <span className={`relative inline-flex rounded-full ${colorStyles[color]} ${sizeStyles[size]}`} />
    </span>
  )
}
