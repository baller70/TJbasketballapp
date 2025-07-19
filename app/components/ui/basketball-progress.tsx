"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Progress } from "./progress"

interface BasketballProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'court' | 'achievement'
  label?: string
  showPercentage?: boolean
  className?: string
}

const BasketballProgress = React.forwardRef<
  HTMLDivElement,
  BasketballProgressProps
>(({ 
  value, 
  max = 100, 
  size = 'md', 
  variant = 'default', 
  label, 
  showPercentage = true,
  className,
  ...props 
}, ref) => {
  const percentage = Math.min((value / max) * 100, 100)
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }
  
  const variantClasses = {
    default: 'bg-gradient-to-r from-orange-500 to-orange-600',
    court: 'bg-gradient-to-r from-amber-600 to-orange-600',
    achievement: 'bg-gradient-to-r from-yellow-500 to-orange-500'
  }

  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-gray-600 font-semibold">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
})
BasketballProgress.displayName = "BasketballProgress"

export { BasketballProgress }
export type { BasketballProgressProps }
