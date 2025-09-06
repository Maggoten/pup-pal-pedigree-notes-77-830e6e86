
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
      
      try {
        // Use fetch API to bypass TypeScript restrictions
        const supabaseUrl = "https://yqcgqriecxtppuvcguyj.supabase.co";
        const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY2dxcmllY3h0cHB1dmNndXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTI4NjksImV4cCI6MjA2MDI2ODg2OX0.PD0W-rLpQBHUGm9--nv4-3PVYQFMAsRujmExBDuP5oA";
        
        // Get auth session for authentication
        const { data: sessionData } = await supabase.auth.getSession();
        const authHeader = sessionData.session ? 
          { Authorization: `Bearer ${sessionData.session.access_token}` } : {};
          
        const response = await fetch(
          `${supabaseUrl}/rest/v1/temperature_logs?pregnancy_id=eq.${pregnancyId}&order=date.desc`, 
          {
            headers: {
              'apikey': supabaseKey,
              'Content-Type': 'application/json',
              ...authHeader
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to load temperature data');
        }
        
        const data = await response.json();

        // Process the data manually
        const processedTemps = data.map((temp: any) => ({
          id: temp.id,
          date: new Date(temp.date),
          temperature: temp.temperature,
          notes: temp.notes
        }));

        setTemperatures(processedTemps);
      } catch (err) {
        console.error('Error in temperature loading:', err);
        toast({
          title: "Error loading temperature logs",
          description: "There was a problem loading the temperature records.",
          variant: "destructive"
        });
      }
      
      setLoading(false);
    };

    if (pregnancyId) {
      loadTemperatures();
    }
  }, [pregnancyId]);

  const addTemperature = async (record: Omit<TemperatureRecord, 'id'>) => {
    try {
      // Get auth session for authentication
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to add temperature records.",
          variant: "destructive"
        });
        return;
      }
      
      const userId = sessionData.session.user.id;
      const supabaseUrl = "https://yqcgqriecxtppuvcguyj.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY2dxcmllY3h0cHB1dmNndXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTI4NjksImV4cCI6MjA2MDI2ODg2OX0.PD0W-rLpQBHUGm9--nv4-3PVYQFMAsRujmExBDuP5oA";
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/temperature_logs`, 
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            pregnancy_id: pregnancyId,
            user_id: userId,
            temperature: record.temperature,
            date: record.date.toISOString(),
            notes: record.notes
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to save temperature data');
      }
      
      const data = await response.json();
      const newRecordData = data[0]; // Get the first returned item
      
      if (!newRecordData) {
        throw new Error('No data returned after saving');
      }

      const newRecord: TemperatureRecord = {
        id: newRecordData.id,
        date: new Date(newRecordData.date),
        temperature: newRecordData.temperature,
        notes: newRecordData.notes
      };

      setTemperatures(prev => [newRecord, ...prev].sort((a, b) => 
        b.date.getTime() - a.date.getTime()
      ));

      toast({
        title: "Temperature recorded",
        description: `Temperature of ${record.temperature}°F recorded for ${record.date.toLocaleDateString()}.`
      });
    } catch (err) {
      console.error('Error in temperature addition:', err);
      toast({
        title: "Error saving temperature",
        description: "The temperature record could not be saved.",
        variant: "destructive"
      });
    }
  };

  const updateTemperature = async (id: string, updates: Partial<Omit<TemperatureRecord, 'id'>>) => {
    try {
      // Get auth session for authentication
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to update temperature records.",
          variant: "destructive"
        });
        return;
      }
      
      const supabaseUrl = "https://yqcgqriecxtppuvcguyj.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY2dxcmllY3h0cHB1dmNndXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTI4NjksImV4cCI6MjA2MDI2ODg2OX0.PD0W-rLpQBHUGm9--nv4-3PVYQFMAsRujmExBDuP5oA";
      
      const updateData: any = {};
      if (updates.temperature !== undefined) updateData.temperature = updates.temperature;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.date !== undefined) updateData.date = updates.date.toISOString();
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/temperature_logs?id=eq.${id}`, 
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(updateData)
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to update temperature data');
      }
      
      const data = await response.json();
      const updatedRecordData = data[0];
      
      if (!updatedRecordData) {
        throw new Error('No data returned after update');
      }

      const updatedRecord: TemperatureRecord = {
        id: updatedRecordData.id,
        date: new Date(updatedRecordData.date),
        temperature: updatedRecordData.temperature,
        notes: updatedRecordData.notes
      };

      setTemperatures(prev => prev.map(temp => 
        temp.id === id ? updatedRecord : temp
      ).sort((a, b) => b.date.getTime() - a.date.getTime()));

      toast({
        title: "Temperature updated",
        description: "The temperature record has been successfully updated."
      });
    } catch (err) {
      console.error('Error in temperature update:', err);
      toast({
        title: "Error updating temperature",
        description: "The temperature record could not be updated.",
        variant: "destructive"
      });
    }
  };

  const deleteTemperature = async (id: string) => {
    try {
      // Get auth session for authentication  
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to delete temperature records.",
          variant: "destructive"
        });
        return;
      }
      
      const supabaseUrl = "https://yqcgqriecxtppuvcguyj.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY2dxcmllY3h0cHB1dmNndXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTI4NjksImV4cCI6MjA2MDI2ODg2OX0.PD0W-rLpQBHUGm9--nv4-3PVYQFMAsRujmExBDuP5oA";
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/temperature_logs?id=eq.${id}`, 
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete temperature data');
      }

      setTemperatures(prev => prev.filter(temp => temp.id !== id));

      toast({
        title: "Temperature deleted",
        description: "The temperature record has been deleted."
      });
    } catch (err) {
      console.error('Error in temperature deletion:', err);
      toast({
        title: "Error deleting record",
        description: "The temperature record could not be deleted.",
        variant: "destructive"
      });
    }
  };

  return {
    temperatures,
    loading,
    addTemperature,
    updateTemperature,
    deleteTemperature
  };
};
