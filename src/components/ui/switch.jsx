import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils" // Assuming you have a utils.js for cn (classnames utility)

const switchVariants = cva(
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-gray-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const thumbVariants = cva(
  "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
);

const Switch = React.forwardRef(({ className, variant, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(switchVariants({ variant, className }))}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className={cn(thumbVariants())} />
  </SwitchPrimitives.Root>
))

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
