
import React from 'react';
import { usePreBreedingChecklist } from '@/hooks/usePreBreedingChecklist';
import ChecklistGroup from '@/components/checklist/ChecklistGroup';
import ChecklistProgress from '@/components/checklist/ChecklistProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { PlannedLitter } from '@/types/breeding';
import { useTranslation } from 'react-i18next';

interface PreBreedingChecklistProps {
  litter: PlannedLitter;
}

const PreBreedingChecklist: React.FC<PreBreedingChecklistProps> = ({ litter }) => {
  const { t } = useTranslation('plannedLitters');
  const { checklist, toggleItemCompletion, isLoading } = usePreBreedingChecklist(litter.id);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">{t('preBreeding.checklist.loadingChecklist')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!checklist) {
    return <div>{t('preBreeding.checklist.loadingChecklist')}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClipboardCheck className="h-5 w-5 text-purple-500 mr-2" />
            <CardTitle>{t('preBreeding.checklist.title')}</CardTitle>
          </div>
        </div>
        <CardDescription>
          {t('preBreeding.checklist.description')}
        </CardDescription>
        
        <ChecklistProgress 
          progress={checklist.progress}
          title={t('preBreeding.checklist.overallProgress')}
          className="mt-4"
        />
      </CardHeader>
      <CardContent className="pt-2">
        {checklist.groups.map(group => (
          <ChecklistGroup 
            key={group.id}
            group={group}
            onToggleItem={toggleItemCompletion}
          />
        ))}

        {checklist.progress === 100 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 text-center">
            <h3 className="text-green-800 font-semibold text-lg">{t('preBreeding.checklist.allPreparationsComplete')}</h3>
            <p className="text-green-700 mt-1">{t('preBreeding.checklist.readyToProceed')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreBreedingChecklist;
