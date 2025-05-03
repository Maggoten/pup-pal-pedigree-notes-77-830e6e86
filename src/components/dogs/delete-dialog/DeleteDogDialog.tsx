
import React, { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { checkDogDependencies } from "@/utils/dogDependencyCheck";

interface DeleteDogDialogProps {
  dogName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
}

const DeleteDogDialog: React.FC<DeleteDogDialogProps> = ({
  dogName,
  open,
  onOpenChange,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingDependencies, setIsCheckingDependencies] = useState(false);
  const [dependencyError, setDependencyError] = useState<string | null>(null);
  
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      console.log(`Initiating deletion of dog "${dogName}" from dialog`);
      const success = await onConfirm();
      console.log(`Deletion result for ${dogName}:`, success);
      
      if (success) {
        onOpenChange(false);
      } else {
        setError("Deletion failed without throwing an error. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting dog:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              This action cannot be undone. This will permanently delete {dogName} from your records.
            </p>
            {error && (
              <p className="text-destructive font-medium flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                Error: {error}
              </p>
            )}
            {dependencyError && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-amber-800 font-medium flex items-center gap-1.5">
                  <Info className="h-4 w-4" />
                  {dependencyError}
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting || isCheckingDependencies}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={async (e) => {
              e.preventDefault();
              
              // First check for dependencies
              setIsCheckingDependencies(true);
              setDependencyError(null);
              
              try {
                // We need to extract the dog ID from the context
                // This will be done in DogDetails.tsx
                handleConfirmDelete();
              } finally {
                setIsCheckingDependencies(false);
              }
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting || isCheckingDependencies || !!dependencyError}
          >
            {isCheckingDependencies ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDogDialog;
