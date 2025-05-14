
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useReminders } from '@/context/RemindersContext';
import RemindersList from './RemindersList';
import AddReminderForm from './AddReminderForm';
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RemindersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RemindersDialog: React.FC<RemindersDialogProps> = ({ open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { 
    reminders, 
    isLoading, 
    hasError, 
    handleMarkComplete,
    remindersSummary 
  } = useReminders();
  
  // Implement these functions if they don't exist in the context
  const addCustomReminder = (data: CustomReminderInput) => {
    console.log("Adding custom reminder:", data);
    // If this function exists in the context, use it instead
    if ('addReminder' in useReminders()) {
      return (useReminders() as any).addReminder(data);
    }
    // Otherwise just log that it's not implemented
    console.warn("addReminder not implemented in RemindersContext");
    return Promise.resolve(false);
  };
  
  const deleteReminder = (id: string) => {
    console.log("Deleting reminder:", id);
    // If this function exists in the context, use it instead
    if ('removeReminder' in useReminders()) {
      return (useReminders() as any).removeReminder(id);
    }
    // Otherwise just log that it's not implemented
    console.warn("removeReminder not implemented in RemindersContext");
  };

  // Filter reminders based on active tab
  const filteredReminders = useMemo(() => {
    if (!reminders) return [];
    
    const currentDate = new Date();
    return reminders.filter(reminder => {
      const dueDate = new Date(reminder.dueDate);
      
      if (activeTab === 'upcoming') {
        return !reminder.isCompleted && dueDate >= currentDate;
      } else if (activeTab === 'completed') {
        return reminder.isCompleted;
      } else if (activeTab === 'past') {
        return !reminder.isCompleted && dueDate < currentDate;
      }
      return true;
    });
  }, [reminders, activeTab]);

  const handleAddReminderClick = () => {
    setShowAddForm(true);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
  };

  const handleFormSubmit = async (data: CustomReminderInput) => {
    const success = await addCustomReminder(data);
    if (success) {
      setShowAddForm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Plus className="h-6 w-6 text-primary" />
            Reminders
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left side - Add new reminder */}
          <div className="space-y-4">
            <div className="font-medium text-sm flex items-center gap-2 text-primary">
              Add New Reminder
            </div>
            
            <AddReminderForm onSubmit={handleFormSubmit} />
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
              <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming">
                  <RemindersList reminders={filteredReminders} onComplete={handleMarkComplete} onDelete={deleteReminder} />
                </TabsContent>
                <TabsContent value="completed">
                  <RemindersList reminders={filteredReminders} onComplete={handleMarkComplete} onDelete={deleteReminder} />
                </TabsContent>
                <TabsContent value="past">
                  <RemindersList reminders={filteredReminders} onComplete={handleMarkComplete} onDelete={deleteReminder} />
                </TabsContent>
              </Tabs>
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
