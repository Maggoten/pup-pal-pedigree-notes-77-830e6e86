
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
import { useAuth } from '@/hooks/useAuth';

interface RemindersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RemindersDialog: React.FC<RemindersDialogProps> = ({ open, onOpenChange }) => {
  const { isLoggedIn } = useAuth();
  const { 
    reminders, 
    handleMarkComplete, 
    addCustomReminder, 
    deleteReminder, 
    loadingReminders 
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
        
        {!isLoggedIn && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <p className="text-amber-800 text-sm">
              Please sign in to save and sync your reminders across devices.
            </p>
          </div>
        )}
        
        {loadingReminders ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary/50 mb-4" />
            <p className="text-sm text-muted-foreground">Loading your reminders...</p>
          </div>
        ) : (
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
              <RemindersTabContent 
                reminders={reminders} 
                onComplete={handleMarkComplete}
                onDelete={deleteReminder}
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemindersDialog;
