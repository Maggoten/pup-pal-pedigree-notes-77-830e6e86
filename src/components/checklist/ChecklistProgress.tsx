
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface ChecklistProgressProps {
  progress: number;
  title?: string;
  className?: string;
}

const ChecklistProgress: React.FC<ChecklistProgressProps> = ({ 
  progress, 
  title = "Checklist Progress", 
  className 
}) => {
  const isComplete = progress === 100;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-sm font-medium">
          {isComplete ? (
            <span className="text-green-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete!
            </span>
          ) : (
            `${progress}%`
          )}
        </span>
      </div>
      <Progress 
        value={progress} 
        className={cn(
          "h-2", 
          isComplete ? "bg-green-100" : "bg-gray-100"
        )}
        indicatorClassName={isComplete ? "bg-green-500" : undefined}
      />
    </div>
  );
};

export default ChecklistProgress;
