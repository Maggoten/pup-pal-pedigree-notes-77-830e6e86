
import { supabase } from '@/integrations/supabase/client';
import { Puppy } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { BaseSupabaseService } from '../base/BaseSupabaseService';
import { PuppyService } from './types';
import { LogService } from './LogService';

/**
 * Service responsible for puppy create/update/delete operations
 */
export class PuppyMutationService extends BaseSupabaseService implements PuppyService {
  constructor(private logService: LogService) {
    super();
  }
  
  /**
   * Add a puppy to a litter
   */
  async addPuppy(litterId: string, puppy: Puppy): Promise<Puppy | null> {
    try {
      // First, insert the puppy into the puppies table
      const { data: newPuppy, error: puppyError } = await supabase
        .from('puppies')
        .insert({
          litter_id: litterId,
          name: puppy.name,
          gender: puppy.gender,
          color: puppy.color,
          markings: puppy.markings,
          birth_weight: puppy.birthWeight,
          current_weight: puppy.currentWeight,
          sold: puppy.sold,
          reserved: puppy.reserved,
          new_owner: puppy.newOwner,
          collar: puppy.collar,
          microchip: puppy.microchip,
          breed: puppy.breed,
          image_url: puppy.imageUrl,
          birth_date_time: puppy.birthDateTime
        })
        .select()
        .single();

      if (puppyError) {
        this.handleError(puppyError, 'adding puppy');
        return null;
      }

      // Add birth weight to weight log if provided
      if (puppy.birthWeight && puppy.birthDateTime) {
        const birthDate = new Date(puppy.birthDateTime);
        await this.logService.addWeightLog(newPuppy.id, birthDate.toISOString(), puppy.birthWeight);
      }

      // Add any weight logs
      if (puppy.weightLog && puppy.weightLog.length > 0) {
        await Promise.all(
          puppy.weightLog.map(log => 
            this.logService.addWeightLog(newPuppy.id, log.date, log.weight)
          )
        );
      }

      // Add any height logs
      if (puppy.heightLog && puppy.heightLog.length > 0) {
        await Promise.all(
          puppy.heightLog.map(log => 
            this.logService.addHeightLog(newPuppy.id, log.date, log.height)
          )
        );
      }

      // Add any notes
      if (puppy.notes && puppy.notes.length > 0) {
        await Promise.all(
          puppy.notes.map(note => 
            this.logService.addPuppyNote(newPuppy.id, note.date, note.content)
          )
        );
      }

      // Create a query service instance to fetch the logs
      const queryService = new LitterQueryService();

      // Now fetch the complete puppy data with all logs
      const puppyWithLogs: Puppy = {
        id: newPuppy.id,
        name: newPuppy.name,
        gender: newPuppy.gender as 'male' | 'female',
        color: newPuppy.color || '',
        markings: newPuppy.markings,
        birthWeight: newPuppy.birth_weight,
        currentWeight: newPuppy.current_weight,
        sold: newPuppy.sold,
        reserved: newPuppy.reserved,
        newOwner: newPuppy.new_owner,
        collar: newPuppy.collar,
        microchip: newPuppy.microchip,
        breed: newPuppy.breed,
        imageUrl: newPuppy.image_url,
        birthDateTime: newPuppy.birth_date_time,
        weightLog: await queryService.fetchWeightLogs(newPuppy.id),
        heightLog: await queryService.fetchHeightLogs(newPuppy.id),
        notes: await queryService.fetchPuppyNotes(newPuppy.id)
      };

      return puppyWithLogs;
    } catch (error) {
      this.handleError(error, 'addPuppy');
      return null;
    }
  }

  /**
   * Update a puppy
   */
  async updatePuppy(litterId: string, updatedPuppy: Puppy): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('puppies')
        .update({
          name: updatedPuppy.name,
          gender: updatedPuppy.gender,
          color: updatedPuppy.color,
          markings: updatedPuppy.markings,
          birth_weight: updatedPuppy.birthWeight,
          current_weight: updatedPuppy.currentWeight,
          sold: updatedPuppy.sold,
          reserved: updatedPuppy.reserved,
          new_owner: updatedPuppy.newOwner,
          collar: updatedPuppy.collar,
          microchip: updatedPuppy.microchip,
          breed: updatedPuppy.breed,
          image_url: updatedPuppy.imageUrl,
          birth_date_time: updatedPuppy.birthDateTime
        })
        .eq('id', updatedPuppy.id)
        .eq('litter_id', litterId);

      if (error) {
        this.handleError(error, 'updating puppy');
        return false;
      }

      return true;
    } catch (error) {
      this.handleError(error, 'updatePuppy');
      return false;
    }
  }

  /**
   * Delete a puppy
   */
  async deletePuppy(puppyId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('puppies')
        .delete()
        .eq('id', puppyId);

      if (error) {
        this.handleError(error, 'deleting puppy');
        return false;
      }

      return true;
    } catch (error) {
      this.handleError(error, 'deletePuppy');
      return false;
    }
  }
}
