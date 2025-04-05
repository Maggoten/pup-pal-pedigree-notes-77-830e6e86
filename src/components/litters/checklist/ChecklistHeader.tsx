
import React from 'react';
import { CheckCircle, CalendarRange } from 'lucide-react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ChecklistHeaderProps {
  completedItems: number;
  totalItems: number;
  completionPercentage: number;
  puppyAge: number;
  puppyWeeks: number;
}

const ChecklistHeader: React.FC<ChecklistHeaderProps> = ({
  completedItems,
  totalItems,
  completionPercentage,
  puppyAge,
  puppyWeeks
}) => {
  return (
    <CardHeader className="bg-primary/5">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Puppy Development Checklist
        </CardTitle>
        <Badge variant={completionPercentage === 100 ? "success" : "outline"}>
          {completedItems}/{totalItems} completed
        </Badge>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            <CalendarRange className="h-4 w-4 inline mr-1" />
            Current age: <span className="font-medium">{puppyAge} days ({puppyWeeks} weeks)</span>
          </span>
          <span className="text-muted-foreground">{completionPercentage}% complete</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>
    </CardHeader>
  );
};

export default ChecklistHeader;
