import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye, Edit2, Trash2, Thermometer, TestTube } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { EditLegacyHeatDialog } from './EditLegacyHeatDialog';
import { DeleteLegacyHeatDialog } from './DeleteLegacyHeatDialog';
import { EditHeatCycleDialog } from './EditHeatCycleDialog';
import { DeleteHeatCycleDialog } from './DeleteHeatCycleDialog';
import type { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];

interface PreviousHeatCardProps {
  // For completed heat cycles
  heatCycle?: HeatCycle;
  temperatureCount?: number;
  progesteroneCount?: number;
  onViewDetails?: () => void;
  onSuccess?: () => void;
  
  // For legacy heat history
  legacyHeat?: { date: string };
  legacyIndex?: number;
  dogId?: string;
  onLegacyUpdate?: () => void;
}

const PreviousHeatCard: React.FC<PreviousHeatCardProps> = ({
  heatCycle,
  temperatureCount = 0,
  progesteroneCount = 0,
  onViewDetails,
  onSuccess,
  legacyHeat,
  legacyIndex,
  dogId,
  onLegacyUpdate
}) => {
  const { t } = useTranslation('dogs');

  // Handle completed heat cycle
  if (heatCycle) {
    const startDate = parseISO(heatCycle.start_date);
    const endDate = heatCycle.end_date ? parseISO(heatCycle.end_date) : null;
    const duration = endDate ? differenceInDays(endDate, startDate) : null;
    const daysAgo = differenceInDays(new Date(), endDate || startDate);

    return (
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium">
                  {format(startDate, 'MMM dd, yyyy')}
                  {endDate && ` - ${format(endDate, 'MMM dd, yyyy')}`}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{t('heatTracking.analytics.daysAgo', { days: daysAgo })}</span>
                  {duration && <span>{duration} {t('common.days')}</span>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Data indicators */}
              {temperatureCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Thermometer className="h-3 w-3 mr-1" />
                  {temperatureCount}
                </Badge>
              )}
              {progesteroneCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  <TestTube className="h-3 w-3 mr-1" />
                  {progesteroneCount}
                </Badge>
              )}
              
              <EditHeatCycleDialog
                open={false}
                onOpenChange={() => {}}
                heatCycle={heatCycle}
                onSuccess={onSuccess || (() => {})}
              />
              <DeleteHeatCycleDialog
                heatCycle={heatCycle}
                onSuccess={onSuccess || (() => {})}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewDetails}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {heatCycle.notes && (
            <p className="text-sm text-muted-foreground mt-2 truncate">
              {heatCycle.notes}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Handle legacy heat history
  if (legacyHeat && legacyIndex !== undefined && dogId) {
    const heatDate = parseISO(legacyHeat.date);
    const daysAgo = differenceInDays(new Date(), heatDate);
    const isRecent = daysAgo <= 30;

    return (
      <Card className="group hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <div>
                <p className="font-medium">
                  {format(heatDate, 'MMMM dd, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('heatTracking.analytics.daysAgo', { days: daysAgo })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isRecent && (
                <Badge variant="secondary" className="text-xs">
                  {t('heatTracking.cycles.badges.recent')}
                </Badge>
              )}
              {legacyIndex === 0 && (
                <Badge variant="default" className="text-xs">
                  {t('heatTracking.cycles.badges.latest')}
                </Badge>
              )}
              
              <EditLegacyHeatDialog
                dogId={dogId}
                heatIndex={legacyIndex}
                currentDate={legacyHeat.date}
                onSuccess={onLegacyUpdate}
              />
              <DeleteLegacyHeatDialog
                dogId={dogId}
                heatIndex={legacyIndex}
                heatDate={legacyHeat.date}
                onSuccess={onLegacyUpdate}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default PreviousHeatCard;