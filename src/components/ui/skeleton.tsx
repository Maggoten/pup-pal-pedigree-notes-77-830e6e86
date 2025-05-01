
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
      style={{
        // Ensure stable dimensions to prevent layout shifts
        contain: 'strict',
        ...props.style
      }}
    />
  )
}

export { Skeleton }
