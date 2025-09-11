
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
  
  // Scroll to current week when component mounts or current week changes
  useEffect(() => {
    if (carouselRef.current) {
      // Find the current week element and scroll it into view
      const currentWeekElement = carouselRef.current.querySelector(`[data-week="${currentWeek}"]`);
      if (currentWeekElement) {
        currentWeekElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentWeek, carouselRef]);
  
  return (
    <div className="w-full relative">
      <Carousel className="w-full">
        <div className="relative px-2 sm:px-6 md:px-10">
          <CarouselContent className="px-1" ref={carouselRef}>
            {weeks.map((week) => (
              <CarouselItem 
                key={week} 
                className="basis-1/2 sm:basis-1/4 md:basis-1/6 lg:basis-1/9"
                data-week={week}
              >
                <div className="p-0.5 sm:p-1">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 sm:h-14 md:h-16 flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-xl border-2 transition-all duration-200 touch-manipulation",
                      currentWeek === week 
                        ? "border-primary bg-primary/10 shadow-sm" 
                        : "border-border hover:border-primary/50",
                      week < currentWeek && "bg-gray-50/80"
                    )}
                    onClick={() => onSelectWeek(week)}
                  >
                    <PawPrint className={cn(
                      "h-3 w-3 sm:h-4 sm:w-4", 
                      currentWeek === week ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-[10px] sm:text-xs font-medium leading-tight",
                      currentWeek === week ? "text-primary" : "text-muted-foreground"
                    )}>
                      {t('journey.weekSelector.week')} {week}
                    </span>
                  </Button>
                </div>
              </CarouselItem>
            ))}
            {isMobile && (
              <CarouselItem className="basis-8 flex items-center justify-center">
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="left-0 sm:left-1 h-8 w-8 sm:h-10 sm:w-10 absolute z-10 -translate-y-1/2 bg-background/90 backdrop-blur-sm border shadow-md" />
          <CarouselNext className="right-0 sm:right-1 h-8 w-8 sm:h-10 sm:w-10 absolute z-10 -translate-y-1/2 bg-background/90 backdrop-blur-sm border shadow-md" />
        </div>
      </Carousel>
    </div>
  );
};

export default WeekSelector;
