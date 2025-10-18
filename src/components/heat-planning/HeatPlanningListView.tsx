import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { HeatCell } from './HeatCell';
import { HeatBadge } from './HeatBadge';
import { DogHeatTimelineDialog } from './DogHeatTimelineDialog';
import { FertileDog, HeatPrediction, YEARS_TO_DISPLAY } from '@/types/heatPlanning';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { formatAge } from '@/utils/formatAge';
import { formatDateWithLocale } from '@/utils/localizedDateFormat';

interface HeatPlanningListViewProps {
  predictions: Map<string, HeatPrediction[]>;
  fertileDogs: FertileDog[];
  onRefresh?: () => void;
}

export const HeatPlanningListView: React.FC<HeatPlanningListViewProps> = ({
  predictions,
  fertileDogs,
  onRefresh,
}) => {
  const { t, i18n } = useTranslation('plannedLitters');
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: YEARS_TO_DISPLAY }, (_, i) => currentYear + i);
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);

  // Helper to get predictions for a dog in a specific year
  const getPredictionsForYear = (dogId: string, year: number): HeatPrediction[] => {
    const dogPredictions = predictions.get(dogId) || [];
    return dogPredictions.filter(p => p.year === year);
  };

  // Get selected dog info for dialog
  const selectedDog = fertileDogs.find(dog => dog.id === selectedDogId);
  const selectedDogPredictions = selectedDogId ? (predictions.get(selectedDogId) || []) : [];

  return (
    <div>
      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="font-semibold text-foreground">{t('heatPlanner.table.dog')}</TableHead>
              {years.map(year => (
                <TableHead key={year} className="text-center font-semibold text-foreground">
                  {year}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fertileDogs.map((dog) => (
              <TableRow key={dog.id} className="border-border hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      className="h-10 w-10 cursor-pointer"
                      onClick={() => setSelectedDogId(dog.id)}
                    >
                      <AvatarImage src={dog.imageUrl} alt={dog.name} />
                      <AvatarFallback>{dog.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span 
                        className="text-foreground cursor-pointer hover:underline underline-offset-4"
                        onClick={() => setSelectedDogId(dog.id)}
                      >
                        {dog.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatAge(dog.age)} {t('heatPlanner.tooltip.years')}
                      </span>
                    </div>
                    {dog.needsWarning && (
                      <Badge variant="warning" className="ml-2">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {formatAge(dog.age)} {t('heatPlanner.tooltip.years')}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                {years.map(year => {
                  const yearPredictions = getPredictionsForYear(dog.id, year);
                  return (
                    <TableCell key={year} className="text-center">
                      <div className="flex justify-center gap-2 flex-wrap">
                        {yearPredictions.map(prediction => (
                          <HeatCell 
                            key={prediction.id} 
                            prediction={prediction}
                            onHeatConfirmed={onRefresh}
                          />
                        ))}
                        {yearPredictions.length === 0 && (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View - Accordion */}
      <div className="md:hidden">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {fertileDogs.map((dog) => {
            const allPredictions = predictions.get(dog.id) || [];
            return (
              <AccordionItem 
                key={dog.id} 
                value={dog.id}
                className={`border rounded-lg mb-2 bg-white dark:bg-gray-800 ${dog.needsWarning ? 'border-l-4 border-l-amber-400' : 'border-border'}`}
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar 
                      className="h-12 w-12 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDogId(dog.id);
                      }}
                    >
                      <AvatarImage src={dog.imageUrl} alt={dog.name} />
                      <AvatarFallback>{dog.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDogId(dog.id);
                        }}
                        className="font-semibold text-base hover:underline text-left"
                      >
                        {dog.name}
                      </button>
                      <div className="text-sm text-muted-foreground">
                        {formatAge(dog.age)} {t('heatPlanner.tooltip.years')}
                      </div>
                      {dog.needsWarning && (
                        <div className="text-xs text-amber-600 mt-1">
                          {t('heatPlanner.warning.oldDog')}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-3 pt-2">
                    {years.map(year => {
                      const yearPredictions = getPredictionsForYear(dog.id, year);
                      if (yearPredictions.length === 0) return null;
                      
                      return (
                        <div key={year} className="space-y-2 px-4">
                          <div className="font-semibold text-sm text-foreground mb-2">
                            {year}
                          </div>
                          <div className="space-y-2">
                            {yearPredictions.map(prediction => (
                              <div key={prediction.id} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-muted-foreground min-w-[60px]">
                                  {formatDateWithLocale(prediction.date, 'd MMM', i18n.language)}
                                </span>
                                <HeatBadge 
                                  prediction={prediction}
                                  onHeatConfirmed={onRefresh}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      {/* Heat Timeline Dialog */}
      {selectedDog && (
        <DogHeatTimelineDialog
          dogId={selectedDogId}
          dogName={selectedDog.name}
          predictions={selectedDogPredictions}
          open={!!selectedDogId}
          onOpenChange={(open) => !open && setSelectedDogId(null)}
        />
      )}
    </div>
  );
};
