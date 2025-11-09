
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Dog, Archive, Users, ChevronRight } from 'lucide-react';
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
  
  // Parse ISO date string to Date object
  const birthDate = parseISO(litter.dateOfBirth);
  
  // Calculate litter age in weeks
  const ageInWeeks = Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  // Get count of puppies, 0 if none
  const puppyCount = litter.puppies?.length || 0;
  const deadCount = litter.puppies?.filter(p => p.deathDate).length || 0;
  const aliveCount = puppyCount - deadCount;
  const maleCount = litter.puppies?.filter(p => p.gender === 'male' && !p.deathDate).length || 0;
  const femaleCount = litter.puppies?.filter(p => p.gender === 'female' && !p.deathDate).length || 0;

  return (
    <Card 
      className={`h-full overflow-hidden transition-all duration-300 ${
        isSelected ? 'ring-2 ring-primary shadow-lg transform scale-[1.02]' : 'hover:scale-[1.01]'
      } cursor-pointer bg-white border border-warmbeige-100 hover:shadow-md`}
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
              <CardTitle className="text-lg font-semibold truncate">{t('litter.labels.litterName', { damName: litter.damName })}</CardTitle>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {litter.damName} × {litter.sireName}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            {/* Status Badge */}
            <Badge 
              variant={litter.archived ? "secondary" : "default"}
              className={`text-xs px-2.5 py-0.5 rounded-full ${
                litter.archived 
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {litter.archived ? t('display.archived') : t('display.active')}
            </Badge>
            
            {/* Expand Arrow */}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 pt-0 px-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary opacity-70" />
            <span>{t('litter.labels.bornLabel', { date: format(birthDate, 'MMM d, yyyy') })}</span>
          </div>
          
          {puppyCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary opacity-70" />
              <div className="flex gap-2 flex-wrap">
                <span>{t('litter.labels.totalCount', { count: aliveCount })}</span>
                <span className="text-blue-500 font-medium">{maleCount} ♂</span>
                <span className="text-pink-500 font-medium">{femaleCount} ♀</span>
                {deadCount > 0 && (
                  <span className="text-muted-foreground font-medium">
                    † {deadCount}
                  </span>
                )}
              </div>
            </div>
          )}

          {litter.archived && (
            <div className="text-xs text-muted-foreground">
              {t('litter.labels.archivedOn', { date: format(new Date(litter.dateOfBirth), 'MMM d, yyyy') })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LitterCard;
