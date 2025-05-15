import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Trash } from 'lucide-react';
import { UpcomingHeat } from '@/types/reminders';
import { formatDistanceToNow, format } from 'date-fns';

export interface UpcomingHeatCardProps {
  heat: UpcomingHeat;
  onHeatDeleted?: () => void; // Add optional callback prop
}

const UpcomingHeatCard: React.FC<UpcomingHeatCardProps> = ({ heat, onHeatDeleted }) => {
  const { dog, expectedDate, daysTillHeat } = heat;

  const handleDeleteHeat = () => {
    onHeatDeleted?.();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {dog.name}
          {onHeatDeleted && (
            <Button variant="ghost" size="sm" onClick={handleDeleteHeat}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>
            Expected in{' '}
            {daysTillHeat >= 0
              ? formatDistanceToNow(expectedDate, { addSuffix: true })
              : 'any day now'}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {expectedDate && (
            <>
              Date: {format(expectedDate, 'PPP')}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingHeatCard;
