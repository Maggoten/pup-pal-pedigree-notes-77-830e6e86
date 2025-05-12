
import React, { useMemo, useCallback, memo } from 'react';
import { Edit, Trash2, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Puppy, PuppyWeightRecord, PuppyHeightRecord } from '@/types/breeding';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

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
    <div 
      className={`border-2 border-warmbeige-300 rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition-all ${
        selectedPuppyId === puppy.id ? 'bg-primary/10 border-primary/30' : 'bg-white'
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {puppy.imageUrl ? 
              <AvatarImage src={puppy.imageUrl} alt={puppy.name} className="object-cover" /> : 
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {puppy.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            }
          </Avatar>
          <div>
            <h3 className="font-semibold text-warmgreen-800">{puppy.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{puppy.gender} • {puppy.color}</p>
          </div>
        </div>
        <div>{getStatusBadge()}</div>
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
      
      <div className="flex items-center justify-end gap-2 border-t pt-2 mt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleAddMeasurement} 
          className="h-8 w-8 p-0"
        >
          <BarChart2 className="h-4 w-4" />
          <span className="sr-only">Add measurement</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={handleEditClick}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit puppy</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" 
          onClick={handleDeletePuppy}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete puppy</span>
        </Button>
      </div>
      
      {/* Removed dialog implementation here */}
    </div>
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
      className={`border-b hover:bg-muted/50 cursor-pointer ${selectedPuppyId === puppy.id ? 'bg-primary/5' : ''}`} 
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
  const isMobile = useIsMobile();
  
  // Memoize the getLatestMeasurement function to avoid recreating it on every render
  const getLatestMeasurement = useCallback((puppy: Puppy, type: 'weight' | 'height') => {
    // For weight, prioritize the currentWeight field from Supabase
    if (type === 'weight') {
      if (puppy.currentWeight) {
        return `${puppy.currentWeight} kg`;
      }
    }
    
    const log = type === 'weight' ? puppy.weightLog : puppy.heightLog;
    if (!log || log.length === 0) return 'Not recorded';

    // Sort logs by date, most recent first
    const sortedLog = [...log].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestEntry = sortedLog[0];

    // Use the type guard functions to properly handle the types
    if (type === 'weight' && isWeightRecord(latestEntry)) {
      return `${latestEntry.weight} kg`;
    } else if (type === 'height' && isHeightRecord(latestEntry)) {
      return `${latestEntry.height} cm`;
    } else {
      return 'Invalid record';
    }
  }, []);
  
  if (isMobile) {
    return (
      <div className="space-y-2">
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
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left bg-warmbeige-200">
            <th className="px-4 py-3 font-medium text-sm text-warmgreen-800">Name</th>
            <th className="px-4 py-3 font-medium text-sm text-warmgreen-800">Gender</th>
            <th className="px-4 py-3 font-medium text-sm text-warmgreen-800">Color</th>
            <th className="px-4 py-3 font-medium text-sm text-warmgreen-800">Current Weight</th>
            <th className="px-4 py-3 font-medium text-sm text-warmgreen-800">Current Height</th>
            <th className="px-4 py-3 font-medium text-sm text-warmgreen-800">Status</th>
            <th className="px-4 py-3 font-medium text-sm text-warmgreen-800">Actions</th>
          </tr>
        </thead>
        <tbody>
          {puppies.map(puppy => (
            <PuppyRow
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
        </tbody>
      </table>
    </div>
  );
};

export default memo(PuppyList);
