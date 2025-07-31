
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from '@/components/ui/carousel';
import { PawPrint, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';

interface WeekSelectorProps {
  currentWeek: number;
  totalWeeks: number;
  onSelectWeek: (week: number) => void;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({
  currentWeek,
  totalWeeks,
  onSelectWeek
}) => {
  const { t } = useTranslation('pregnancy');
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const isMobile = useIsMobile();
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const isInitialMount = useRef(true);
  
  // Only scroll to current week when user actively changes weeks, not on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (carouselRef.current) {
      // Find the current week element and scroll it into view
      const currentWeekElement = carouselRef.current.querySelector(`[data-week="${currentWeek}"]`);
      if (currentWeekElement) {
        currentWeekElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentWeek]);
  
  return (
    <div className="w-full relative">
      <Carousel className="w-full">
        <div className="relative px-10">
          <CarouselContent className="px-1" ref={carouselRef}>
            {weeks.map((week) => (
              <CarouselItem 
                key={week} 
                className="basis-1/3 sm:basis-1/4 md:basis-1/6 lg:basis-1/9"
                data-week={week}
              >
                <div className="p-1">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full min-h-[60px] md:h-16 flex flex-col items-center justify-center gap-1 rounded-lg border-2",
                      currentWeek === week 
                        ? "border-primary bg-primary/10" 
                        : "border-border",
                      week < currentWeek && "bg-gray-50"
                    )}
                    onClick={() => onSelectWeek(week)}
                  >
                    <PawPrint className={cn(
                      "h-4 w-4", 
                      currentWeek === week ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      currentWeek === week ? "text-primary" : "text-muted-foreground"
                    )}>
                      {t('journey.weekSelector.week')} {week}
                    </span>
                  </Button>
                </div>
              </CarouselItem>
            ))}
            {isMobile && (
              <CarouselItem className="basis-12 flex items-center justify-center">
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="left-1 absolute z-10 -translate-y-1/2" />
          <CarouselNext className="right-1 absolute z-10 -translate-y-1/2" />
        </div>
      </Carousel>
    </div>
  );
};

export default WeekSelector;
