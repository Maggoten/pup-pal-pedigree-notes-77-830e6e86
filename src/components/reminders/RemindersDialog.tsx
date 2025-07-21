
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
import { useTranslation } from 'react-i18next';

interface RemindersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RemindersDialog: React.FC<RemindersDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation('home');
  
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
            {t('dialogs.reminders.title')}
          </DialogTitle>
          <DialogDescription>
            {t('dialogs.reminders.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left side - Add new reminder */}
          <div className="space-y-4">
            <div className="font-medium text-sm flex items-center gap-2 text-primary">
              {t('dialogs.reminders.addNewReminder')}
            </div>
            
            <AddReminderForm onSubmit={addCustomReminder} />
          </div>
          
          {/* Right side - Tabs with reminders lists */}
          <div className="md:col-span-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-60">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <span className="text-muted-foreground">{t('reminders.loading')}</span>
              </div>
            ) : hasError ? (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  {t('dialogs.reminders.loadingError')}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('dialogs.reminders.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemindersDialog;
