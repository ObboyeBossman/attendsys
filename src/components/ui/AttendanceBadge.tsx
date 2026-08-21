import React from 'react'
import { Check, X, Clock, ShieldCheck, HelpCircle } from 'lucide-react'
import { Badge, BadgeSize } from './Badge'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'unmarked'

export interface AttendanceBadgeProps {
  status: AttendanceStatus
  size?: BadgeSize
  showIcon?: boolean
  customLabel?: string
  className?: string
}

const statusConfig: Record<
  AttendanceStatus,
  {
    variant: 'present' | 'absent' | 'late' | 'excused' | 'neutral'
    defaultLabel: string
    icon: React.ReactNode
  }
> = {
  present: {
    variant: 'present',
    defaultLabel: 'Present',
    icon: <Check className="w-3 h-3" strokeWidth={2} />,
  },
  absent: {
    variant: 'absent',
    defaultLabel: 'Absent',
    icon: <X className="w-3 h-3" strokeWidth={2} />,
  },
  late: {
    variant: 'late',
    defaultLabel: 'Late',
    icon: <Clock className="w-3 h-3" strokeWidth={2} />,
  },
  excused: {
    variant: 'excused',
    defaultLabel: 'Excused',
    icon: <ShieldCheck className="w-3 h-3" strokeWidth={2} />,
  },
  unmarked: {
    variant: 'neutral',
    defaultLabel: 'Pending',
    icon: <HelpCircle className="w-3 h-3" strokeWidth={2} />,
  },
}

export function AttendanceBadge({
  status,
  size = 'md',
  showIcon = true,
  customLabel,
  className = '',
}: AttendanceBadgeProps) {
  const config = statusConfig[status] || statusConfig.unmarked

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={showIcon ? config.icon : undefined}
      className={className}
    >
      {customLabel || config.defaultLabel}
    </Badge>
  )
}
