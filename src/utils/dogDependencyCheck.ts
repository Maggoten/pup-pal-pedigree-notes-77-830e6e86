
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface DependencyResult {
  hasDependencies: boolean;
  message: string;
  details?: {
    pregnancies: number;
    plannedLitters: number;
    litters: number;
  };
}

export const checkDogDependencies = async (dogId: string): Promise<DependencyResult> => {
  try {
    // Check pregnancies where dog is female
    const { data: femalePregnancies, error: femaleError } = await supabase
      .from('pregnancies')
      .select('id')
      .eq('female_dog_id', dogId)
      .eq('status', 'active');
      
    if (femaleError) throw new Error(`Female pregnancies check failed: ${femaleError.message}`);
    
    // Check pregnancies where dog is male
    const { data: malePregnancies, error: maleError } = await supabase
      .from('pregnancies')
      .select('id')
      .eq('male_dog_id', dogId)
      .eq('status', 'active');
      
    if (maleError) throw new Error(`Male pregnancies check failed: ${maleError.message}`);
    
    // Check planned litters where dog is female
    const { data: femalePlannedLitters, error: femalePlannedError } = await supabase
      .from('planned_litters')
      .select('id')
      .eq('female_id', dogId);
      
    if (femalePlannedError) throw new Error(`Female planned litters check failed: ${femalePlannedError.message}`);
    
    // Check planned litters where dog is male
    const { data: malePlannedLitters, error: malePlannedError } = await supabase
      .from('planned_litters')
      .select('id')
      .eq('male_id', dogId);
      
    if (malePlannedError) throw new Error(`Male planned litters check failed: ${malePlannedError.message}`);
    
    // Check litters where dog is dam (mother)
    const { data: damLitters, error: damError } = await supabase
      .from('litters')
      .select('id')
      .eq('dam_id', dogId);
      
    if (damError) throw new Error(`Dam litters check failed: ${damError.message}`);
    
    // Check litters where dog is sire (father)
    const { data: sireLitters, error: sireError } = await supabase
      .from('litters')
      .select('id')
      .eq('sire_id', dogId);
      
    if (sireError) throw new Error(`Sire litters check failed: ${sireError.message}`);
    
    const pregnanciesCount = (femalePregnancies?.length || 0) + (malePregnancies?.length || 0);
    const plannedLittersCount = (femalePlannedLitters?.length || 0) + (malePlannedLitters?.length || 0);
    const littersCount = (damLitters?.length || 0) + (sireLitters?.length || 0);
    
    const hasDependencies = pregnanciesCount > 0 || plannedLittersCount > 0 || littersCount > 0;
    
    let message = '';
    if (hasDependencies) {
      const dependencies = [];
      if (pregnanciesCount > 0) dependencies.push(`${pregnanciesCount} active pregnancies`);
      if (plannedLittersCount > 0) dependencies.push(`${plannedLittersCount} planned litters`);
      if (littersCount > 0) dependencies.push(`${littersCount} litters`);
      
      message = `This dog cannot be deleted because it is part of: ${dependencies.join(', ')}. Please remove these references before deleting the dog.`;
    }
    
    return {
      hasDependencies,
      message,
      details: {
        pregnancies: pregnanciesCount,
        plannedLitters: plannedLittersCount,
        litters: littersCount
      }
    };
  } catch (error) {
    console.error('Error checking dog dependencies:', error);
    return {
      hasDependencies: false,
      message: `Error checking dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
