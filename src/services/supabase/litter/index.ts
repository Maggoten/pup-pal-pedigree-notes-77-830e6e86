
import { LitterQueryService } from './LitterQueryService';
import { LitterMutationService } from './LitterMutationService';
import { PuppyMutationService } from './PuppyMutationService';
import { LogService } from './LogService';
import { ChecklistService } from './ChecklistService';
import { Litter, Puppy } from '@/types/breeding';
import { LitterService, PuppyService, LogService as ILogService, ChecklistService as IChecklistService } from './types';

/**
 * Combined service that provides the same API as the original litterService
 * This is a facade that delegates to more specialized services
 */
class SupabaseLitterServiceFacade {
  private readonly queryService: LitterQueryService;
  private readonly logService: LogService;
  private readonly checklistService: ChecklistService;
  private readonly litterService: LitterService;
  private readonly puppyService: PuppyService;

  constructor() {
    this.queryService = new LitterQueryService();
    this.logService = new LogService();
    this.checklistService = new ChecklistService();
    this.litterService = new LitterMutationService();
    this.puppyService = new PuppyMutationService(this.logService);
  }

  // Litter operations
  async loadLitters(): Promise<Litter[]> {
    return this.queryService.loadLitters();
  }

  async addLitter(litter: Litter): Promise<Litter | null> {
    return this.litterService.addLitter(litter);
  }

  async updateLitter(litter: Litter): Promise<boolean> {
    return this.litterService.updateLitter(litter);
  }

  async deleteLitter(litterId: string): Promise<boolean> {
    return this.litterService.deleteLitter(litterId);
  }

  async toggleArchiveLitter(litterId: string, archive: boolean): Promise<boolean> {
    return this.litterService.toggleArchiveLitter(litterId, archive);
  }

  // Puppy operations
  async addPuppy(litterId: string, puppy: Puppy): Promise<Puppy | null> {
    return this.puppyService.addPuppy(litterId, puppy);
  }

  async updatePuppy(litterId: string, puppy: Puppy): Promise<boolean> {
    return this.puppyService.updatePuppy(litterId, puppy);
  }

  async deletePuppy(puppyId: string): Promise<boolean> {
    return this.puppyService.deletePuppy(puppyId);
  }

  // Log operations
  async addWeightLog(puppyId: string, date: string, weight: number): Promise<boolean> {
    return this.logService.addWeightLog(puppyId, date, weight);
  }

  async addHeightLog(puppyId: string, date: string, height: number): Promise<boolean> {
    return this.logService.addHeightLog(puppyId, date, height);
  }

  async addPuppyNote(puppyId: string, date: string, content: string): Promise<boolean> {
    return this.logService.addPuppyNote(puppyId, date, content);
  }

  // Checklist operations
  async saveChecklistItemStatus(litterId: string, itemId: string, completed: boolean): Promise<boolean> {
    return this.checklistService.saveChecklistItemStatus(litterId, itemId, completed);
  }

  async loadChecklistStatuses(litterId: string): Promise<Record<string, boolean>> {
    return this.checklistService.loadChecklistStatuses(litterId);
  }
}

// Export a singleton instance that maintains the same API as the original litterService
export const supabaseLitterService = new SupabaseLitterServiceFacade();
