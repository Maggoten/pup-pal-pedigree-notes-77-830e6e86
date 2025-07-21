
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RemindersList from './RemindersList';
import { Reminder } from '@/types/reminders';
import { useTranslation } from 'react-i18next';

interface RemindersTabContentProps {
  reminders: Reminder[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const RemindersTabContent: React.FC<RemindersTabContentProps> = ({ 
  reminders, 
  onComplete, 
  onDelete 
}) => {
  const { t } = useTranslation('home');
  const highPriorityReminders = reminders.filter(r => r.priority === 'high');
  const mediumPriorityReminders = reminders.filter(r => r.priority === 'medium');
  const lowPriorityReminders = reminders.filter(r => r.priority === 'low');
  
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="all">{t('tabs.reminders.all')}</TabsTrigger>
        <TabsTrigger value="high" className="text-rose-600">{t('tabs.reminders.highPriority')}</TabsTrigger>
        <TabsTrigger value="medium" className="text-amber-600">{t('tabs.reminders.medium')}</TabsTrigger>
        <TabsTrigger value="low" className="text-green-600">{t('tabs.reminders.low')}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-4">
        <RemindersList 
          reminders={reminders} 
          onComplete={onComplete}
          onDelete={onDelete}
          showDelete={true}
        />
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
