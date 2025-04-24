
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { TemperatureRecord } from './types';
import { supabase } from '@/integrations/supabase/client';

export const useTemperatureLog = (pregnancyId: string) => {
  const [temperatures, setTemperatures] = useState<TemperatureRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemperatures = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('temperature_logs')
        .select('*')
        .eq('pregnancy_id', pregnancyId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading temperatures:', error);
        toast({
          title: "Error loading temperature logs",
          description: "There was a problem loading the temperature records.",
          variant: "destructive"
        });
        return;
      }

      const processedTemps = data.map(temp => ({
        id: temp.id,
        date: new Date(temp.date),
        temperature: temp.temperature,
        notes: temp.notes
      }));

      setTemperatures(processedTemps);
      setLoading(false);
    };

    loadTemperatures();
  }, [pregnancyId]);

  const addTemperature = async (record: Omit<TemperatureRecord, 'id'>) => {
    const { data, error } = await supabase
      .from('temperature_logs')
      .insert({
        pregnancy_id: pregnancyId,
        temperature: record.temperature,
        date: record.date.toISOString(),
        notes: record.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding temperature:', error);
      toast({
        title: "Error saving temperature",
        description: "The temperature record could not be saved.",
        variant: "destructive"
      });
      return;
    }

    const newRecord: TemperatureRecord = {
      id: data.id,
      date: new Date(data.date),
      temperature: data.temperature,
      notes: data.notes
    };

    setTemperatures(prev => [newRecord, ...prev].sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    ));

    toast({
      title: "Temperature recorded",
      description: `Temperature of ${record.temperature}°F recorded for ${record.date.toLocaleDateString()}.`
    });
  };

  const deleteTemperature = async (id: string) => {
    const { error } = await supabase
      .from('temperature_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting temperature:', error);
      toast({
        title: "Error deleting record",
        description: "The temperature record could not be deleted.",
        variant: "destructive"
      });
      return;
    }

    setTemperatures(prev => prev.filter(temp => temp.id !== id));

    toast({
      title: "Temperature deleted",
      description: "The temperature record has been deleted."
    });
  };

  return {
    temperatures,
    loading,
    addTemperature,
    deleteTemperature
  };
};
