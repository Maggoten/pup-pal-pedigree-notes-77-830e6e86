
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RemindersList from './RemindersList';
import RemindersPagination from './RemindersPagination';
import { Reminder } from '@/types/reminders';

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
  const highPriorityReminders = reminders.filter(r => r.priority === 'high');
  const mediumPriorityReminders = reminders.filter(r => r.priority === 'medium');
  const lowPriorityReminders = reminders.filter(r => r.priority === 'low');
  
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
          reminders={reminders} 
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
