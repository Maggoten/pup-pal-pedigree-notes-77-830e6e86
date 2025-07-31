
import React from 'react';
import { usePregnancyChecklist } from '@/hooks/usePregnancyChecklist';
import ChecklistGroup from '@/components/checklist/ChecklistGroup';
import ChecklistProgress from '@/components/checklist/ChecklistProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

interface PregnancyChecklistProps {
  pregnancyId: string;
  femaleName: string;
}

const PregnancyChecklist: React.FC<PregnancyChecklistProps> = ({ 
  pregnancyId,
  femaleName
}) => {
  const { t, ready } = useTranslation('pregnancy');
  const { checklist, toggleItemCompletion, isLoading, error } = usePregnancyChecklist(pregnancyId);

  // Loading state for translations
  if (!ready) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <ClipboardList className="h-5 w-5 text-purple-500 mr-2" />
            <Skeleton className="h-6 w-[250px]" />
          </div>
          <Skeleton className="h-4 w-[300px] mt-1" />
          <Skeleton className="h-6 w-full mt-4" />
        </CardHeader>
        <CardContent className="pt-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="mb-4">
              <Skeleton className="h-5 w-[200px] mb-2" />
              <div className="pl-4">
                {[1, 2].map((subitem) => (
                  <div key={subitem} className="flex items-center mb-2">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-[250px]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <ClipboardList className="h-5 w-5 text-purple-500 mr-2" />
            <Skeleton className="h-6 w-[250px]" />
          </div>
          <Skeleton className="h-4 w-[300px] mt-1" />
          <Skeleton className="h-6 w-full mt-4" />
        </CardHeader>
        <CardContent className="pt-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="mb-4">
              <Skeleton className="h-5 w-[200px] mb-2" />
              <div className="pl-4">
                {[1, 2].map((subitem) => (
                  <div key={subitem} className="flex items-center mb-2">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-[250px]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-300">
        <CardHeader>
          <div className="flex items-center">
            <ClipboardList className="h-5 w-5 text-red-500 mr-2" />
            <CardTitle>{t('symptoms.checklist.errorTitle', 'Error Loading Symptoms Tracker')}</CardTitle>
          </div>
          <CardDescription className="text-red-500">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <p>{t('symptoms.checklist.errorMessage', 'Please try refreshing the page or contact support if the problem persists.')}</p>
        </CardContent>
      </Card>
    );
  }

  // No checklist state
  if (!checklist) {
    return (
      <Card>
        <CardHeader>
        <div className="flex items-center">
          <ClipboardList className="h-5 w-5 text-purple-500 mr-2" />
          <CardTitle>{t('symptoms.checklist.title', 'Pregnancy Symptoms Tracker')}</CardTitle>
        </div>
        <CardDescription>
          {t('symptoms.checklist.noData', 'Unable to load symptom tracker. Please try again.')}
        </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <ClipboardList className="h-5 w-5 text-purple-500 mr-2" />
          <CardTitle>{t('symptoms.checklist.title', 'Pregnancy Symptoms Tracker')}</CardTitle>
        </div>
        <CardDescription>
          {t('symptoms.checklist.description', 'Check off symptoms as you observe them in {{femaleName}}\'s pregnancy', { femaleName })}
        </CardDescription>
        
        <ChecklistProgress 
          progress={checklist.progress}
          title={t('symptoms.checklist.progressTitle', 'Symptoms Observed')}
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
      </CardContent>
    </Card>
  );
};

export default PregnancyChecklist;
