"use client"

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconClick,
  className = '',
  type,
  disabled,
  id,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const generatedId = React.useId()
  const inputId = id || (label ? `input-${generatedId}` : undefined)

  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block font-body text-xs font-semibold text-text-secondary uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-text-meta">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          type={resolvedType}
          disabled={disabled}
          className={`w-full bg-surface border rounded-xl font-body text-sm text-text-primary placeholder:text-text-meta transition duration-fast outline-none disabled:bg-sunken disabled:text-text-disabled disabled:cursor-not-allowed ${
            leftIcon ? 'pl-10' : 'pl-4'
          } ${isPassword || rightIcon ? 'pr-10' : 'pr-4'} py-2.5 min-h-[44px] ${
            error
              ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
              : 'border-border focus:border-text-primary focus:ring-1 focus:ring-text-primary'
          } ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 p-1 text-text-meta hover:text-text-primary transition-colors duration-fast cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" strokeWidth={1.75} />
            ) : (
              <Eye className="w-4 h-4" strokeWidth={1.75} />
            )}
          </button>
        ) : rightIcon ? (
          <button
            type="button"
            onClick={onRightIconClick}
            className={`absolute right-3 p-1 text-text-meta hover:text-text-primary transition-colors duration-fast ${
              onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
            }`}
            tabIndex={onRightIconClick ? 0 : -1}
          >
            {rightIcon}
          </button>
        ) : null}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="font-body text-xs text-danger font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="font-body text-xs text-text-meta">
          {helperText}
        </p>
      )}
    </div>
  )
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  disabled,
  id,
  ...props
}: TextareaProps) {
  const generatedId = React.useId()
  const inputId = id || (label ? `textarea-${generatedId}` : undefined)

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block font-body text-xs font-semibold text-text-secondary uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        disabled={disabled}
        className={`w-full bg-surface border rounded-xl p-3 font-body text-sm text-text-primary placeholder:text-text-meta transition duration-fast outline-none resize-y min-h-[100px] disabled:bg-sunken disabled:text-text-disabled disabled:cursor-not-allowed ${
          error
            ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
            : 'border-border focus:border-text-primary focus:ring-1 focus:ring-text-primary'
        } ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="font-body text-xs text-danger font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="font-body text-xs text-text-meta">
          {helperText}
        </p>
      )}
    </div>
  )
}
