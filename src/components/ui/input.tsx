import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles matching the second component
        "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs",
        "bg-transparent text-gray-800 border-gray-300",
        "placeholder:text-gray-400",
        "focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10",
        "dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:placeholder:text-white/30 dark:focus:border-brand-800",
        
        // File input styles (preserved from original)
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "file:text-foreground",
        
        // Selection styles (preserved from original)
        "selection:bg-primary selection:text-primary-foreground",
        
        // Disabled state matching second component
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-gray-500 disabled:border-gray-300",
        "dark:disabled:bg-gray-800 dark:disabled:text-gray-400 dark:disabled:border-gray-700",
        
        // Error state matching second component (using aria-invalid)
        "aria-invalid:text-error-800 aria-invalid:border-error-500 aria-invalid:ring-3 aria-invalid:ring-error-500/10",
        "dark:aria-invalid:text-error-400 dark:aria-invalid:border-error-500",
        
        className
      )}
      {...props}
    />
  )
}

export { Input }