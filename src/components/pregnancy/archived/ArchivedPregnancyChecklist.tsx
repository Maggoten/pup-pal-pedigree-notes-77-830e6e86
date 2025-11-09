import React from 'react';
import { usePregnancyChecklist } from '@/hooks/usePregnancyChecklist';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ClipboardList, CheckCircle2, Circle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

interface ArchivedPregnancyChecklistProps {
  pregnancyId: string;
}

const ArchivedPregnancyChecklist: React.FC<ArchivedPregnancyChecklistProps> = ({ pregnancyId }) => {
  const { t } = useTranslation('pregnancy');
  const { checklist, isLoading, error } = usePregnancyChecklist(pregnancyId);

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
            <CardTitle>{t('archived.checklist.title', 'Pregnancy Checklist')}</CardTitle>
          </div>
          <CardDescription className="text-red-500">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // No checklist state
  if (!checklist || checklist.groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <ClipboardList className="h-5 w-5 text-purple-500 mr-2" />
            <CardTitle>{t('archived.checklist.title', 'Pregnancy Checklist')}</CardTitle>
          </div>
          <CardDescription>
            {t('archived.checklist.noData', 'No checklist data available for this pregnancy')}
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
          <CardTitle>{t('archived.checklist.title', 'Pregnancy Checklist')}</CardTitle>
        </div>
        <CardDescription>
          {t('archived.checklist.description', 'Overview of completed activities during pregnancy')}
        </CardDescription>
        
        {/* Overall Progress */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{t('archived.checklist.overallProgress', 'Overall Progress')}</span>
            <span className="text-sm text-muted-foreground">{checklist.progress}%</span>
          </div>
          <Progress value={checklist.progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <Accordion type="multiple" className="w-full">
          {checklist.groups.map((group) => {
            const completedItems = group.items.filter(item => item.isCompleted).length;
            const totalItems = group.items.length;
            const groupProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

            return (
              <AccordionItem key={group.id} value={group.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">{t(group.title)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {t('archived.checklist.completedItems', '{{completed}} of {{total}} completed', { 
                          completed: completedItems, 
                          total: totalItems 
                        })}
                      </span>
                      {completedItems === totalItems && totalItems > 0 && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {/* Week Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">
                          {t('archived.checklist.weekProgress', 'Week {{week}} Progress', { week: group.id.replace('week', '') })}
                        </span>
                        <span className="text-xs text-muted-foreground">{groupProgress}%</span>
                      </div>
                      <Progress value={groupProgress} className="h-1.5" />
                    </div>

                    {/* Checklist Items (read-only) */}
                    {group.items.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="mt-0.5">
                          {item.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${item.isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {t(item.text)}
                          </p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {t(item.description)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ArchivedPregnancyChecklist;
