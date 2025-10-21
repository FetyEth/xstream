import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 text-sm font-light text-white shadow-sm transition-all duration-300 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:border-white/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
