import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ClipboardList, CheckCircle2, Circle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useChecklistData } from '../checklist/useChecklistData';
import { Litter } from '@/types/breeding';

interface ArchivedDevelopmentChecklistProps {
  litter: Litter;
}

const ArchivedDevelopmentChecklist: React.FC<ArchivedDevelopmentChecklistProps> = ({ litter }) => {
  const { t } = useTranslation('litters');
  const {
    completedItems,
    totalItems,
    completionPercentage,
    getFilteredItems,
    getItemsByTimeline,
    isLoading
  } = useChecklistData(litter, () => {});

  const filteredItems = getFilteredItems(false);
  const itemsByTimeline = getItemsByTimeline(filteredItems);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <ClipboardList className="h-5 w-5 text-primary mr-2" />
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

  // No checklist state
  if (filteredItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <ClipboardList className="h-5 w-5 text-primary mr-2" />
            <CardTitle>{t('checklist.title')}</CardTitle>
          </div>
          <CardDescription>
            {t('checklist.empty.description')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <ClipboardList className="h-5 w-5 text-primary mr-2" />
          <CardTitle>{t('checklist.title')}</CardTitle>
        </div>
        <CardDescription>
          {t('archivedLitters.checklist.description')}
        </CardDescription>
        
        {/* Overall Progress */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{t('archivedLitters.checklist.overallProgress')}</span>
            <span className="text-sm text-muted-foreground">
              {completedItems}/{totalItems} ({completionPercentage}%)
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <Accordion type="multiple" className="w-full">
          {itemsByTimeline.map((timeline) => {
            const completedInTimeline = timeline.items.filter(item => item.isCompleted).length;
            const totalInTimeline = timeline.items.length;
            const timelineProgress = totalInTimeline > 0 ? Math.round((completedInTimeline / totalInTimeline) * 100) : 0;

            // Skip empty timelines
            if (totalInTimeline === 0) return null;

            return (
              <AccordionItem key={timeline.name} value={timeline.name}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">{timeline.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {completedInTimeline}/{totalInTimeline}
                      </span>
                      {completedInTimeline === totalInTimeline && totalInTimeline > 0 && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {/* Timeline Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">
                          {t('archivedLitters.checklist.timelineProgress')}
                        </span>
                        <span className="text-xs text-muted-foreground">{timelineProgress}%</span>
                      </div>
                      <Progress value={timelineProgress} className="h-1.5" />
                    </div>

                    {/* Checklist Items (read-only) */}
                    {timeline.items.map((item) => (
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
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
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

export default ArchivedDevelopmentChecklist;
