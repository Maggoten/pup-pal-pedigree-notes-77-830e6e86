
import { litterService } from './LitterService';
import { Puppy } from '@/types/breeding';

export const updatePuppyInDb = async (litterId: string, updatedPuppy: Puppy): Promise<boolean> => {
  try {
    console.log('Updating puppy in database:', updatedPuppy.id, updatedPuppy.name);
    
    const success = await litterService.updatePuppy(litterId, updatedPuppy);
    
    if (success) {
      console.log('Successfully updated puppy in database');
      return true;
    } else {
      console.error('Failed to update puppy in database');
      return false;
    }
  } catch (error) {
    console.error('Error updating puppy in database:', error);
    return false;
  }
};
