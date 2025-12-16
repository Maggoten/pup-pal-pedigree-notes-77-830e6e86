import { supabase } from '@/integrations/supabase/client';
import { HealthTest } from '@/types/dogs';

export interface DogWeightLog {
  id: string;
  dog_id: string;
  user_id: string;
  date: string;
  weight: number;
  notes?: string;
  created_at?: string;
}

export interface DogHeightLog {
  id: string;
  dog_id: string;
  user_id: string;
  date: string;
  height: number;
  notes?: string;
  created_at?: string;
}

export const DogHealthService = {
  // Weight logs
  async getWeightLogs(dogId: string): Promise<DogWeightLog[]> {
    const { data, error } = await supabase
      .from('dog_weight_logs')
      .select('*')
      .eq('dog_id', dogId)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async addWeightLog(dogId: string, weight: number, date: Date, notes?: string): Promise<DogWeightLog> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('dog_weight_logs')
      .insert({
        dog_id: dogId,
        user_id: user.id,
        weight,
        date: date.toISOString(),
        notes
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteWeightLog(logId: string): Promise<void> {
    const { error } = await supabase
      .from('dog_weight_logs')
      .delete()
      .eq('id', logId);
    
    if (error) throw error;
  },

  // Height logs
  async getHeightLogs(dogId: string): Promise<DogHeightLog[]> {
    const { data, error } = await supabase
      .from('dog_height_logs')
      .select('*')
      .eq('dog_id', dogId)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async addHeightLog(dogId: string, height: number, date: Date, notes?: string): Promise<DogHeightLog> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('dog_height_logs')
      .insert({
        dog_id: dogId,
        user_id: user.id,
        height,
        date: date.toISOString(),
        notes
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteHeightLog(logId: string): Promise<void> {
    const { error } = await supabase
      .from('dog_height_logs')
      .delete()
      .eq('id', logId);
    
    if (error) throw error;
  },

  // Health tests (stored in dogs.health_tests JSONB)
  async addHealthTest(dogId: string, test: Omit<HealthTest, 'id'>): Promise<void> {
    // First get current health tests
    const { data: dog, error: fetchError } = await supabase
      .from('dogs')
      .select('health_tests')
      .eq('id', dogId)
      .single();
    
    if (fetchError) throw fetchError;

    const currentTests = (dog?.health_tests as HealthTest[]) || [];
    const newTest: HealthTest = {
      ...test,
      id: crypto.randomUUID()
    };
    
    const { error } = await supabase
      .from('dogs')
      .update({ health_tests: [...currentTests, newTest] })
      .eq('id', dogId);
    
    if (error) throw error;
  },

  async deleteHealthTest(dogId: string, testId: string): Promise<void> {
    const { data: dog, error: fetchError } = await supabase
      .from('dogs')
      .select('health_tests')
      .eq('id', dogId)
      .single();
    
    if (fetchError) throw fetchError;

    const currentTests = (dog?.health_tests as HealthTest[]) || [];
    const updatedTests = currentTests.filter(t => t.id !== testId);
    
    const { error } = await supabase
      .from('dogs')
      .update({ health_tests: updatedTests })
      .eq('id', dogId);
    
    if (error) throw error;
  },

  // Health notes
  async updateHealthNotes(dogId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('dogs')
      .update({ health_notes: notes })
      .eq('id', dogId);
    
    if (error) throw error;
  }
};
