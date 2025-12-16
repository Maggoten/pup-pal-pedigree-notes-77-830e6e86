
import React from 'react';
import { useTranslation } from 'react-i18next';
import MetricCard from './MetricCard';
import { Calendar, Check, Heart, PawPrint } from 'lucide-react';

interface MetricCardGridProps {
  reminderCount: number;
  plannedLittersCount: number;
  activePregnanciesCount: number;
  recentLittersCount: number;
  onRemindersClick?: () => void;
}

const MetricCardGrid: React.FC<MetricCardGridProps> = ({
  reminderCount,
  plannedLittersCount,
  activePregnanciesCount,
  recentLittersCount,
  onRemindersClick,
}) => {
  const { t } = useTranslation('home');

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-fr">
      <MetricCard 
        title={t('metrics.reminders')} 
        value={reminderCount} 
        icon={<Check className="h-4 w-4" />} 
        onClick={onRemindersClick}
      />
      
      <MetricCard 
        title={t('metrics.plannedLitters')} 
        value={plannedLittersCount} 
        icon={<Calendar className="h-4 w-4" />} 
        linkTo="/planned-litters"
      />
      
      <MetricCard 
        title={t('metrics.activePregnancies')} 
        value={activePregnanciesCount} 
        icon={<Heart className="h-4 w-4" />} 
        linkTo="/pregnancy"
      />
      
      <MetricCard 
        title={t('metrics.recentLitters')} 
        value={recentLittersCount} 
        icon={<PawPrint className="h-4 w-4" />} 
        linkTo="/my-litters"
      />
    </div>
  );
};

export default MetricCardGrid;
