/**
 * attendsys UI Component Library — Barrel Export
 *
 * Single source of truth for all primitive UI components.
 * Import directly from "@/components/ui"
 */

// Button
export { Button } from './Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button'

// Card & Sub-components
export { Card, CardHeader, CardDivider, StatCard } from './Card'
export type { CardProps, CardVariant, CardPadding, CardHeaderProps, StatCardProps } from './Card'

// Badge & Attendance
export { Badge } from './Badge'
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge'
export { AttendanceBadge } from './AttendanceBadge'
export type { AttendanceBadgeProps, AttendanceStatus } from './AttendanceBadge'

// Input & Form Elements
export { Input, Textarea } from './Input'
export type { InputProps, TextareaProps } from './Input'

// Indicators & Feedback
export { StatusDot } from './StatusDot'
export type { StatusDotProps, StatusDotColor, StatusDotSize } from './StatusDot'
export { ProgressBar } from './ProgressBar'
export type { ProgressBarProps, ProgressBarVariant, ProgressBarSize } from './ProgressBar'
export { Skeleton } from './Skeleton'
export type { SkeletonProps, SkeletonShape } from './Skeleton'
export { Toast } from './Toast'
export type { ToastProps, ToastVariant } from './Toast'

// Presentation & Media
export { Avatar } from './Avatar'
export type { AvatarProps, AvatarSize } from './Avatar'
export { CalendarDay } from './CalendarDay'
export type { CalendarDayProps, CalendarDayState } from './CalendarDay'

// Headers & States
export { SectionHeader } from './SectionHeader'
export type { SectionHeaderProps } from './SectionHeader'
export { PageHeader } from './PageHeader'
export type { PageHeaderProps, BreadcrumbItem } from './PageHeader'
export { EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'
export { ErrorState } from './ErrorState'
export type { ErrorStateProps } from './ErrorState'

// Navigation & Overlays
export { BottomNav } from './BottomNav'
export type { BottomNavProps, BottomNavItem } from './BottomNav'
export { Sidebar } from './Sidebar'
export type { SidebarProps, SidebarNavItem, SidebarNavSection } from './Sidebar'
export { Modal } from './Modal'
export type { ModalProps } from './Modal'
