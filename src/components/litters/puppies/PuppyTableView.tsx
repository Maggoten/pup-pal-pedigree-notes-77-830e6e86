import React, { useCallback, memo } from 'react';
import { format, parseISO } from 'date-fns';
import { Edit, Trash2, BarChart2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Puppy, PuppyWeightRecord, PuppyHeightRecord } from '@/types/breeding';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';

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
  const isMobile = useIsMobile();
  const { t } = useTranslation('litters');

  const handleDeletePuppy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('puppies.messages.deleteConfirmation', { name: puppy.name }))) {
      onDeletePuppy(puppy.id);
    }
  }, [puppy, onDeletePuppy, t]);

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
        return <Badge variant="outline" className="bg-rustbrown-100 text-xs">{t('puppies.statuses.reserved')}</Badge>;
      case 'Sold':
        return <Badge variant="outline" className="bg-warmgreen-100 text-xs">{t('puppies.statuses.sold')}</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{t('puppies.statuses.available')}</Badge>;
    }
  };

  // Format birthdate
  const formatBirthdate = () => {
    if (puppy.birthDateTime) {
      return format(parseISO(puppy.birthDateTime), isMobile ? 'MMM d' : 'MMM d, yyyy');
    } else {
      return format(parseISO(litterDob), isMobile ? 'MMM d' : 'MMM d, yyyy');
    }
  };

  return (
    <TableRow 
      className={`cursor-pointer ${selectedPuppyId === puppy.id ? 'bg-primary/5' : ''}`} 
      onClick={handleRowClick}
    >
      <TableCell className="p-2">
        <div className="flex items-center gap-2">
          <Avatar className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}>
            {puppy.imageUrl ? 
              <AvatarImage src={puppy.imageUrl} alt={puppy.name} className="object-cover" /> : 
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {puppy.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            }
          </Avatar>
          <div className="min-w-0 flex-1">
            <span className={`font-medium block truncate ${isMobile ? 'text-sm' : ''}`}>{puppy.name}</span>
            {isMobile && (
              <span className="text-xs text-muted-foreground capitalize">{puppy.gender}</span>
            )}
          </div>
        </div>
      </TableCell>
      
      {!isMobile && <TableCell className="capitalize text-sm">{puppy.gender}</TableCell>}
      
      <TableCell className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
        {puppy.color || t('puppies.labels.unknown')}
      </TableCell>
      
      {!isMobile && (
        <>
          <TableCell className={`text-sm`}>
            {formatBirthdate()}
          </TableCell>
          <TableCell className="text-sm">{getLatestMeasurement(puppy, 'weight')}</TableCell>
          <TableCell className="text-sm">{getLatestMeasurement(puppy, 'height')}</TableCell>
          <TableCell>{getStatusBadge()}</TableCell>
        </>
      )}
      
      <TableCell className="p-2">
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={e => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleAddMeasurement}>
                <BarChart2 className="h-4 w-4 mr-2" />
                {t('puppies.actions.recordData')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="h-4 w-4 mr-2" />
                {t('puppies.actions.viewProfile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeletePuppy} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                {t('puppies.actions.deletePuppy')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
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
        )}
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
  const isMobile = useIsMobile();
  const { t } = useTranslation('litters');

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
        return `${puppy.currentWeight} ${t('puppies.charts.units.kg')}`;
      }
      return t('puppies.labels.unknown');
    }

    // Sort logs by date, most recent first
    const sortedLog = [...log].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestEntry = sortedLog[0];

    if (type === 'weight' && latestEntry) {
      if (isWeightRecord(latestEntry)) {
        console.log(`PuppyTableView: Using last weight log entry for ${puppy.name}: ${latestEntry.weight} kg from ${latestEntry.date}`);
        return `${latestEntry.weight} ${t('puppies.charts.units.kg')}`;
      }
    } else if (type === 'height' && latestEntry) {
      if (isHeightRecord(latestEntry)) {
        return `${latestEntry.height} ${t('puppies.charts.units.cm')}`;
      }
    }
    
    return t('puppies.labels.unknown');
  }, []);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={isMobile ? 'text-xs p-2' : ''}>{t('puppies.labels.name')}</TableHead>
            {!isMobile && <TableHead className="text-xs">{t('puppies.labels.gender')}</TableHead>}
            <TableHead className={isMobile ? 'text-xs p-2' : ''}>{t('puppies.labels.color')}</TableHead>
            {!isMobile && (
              <>
                <TableHead>{t('puppies.labels.dateOfBirth')}</TableHead>
                <TableHead>{t('puppies.labels.weight')}</TableHead>
                <TableHead>{t('puppies.labels.height')}</TableHead>
                <TableHead>{t('puppies.labels.status')}</TableHead>
              </>
            )}
            <TableHead className={`text-right ${isMobile ? 'text-xs p-2' : ''}`}>{t('puppies.actions.actions')}</TableHead>
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
