
import React from 'react';
import { LineChart, PawPrint, LineChartIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyChartStateProps {
  type: 'no-selection' | 'no-data';
  logType: string;
  puppyName?: string;
}

const EmptyChartState: React.FC<EmptyChartStateProps> = ({ type, logType, puppyName }) => {
  const { t } = useTranslation('litters');
  return (
    <div className="text-center py-12 px-6 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-card/50">
      <div className="relative mx-auto w-20 h-20 mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <LineChart className="h-8 w-8 text-primary/80" />
          </div>
        </div>
        {type === 'no-selection' && (
          <div className="absolute -bottom-3 -right-3">
            <div className="bg-accent/20 rounded-full p-1.5">
              <PawPrint className="h-5 w-5 text-accent/80" />
            </div>
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-medium mb-2">
        {type === 'no-selection' ? t('charts.empty.noSelection.title') : t('charts.empty.noData.title')}
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {type === 'no-selection' 
          ? t('charts.empty.noSelection.description')
          : puppyName
            ? t('charts.empty.noData.description.forPuppy', { logType, puppyName })
            : t('charts.empty.noData.description.forLitter', { logType })}
      </p>
      
      {/* Decorative chart lines */}
      {type === 'no-data' && (
        <div className="mt-8 flex items-end justify-center h-10 gap-1.5 opacity-20">
          <div className="w-1.5 h-3 bg-primary rounded-t"></div>
          <div className="w-1.5 h-5 bg-primary rounded-t"></div>
          <div className="w-1.5 h-4 bg-primary rounded-t"></div>
          <div className="w-1.5 h-7 bg-primary rounded-t"></div>
          <div className="w-1.5 h-6 bg-primary rounded-t"></div>
          <div className="w-1.5 h-9 bg-primary rounded-t"></div>
          <div className="w-1.5 h-8 bg-primary rounded-t"></div>
        </div>
      )}
    </div>
  );
};

export default EmptyChartState;
