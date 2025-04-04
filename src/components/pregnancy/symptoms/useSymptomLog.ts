
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { SymptomRecord } from './types';

export const useSymptomLog = (pregnancyId: string, femaleName: string) => {
  const [symptoms, setSymptoms] = useState<SymptomRecord[]>([]);
  
  useEffect(() => {
    // Load symptoms from localStorage
    const loadSymptoms = () => {
      const storedSymptoms = localStorage.getItem(`symptoms_${pregnancyId}`);
      if (storedSymptoms) {
        const parsedSymptoms = JSON.parse(storedSymptoms);
        // Convert string dates to Date objects
        const processedSymptoms = parsedSymptoms.map((symptom: any) => ({
          ...symptom,
          date: new Date(symptom.date)
        }));
        setSymptoms(processedSymptoms);
      }
    };
    
    loadSymptoms();
  }, [pregnancyId]);
  
  const saveSymptoms = (updatedSymptoms: SymptomRecord[]) => {
    localStorage.setItem(`symptoms_${pregnancyId}`, JSON.stringify(updatedSymptoms));
    setSymptoms(updatedSymptoms);
  };
  
  const addSymptom = (record: Omit<SymptomRecord, 'id'>) => {
    const newRecord: SymptomRecord = {
      id: Date.now().toString(),
      ...record
    };
    
    const updatedSymptoms = [...symptoms, newRecord];
    // Sort by date, newest first
    updatedSymptoms.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    saveSymptoms(updatedSymptoms);
    
    toast({
      title: "Observation recorded",
      description: `"${record.title}" has been added to ${femaleName}'s pregnancy log.`
    });
  };
  
  const deleteSymptom = (id: string) => {
    const updatedSymptoms = symptoms.filter(symptom => symptom.id !== id);
    saveSymptoms(updatedSymptoms);
    
    toast({
      title: "Record deleted",
      description: "The observation has been deleted from the log."
    });
  };
  
  return {
    symptoms,
    addSymptom,
    deleteSymptom
  };
};
