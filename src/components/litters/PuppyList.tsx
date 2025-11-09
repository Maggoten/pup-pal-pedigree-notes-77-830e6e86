import React, { useMemo, useCallback, memo } from 'react';
import { Edit, Trash2, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Puppy, PuppyWeightRecord, PuppyHeightRecord } from '@/types/breeding';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useTranslation } from 'react-i18next';

interface PuppyListProps {
  puppies: Puppy[];
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  onPuppyClick?: (puppy: Puppy) => void;
  selectedPuppyId?: string | null;
  onAddMeasurement?: (puppy: Puppy) => void;
  litterAge?: number;
}

// Type guards to properly handle PuppyWeightRecord and PuppyHeightRecord
const isWeightRecord = (record: PuppyWeightRecord | PuppyHeightRecord): record is PuppyWeightRecord => {
  return 'weight' in record;
};

const isHeightRecord = (record: PuppyWeightRecord | PuppyHeightRecord): record is PuppyHeightRecord => {
  return 'height' in record;
};

// Mobile card view for puppies
const PuppyCard = memo(({
  puppy,
  selectedPuppyId,
  getLatestMeasurement,
  onPuppyClick,
  onAddMeasurement,
  onUpdatePuppy,
  onDeletePuppy
}: {
  puppy: Puppy;
  selectedPuppyId?: string | null;
  getLatestMeasurement: (puppy: Puppy, type: 'weight' | 'height') => string;
  onPuppyClick?: (puppy: Puppy) => void;
  onAddMeasurement?: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
}) => {
  const { t } = useTranslation('litters');
  
  const handleDeletePuppy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Do you want to delete "${puppy.name}"?`)) {
      onDeletePuppy(puppy.id);
    }
  }, [puppy, onDeletePuppy]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPuppyClick) onPuppyClick(puppy);
  }, [puppy, onPuppyClick]);
  
  const handleAddMeasurement = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddMeasurement) onAddMeasurement(puppy);
  }, [puppy, onAddMeasurement]);

  const handleCardClick = useCallback(() => {
    if (onPuppyClick) onPuppyClick(puppy);
  }, [puppy, onPuppyClick]);

  // Get status badge color
  const getStatusBadge = () => {
    if (puppy.deathDate) {
      return <Badge variant="secondary" className="bg-muted text-muted-foreground">† {t('puppies.statuses.deceased')}</Badge>;
    }
    
    const status = puppy.status || 'Available';
    switch (status) {
      case 'Reserved':
        return <Badge variant="outline" className="bg-rustbrown-100">Reserved</Badge>;
      case 'Sold':
        return <Badge variant="outline" className="bg-warmgreen-100">Sold</Badge>;
      default:
        return <Badge variant="outline">Available</Badge>;
    }
  };

  return (
    <Card 
      className={`w-full h-full flex flex-col overflow-hidden cursor-pointer ${
        selectedPuppyId === puppy.id ? 'bg-primary/10 border-primary/30' : ''
      } ${puppy.deathDate ? 'opacity-70 bg-muted/30' : ''}`}
      onClick={handleCardClick}
    >
      {/* Photo section - edge to edge with no padding */}
      <CardHeader className="p-0">
        <div className="relative w-full">
          <AspectRatio ratio={1/1}>
            {puppy.imageUrl ? (
              <img 
                src={puppy.imageUrl} 
                alt={puppy.name} 
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-2xl font-semibold">
                  {puppy.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </AspectRatio>
          {/* Badge positioned on top of photo */}
          <div className="absolute top-2 right-2">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      
      {/* Content section with padding */}
      <CardContent className="p-4 flex-grow">
        <div className="mb-3">
          <h3 className="font-semibold text-warmgreen-800">{puppy.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">{puppy.gender} • {puppy.color}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-warmbeige-50 p-2 rounded-md">
            <p className="text-xs text-muted-foreground">Weight</p>
            <p className="font-medium">{getLatestMeasurement(puppy, 'weight')}</p>
          </div>
          <div className="bg-warmbeige-50 p-2 rounded-md">
            <p className="text-xs text-muted-foreground">Height</p>
            <p className="font-medium">{getLatestMeasurement(puppy, 'height')}</p>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 mt-4 px-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleAddMeasurement} 
            className="w-full justify-start"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            <span>Add measurements</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleEditClick}
            className="w-full justify-start"
          >
            <Edit className="h-4 w-4 mr-2" />
            <span>Edit</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDeletePuppy}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <span>Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

PuppyCard.displayName = 'PuppyCard';

// Extracted as a memoized component to avoid re-rendering the entire table
const PuppyRow = memo(({ 
  puppy, 
  selectedPuppyId, 
  getLatestMeasurement, 
  onPuppyClick, 
  onAddMeasurement,
  onUpdatePuppy,
  onDeletePuppy
}: { 
  puppy: Puppy; 
  selectedPuppyId?: string | null;
  getLatestMeasurement: (puppy: Puppy, type: 'weight' | 'height') => string;
  onPuppyClick?: (puppy: Puppy) => void;
  onAddMeasurement?: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
}) => {
  const { t } = useTranslation('litters');
  
  const handleDeletePuppy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Do you want to delete "${puppy.name}"?`)) {
      onDeletePuppy(puppy.id);
    }
  }, [puppy, onDeletePuppy]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPuppyClick) onPuppyClick(puppy);
  }, [puppy, onPuppyClick]);
  
  const handleAddMeasurement = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddMeasurement) onAddMeasurement(puppy);
  }, [puppy, onAddMeasurement]);

  const handleRowClick = useCallback(() => {
    if (onPuppyClick) onPuppyClick(puppy);
  }, [puppy, onPuppyClick]);

  // Get status badge color
  const getStatusBadge = () => {
    if (puppy.deathDate) {
      return <Badge variant="secondary" className="bg-muted text-muted-foreground">† {t('puppies.statuses.deceased')}</Badge>;
    }
    
    const status = puppy.status || 'Available';
    switch (status) {
      case 'Reserved':
        return <Badge variant="outline" className="bg-rustbrown-100">Reserved</Badge>;
      case 'Sold':
        return <Badge variant="outline" className="bg-warmgreen-100">Sold</Badge>;
      default:
        return <Badge variant="outline">Available</Badge>;
    }
  };

  return (
    <tr 
      className={`border-b hover:bg-muted/50 cursor-pointer ${selectedPuppyId === puppy.id ? 'bg-primary/5' : ''} ${puppy.deathDate ? 'opacity-70 bg-muted/20' : ''}`} 
      onClick={handleRowClick}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {puppy.imageUrl ? 
              <AvatarImage src={puppy.imageUrl} alt={puppy.name} className="object-cover" /> : 
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {puppy.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            }
          </Avatar>
          <span>{puppy.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 capitalize">{puppy.gender}</td>
      <td className="px-4 py-3">{puppy.color}</td>
      <td className="px-4 py-3">{getLatestMeasurement(puppy, 'weight')}</td>
      <td className="px-4 py-3">{getLatestMeasurement(puppy, 'height')}</td>
      <td className="px-4 py-3">{getStatusBadge()}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleAddMeasurement} 
            className="h-8 w-8"
          >
            <BarChart2 className="h-4 w-4" />
            <span className="sr-only">Add measurement</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit puppy</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
            onClick={handleDeletePuppy}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete puppy</span>
          </Button>
        </div>
      </td>
      
      {/* Removed dialog implementation here */}
    </tr>
  );
});

PuppyRow.displayName = 'PuppyRow';

const PuppyList: React.FC<PuppyListProps> = ({
  puppies,
  onUpdatePuppy,
  onDeletePuppy,
  onPuppyClick,
  selectedPuppyId,
  onAddMeasurement,
  litterAge
}) => {
  // Memoize the getLatestMeasurement function to avoid recreating it on every render
  const getLatestMeasurement = useCallback((puppy: Puppy, type: 'weight' | 'height') => {
    // For weight measurements, always prioritize the weight log
    if (type === 'weight') {
      console.log(`PuppyList: Getting weight for ${puppy.name} (${puppy.id})`, {
        hasWeightLog: Boolean(puppy.weightLog?.length)
      });
    }
    
    const log = type === 'weight' ? puppy.weightLog : puppy.heightLog;
    if (!log || log.length === 0) {
      // Only use currentWeight as fallback if no weight log entries exist
      if (type === 'weight' && puppy.currentWeight) {
        console.log(`PuppyList: Using fallback currentWeight for ${puppy.name}: ${puppy.currentWeight} kg`);
        return `${puppy.currentWeight} kg`;
      }
      return 'Not recorded';
    }

    // Sort logs by date, most recent first
    const sortedLog = [...log].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestEntry = sortedLog[0];

    if (type === 'weight' && latestEntry) {
      // Use the type guard functions to properly handle the types
      if (isWeightRecord(latestEntry)) {
        console.log(`PuppyList: Using last weight log entry for ${puppy.name}: ${latestEntry.weight} kg from ${latestEntry.date}`);
        return `${latestEntry.weight} kg`;
      }
    } else if (type === 'height' && latestEntry) {
      // Use the type guard functions to properly handle the types
      if (isHeightRecord(latestEntry)) {
        return `${latestEntry.height} cm`;
      }
    }
    
    return 'Invalid record';
  }, []);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {puppies.map(puppy => (
        <PuppyCard
          key={puppy.id}
          puppy={puppy}
          selectedPuppyId={selectedPuppyId}
          getLatestMeasurement={getLatestMeasurement}
          onPuppyClick={onPuppyClick}
          onAddMeasurement={onAddMeasurement}
          onUpdatePuppy={onUpdatePuppy}
          onDeletePuppy={onDeletePuppy}
        />
      ))}
    </div>
  );
};

export default memo(PuppyList);
