
import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Process action if it's an object and not a React element
        let actionElement = null;
        if (action) {
          if (React.isValidElement(action)) {
            actionElement = action;
          } else if (typeof action === 'object' && 'label' in action) {
            const { label, onClick, className } = action as { label: string; onClick: () => void; className?: string };
            actionElement = (
              <button
                className={className || "bg-white text-red-600 px-3 py-1 rounded-md text-xs font-medium"}
                onClick={onClick}
              >
                {label}
              </button>
            );
          }
        }

        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {actionElement}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
