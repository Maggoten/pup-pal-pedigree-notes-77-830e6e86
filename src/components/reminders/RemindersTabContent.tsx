
import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RemindersList from './RemindersList';
import RemindersPagination from './RemindersPagination';
import { Reminder } from '@/types/reminders';
import { isValidDate } from '@/utils/dateUtils';

interface RemindersTabContentProps {
  reminders: Reminder[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  paginationData?: {
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
  };
}

const RemindersTabContent: React.FC<RemindersTabContentProps> = ({ 
  reminders, 
  onComplete, 
  onDelete,
  paginationData
}) => {
  // Add validation and logging to understand what's happening with reminders
  useEffect(() => {
    console.log(`[RemindersTabContent] Received ${reminders?.length || 0} reminders`);
    
    // Check for invalid dates
    if (reminders && reminders.length > 0) {
      const invalidDateReminders = reminders.filter(r => !r.dueDate || !isValidDate(r.dueDate));
      if (invalidDateReminders.length > 0) {
        console.warn(`[RemindersTabContent] Found ${invalidDateReminders.length} reminders with invalid dates`);
        invalidDateReminders.forEach(r => {
          console.warn(`- ${r.title} (${r.type}) - Invalid due date: ${r.dueDate}`);
        });
      }
      
      // Log a sample of reminders
      console.log(`[RemindersTabContent] Sample reminders (up to 5):`);
      reminders.slice(0, 5).forEach(r => {
        console.log(`- ${r.title} (${r.type}) - Due: ${r.dueDate instanceof Date ? r.dueDate.toISOString() : r.dueDate} - Priority: ${r.priority}`);
      });
      
      // Count by type
      const typeCount: Record<string, number> = {};
      reminders.forEach(r => {
        typeCount[r.type] = (typeCount[r.type] || 0) + 1;
      });
      console.log(`[RemindersTabContent] Reminder counts by type:`, typeCount);
    }
  }, [reminders]);
  
  // Filter reminders with valid dates
  const validReminders = reminders?.filter(r => r.dueDate && isValidDate(r.dueDate)) || [];
  
  // Then filter by priority
  const highPriorityReminders = validReminders.filter(r => r.priority === 'high');
  const mediumPriorityReminders = validReminders.filter(r => r.priority === 'medium');
  const lowPriorityReminders = validReminders.filter(r => r.priority === 'low');
  
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="high" className="text-rose-600">High Priority</TabsTrigger>
        <TabsTrigger value="medium" className="text-amber-600">Medium</TabsTrigger>
        <TabsTrigger value="low" className="text-green-600">Low</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-4">
        <RemindersList 
          reminders={validReminders} 
          onComplete={onComplete}
          onDelete={onDelete}
          showDelete={true}
        />
        
        {paginationData && (
          <RemindersPagination 
            currentPage={paginationData.currentPage}
            totalPages={paginationData.totalPages}
            onPageChange={paginationData.handlePageChange}
          />
        )}
      </TabsContent>
      
      <TabsContent value="high" className="space-y-4">
        <RemindersList 
          reminders={highPriorityReminders} 
          onComplete={onComplete}
          onDelete={onDelete}
          showDelete={true}
        />
      </TabsContent>
      
      <TabsContent value="medium" className="space-y-4">
        <RemindersList 
          reminders={mediumPriorityReminders} 
          onComplete={onComplete}
          onDelete={onDelete}
          showDelete={true}
        />
      </TabsContent>
      
      <TabsContent value="low" className="space-y-4">
        <RemindersList 
          reminders={lowPriorityReminders} 
          onComplete={onComplete}
          onDelete={onDelete}
          showDelete={true}
        />
      </TabsContent>
    </Tabs>
  );
};

export default RemindersTabContent;
