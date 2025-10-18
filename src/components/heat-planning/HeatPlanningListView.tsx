import React from 'react';
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
import { HeatCell } from './HeatCell';
import { HeatBadge } from './HeatBadge';
import { FertileDog, HeatPrediction, YEARS_TO_DISPLAY } from '@/types/heatPlanning';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface HeatPlanningListViewProps {
  predictions: Map<string, HeatPrediction[]>;
  fertileDogs: FertileDog[];
}

export const HeatPlanningListView: React.FC<HeatPlanningListViewProps> = ({
  predictions,
  fertileDogs,
}) => {
  const { t } = useTranslation('plannedLitters');
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: YEARS_TO_DISPLAY }, (_, i) => currentYear + i);

  // Helper to get predictions for a dog in a specific year
  const getPredictionsForYear = (dogId: string, year: number): HeatPrediction[] => {
    const dogPredictions = predictions.get(dogId) || [];
    return dogPredictions.filter(p => p.year === year);
  };

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
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-foreground">{dog.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {dog.age} {t('heatPlanner.tooltip.years')}
                      </span>
                    </div>
                    {dog.needsWarning && (
                      <Badge variant="warning" className="ml-2">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {dog.age} {t('heatPlanner.tooltip.years')}
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
                          <HeatCell key={prediction.id} prediction={prediction} />
                        ))}
                        {yearPredictions.length === 0 && (
                          <span className="text-muted-foreground text-sm">{t('heatPlanner.table.noHeats')}</span>
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
                className="border border-border rounded-lg bg-card px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center justify-between w-full pr-2">
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-foreground">{dog.name}</span>
                      <span className="text-xs text-muted-foreground">{dog.age} {t('heatPlanner.tooltip.years')}</span>
                    </div>
                    {dog.needsWarning && (
                      <Badge variant="warning" className="mr-2">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {dog.age} {t('heatPlanner.tooltip.years')}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pt-2">
                    {years.map(year => {
                      const yearPredictions = getPredictionsForYear(dog.id, year);
                      return (
                        <div key={year} className="space-y-2">
                          <h4 className="font-semibold text-sm text-foreground">{year}</h4>
                          <div className="flex flex-wrap gap-2">
                            {yearPredictions.map(prediction => (
                              <HeatBadge key={prediction.id} prediction={prediction} />
                            ))}
                            {yearPredictions.length === 0 && (
                              <span className="text-muted-foreground text-sm">
                                {t('heatPlanner.table.noHeats')}
                              </span>
                            )}
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
    </div>
  );
};
