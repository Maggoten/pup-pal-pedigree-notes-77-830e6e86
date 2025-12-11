import { supabase } from '@/integrations/supabase/client';
import { Litter, Puppy } from '@/types/breeding';
import { litterService } from './LitterService';

export interface ArchivedLitterData {
  litter: Litter;
  puppies: Puppy[];
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
    avgWeightAt8Weeks: number;
  };
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

    // Calculate average weight at 8 weeks (56 days from birth)
    const birthDate = new Date(litter.dateOfBirth);
    const eightWeeksDate = new Date(birthDate.getTime() + 56 * 24 * 60 * 60 * 1000);
    
    const weightsAt8Weeks = puppies
      .map(p => {
        if (!p.weightLog || p.weightLog.length === 0) return null;
        
        // Find measurement closest to 8 weeks (within ±7 days)
        let closestWeight: number | null = null;
        let closestDiff = Infinity;
        
        p.weightLog.forEach(log => {
          const logDate = new Date(log.date);
          const diff = Math.abs(logDate.getTime() - eightWeeksDate.getTime());
          const daysDiff = diff / (24 * 60 * 60 * 1000);
          
          if (daysDiff <= 7 && diff < closestDiff) {
            closestDiff = diff;
            closestWeight = log.weight;
          }
        });
        
        return closestWeight;
      })
      .filter(w => w !== null) as number[];
    
    const avgWeightAt8Weeks = weightsAt8Weeks.length > 0 
      ? weightsAt8Weeks.reduce((sum, w) => sum + w, 0) / weightsAt8Weeks.length 
      : 0;

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
      puppies,
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
        avgWeightAt8Weeks
      }
    };
  } catch (error) {
    console.error('Error fetching archived litter details:', error);
    return null;
  }
};
