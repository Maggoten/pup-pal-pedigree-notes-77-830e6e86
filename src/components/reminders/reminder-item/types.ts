
import React from 'react';

export interface ReminderItemProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  type: string;
  relatedId?: string;
  isCompleted?: boolean;
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}
