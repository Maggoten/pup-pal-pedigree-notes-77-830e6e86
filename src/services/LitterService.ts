
import { Litter, Puppy } from '@/types/breeding';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

class LitterService {
  private readonly STORAGE_KEY = 'litters';

  /**
   * Load litters from localStorage
   */
  loadLitters(): Litter[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing litters from localStorage:", e);
        return [];
      }
    }
    return [];
  }

  /**
   * Save litters to localStorage
   */
  saveLitters(litters: Litter[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(litters));
  }

  /**
   * Add a new litter
   */
  addLitter(litter: Litter): Litter[] {
    const litters = this.loadLitters();
    const updatedLitters = [...litters, litter];
    this.saveLitters(updatedLitters);
    return updatedLitters;
  }

  /**
   * Update an existing litter
   */
  updateLitter(updatedLitter: Litter): Litter[] {
    const litters = this.loadLitters();
    const updatedLitters = litters.map(litter => 
      litter.id === updatedLitter.id ? updatedLitter : litter
    );
    this.saveLitters(updatedLitters);
    return updatedLitters;
  }

  /**
   * Delete a litter
   */
  deleteLitter(litterId: string): Litter[] {
    const litters = this.loadLitters();
    const updatedLitters = litters.filter(litter => litter.id !== litterId);
    this.saveLitters(updatedLitters);
    return updatedLitters;
  }

  /**
   * Add a puppy to a litter
   */
  addPuppy(litterId: string, puppy: Puppy): Litter[] {
    const litters = this.loadLitters();
    const updatedLitters = litters.map(litter => {
      if (litter.id === litterId) {
        return {
          ...litter,
          puppies: [...litter.puppies, puppy]
        };
      }
      return litter;
    });
    this.saveLitters(updatedLitters);
    return updatedLitters;
  }

  /**
   * Update a puppy in a litter
   */
  updatePuppy(litterId: string, updatedPuppy: Puppy): Litter[] {
    const litters = this.loadLitters();
    const updatedLitters = litters.map(litter => {
      if (litter.id === litterId) {
        const updatedPuppies = litter.puppies.map(puppy => 
          puppy.id === updatedPuppy.id ? updatedPuppy : puppy
        );
        return {
          ...litter,
          puppies: updatedPuppies
        };
      }
      return litter;
    });
    this.saveLitters(updatedLitters);
    return updatedLitters;
  }

  /**
   * Delete a puppy from a litter
   */
  deletePuppy(litterId: string, puppyId: string): Litter[] {
    const litters = this.loadLitters();
    const updatedLitters = litters.map(litter => {
      if (litter.id === litterId) {
        return {
          ...litter,
          puppies: litter.puppies.filter(puppy => puppy.id !== puppyId)
        };
      }
      return litter;
    });
    this.saveLitters(updatedLitters);
    return updatedLitters;
  }
}

// Export a singleton instance
export const litterService = new LitterService();
