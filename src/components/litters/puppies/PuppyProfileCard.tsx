import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInWeeks, differenceInDays } from 'date-fns';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Scale, Ruler, BarChart2 } from 'lucide-react';
import { Puppy } from '@/types/breeding';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';

interface PuppyProfileCardProps {
  puppy: Puppy;
  onPuppyClick: (puppy: Puppy) => void;
  onAddMeasurement: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  isSelected?: boolean;
  litterAge: number;
  litterId: string;
}

const PuppyProfileCard: React.FC<PuppyProfileCardProps> = ({
  puppy,
  onPuppyClick,
  onAddMeasurement,
  onUpdatePuppy,
  onDeletePuppy,
  isSelected = false,
  litterAge,
  litterId
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useTranslation('litters');
  
  // Get latest weight measurement
  const getLatestWeight = () => {
    if (puppy.weightLog && puppy.weightLog.length > 0) {
      const sortedWeights = [...puppy.weightLog].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return `${sortedWeights[0].weight} ${t('puppies.charts.units.kg')}`;
    }
    return puppy.currentWeight ? `${puppy.currentWeight} ${t('puppies.charts.units.kg')}` : '-';
  };

  // Get latest height measurement
  const getLatestHeight = () => {
    if (puppy.heightLog && puppy.heightLog.length > 0) {
      const sortedHeights = [...puppy.heightLog].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return `${sortedHeights[0].height} ${t('puppies.charts.units.cm')}`;
    }
    return `- ${t('puppies.charts.units.cm')}`;
  };

  // Get puppy age
  const getPuppyAge = () => {
    if (!puppy.birthDateTime) return t('puppies.labels.unknown');
    
    const birthDate = parseISO(puppy.birthDateTime);
    const today = new Date();
    const weeks = differenceInWeeks(today, birthDate);
    const days = differenceInDays(today, birthDate);
    
    if (weeks >= 1) {
      return `${weeks} ${weeks > 1 ? t('puppies.time.weeks') : t('puppies.time.week')}`;
    } else {
      return `${days} ${days > 1 ? t('puppies.time.days') : t('puppies.time.day')}`;
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    const status = puppy.status || 'Available';
    switch (status) {
      case 'Reserved':
        return <Badge variant="warning" className="text-xs px-3 py-0.5">{t('puppies.statuses.reserved')}</Badge>;
      case 'Sold':
        return <Badge variant="success" className="text-xs px-3 py-0.5">{t('puppies.statuses.sold')}</Badge>;
      default:
        return <Badge variant="info" className="text-xs px-3 py-0.5">{t('puppies.statuses.available')}</Badge>;
    }
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/my-litters/${litterId}/puppy/${puppy.id}`);
  };

  const handleRecordMeasurement = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddMeasurement(puppy);
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-lg cursor-pointer bg-white max-w-sm mx-auto h-full flex flex-col ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onClick={() => navigate(`/my-litters/${litterId}/puppy/${puppy.id}`)}
    >
      <CardContent className="p-4 flex-grow">
        <div className="space-y-3">
          {/* Profile Picture - Centered at top */}
          <div className="flex justify-center">
            <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-warmbeige-200 shadow-sm">
              <AspectRatio ratio={1/1}>
                {puppy.imageUrl ? (
                  <img 
                    src={puppy.imageUrl} 
                    alt={puppy.name} 
                    className="object-cover object-center w-full h-full"
                  />
                ) : (
                  <div className="bg-warmgreen-100 text-warmgreen-800 font-semibold text-4xl w-full h-full flex items-center justify-center">
                    {puppy.name.charAt(0)}
                  </div>
                )}
              </AspectRatio>
            </div>
          </div>

          {/* Puppy Name - Centered below picture */}
          <h3 className="text-2xl font-bold text-warmgreen-800 text-center">
            {puppy.name}
          </h3>

          {/* Gender and Color Info - Centered */}
          <div className="flex items-center justify-center gap-3 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
              {puppy.gender === 'male' ? '♂' : '♀'} {t(`puppies.labels.${puppy.gender}`)}
            </span>
            <span className="text-sm">•</span>
            <span>{puppy.color}</span>
          </div>

          {/* Age and Status Badge Row */}
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="text-muted-foreground">{t('puppies.labels.age')}: </span>
              <span className="font-medium">
                {getPuppyAge()}
              </span>
            </div>
            {getStatusBadge()}
          </div>

          {/* Weight and Height Measurements */}
          <div className="grid grid-cols-2 gap-4 py-3">
            <div className="text-center bg-greige-50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('puppies.labels.weight')}</span>
              </div>
              <p className="text-lg font-semibold">{getLatestWeight()}</p>
            </div>
            
            <div className="text-center bg-greige-50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('puppies.labels.height')}</span>
              </div>
              <p className="text-lg font-semibold">{getLatestHeight()}</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 mt-auto">
        <div className="flex gap-2 w-full">
          <Button 
            variant="default" 
            size={isMobile ? "sm" : "default"}
            className="flex-1"
            onClick={handleRecordMeasurement}
          >
            <BarChart2 className={`h-4 w-4 ${isMobile ? '' : 'mr-1'}`} />
            {!isMobile && t('puppies.actions.recordData')}
          </Button>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            className="flex-1"
            onClick={handleViewProfile}
          >
            {isMobile ? t('puppies.labels.profile') : t('puppies.actions.viewProfile')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PuppyProfileCard;
