import React from 'react'

export type SkeletonShape = 'text' | 'circle' | 'rect' | 'card'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape
  width?: string | number
  height?: string | number
  className?: string
}

export function Skeleton({
  shape = 'rect',
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const customStyles: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  }

  if (shape === 'circle') {
    return (
      <div
        className={`bg-sunken animate-pulse rounded-full flex-shrink-0 ${className}`}
        style={{ width: width || 40, height: height || 40, ...customStyles }}
        aria-hidden="true"
        {...props}
      />
    )
  }

  if (shape === 'text') {
    return (
      <div
        className={`bg-sunken animate-pulse rounded-md h-4 w-full ${className}`}
        style={customStyles}
        aria-hidden="true"
        {...props}
      />
    )
  }

  if (shape === 'card') {
    return (
      <div
        className={`bg-surface border border-border rounded-xl p-5 shadow-card space-y-4 ${className}`}
        style={customStyles}
        aria-hidden="true"
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="bg-sunken animate-pulse h-4 w-28 rounded-md" />
          <div className="bg-sunken animate-pulse h-8 w-8 rounded-full" />
        </div>
        <div className="bg-sunken animate-pulse h-8 w-16 rounded-md" />
        <div className="bg-sunken animate-pulse h-3 w-36 rounded-md" />
      </div>
    )
  }

  return (
    <div
      className={`bg-sunken animate-pulse rounded-xl ${className}`}
      style={customStyles}
      aria-hidden="true"
      {...props}
    />
  )
}
