
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UpcomingHeat } from '@/types/reminders';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface UpcomingHeatCardProps {
  heat: UpcomingHeat;
  onDelete?: (id: string) => void;
}

const UpcomingHeatCard: React.FC<UpcomingHeatCardProps> = ({ 
  heat,
  onDelete 
}) => {
  const getWeekText = (daysUntil: number) => {
    if (daysUntil <= 7) return 'This week';
    if (daysUntil <= 14) return 'Next week';
    return `In ${Math.ceil(daysUntil / 7)} weeks`;
  };

  const weekText = getWeekText(heat.daysUntil);

  return (
    <Card className="border-amber-100">
      <CardContent className="pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-amber-500" />
            <p className="text-sm font-medium">{heat.dogName}</p>
          </div>
          <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 text-xs">
            {weekText}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-1">Expected heat</p>
        <p className="text-sm font-medium">
          {format(new Date(heat.expectedDate), 'MMMM d, yyyy')}
        </p>
        
        <p className="text-xs text-muted-foreground mt-2">
          {heat.daysUntil === 0 ? 'Today' : 
            heat.daysUntil === 1 ? 'Tomorrow' : 
            `${heat.daysUntil} days from now`}
        </p>
      </CardContent>
    </Card>
  );
};

export default UpcomingHeatCard;
