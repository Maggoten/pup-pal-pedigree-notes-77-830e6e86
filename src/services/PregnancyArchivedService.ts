import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';

export interface ArchivedPregnancyData {
  id: string;
  femaleName: string;
  maleName: string;
  matingDate: Date;
  actualBirthDate: Date | null;
  expectedDueDate: Date;
  gestationLength: number | null;
  temperatureLogs: TemperatureLog[];
  symptoms: SymptomLog[];
  notes: NoteLog[];
  linkedLitter: LinkedLitter | null;
}

export interface TemperatureLog {
  id: string;
  date: Date;
  temperature: number;
  notes?: string;
}

export interface SymptomLog {
  id: string;
  date: Date;
  title: string;
  description: string;
}

export interface NoteLog {
  id: string;
  date: Date;
  title: string;
  description: string;
}

export interface LinkedLitter {
  id: string;
  name: string;
  damName: string;
  sireName: string;
  dateOfBirth: Date;
  totalPuppies: number;
  alivePuppies: number;
  deadPuppies: number;
}

export const getArchivedPregnancyDetails = async (
  pregnancyId: string
): Promise<ArchivedPregnancyData | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log('No active session found');
      return null;
    }

    // Fetch pregnancy details
    const { data: pregnancy, error: pregnancyError } = await supabase
      .from('pregnancies')
      .select(`
        id,
        mating_date,
        expected_due_date,
        actual_birth_date,
        external_male_name,
        female_dog_id,
        male_dog_id
      `)
      .eq('id', pregnancyId)
      .eq('user_id', sessionData.session.user.id)
      .single();

    if (pregnancyError || !pregnancy) {
      console.error('Error fetching pregnancy:', pregnancyError);
      return null;
    }

    // Fetch female dog name
    let femaleName = 'Unknown Female';
    if (pregnancy.female_dog_id) {
      const { data: femaleDog } = await supabase
        .from('dogs')
        .select('name')
        .eq('id', pregnancy.female_dog_id)
        .single();
      
      if (femaleDog) femaleName = femaleDog.name;
    }

    // Fetch male dog name with fallback strategy
    let maleName = 'Unknown Male';
    
    // Strategy 1: Check male_dog_id first (for internal males)
    if (pregnancy.male_dog_id) {
      const { data: maleDog } = await supabase
        .from('dogs')
        .select('name')
        .eq('id', pregnancy.male_dog_id)
        .maybeSingle();
      
      if (maleDog) {
        maleName = maleDog.name;
      } else if (pregnancy.external_male_name) {
        // Fallback to external_male_name if dog no longer exists
        maleName = pregnancy.external_male_name;
      }
    } 
    // Strategy 2: Check external_male_name (for external males or fallback)
    else if (pregnancy.external_male_name) {
      maleName = pregnancy.external_male_name;
    }
    // Strategy 3: Fallback to mating_dates -> planned_litters
    else {
      const { data: matingDate } = await supabase
        .from('mating_dates')
        .select('planned_litter_id')
        .eq('pregnancy_id', pregnancyId)
        .maybeSingle();
      
      if (matingDate?.planned_litter_id) {
        const { data: plannedLitter } = await supabase
          .from('planned_litters')
          .select('male_name, external_male_name')
          .eq('id', matingDate.planned_litter_id)
          .single();
        
        if (plannedLitter) {
          maleName = plannedLitter.male_name || plannedLitter.external_male_name || 'Unknown Male';
        }
      }
    }

    const matingDate = new Date(pregnancy.mating_date);
    const expectedDueDate = new Date(pregnancy.expected_due_date);
    const actualBirthDate = pregnancy.actual_birth_date ? new Date(pregnancy.actual_birth_date) : null;
    
    // Calculate gestation length if birth date exists
    const gestationLength = actualBirthDate ? differenceInDays(actualBirthDate, matingDate) : null;

    // Fetch temperature logs
    const { data: tempLogs, error: tempError } = await supabase
      .from('temperature_logs')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .order('date', { ascending: true });

    const temperatureLogs: TemperatureLog[] = (tempLogs || []).map(log => ({
      id: log.id,
      date: new Date(log.date),
      temperature: Number(log.temperature),
      notes: log.notes || undefined
    }));

    // Fetch symptom logs
    const { data: symptomLogs, error: symptomError } = await supabase
      .from('symptom_logs')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .order('date', { ascending: true });

    const symptoms: SymptomLog[] = (symptomLogs || []).map(log => ({
      id: log.id,
      date: new Date(log.date),
      title: log.title,
      description: log.description
    }));

    // For now, notes are empty - we can add pregnancy_notes table later if needed
    const notes: NoteLog[] = [];

    // Fetch linked litter
    const { data: litterData, error: litterError } = await supabase
      .from('litters')
      .select('*')
      .eq('pregnancy_id', pregnancyId)
      .maybeSingle();

    let linkedLitter: LinkedLitter | null = null;
    if (litterData) {
      // Fetch puppies for the litter
      const { data: puppies } = await supabase
        .from('puppies')
        .select('id, death_date')
        .eq('litter_id', litterData.id);

      const totalPuppies = puppies?.length || 0;
      const deadPuppies = puppies?.filter(p => p.death_date).length || 0;
      const alivePuppies = totalPuppies - deadPuppies;

      linkedLitter = {
        id: String(litterData.id),
        name: litterData.name,
        damName: litterData.dam_name,
        sireName: litterData.sire_name,
        dateOfBirth: new Date(litterData.date_of_birth),
        totalPuppies,
        alivePuppies,
        deadPuppies
      };
    }

    return {
      id: pregnancy.id,
      femaleName,
      maleName,
      matingDate,
      actualBirthDate,
      expectedDueDate,
      gestationLength,
      temperatureLogs,
      symptoms,
      notes,
      linkedLitter
    };
  } catch (error) {
    console.error('Error in getArchivedPregnancyDetails:', error);
    return null;
  }
};

export const findLowestTemperature = (logs: TemperatureLog[]): TemperatureLog | null => {
  if (logs.length === 0) return null;
  
  return logs.reduce((lowest, current) => 
    current.temperature < lowest.temperature ? current : lowest
  );
};