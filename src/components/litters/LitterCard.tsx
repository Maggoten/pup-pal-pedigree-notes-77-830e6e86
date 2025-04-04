
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Dog, Archive, Grid2X2 } from 'lucide-react';
import { Litter } from '@/types/breeding';

interface LitterCardProps {
  litter: Litter;
  onSelect: (litter: Litter) => void;
  onArchive?: (litter: Litter) => void;
}

const LitterCard: React.FC<LitterCardProps> = ({ litter, onSelect, onArchive }) => {
  // Parse ISO date string to Date object
  const birthDate = parseISO(litter.dateOfBirth);
  
  // Calculate litter age in weeks
  const ageInWeeks = Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  // Determine if the litter is recent (less than 12 weeks old)
  const isRecent = ageInWeeks < 12;
  
  // Get count of puppies, 0 if none
  const puppyCount = litter.puppies?.length || 0;
  
  // Determine breed(s) from puppies if available
  const getBreeds = () => {
    if (!litter.puppies || litter.puppies.length === 0) return 'Unknown';
    
    // Get unique breeds
    const breeds = [...new Set(litter.puppies
      .filter(puppy => puppy.breed)
      .map(puppy => puppy.breed))];
    
    if (breeds.length === 0) return 'Unknown';
    return breeds.join(', ');
  };

  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
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
      
      <CardContent className="pb-3">
        <div className="space-y-2 text-sm">
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
          
          {puppyCount > 0 && (
            <div className="flex items-center gap-2">
              <Grid2X2 className="h-4 w-4 text-muted-foreground" />
              <span>Breed: {getBreeds()}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-0">
        <Button 
          variant="default" 
          className="flex-1"
          onClick={() => onSelect(litter)}
        >
          View Details
        </Button>
        
        {onArchive && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onArchive(litter);
            }}
            title={litter.archived ? "Unarchive Litter" : "Archive Litter"}
          >
            <Archive className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default LitterCard;
