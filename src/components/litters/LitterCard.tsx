
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Dog, Archive } from 'lucide-react';
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

  return (
    <Card 
      className={`h-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(litter)}
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{litter.name}</CardTitle>
          <div className="flex gap-1">
            {isRecent && (
              <Badge variant="default" className="bg-primary">Active</Badge>
            )}
            {puppyCount > 0 && (
              <Badge variant="secondary">
                {puppyCount} {puppyCount === 1 ? 'puppy' : 'puppies'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 pt-1 px-4">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Born: {format(birthDate, 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Dog className="h-4 w-4 text-muted-foreground" />
            <span>Sire: {litter.sireName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Dog className="h-4 w-4 text-muted-foreground" />
            <span>Dam: {litter.damName}</span>
          </div>
        </div>
        
        {onArchive && (
          <div className="flex justify-end mt-3">
            <Button 
              variant="outline" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(litter);
              }}
              title={litter.archived ? "Unarchive Litter" : "Archive Litter"}
              className="h-7 w-7"
            >
              <Archive className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LitterCard;
