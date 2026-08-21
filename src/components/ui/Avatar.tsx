"use client"

import React, { useState } from 'react'

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps {
  src?: string | null
  name?: string
  alt?: string
  size?: AvatarSize
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-2xs',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({
  src,
  name = '',
  alt = 'Avatar',
  size = 'md',
  className = '',
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const initials = getInitials(name)

  return (
    <div
      className={`relative inline-flex items-center justify-center font-heading font-bold rounded-full overflow-hidden flex-shrink-0 select-none bg-sunken text-text-secondary border border-border ${sizeStyles[size]} ${className}`}
      title={name || alt}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="tracking-tight">{initials}</span>
      )}
    </div>
  )
}
