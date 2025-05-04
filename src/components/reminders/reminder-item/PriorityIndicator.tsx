
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriorityIndicatorProps {
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  onClick: () => void;
}

const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({
  priority,
  isCompleted,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors",
        isCompleted ? "bg-green-500 border-green-600" : "border-greige-300 hover:border-primary/70",
        priority === 'high' && !isCompleted ? "border-rose-400" : "",
        priority === 'medium' && !isCompleted ? "border-amber-400" : "",
        priority === 'low' && !isCompleted ? "border-green-400" : ""
      )}
    >
      {isCompleted && <Check className="h-3 w-3 text-white" />}
    </button>
  );
};

export default PriorityIndicator;
