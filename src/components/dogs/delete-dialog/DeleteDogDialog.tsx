
import React, { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DogDependencies } from "@/types/dogs";
import { Button } from "@/components/ui/button";
import { DeletionMode } from "@/services/dogs";

interface DeleteDogDialogProps {
  dogName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (mode: DeletionMode) => Promise<boolean>;
  onCheckDependencies: () => Promise<DogDependencies | null>;
}

const DeleteDogDialog: React.FC<DeleteDogDialogProps> = ({
  dogName,
  open,
  onOpenChange,
  onConfirm,
  onCheckDependencies
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dependencies, setDependencies] = useState<DogDependencies | null>(null);
  const [deletionMode, setDeletionMode] = useState<DeletionMode>('soft');
  
  const hasDependencies = dependencies && Object.keys(dependencies).length > 0;
  
  // When dialog opens, check dependencies
  useEffect(() => {
    if (open) {
      checkDependencies();
    }
  }, [open]);
  
  const checkDependencies = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const deps = await onCheckDependencies();
      setDependencies(deps);
      
      // If no dependencies, default to hard delete, otherwise soft delete
      setDeletionMode(deps && Object.keys(deps).length > 0 ? 'soft' : 'hard');
    } catch (error) {
      console.error("Error checking dependencies:", error);
      setError(error instanceof Error ? error.message : "Failed to check dog dependencies");
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      console.log(`Initiating ${deletionMode} deletion of dog "${dogName}" from dialog`);
      const success = await onConfirm(deletionMode);
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
  
  // Format the dependencies for display
  const formatDependencies = () => {
    if (!dependencies) return null;
    
    const sections = [];
    
    // Helper function to format a section
    const formatSection = (key: string, title: string) => {
      const dep = dependencies[key as keyof DogDependencies];
      if (!dep) return null;
      
      return (
        <div key={key} className="mb-2">
          <p className="font-medium">{title} ({dep.count})</p>
          <ul className="text-sm list-disc pl-5">
            {dep.items.slice(0, 3).map((item, index) => (
              <li key={index}>{item.name}</li>
            ))}
            {dep.items.length > 3 && <li>...and {dep.items.length - 3} more</li>}
          </ul>
        </div>
      );
    };
    
    // Add each section if it exists
    const maleBreedings = formatSection('planned_litters', 'Planned Breedings (as Male)');
    if (maleBreedings) sections.push(maleBreedings);
    
    const femaleBreedings = formatSection('planned_litters_female', 'Planned Breedings (as Female)');
    if (femaleBreedings) sections.push(femaleBreedings);
    
    const malePregnancies = formatSection('pregnancies_male', 'Active Pregnancies (as Male)');
    if (malePregnancies) sections.push(malePregnancies);
    
    const femalePregnancies = formatSection('pregnancies_female', 'Active Pregnancies (as Female)');
    if (femalePregnancies) sections.push(femalePregnancies);
    
    const sireLitters = formatSection('litters_sire', 'Litters (as Sire)');
    if (sireLitters) sections.push(sireLitters);
    
    const damLitters = formatSection('litters_dam', 'Litters (as Dam)');
    if (damLitters) sections.push(damLitters);
    
    const events = formatSection('calendar_events', 'Calendar Events');
    if (events) sections.push(events);
    
    return sections.length > 0 ? (
      <div className="mt-3 bg-muted/40 p-3 rounded-md max-h-40 overflow-y-auto">
        {sections}
      </div>
    ) : null;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isChecking ? "Checking dependencies..." : `Delete ${dogName}?`}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {isChecking ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking for related data...</span>
              </div>
            ) : (
              <>
                {hasDependencies ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This dog is used in other parts of the application. 
                      {deletionMode === 'soft' 
                        ? " The dog will be soft-deleted (archived) and marked as deleted in the UI."
                        : " Permanently deleting will remove references in other parts of the app."}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This dog can be permanently removed as it has no dependencies.
                    </AlertDescription>
                  </Alert>
                )}
                
                <p>
                  {deletionMode === 'soft' 
                    ? "This action will mark the dog as deleted but preserve its data and relationships."
                    : "This action cannot be undone. This will permanently delete the dog from your records."}
                </p>
                
                {formatDependencies()}
                
                {error && (
                  <p className="text-destructive font-medium mt-2">
                    Error: {error}
                  </p>
                )}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {!isChecking && (
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            
            {hasDependencies && (
              <div className="flex gap-2">
                <Button 
                  variant={deletionMode === 'soft' ? "default" : "outline"}
                  onClick={() => setDeletionMode('soft')}
                  disabled={isDeleting}
                >
                  Archive
                </Button>
                <Button 
                  variant={deletionMode === 'hard' ? "default" : "outline"}
                  onClick={() => setDeletionMode('hard')}
                  disabled={isDeleting}
                >
                  Permanently Delete
                </Button>
              </div>
            )}
            
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {deletionMode === 'soft' ? 'Archiving...' : 'Deleting...'}
                </>
              ) : (
                deletionMode === 'soft' ? 'Archive Dog' : 'Delete Dog'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDogDialog;
