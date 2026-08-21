import React from 'react'

export type CalendarDayState =
  | 'empty'
  | 'present'
  | 'absent'
  | 'late'
  | 'excused'
  | 'today'
  | 'selected'
  | 'default'

export interface CalendarDayProps {
  dayNumber?: number | string
  state?: CalendarDayState
  isToday?: boolean
  isSelected?: boolean
  hasEvent?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function CalendarDay({
  dayNumber,
  state = 'default',
  isToday = false,
  isSelected = false,
  hasEvent = false,
  disabled = false,
  onClick,
  className = '',
}: CalendarDayProps) {
  if (state === 'empty' || dayNumber === undefined) {
    return <div className="w-10 h-10 min-w-[36px] min-h-[36px]" aria-hidden="true" />
  }

  // Determine indicator dot or ring based on attendance state
  const indicatorColor =
    state === 'present'
      ? 'bg-attendance-present'
      : state === 'absent'
      ? 'bg-attendance-absent'
      : state === 'late'
      ? 'bg-attendance-late'
      : state === 'excused'
      ? 'bg-attendance-excused'
      : null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative w-10 h-10 sm:w-11 sm:h-11 flex flex-col items-center justify-center rounded-full font-body text-sm font-semibold transition-all duration-fast select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta disabled:opacity-30 disabled:cursor-not-allowed ${
        isSelected
          ? 'bg-cta text-cta-text shadow-card scale-105 font-bold'
          : isToday
          ? 'bg-brand-subtle text-brand border border-brand/30 font-bold'
          : 'bg-surface text-text-primary hover:bg-sunken border border-transparent'
      } ${className}`}
      aria-current={isToday ? 'date' : undefined}
      aria-selected={isSelected}
    >
      <span className="tabular-nums leading-none">{dayNumber}</span>
      {indicatorColor && !isSelected && (
        <span
          className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${indicatorColor}`}
        />
      )}
      {hasEvent && !indicatorColor && !isSelected && (
        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-text-meta" />
      )}
    </button>
  )
}
