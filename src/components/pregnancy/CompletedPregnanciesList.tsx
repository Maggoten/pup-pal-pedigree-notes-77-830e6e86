import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, RotateCcw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { ActivePregnancy } from './ActivePregnanciesList';
import { reactivatePregnancy } from '@/services/PregnancyService';
import { useTranslation } from 'react-i18next';

interface CompletedPregnanciesListProps {
  pregnancies: ActivePregnancy[];
  isLoading: boolean;
  onRefresh: () => void;
}

const CompletedPregnanciesList: React.FC<CompletedPregnanciesListProps> = ({
  pregnancies,
  isLoading,
  onRefresh
}) => {
  const { t, ready } = useTranslation('pregnancy');
  const [reactivatingIds, setReactivatingIds] = React.useState<Set<string>>(new Set());

  // Don't render until translations are ready
  if (!ready) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleReactivate = async (pregnancyId: string, femaleName: string) => {
    setReactivatingIds(prev => new Set(prev).add(pregnancyId));
    
    try {
      const success = await reactivatePregnancy(pregnancyId);
      if (success) {
        toast({
          title: t('toasts.success.pregnancyUpdated'),
          description: t('forms.completedPregnancies.reactivatedToast', { femaleName }),
        });
        onRefresh();
      } else {
        toast({
          title: t('toasts.error.failedToUpdatePregnancy'),
          description: t('forms.completedPregnancies.reactivationFailedToast'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error reactivating pregnancy:", error);
      toast({
        title: t('toasts.error.failedToUpdatePregnancy'),
        description: t('forms.completedPregnancies.unexpectedErrorToast'),
        variant: "destructive"
      });
    } finally {
      setReactivatingIds(prev => {
        const next = new Set(prev);
        next.delete(pregnancyId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!pregnancies || pregnancies.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{t('empty.completedPregnancies.title')}</h3>
              <p className="text-muted-foreground">
                {t('empty.completedPregnancies.description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pregnancies.map((pregnancy) => (
        <Card key={pregnancy.id} className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold text-foreground">
                  {pregnancy.femaleName} × {pregnancy.maleName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    {t('status.completed')}
                  </Badge>
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReactivate(pregnancy.id, pregnancy.femaleName)}
                disabled={reactivatingIds.has(pregnancy.id)}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {reactivatingIds.has(pregnancy.id) ? t('forms.completedPregnancies.reactivating') : t('forms.completedPregnancies.reactivate')}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{t('display.matingDate')}: {format(pregnancy.matingDate, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{t('display.expectedDueDate')}: {format(pregnancy.expectedDueDate, 'MMM dd, yyyy')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {t('forms.completedPregnancies.inactiveDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CompletedPregnanciesList;