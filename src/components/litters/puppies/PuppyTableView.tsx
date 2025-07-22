
import React, { useCallback, memo } from 'react';
import { format, parseISO } from 'date-fns';
import { Edit, Trash2, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Puppy, PuppyWeightRecord, PuppyHeightRecord } from '@/types/breeding';

interface PuppyTableViewProps {
  puppies: Puppy[];
  onPuppyClick?: (puppy: Puppy) => void;
  onAddMeasurement?: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  selectedPuppyId?: string | null;
  litterDob: string;
}

// Type guards to properly handle PuppyWeightRecord and PuppyHeightRecord
const isWeightRecord = (record: PuppyWeightRecord | PuppyHeightRecord): record is PuppyWeightRecord => {
  return 'weight' in record;
};

const isHeightRecord = (record: PuppyWeightRecord | PuppyHeightRecord): record is PuppyHeightRecord => {
  return 'height' in record;
};

const PuppyTableRow = memo(({ 
  puppy, 
  selectedPuppyId, 
  getLatestMeasurement, 
  onPuppyClick, 
  onAddMeasurement,
  onUpdatePuppy,
  onDeletePuppy,
  litterDob
}: { 
  puppy: Puppy; 
  selectedPuppyId?: string | null;
  getLatestMeasurement: (puppy: Puppy, type: 'weight' | 'height') => string;
  onPuppyClick?: (puppy: Puppy) => void;
  onAddMeasurement?: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  litterDob: string;
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

  // Format birthdate
  const formatBirthdate = () => {
    if (puppy.birth_date_time) {
      return format(parseISO(puppy.birth_date_time), 'MMM d, yyyy');
    } else {
      return format(parseISO(litterDob), 'MMM d, yyyy');
    }
  };

  return (
    <TableRow 
      className={`cursor-pointer ${selectedPuppyId === puppy.id ? 'bg-primary/5' : ''}`} 
      onClick={handleRowClick}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {puppy.imageUrl ? 
              <AvatarImage src={puppy.imageUrl} alt={puppy.name} className="object-cover" /> : 
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {puppy.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            }
          </Avatar>
          <span className="font-medium">{puppy.name}</span>
        </div>
      </TableCell>
      <TableCell className="capitalize">{puppy.gender}</TableCell>
      <TableCell>{puppy.color || 'Not specified'}</TableCell>
      <TableCell>{formatBirthdate()}</TableCell>
      <TableCell>{getLatestMeasurement(puppy, 'weight')}</TableCell>
      <TableCell>{getLatestMeasurement(puppy, 'height')}</TableCell>
      <TableCell>{getStatusBadge()}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleAddMeasurement} 
            className="h-8 w-8"
            title="Add measurements"
          >
            <BarChart2 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleEditClick}
            title="View profile"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" 
            onClick={handleDeletePuppy}
            title="Delete puppy"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

PuppyTableRow.displayName = 'PuppyTableRow';

const PuppyTableView: React.FC<PuppyTableViewProps> = ({
  puppies,
  onPuppyClick,
  onAddMeasurement,
  onUpdatePuppy,
  onDeletePuppy,
  selectedPuppyId,
  litterDob
}) => {
  // Memoize the getLatestMeasurement function
  const getLatestMeasurement = useCallback((puppy: Puppy, type: 'weight' | 'height') => {
    // For weight measurements, always prioritize the weight log
    if (type === 'weight') {
      console.log(`PuppyTableView: Getting weight for ${puppy.name} (${puppy.id})`, {
        hasWeightLog: Boolean(puppy.weightLog?.length)
      });
    }
    
    const log = type === 'weight' ? puppy.weightLog : puppy.heightLog;
    if (!log || log.length === 0) {
      // Only use currentWeight as fallback if no weight log entries exist
      if (type === 'weight' && puppy.currentWeight) {
        console.log(`PuppyTableView: Using fallback currentWeight for ${puppy.name}: ${puppy.currentWeight} kg`);
        return `${puppy.currentWeight} kg`;
      }
      return 'Not recorded';
    }

    // Sort logs by date, most recent first
    const sortedLog = [...log].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestEntry = sortedLog[0];

    if (type === 'weight' && latestEntry) {
      if (isWeightRecord(latestEntry)) {
        console.log(`PuppyTableView: Using last weight log entry for ${puppy.name}: ${latestEntry.weight} kg from ${latestEntry.date}`);
        return `${latestEntry.weight} kg`;
      }
    } else if (type === 'height' && latestEntry) {
      if (isHeightRecord(latestEntry)) {
        return `${latestEntry.height} cm`;
      }
    }
    
    return 'Invalid record';
  }, []);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Sex</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Birthdate</TableHead>
            <TableHead>Current Weight</TableHead>
            <TableHead>Height</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {puppies.map(puppy => (
            <PuppyTableRow
              key={puppy.id}
              puppy={puppy}
              selectedPuppyId={selectedPuppyId}
              getLatestMeasurement={getLatestMeasurement}
              onPuppyClick={onPuppyClick}
              onAddMeasurement={onAddMeasurement}
              onUpdatePuppy={onUpdatePuppy}
              onDeletePuppy={onDeletePuppy}
              litterDob={litterDob}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default memo(PuppyTableView);
