import { useMemo } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { CalendarEvent } from './types';
import { 
  calculateDaysPregnant,
  calculateProgress,
  calculateDueDate,
  normalizeDate
} from '@/utils/pregnancyCalculations';
import { getDogPregnancyColor } from '@/utils/dogColorUtils';
import { ChevronRight } from 'lucide-react';

interface PregnancySwimLaneProps {
  pregnancy: CalendarEvent;
}

export const PregnancySwimLane = ({ pregnancy }: PregnancySwimLaneProps) => {
  const navigate = useNavigate();
  const color = getDogPregnancyColor(pregnancy.dogId || '');
  
  const matingDate = useMemo(() => normalizeDate(pregnancy.startDate!), [pregnancy.startDate]);
  const dueDate = useMemo(() => calculateDueDate(matingDate), [matingDate]);
  const daysPregnant = useMemo(() => calculateDaysPregnant(matingDate), [matingDate]);
  const progress = useMemo(() => calculateProgress(matingDate), [matingDate]);
  
  // Week ticks (D+0, D+7, D+14, D+21, D+28, D+35, D+42, D+49, D+56, D+63)
  const weekTicks = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => i * 7);
  }, []);
  
  const handleClick = () => {
    if (pregnancy.dogId) {
      navigate(`/pregnancy/${pregnancy.dogId}`);
    }
  };
  
  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors cursor-pointer group"
      onClick={handleClick}
    >
      {/* Dog name and icon */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <div 
          className={`w-3 h-3 rounded-full ${color.chip}`}
          style={{ opacity: 0.8 }}
        />
        <span className="font-medium text-sm truncate">
          {pregnancy.dogName || 'Unknown'}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="flex-1 relative">
        <div className="relative h-8 bg-muted/30 rounded-md overflow-hidden">
          {/* Progress fill */}
          <div 
            className={`absolute inset-y-0 left-0 ${color.band} transition-all duration-300`}
            style={{ 
              width: `${progress}%`,
              opacity: 0.3
            }}
          />
          
          {/* Week ticks */}
          <div className="absolute inset-0 flex">
            {weekTicks.map((day) => (
              <div
                key={day}
                className="flex-1 border-r border-border/30 first:border-l-0 last:border-r-0"
                style={{ width: `${100 / weekTicks.length}%` }}
              >
                {day === 63 && (
                  <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center">
                    <span className="text-lg">★</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* D+X label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-foreground/80">
              D+{daysPregnant} • {Math.round(progress)}%
            </span>
          </div>
        </div>
        
        {/* Due date label */}
        <div className="text-[10px] text-muted-foreground mt-1 text-center">
          Due: {format(dueDate, 'dd MMM yyyy')} (±2d)
        </div>
      </div>
      
      {/* Quick action arrow */}
      <div className="flex items-center">
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </div>
  );
};
