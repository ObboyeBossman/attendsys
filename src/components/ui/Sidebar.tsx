"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Avatar } from './Avatar'

export interface SidebarNavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  badgeCount?: number
  badgeLabel?: string
}

export interface SidebarNavSection {
  title?: string
  items: SidebarNavItem[]
}

export interface SidebarProps {
  sections: SidebarNavSection[]
  headerLogo?: React.ReactNode
  headerTitle?: string
  headerSubtitle?: string
  user?: {
    name: string
    role: string
    avatarUrl?: string | null
  }
  onSignOut?: () => void
  className?: string
}

export function Sidebar({
  sections,
  headerLogo,
  headerTitle = 'attendsys',
  headerSubtitle = 'Admin Portal',
  user,
  onSignOut,
  className = '',
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      aria-label="Desktop Sidebar"
      className={`hidden md:flex flex-col justify-between w-64 h-screen sticky top-0 bg-surface border-r border-border p-4 select-none z-sidebar ${className}`}
    >
      <div className="space-y-6 overflow-y-auto">
        {/* Brand / Institution Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          {headerLogo ? (
            headerLogo
          ) : (
            <div className="w-8 h-8 rounded-xl bg-cta text-cta-text flex items-center justify-center font-heading font-black text-sm shadow-card">
              A
            </div>
          )}
          <div>
            <h2 className="font-heading text-base font-bold text-text-primary tracking-tight leading-none">
              {headerTitle}
            </h2>
            {headerSubtitle && (
              <p className="font-body text-xs text-text-meta mt-0.5">{headerSubtitle}</p>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-6" aria-label="Main Navigation">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <div className="px-3 pb-1 text-[11px] font-semibold text-text-meta uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href))

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl font-body text-sm font-medium transition duration-fast group ${
                        isActive
                          ? 'bg-sunken text-text-primary font-semibold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-sunken/60'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-text-primary'
                              : 'text-text-meta group-hover:text-text-primary'
                          }`}
                          strokeWidth={isActive ? 2 : 1.75}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badgeCount !== undefined && item.badgeCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-cta text-cta-text leading-none">
                          {item.badgeCount}
                        </span>
                      )}
                      {item.badgeLabel && (
                        <span className="px-2 py-0.5 text-2xs font-semibold rounded-full bg-sunken text-text-secondary border border-border">
                          {item.badgeLabel}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User profile & Sign out */}
      {user && (
        <div className="pt-4 border-t border-border mt-auto flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar name={user.name} src={user.avatarUrl} size="sm" />
            <div className="min-w-0">
              <p className="font-heading text-xs font-bold text-text-primary truncate leading-tight">
                {user.name}
              </p>
              <p className="font-body text-[11px] text-text-meta truncate">{user.role}</p>
            </div>
          </div>
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="p-1.5 rounded-lg text-text-meta hover:text-danger hover:bg-danger-subtle transition-colors duration-fast cursor-pointer"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
