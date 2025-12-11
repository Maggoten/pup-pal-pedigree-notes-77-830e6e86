import { supabase } from '@/integrations/supabase/client';
import { Puppy, Litter } from '@/types/breeding';
import { Dog, Gender } from '@/types/dogs';

export interface CreateDogFromPuppyResult {
  success: boolean;
  dogId?: string;
  error?: string;
}

/**
 * Creates a new dog profile from a kept puppy
 * Maps puppy data to dog data and inserts into the dogs table
 */
export const createDogFromPuppy = async (
  puppy: Puppy,
  litter: Litter,
  userId: string
): Promise<CreateDogFromPuppyResult> => {
  try {
    // Validate puppy status
    if (puppy.status !== 'Kept') {
      return {
        success: false,
        error: 'Only puppies with status "Kept" can be added to My Dogs'
      };
    }

    // Check if a dog already exists for this puppy
    const { data: existingDog, error: checkError } = await supabase
      .from('dogs')
      .select('id, name')
      .eq('source_puppy_id', puppy.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing dog:', checkError);
      return {
        success: false,
        error: 'Failed to check for existing dog profile'
      };
    }

    if (existingDog) {
      return {
        success: false,
        error: `A dog profile already exists for this puppy: ${existingDog.name}`
      };
    }

    // Calculate birthdate from puppy or litter
    const birthdate = puppy.birthDateTime 
      ? puppy.birthDateTime.split('T')[0] 
      : litter.dateOfBirth.split('T')[0];

    // Map puppy data to dog data
    const dogData = {
      owner_id: userId,
      name: puppy.name,
      breed: puppy.breed || null,
      gender: puppy.gender as Gender,
      color: puppy.color || null,
      birthdate,
      chip_number: puppy.microchip || null,
      registered_name: puppy.registered_name || null,
      registration_number: puppy.registration_number || null,
      image_url: puppy.imageUrl || null,
      source_puppy_id: puppy.id,
      // Leave these empty - can be filled in later by the user
      notes: null,
      dewormingDate: null,
      vaccinationDate: null,
      heatHistory: [],
      heatInterval: null,
      breedingHistory: { litters: [], breedings: [], matings: [] }
    };

    console.log('Creating dog from puppy:', { puppyId: puppy.id, puppyName: puppy.name, dogData });

    // Insert the new dog
    const { data: newDog, error: insertError } = await supabase
      .from('dogs')
      .insert(dogData)
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating dog from puppy:', insertError);
      return {
        success: false,
        error: 'Failed to create dog profile'
      };
    }

    console.log('Successfully created dog from puppy:', { dogId: newDog.id, puppyId: puppy.id });

    return {
      success: true,
      dogId: newDog.id
    };
  } catch (error) {
    console.error('Unexpected error creating dog from puppy:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
};

/**
 * Fetches litter information for a dog that was created from a puppy
 */
export const fetchPuppyOriginInfo = async (sourcePuppyId: string): Promise<{
  litterName: string;
  litterId: string;
  puppyId: string;
} | null> => {
  try {
    const { data: puppy, error } = await supabase
      .from('puppies')
      .select('id, litter_id')
      .eq('id', sourcePuppyId)
      .maybeSingle();

    if (error || !puppy) {
      console.error('Error fetching puppy origin:', error);
      return null;
    }

    const { data: litter, error: litterError } = await supabase
      .from('litters')
      .select('id, name')
      .eq('id', puppy.litter_id)
      .maybeSingle();

    if (litterError || !litter) {
      console.error('Error fetching litter info:', litterError);
      return null;
    }

    return {
      litterName: litter.name,
      litterId: litter.id,
      puppyId: puppy.id
    };
  } catch (error) {
    console.error('Unexpected error fetching puppy origin:', error);
    return null;
  }
};
