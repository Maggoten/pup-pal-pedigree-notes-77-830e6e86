
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WeeklyDevelopment } from '@/types/pregnancyJourney';
import { PawPrint } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WeeklyDevelopmentCardProps {
  development: WeeklyDevelopment;
  weekProgress: number;
}

const WeeklyDevelopmentCard: React.FC<WeeklyDevelopmentCardProps> = ({
  development,
  weekProgress
}) => {
  const { t } = useTranslation('pregnancy');
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <PawPrint className="h-5 w-5 text-primary" />
          {development.title}
        </CardTitle>
        
        <div className="flex justify-between items-center mt-2 mb-1 text-sm">
          <span className="text-muted-foreground">{t('journey.development.progressLabel')}</span>
          <span className="font-medium">{weekProgress}%</span>
        </div>
        <Progress value={weekProgress} className="h-1.5" />
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {development.description}
        </p>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{t('journey.development.keyPointsTitle')}</h4>
          <ul className="space-y-2">
            {development.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  {index + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyDevelopmentCard;
