import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-4 py-2 text-sm font-light transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-white/10 bg-white/5 text-neutral-200 backdrop-blur-sm hover:bg-white/10",
        secondary:
          "border-white/10 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
        destructive:
          "border-red-500/30 bg-red-500/10 text-red-200 shadow hover:bg-red-500/20",
        outline: "border-white/20 text-white hover:bg-white/5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
