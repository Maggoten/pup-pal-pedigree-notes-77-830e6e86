
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RemindersTabContent from './RemindersTabContent';
import { Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReminders } from '@/hooks/useReminders';

interface RemindersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RemindersDialog: React.FC<RemindersDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { 
    reminders, 
    handleMarkComplete,
    isLoading 
  } = useReminders();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Bell className="h-5 w-5" />
              Reminders & Tasks
            </DialogTitle>
            
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Add Custom Reminder
            </Button>
          </div>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-muted-foreground">Loading reminders...</span>
          </div>
        ) : (
          <RemindersTabContent 
            reminders={reminders} 
            onComplete={handleMarkComplete} 
            onDelete={() => {}} // Add delete functionality later
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RemindersDialog;
