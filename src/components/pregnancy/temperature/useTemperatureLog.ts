
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { TemperatureRecord } from './types';

export const useTemperatureLog = (pregnancyId: string) => {
  const [temperatures, setTemperatures] = useState<TemperatureRecord[]>([]);
  
  useEffect(() => {
    // Load temperature logs from localStorage
    const loadTemperatures = () => {
      const storedTemps = localStorage.getItem(`temperature_${pregnancyId}`);
      if (storedTemps) {
        const parsedTemps = JSON.parse(storedTemps);
        // Convert string dates to Date objects
        const processedTemps = parsedTemps.map((temp: any) => ({
          ...temp,
          date: new Date(temp.date)
        }));
        setTemperatures(processedTemps);
      }
    };
    
    loadTemperatures();
  }, [pregnancyId]);
  
  const saveTemperatures = (updatedTemps: TemperatureRecord[]) => {
    localStorage.setItem(`temperature_${pregnancyId}`, JSON.stringify(updatedTemps));
    setTemperatures(updatedTemps);
  };
  
  const addTemperature = (record: Omit<TemperatureRecord, 'id'>) => {
    const newRecord: TemperatureRecord = {
      id: Date.now().toString(),
      ...record
    };
    
    const updatedTemps = [...temperatures, newRecord];
    // Sort by date, newest first
    updatedTemps.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    saveTemperatures(updatedTemps);
    
    toast({
      title: "Temperature recorded",
      description: `Temperature of ${record.temperature}°F recorded for ${record.date.toLocaleDateString()}.`
    });
  };
  
  const deleteTemperature = (id: string) => {
    const updatedTemps = temperatures.filter(temp => temp.id !== id);
    saveTemperatures(updatedTemps);
    
    toast({
      title: "Temperature deleted",
      description: "The temperature record has been deleted."
    });
  };
  
  return {
    temperatures,
    addTemperature,
    deleteTemperature
  };
};
