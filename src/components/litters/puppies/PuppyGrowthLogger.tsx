
import React, { useState } from 'react';
import { Puppy } from '@/types/breeding';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface PuppyGrowthLoggerProps {
  puppy: Puppy;
  onUpdatePuppy: (updatedPuppy: Puppy) => void;
}

const PuppyGrowthLogger: React.FC<PuppyGrowthLoggerProps> = ({ puppy, onUpdatePuppy }) => {
  const { t } = useTranslation('litters');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [logType, setLogType] = useState<'weight' | 'height'>('weight');

  const handleAddLog = () => {
    if (logType === 'weight' && (!weight || isNaN(parseFloat(weight)))) {
      toast({
        title: t('growthLogger.invalidWeight'),
        description: t('growthLogger.pleaseEnterValidWeight'),
        variant: "destructive"
      });
      return;
    }

    if (logType === 'height' && (!height || isNaN(parseFloat(height)))) {
      toast({
        title: t('growthLogger.invalidHeight'),
        description: t('growthLogger.pleaseEnterValidHeight'),
        variant: "destructive"
      });
      return;
    }

    const now = new Date();
    const updatedPuppy = { ...puppy };

    if (logType === 'weight') {
      updatedPuppy.weightLog = [
        ...puppy.weightLog,
        { date: now.toISOString(), weight: parseFloat(weight) }
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setWeight('');
    } else {
      updatedPuppy.heightLog = [
        ...puppy.heightLog,
        { date: now.toISOString(), height: parseFloat(height) }
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setHeight('');
    }

    onUpdatePuppy(updatedPuppy);
    
    toast({
      title: logType === 'weight' ? t('growthLogger.weightRecorded') : t('growthLogger.heightRecorded'),
      description: t('growthLogger.recordedSuccessfully', { name: puppy.name, type: t(`puppies.labels.${logType}`).toLowerCase() })
    });
  };

  const getLogData = () => {
    return logType === 'weight' ? puppy.weightLog : puppy.heightLog;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP p');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button 
            variant={logType === 'weight' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLogType('weight')}
          >
            {t('puppies.labels.weight')}
          </Button>
          <Button 
            variant={logType === 'height' ? 'default' : 'outline'}
            size="sm" 
            onClick={() => setLogType('height')}
          >
            {t('puppies.labels.height')}
          </Button>
        </div>
      </div>

      <div className="flex space-x-2 items-end">
        {logType === 'weight' ? (
          <>
            <div className="space-y-2 flex-1">
              <Label htmlFor="weight">{t('puppies.labels.weightKg')}</Label>
              <Input
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                type="number"
                step="0.01"
                placeholder={t('puppies.placeholders.enterWeight')}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2 flex-1">
              <Label htmlFor="height">{t('puppies.labels.heightCm')}</Label>
              <Input
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                type="number"
                step="0.1"
                placeholder={t('puppies.placeholders.enterHeight')}
              />
            </div>
          </>
        )}
        <Button onClick={handleAddLog}>{t('growthLogger.addLog')}</Button>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">
          {logType === 'weight' ? t('growthLogger.weightHistory') : t('growthLogger.heightHistory')}
        </h3>
        
        {getLogData().length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('growthLogger.dateAndTime')}</TableHead>
                  <TableHead>{logType === 'weight' ? t('puppies.labels.weightKg') : t('puppies.labels.heightCm')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getLogData().slice().reverse().map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(log.date)}</TableCell>
                    <TableCell>
                      {logType === 'weight' 
                        ? (log as {date: string; weight: number}).weight 
                        : (log as {date: string; height: number}).height}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 border rounded-md text-muted-foreground">
            {t('growthLogger.noLogsYet', { type: t(`puppies.labels.${logType}`).toLowerCase() })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PuppyGrowthLogger;
