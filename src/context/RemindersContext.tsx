
import React, { createContext, useContext, useState } from 'react';
import { Reminder } from '@/types/reminders';

interface RemindersSummary {
  total: number;
  incomplete: number;
  upcoming: number;
}

interface RemindersContextType {
  reminders: Reminder[];
  isLoading: boolean;
  hasError: boolean;
  handleMarkComplete: (id: string) => Promise<void>;
  remindersSummary: RemindersSummary;
  refreshReminders?: () => void;
  addCustomReminder?: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  deleteReminder?: (id: string) => Promise<void>;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export const RemindersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const remindersSummary: RemindersSummary = {
    total: reminders.length,
    incomplete: reminders.filter(r => !r.isCompleted).length,
    upcoming: reminders.filter(r => !r.isCompleted && new Date(r.dueDate) > new Date()).length
  };
  
  const handleMarkComplete = async (id: string) => {
    // Implementation
  };
  
  const refreshReminders = () => {
    // Implementation
  };
  
  const addCustomReminder = async (reminder: Omit<Reminder, 'id'>) => {
    // Implementation
  };
  
  const deleteReminder = async (id: string) => {
    // Implementation
  };
  
  return (
    <RemindersContext.Provider value={{
      reminders,
      isLoading,
      hasError,
      handleMarkComplete,
      remindersSummary,
      refreshReminders,
      addCustomReminder,
      deleteReminder
    }}>
      {children}
    </RemindersContext.Provider>
  );
};

export const useReminders = (): RemindersContextType => {
  const context = useContext(RemindersContext);
  if (!context) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
};
