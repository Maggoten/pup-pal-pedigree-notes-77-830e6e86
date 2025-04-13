
import { Reminder } from "@/types/reminders";
import React from "react";
import { createCalendarClockIcon } from "@/utils/iconUtils";

// Type for the reminder data stored in Supabase
export interface ReminderData {
  id: string;
  user_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  dog_id?: string;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

// Type for the reminder status data stored in Supabase
export interface ReminderStatusData {
  id: string;
  user_id: string;
  reminder_id: string;
  is_completed: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// Helper to create appropriate icon based on reminder type and priority
export const createIconForReminder = (type: string, priority: 'high' | 'medium' | 'low') => {
  // You can expand this to handle all reminder types from your existing code
  const color = priority === 'high' ? 'rose-500' : 
                priority === 'medium' ? 'amber-500' : 'green-500';
  
  return createCalendarClockIcon(color);
};

// Map a reminder from Supabase to the application's Reminder type
export const mapToReminder = (data: ReminderData, isCompleted: boolean = false): Reminder => {
  // Ensure the type is one of the allowed values in Reminder.type
  const safeType = data.type as Reminder['type'];
  
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    dueDate: new Date(data.due_date),
    priority: data.priority,
    type: safeType,
    relatedId: data.dog_id,
    isCompleted,
    icon: createIconForReminder(data.type, data.priority)
  };
};
