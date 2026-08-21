"use client"

import React from 'react'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-cta text-cta-text hover:bg-cta-hover shadow-card active:scale-[0.98]',
  secondary: 'bg-sunken text-text-primary hover:bg-border active:scale-[0.98]',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-sunken active:scale-[0.98]',
  danger: 'bg-danger text-text-inverse hover:opacity-90 active:scale-[0.98]',
  link: 'bg-transparent text-brand underline-offset-4 hover:underline !p-0 !min-h-0 !shadow-none',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 min-h-[36px]',
  md: 'text-sm px-5 py-2.5 min-h-[44px]',
  lg: 'text-base px-6 py-3 min-h-[50px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-body font-semibold rounded-full select-none cursor-pointer transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantStyles[variant]} ${variant !== 'link' ? sizeStyles[size] : ''} ${className}`}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" strokeWidth={1.75} aria-hidden="true" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  )
}
