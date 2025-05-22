
import { ToastProps } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";

/**
 * Shows toast messages only in non-production environments
 * For developer-facing notifications that should be hidden in production
 */
export function showDevToast(props: ToastProps & { 
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement | {
    label: string;
    onClick: () => void;
    className?: string;
  };
}) {
  // Only show toasts in development or preview environments
  if (process.env.NODE_ENV !== 'production') {
    return toast(props);
  }
  
  // Return a dummy object with the same structure as toast()
  // to ensure any code that uses the return value doesn't break
  return {
    id: 'suppressed-dev-toast',
    dismiss: () => {},
    update: () => {},
  };
}
