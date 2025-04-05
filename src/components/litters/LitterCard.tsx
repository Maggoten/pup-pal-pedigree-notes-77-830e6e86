
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Dog, Archive, Users } from 'lucide-react';
import { Litter } from '@/types/breeding';

interface LitterCardProps {
  litter: Litter;
  onSelect: (litter: Litter) => void;
  onArchive?: (litter: Litter) => void;
  isSelected?: boolean;
}

const LitterCard: React.FC<LitterCardProps> = ({ litter, onSelect, onArchive, isSelected = false }) => {
  // Parse ISO date string to Date object
  const birthDate = parseISO(litter.dateOfBirth);
  
  // Calculate litter age in weeks
  const ageInWeeks = Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  // Determine if the litter is recent (less than 12 weeks old)
  const isRecent = ageInWeeks < 12;
  
  // Get count of puppies, 0 if none
  const puppyCount = litter.puppies?.length || 0;
  const maleCount = litter.puppies?.filter(p => p.gender === 'male').length || 0;
  const femaleCount = litter.puppies?.filter(p => p.gender === 'female').length || 0;

  return (
    <Card 
      className={`h-full overflow-hidden hover:shadow-md transition-all duration-300 ${
        isSelected ? 'ring-2 ring-primary shadow-lg transform scale-[1.02]' : 'hover:scale-[1.01]'
      } cursor-pointer`}
      onClick={() => onSelect(litter)}
    >
      <CardHeader className="pb-1 pt-3 px-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{litter.name}</CardTitle>
          <div className="flex gap-1">
            {isRecent && (
              <Badge variant="success" className="text-xs">Active</Badge>
            )}
            {puppyCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {puppyCount} {puppyCount === 1 ? 'puppy' : 'puppies'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 pt-1 px-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary opacity-70" />
            <span>Born: {format(birthDate, 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Dog className="h-3.5 w-3.5 text-primary opacity-70" />
            <span>Sire: {litter.sireName}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Dog className="h-3.5 w-3.5 text-primary opacity-70" />
            <span>Dam: {litter.damName}</span>
          </div>
          
          {puppyCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary opacity-70" />
              <div className="flex gap-2">
                <span>{puppyCount} total</span>
                <span className="text-blue-500">{maleCount} ♂</span>
                <span className="text-pink-500">{femaleCount} ♀</span>
              </div>
            </div>
          )}
        </div>
        
        {onArchive && (
          <div className="flex justify-end mt-3">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LitterCard;
