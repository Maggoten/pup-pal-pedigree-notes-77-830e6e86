
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WeeklyDevelopmentData } from '@/data/weeklyDevelopmentData';
import { PawPrint } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WeeklyDevelopmentCardProps {
  development: WeeklyDevelopmentData;
  weekProgress: number;
}

const WeeklyDevelopmentCard: React.FC<WeeklyDevelopmentCardProps> = ({
  development,
  weekProgress
}) => {
  const { t, ready } = useTranslation('pregnancy');
  
  if (!ready) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-primary" />
            Loading...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const weekKey = `week${development.week}`;
  
  // Get translations with fallbacks - check if translation exists by comparing with key
  const titleTranslation = t(`journey.development.${weekKey}.title`);
  const title = titleTranslation === `journey.development.${weekKey}.title` ? development.title : titleTranslation;
  
  const descriptionTranslation = t(`journey.development.${weekKey}.description`);
  const description = descriptionTranslation === `journey.development.${weekKey}.description` ? development.description : descriptionTranslation;
  
  const keyPoints = t(`journey.development.${weekKey}.keyPoints`, { returnObjects: true });
  
  // Ensure keyPoints is an array with fallback
  const keyPointsArray = Array.isArray(keyPoints) && keyPoints[0] !== `journey.development.${weekKey}.keyPoints.0` 
    ? keyPoints 
    : development.keyPoints || [];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <PawPrint className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        
        <div className="flex justify-between items-center mt-2 mb-1 text-sm">
          <span className="text-muted-foreground">{t('journey.development.progressLabel')}</span>
          <span className="font-medium">{weekProgress}%</span>
        </div>
        <Progress value={weekProgress} className="h-1.5" />
      </CardHeader>
      
      
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {description}
        </p>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{t('journey.development.keyPointsTitle')}</h4>
          <ul className="space-y-2">
            {keyPointsArray.map((point, index) => (
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
