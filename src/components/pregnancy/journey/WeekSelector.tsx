
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from '@/components/ui/carousel';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  
  return (
    <div className="w-full">
      <Carousel className="w-full">
        <CarouselContent>
          {weeks.map((week) => (
            <CarouselItem key={week} className="basis-1/5 md:basis-1/7">
              <div className="p-1">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-16 flex flex-col items-center justify-center gap-1 rounded-lg border-2",
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
                    Week {week}
                  </span>
                </Button>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};

export default WeekSelector;
