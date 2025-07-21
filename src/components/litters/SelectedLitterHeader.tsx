
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Litter } from '@/types/breeding';

interface SelectedLitterHeaderProps {
  litter: Litter;
  damImageUrl?: string;
}

const SelectedLitterHeader: React.FC<SelectedLitterHeaderProps> = ({ 
  litter, 
  damImageUrl 
}) => {
  const birthDate = parseISO(litter.dateOfBirth);
  const ageInWeeks = Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const isRecent = ageInWeeks < 12;
  
  const puppyCount = litter.puppies?.length || 0;
  const maleCount = litter.puppies?.filter(p => p.gender === 'male').length || 0;
  const femaleCount = litter.puppies?.filter(p => p.gender === 'female').length || 0;

  return (
    <div className="bg-white border border-warmbeige-200 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border-2 border-warmbeige-200 shadow-sm">
          {damImageUrl ? (
            <AvatarImage src={damImageUrl} alt={litter.damName} className="object-cover" />
          ) : (
            <AvatarFallback className="bg-warmgreen-100 text-warmgreen-800 font-medium text-lg">
              {litter.damName.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-warmgreen-800">{litter.name}</h1>
            <div className="flex gap-2">
              {isRecent && !litter.archived && (
                <Badge variant="active" className="px-3 py-1">Active</Badge>
              )}
              {litter.archived && (
                <Badge variant="archived" className="px-3 py-1">Archived</Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Parents</p>
              <p className="font-medium">{litter.damName} × {litter.sireName}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{format(birthDate, 'MMMM d, yyyy')}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Age</p>
              <p className="font-medium">{ageInWeeks} weeks old</p>
            </div>
            
            {puppyCount > 0 && (
              <div>
                <p className="text-muted-foreground">Puppies</p>
                <p className="font-medium">
                  {puppyCount} total 
                  <span className="text-blue-500 ml-2">{maleCount} ♂</span>
                  <span className="text-pink-500 ml-2">{femaleCount} ♀</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedLitterHeader;
