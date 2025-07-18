"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"

interface StatDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  variant?: 'default' | 'basketball' | 'achievement'
}

const StatDisplay = React.forwardRef<HTMLDivElement, StatDisplayProps>(
  ({ 
    className, 
    label, 
    value, 
    icon, 
    trend, 
    trendValue, 
    variant = 'default',
    ...props 
  }, ref) => {
    const variants = {
      default: "bg-white border-gray-200",
      basketball: "bg-gradient-to-br from-orange-50 to-blue-50 border-orange-200",
      achievement: "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300"
    }

    const trendColors = {
      up: "text-green-600",
      down: "text-red-600",
      neutral: "text-gray-600"
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "hover:shadow-lg transition-all duration-200",
          variants[variant],
          className
        )}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trend && trendValue && (
                <p className={cn("text-sm font-medium", trendColors[trend])}>
                  {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
                </p>
              )}
            </div>
            {icon && (
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  {icon}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)
StatDisplay.displayName = "StatDisplay"

export { StatDisplay }
export type { StatDisplayProps }
