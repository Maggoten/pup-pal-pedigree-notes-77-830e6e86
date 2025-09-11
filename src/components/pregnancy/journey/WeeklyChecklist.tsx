
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChecklistItem as ChecklistItemType } from '@/types/checklist';
import { ClipboardList, Loader2 } from 'lucide-react';
import ChecklistItem from '@/components/checklist/ChecklistItem';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface WeeklyChecklistProps {
  checklistItems: ChecklistItemType[];
  onToggleItem: (itemId: string) => void;
  weekNumber: number;
  isLoading?: boolean;
}

const WeeklyChecklist: React.FC<WeeklyChecklistProps> = ({
  checklistItems,
  onToggleItem,
  weekNumber,
  isLoading = false
}) => {
  const { t, ready } = useTranslation('pregnancy');
  const { user } = useAuth();
  
  console.log(`📋 WeeklyChecklist rendered for week ${weekNumber}:`, { 
    itemsCount: checklistItems?.length, 
    isLoading,
    isAuthenticated: !!user,
    ready
  });

  // Loading state or translations not ready
  if (!ready || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            {t('journey.checklist.title', { weekNumber })}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          {t('loading.symptoms')}
        </CardContent>
      </Card>
    );
  }

  // No items
  if (!checklistItems || checklistItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            {t('journey.checklist.title', { weekNumber })}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          {t('journey.checklist.noSymptoms')}
        </CardContent>
      </Card>
    );
  }

  // Render checklist
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          {t('journey.checklist.title', { weekNumber })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {checklistItems.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={() => onToggleItem(item.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyChecklist;
