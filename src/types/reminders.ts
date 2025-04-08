
import React from 'react';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  type: 'heat' | 'mating' | 'vaccination' | 'deworming' | 'weighing' | 'vet-visit' | 'birthday' | 'other' | 'custom';
  relatedId?: string; // ID of the related dog or litter
  isCompleted?: boolean;
}

export interface CustomReminderInput {
  title: string;
  description: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
}

export interface UpcomingHeat {
  dogId: string;
  dogName: string;
  date: Date;
}
