
import { supabase } from '@/integrations/supabase/client';
import { Litter } from '@/types/breeding';
import { toast } from '@/components/ui/use-toast';
import { BaseSupabaseService } from '../base/BaseSupabaseService';
import { LitterService } from './types';

/**
 * Service responsible for litter create/update/delete operations
 */
export class LitterMutationService extends BaseSupabaseService implements LitterService {
  /**
   * Load all litters for the current user
   * This method is here to satisfy the interface but delegates to LitterQueryService
   */
  async loadLitters(): Promise<Litter[]> {
    return [];
  }
  
  /**
   * Add a new litter
   */
  async addLitter(litter: Litter): Promise<Litter | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }

      const { data, error } = await supabase
        .from('litters')
        .insert({
          name: litter.name,
          date_of_birth: litter.dateOfBirth,
          sire_id: litter.sireId,
          dam_id: litter.damId,
          sire_name: litter.sireName,
          dam_name: litter.damName,
          archived: litter.archived || false,
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) {
        this.handleError(error, 'adding litter');
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        dateOfBirth: data.date_of_birth,
        sireId: data.sire_id || '',
        damId: data.dam_id || '',
        sireName: data.sire_name,
        damName: data.dam_name,
        archived: data.archived,
        puppies: []
      };
    } catch (error) {
      this.handleError(error, 'addLitter');
      return null;
    }
  }

  /**
   * Update an existing litter
   */
  async updateLitter(updatedLitter: Litter): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('litters')
        .update({
          name: updatedLitter.name,
          date_of_birth: updatedLitter.dateOfBirth,
          sire_id: updatedLitter.sireId,
          dam_id: updatedLitter.damId,
          sire_name: updatedLitter.sireName,
          dam_name: updatedLitter.damName,
          archived: updatedLitter.archived
        })
        .eq('id', updatedLitter.id);

      if (error) {
        this.handleError(error, 'updating litter');
        return false;
      }

      return true;
    } catch (error) {
      this.handleError(error, 'updateLitter');
      return false;
    }
  }

  /**
   * Delete a litter
   */
  async deleteLitter(litterId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('litters')
        .delete()
        .eq('id', litterId);

      if (error) {
        this.handleError(error, 'deleting litter');
        return false;
      }

      return true;
    } catch (error) {
      this.handleError(error, 'deleteLitter');
      return false;
    }
  }

  /**
   * Archive or unarchive a litter
   */
  async toggleArchiveLitter(litterId: string, archive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('litters')
        .update({ archived: archive })
        .eq('id', litterId);

      if (error) {
        this.handleError(error, 'toggling archive status');
        return false;
      }

      return true;
    } catch (error) {
      this.handleError(error, 'toggleArchiveLitter');
      return false;
    }
  }
}
