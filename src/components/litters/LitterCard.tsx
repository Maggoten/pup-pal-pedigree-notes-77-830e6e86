
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Dog, Archive, Users, ChevronRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Litter } from '@/types/breeding';

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
  // Parse ISO date string to Date object
  const birthDate = parseISO(litter.dateOfBirth);
  
  // Calculate litter age in weeks
  const ageInWeeks = Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  // Get count of puppies, 0 if none
  const puppyCount = litter.puppies?.length || 0;
  const maleCount = litter.puppies?.filter(p => p.gender === 'male').length || 0;
  const femaleCount = litter.puppies?.filter(p => p.gender === 'female').length || 0;

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
              <CardTitle className="text-lg font-semibold truncate">{litter.name}</CardTitle>
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
              {litter.archived ? 'Archived' : 'Active'}
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
            <span>Born: {format(birthDate, 'MMM d, yyyy')}</span>
          </div>
          
          {puppyCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary opacity-70" />
              <div className="flex gap-2">
                <span>{puppyCount} total</span>
                <span className="text-blue-500 font-medium">{maleCount} ♂</span>
                <span className="text-pink-500 font-medium">{femaleCount} ♀</span>
              </div>
            </div>
          )}

          {litter.archived && (
            <div className="text-xs text-muted-foreground">
              Archived on {format(new Date(litter.updated_at || litter.created_at), 'MMM d, yyyy')}
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex-1" />
          {onArchive && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(litter);
              }}
              title={litter.archived ? "Unarchive Litter" : "Archive Litter"}
              className="h-7 w-7 opacity-60 hover:opacity-100 transition-opacity"
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LitterCard;
