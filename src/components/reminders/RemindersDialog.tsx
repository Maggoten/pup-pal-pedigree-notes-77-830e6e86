
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Loader2 } from 'lucide-react';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import AddReminderForm from './AddReminderForm';
import RemindersTabContent from './RemindersTabContent';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RemindersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RemindersDialog: React.FC<RemindersDialogProps> = ({ open, onOpenChange }) => {
  // Since this is a modal dialog, it's okay to use the hook here
  // It will only fetch once when the dialog is opened
  const { 
    reminders, 
    isLoading, 
    hasError, 
    handleMarkComplete, 
    addCustomReminder, 
    deleteReminder 
  } = useBreedingReminders();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6 text-primary" />
            Breeding Reminders
          </DialogTitle>
          <DialogDescription>
            Manage your breeding program tasks and reminders
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left side - Add new reminder */}
          <div className="space-y-4">
            <div className="font-medium text-sm flex items-center gap-2 text-primary">
              Add New Reminder
            </div>
            
            <AddReminderForm onSubmit={addCustomReminder} />
          </div>
          
          {/* Right side - Tabs with reminders lists */}
          <div className="md:col-span-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-60">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <span className="text-muted-foreground">Loading reminders...</span>
              </div>
            ) : hasError ? (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  There was a problem loading your reminders. Please try refreshing the page.
                </AlertDescription>
              </Alert>
            ) : (
              <RemindersTabContent 
                reminders={reminders} 
                onComplete={handleMarkComplete}
                onDelete={deleteReminder}
              />
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemindersDialog;
