
import React from 'react';
import { CheckCircle, CalendarRange } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';

interface ChecklistHeaderProps {
  completedItems: number;
  totalItems: number;
  completionPercentage: number;
  puppyAge: number;
  puppyWeeks: number;
}

const ChecklistHeader: React.FC<ChecklistHeaderProps> = ({
  completedItems,
  totalItems,
  completionPercentage,
  puppyAge,
  puppyWeeks
}) => {
  const { t } = useTranslation('litters');
  return (
    <CardHeader className="bg-primary/5">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          {t('checklist.title')}
        </CardTitle>
        <Badge variant={completionPercentage === 100 ? "success" : "outline"}>
          {t('checklist.completedBadge', { completed: completedItems, total: totalItems })}
        </Badge>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            <CalendarRange className="h-4 w-4 inline mr-1" />
            {t('checklist.currentAge')}: <span className="font-medium">{puppyAge} {t('checklist.units.days')} ({puppyWeeks} {t('checklist.units.weeks')})</span>
          </span>
          <span className="text-muted-foreground">{completionPercentage}{t('checklist.progressComplete')}</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>
    </CardHeader>
  );
};

export default ChecklistHeader;
