
import { useDogs } from '@/context/DogsContext';
import { toast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createCalendarClockIcon } from '@/utils/iconUtils';
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { 
  loadCustomReminders, 
  saveCustomReminders,
  loadCompletedReminders,
  saveCompletedReminders,
  loadDeletedReminders,
  saveDeletedReminders
} from '@/utils/reminderStorage';
import {
  generateDogReminders,
  generateLitterReminders,
  generateGeneralReminders
} from '@/services/ReminderService';

export type { Reminder, CustomReminderInput };

export const useBreedingReminders = () => {
  const { dogs } = useDogs();
  const [customReminders, setCustomReminders] = useState<Reminder[]>([]);
  const [completedReminders, setCompletedReminders] = useState<Set<string>>(new Set());
  const [deletedReminderIds, setDeletedReminderIds] = useState<Set<string>>(new Set());
  
  // Load data from localStorage on mount
  useEffect(() => {
    setCustomReminders(loadCustomReminders());
    setCompletedReminders(loadCompletedReminders());
    setDeletedReminderIds(loadDeletedReminders());
  }, []);
  
  // Save custom reminders to localStorage when they change
  useEffect(() => {
    if (customReminders.length > 0) {
      saveCustomReminders(customReminders);
    }
  }, [customReminders]);
  
  // Save completed reminders to localStorage when they change
  useEffect(() => {
    if (completedReminders.size > 0) {
      saveCompletedReminders(completedReminders);
    }
  }, [completedReminders]);
  
  // Save deleted reminders to localStorage when they change
  useEffect(() => {
    if (deletedReminderIds.size > 0) {
      saveDeletedReminders(deletedReminderIds);
    }
  }, [deletedReminderIds]);
  
  // Generate reminders based on all data sources
  const generateReminders = (): Reminder[] => {
    // Get reminders from different sources
    const dogReminders = generateDogReminders(dogs);
    const litterReminders = generateLitterReminders();
    const generalReminders = generateGeneralReminders(dogs);
    
    // Combine all system-generated reminders
    const systemReminders = [...dogReminders, ...litterReminders, ...generalReminders];
    
    // Filter out deleted reminders
    const filteredReminders = systemReminders.filter(reminder => !deletedReminderIds.has(reminder.id));
    
    // Add custom reminders
    const allReminders = [...filteredReminders, ...customReminders];
    
    // Add completed status to reminders
    return allReminders.map(reminder => ({
      ...reminder,
      isCompleted: completedReminders.has(reminder.id)
    }));
  };

  const allReminders = generateReminders();
  
  // Sort reminders by priority (high first) and then by completion status
  const sortedReminders = [...allReminders].sort((a, b) => {
    // First sort by completion status
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    
    // Then sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  const handleMarkComplete = (id: string) => {
    setCompletedReminders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    
    toast({
      title: completedReminders.has(id) ? "Reminder Reopened" : "Reminder Completed",
      description: completedReminders.has(id) 
        ? "This task has been marked as not completed."
        : "This task has been marked as completed."
    });
  };
  
  const addCustomReminder = (input: CustomReminderInput) => {
    const newReminder: Reminder = {
      id: `custom-${uuidv4()}`,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      type: 'custom',
      icon: createCalendarClockIcon(
        input.priority === 'high' ? 'rose-500' : 
        input.priority === 'medium' ? 'amber-500' : 'green-500'
      )
    };
    
    setCustomReminders(prev => [...prev, newReminder]);
  };
  
  const deleteReminder = (id: string) => {
    // If it's a custom reminder, remove it from the custom reminders array
    if (id.startsWith('custom-')) {
      setCustomReminders(prev => prev.filter(r => r.id !== id));
    } else {
      // For system-generated reminders, add to the deleted reminders set
      setDeletedReminderIds(prev => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
      });
    }
    
    // Also remove from completed if needed
    if (completedReminders.has(id)) {
      setCompletedReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
    
    toast({
      title: "Reminder Deleted",
      description: "The reminder has been deleted successfully."
    });
  };
  
  return {
    reminders: sortedReminders,
    handleMarkComplete,
    addCustomReminder,
    deleteReminder
  };
};
