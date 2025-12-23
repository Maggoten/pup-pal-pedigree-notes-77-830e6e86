import React, { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { parseISODate } from '@/utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, ChevronRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Litter } from '@/types/breeding';
import { useTranslation } from 'react-i18next';

interface LitterCardProps {
  litter: Litter;
  onSelect: (litter: Litter) => void;
  onArchive?: (litter: Litter) => void;
  isSelected?: boolean;
  damImageUrl?: string;
}

const LitterCard: React.FC<LitterCardProps> = ({
  litter,
  onSelect,
  onArchive,
  isSelected = false,
  damImageUrl
}) => {
  const { t } = useTranslation('litters');

  // Memoize all calculations
  const { birthDate, formattedDate, puppyStats } = useMemo(() => {
    const birthDate = parseISODate(litter.dateOfBirth);
    const puppyCount = litter.puppies?.length || 0;
    const deadCount = litter.puppies?.filter(p => p.deathDate).length || 0;
    
    return {
      birthDate,
      formattedDate: format(birthDate, 'MMM d, yyyy'),
      puppyStats: {
        total: puppyCount,
        alive: puppyCount - deadCount,
        dead: deadCount,
        male: litter.puppies?.filter(p => p.gender === 'male' && !p.deathDate).length || 0,
        female: litter.puppies?.filter(p => p.gender === 'female' && !p.deathDate).length || 0
      }
    };
  }, [litter.dateOfBirth, litter.puppies]);

  return (
    <Card 
      className={`h-full overflow-hidden transition-all duration-300 ${isSelected ? 'ring-2 ring-primary shadow-lg transform scale-[1.02]' : 'hover:scale-[1.01]'} cursor-pointer bg-white border border-warmbeige-100 hover:shadow-md`} 
      onClick={() => onSelect(litter)}
    >
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              {damImageUrl ? (
                <AvatarImage src={damImageUrl} alt={litter.damName} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-warmgreen-100 text-warmgreen-800 font-medium">
                  {litter.damName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">{litter.name}</CardTitle>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {litter.damName} × {litter.sireName}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            <Badge 
              variant={litter.archived ? "secondary" : "default"} 
              className={`text-xs px-2.5 py-0.5 rounded-full ${litter.archived ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            >
              {litter.archived ? t('display.archived') : t('display.active')}
            </Badge>
            
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 pt-0 px-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary opacity-70" />
            <span>{t('litter.labels.bornLabel', { date: formattedDate })}</span>
          </div>
          
          {puppyStats.total > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary opacity-70" />
              <div className="flex gap-2 flex-wrap">
                <span>{t('litter.labels.totalCount', { count: puppyStats.alive })}</span>
                <span className="text-blue-500 font-medium">{puppyStats.male} ♂</span>
                <span className="text-pink-500 font-medium">{puppyStats.female} ♀</span>
                {puppyStats.dead > 0 && (
                  <span className="text-muted-foreground font-medium">† {puppyStats.dead}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(LitterCard);
