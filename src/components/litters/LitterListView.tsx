
import React from 'react';
import { Litter } from '@/types/breeding';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Archive } from 'lucide-react';
import { format } from 'date-fns';
import { parseISODate } from '@/utils/dateUtils';

interface LitterListViewProps {
  litters: Litter[];
  onSelectLitter: (litter: Litter) => void;
  onArchive?: (litter: Litter) => void;
  selectedLitterId?: string | null;
}

const LitterListView: React.FC<LitterListViewProps> = ({ 
  litters, 
  onSelectLitter, 
  onArchive,
  selectedLitterId
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Sire</TableHead>
            <TableHead>Dam</TableHead>
            <TableHead>Puppies</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {litters.map(litter => {
            const puppyCount = litter.puppies?.length || 0;
            const birthDate = parseISODate(litter.dateOfBirth);
            const isSelected = selectedLitterId === litter.id;
            
            return (
              <TableRow 
                key={litter.id}
                className={`cursor-pointer ${isSelected ? 'bg-primary/10' : ''}`}
                onClick={() => onSelectLitter(litter)}
              >
                <TableCell className="font-medium">{litter.name}</TableCell>
                <TableCell>{format(birthDate, 'MMM d, yyyy')}</TableCell>
                <TableCell>{litter.sireName}</TableCell>
                <TableCell>{litter.damName}</TableCell>
                <TableCell>
                  {puppyCount > 0 ? (
                    <Badge variant="secondary">
                      {puppyCount} {puppyCount === 1 ? 'puppy' : 'puppies'}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {onArchive && (
                    <Button
                      variant="ghost"
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default LitterListView;
