import { supabase } from '@/integrations/supabase/client';
import { Litter, Puppy } from '@/types/breeding';
import { litterService } from './LitterService';

export interface ArchivedLitterData {
  litter: Litter;
  damImageUrl?: string;
  sireImageUrl?: string;
  damBreed?: string;
  damRegistration?: string;
  sireBreed?: string;
  sireRegistration?: string;
  statistics: {
    totalBorn: number;
    living: number;
    deceased: number;
    males: number;
    females: number;
    avgBirthWeight: number;
    avgFinalWeight: number;
  };
  averageWeightLog: Array<{ date: string; weight: number }>;
  averageHeightLog: Array<{ date: string; height: number }>;
}

export const getArchivedLitterDetails = async (litterId: string): Promise<ArchivedLitterData | null> => {
  try {
    // Fetch litter with all puppies
    const litter = await litterService.getLitterDetails(litterId);
    
    if (!litter) {
      console.error('Litter not found');
      return null;
    }

    const puppies = litter.puppies || [];
    
    // Calculate statistics
    const totalBorn = puppies.length;
    const deceased = puppies.filter(p => p.deathDate).length;
    const living = totalBorn - deceased;
    const males = puppies.filter(p => p.gender === 'male').length;
    const females = puppies.filter(p => p.gender === 'female').length;

    // Calculate average birth weight
    const birthWeights = puppies.filter(p => p.birthWeight).map(p => p.birthWeight!);
    const avgBirthWeight = birthWeights.length > 0 
      ? birthWeights.reduce((sum, w) => sum + w, 0) / birthWeights.length 
      : 0;

    // Calculate average final weight (most recent weight from each puppy)
    const finalWeights = puppies
      .map(p => {
        if (!p.weightLog || p.weightLog.length === 0) return null;
        const sortedWeights = [...p.weightLog].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        return sortedWeights[0].weight;
      })
      .filter(w => w !== null) as number[];
    
    const avgFinalWeight = finalWeights.length > 0 
      ? finalWeights.reduce((sum, w) => sum + w, 0) / finalWeights.length 
      : 0;

    // Calculate average weight/height logs for the litter
    const averageWeightLog = calculateAverageWeightLog(puppies);
    const averageHeightLog = calculateAverageHeightLog(puppies);

    // Fetch dam and sire images
    let damImageUrl: string | undefined;
    let sireImageUrl: string | undefined;

    let damBreed: string | undefined;
    let damRegistration: string | undefined;
    let sireBreed: string | undefined;
    let sireRegistration: string | undefined;

    if (litter.damId) {
      const { data: damData } = await supabase
        .from('dogs')
        .select('image_url, breed, registration_number')
        .eq('id', litter.damId)
        .single();
      damImageUrl = damData?.image_url || undefined;
      damBreed = damData?.breed || undefined;
      damRegistration = damData?.registration_number || undefined;
    }

    if (litter.sireId) {
      const { data: sireData } = await supabase
        .from('dogs')
        .select('image_url, breed, registration_number')
        .eq('id', litter.sireId)
        .single();
      sireImageUrl = sireData?.image_url || undefined;
      sireBreed = sireData?.breed || undefined;
      sireRegistration = sireData?.registration_number || undefined;
    }

    return {
      litter,
      damImageUrl,
      sireImageUrl,
      damBreed,
      damRegistration,
      sireBreed,
      sireRegistration,
      statistics: {
        totalBorn,
        living,
        deceased,
        males,
        females,
        avgBirthWeight,
        avgFinalWeight
      },
      averageWeightLog,
      averageHeightLog
    };
  } catch (error) {
    console.error('Error fetching archived litter details:', error);
    return null;
  }
};

// Helper function to calculate average weight logs
const calculateAverageWeightLog = (puppies: Puppy[]): Array<{ date: string; weight: number }> => {
  const logMap = new Map<string, number[]>();

  // Collect all weight logs from all puppies
  puppies.forEach(puppy => {
    if (!puppy.weightLog) return;

    puppy.weightLog.forEach(log => {
      const dateKey = log.date;
      const value = log.weight;
      
      if (!logMap.has(dateKey)) {
        logMap.set(dateKey, []);
      }
      logMap.get(dateKey)!.push(value);
    });
  });

  // Calculate averages for each date
  const result = Array.from(logMap.entries()).map(([date, values]) => {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return { date, weight: avg };
  });

  // Sort by date
  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Helper function to calculate average height logs
const calculateAverageHeightLog = (puppies: Puppy[]): Array<{ date: string; height: number }> => {
  const logMap = new Map<string, number[]>();

  // Collect all height logs from all puppies
  puppies.forEach(puppy => {
    if (!puppy.heightLog) return;

    puppy.heightLog.forEach(log => {
      const dateKey = log.date;
      const value = log.height;
      
      if (!logMap.has(dateKey)) {
        logMap.set(dateKey, []);
      }
      logMap.get(dateKey)!.push(value);
    });
  });

  // Calculate averages for each date
  const result = Array.from(logMap.entries()).map(([date, values]) => {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return { date, height: avg };
  });

  // Sort by date
  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
