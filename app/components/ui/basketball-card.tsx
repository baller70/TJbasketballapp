"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

interface BasketballCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'court' | 'highlight' | 'achievement'
  interactive?: boolean
}

const BasketballCard = React.forwardRef<HTMLDivElement, BasketballCardProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    const variants = {
      default: "card-basketball hover:shadow-basketball transition-all duration-300",
      court: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-court",
      highlight: "bg-gradient-to-r from-orange-500 to-blue-600 text-white border-0 shadow-lg",
      achievement: "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 hover:shadow-basketball"
    }
    
    const interactiveStyles = interactive 
      ? "cursor-pointer hover:scale-[1.02] hover:-translate-y-1 transition-transform duration-200" 
      : ""

    return (
      <Card
        ref={ref}
        className={cn(
          variants[variant],
          interactiveStyles,
          className
        )}
        {...props}
      >
        {children}
      </Card>
    )
  }
)
BasketballCard.displayName = "BasketballCard"

export { BasketballCard }
export type { BasketballCardProps }
