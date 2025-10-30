import { useMemo } from 'react';
import { CalendarEvent } from './types';
import { PregnancySwimLane } from './PregnancySwimLane';
import { normalizeDate } from '@/utils/pregnancyCalculations';
import { useIsMobile } from '@/hooks/use-mobile';

interface PregnancySwimLanesProps {
  pregnancies: CalendarEvent[];
}

export const PregnancySwimLanes = ({ pregnancies }: PregnancySwimLanesProps) => {
  const isMobile = useIsMobile();
  
  // Filter and sort active pregnancies
  const activePregnancies = useMemo(() => {
    return pregnancies
      .filter(p => p.type === 'pregnancy-period' && p.startDate)
      .sort((a, b) => {
        const dateA = normalizeDate(a.startDate!).getTime();
        const dateB = normalizeDate(b.startDate!).getTime();
        return dateA - dateB;
      });
  }, [pregnancies]);
  
  if (activePregnancies.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          Aktiva dräktigheter ({activePregnancies.length})
        </h3>
      </div>
      
      {isMobile ? (
        // Mobile: Horizontal scrollable
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
            {activePregnancies.map((pregnancy) => (
              <div 
                key={pregnancy.id}
                className="w-[85vw] flex-shrink-0"
              >
                <PregnancySwimLane pregnancy={pregnancy} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Desktop: Stacked lanes
        <div className="space-y-2">
          {activePregnancies.map((pregnancy) => (
            <PregnancySwimLane key={pregnancy.id} pregnancy={pregnancy} />
          ))}
        </div>
      )}
    </div>
  );
};
