"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface BottomNavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  badgeCount?: number
}

export interface BottomNavProps {
  items: BottomNavItem[]
  className?: string
}

export function BottomNav({ items, className = '' }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobile Navigation"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-bottom-nav bg-surface/90 backdrop-blur-lg border-t border-border px-2 py-1 safe-bottom shadow-modal ${className}`}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[60px] min-h-[48px] rounded-xl font-body transition-colors duration-fast ${
                isActive
                  ? 'text-text-primary font-bold'
                  : 'text-text-meta hover:text-text-secondary font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-fast ${
                    isActive ? 'scale-110 text-text-primary' : 'text-text-meta'
                  }`}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-danger text-text-inverse text-[10px] font-bold flex items-center justify-center">
                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-text-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
