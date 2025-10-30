/**
 * Configuration for event deletion permissions and warnings
 */
export const EVENT_DELETION_CONFIG = {
  /**
   * Events that can be deleted without warning
   * These are typically user-created or temporary events
   */
  SAFE_DELETE: [
    'custom',
    'reminder',
    'heat',              // Predicted heats
    'ovulation-predicted',
    'fertility-window',
    'birthday-reminder',
    'vaccination-reminder',
    'vet-visit'
  ] as const,

  /**
   * Events that require confirmation before deletion
   * These are important historical records
   */
  REQUIRES_CONFIRMATION: [
    'mating',           // Critical breeding history
    'due-date',         // Birth records
    'birthday',         // Important identity data
    'heat-active',      // Actual heat cycle records
    'vaccination'       // Medical records
  ] as const,

  /**
   * Events that cannot be deleted at all
   * (Currently none - users should have full control)
   */
  CANNOT_DELETE: [] as string[],
};

export const EventDeletionHelpers = {
  /**
   * Check if an event can be deleted
   */
  canDelete(eventType: string): boolean {
    return !EVENT_DELETION_CONFIG.CANNOT_DELETE.includes(eventType as any);
  },

  /**
   * Check if deletion requires confirmation
   */
  requiresConfirmation(eventType: string): boolean {
    return EVENT_DELETION_CONFIG.REQUIRES_CONFIRMATION.includes(eventType as any);
  },

  /**
   * Get confirmation message for event type
   */
  getConfirmationMessage(eventType: string, eventTitle: string): {
    title: string;
    description: string;
    warningLevel: 'high' | 'medium' | 'low';
  } {
    switch (eventType) {
      case 'mating':
        return {
          title: 'Radera parningsdatum?',
          description: `Vill du verkligen radera "${eventTitle}"? Detta är viktig avelhistorik och kan inte återställas.`,
          warningLevel: 'high'
        };
      case 'due-date':
        return {
          title: 'Radera förlossningsdatum?',
          description: `Vill du verkligen radera "${eventTitle}"? Detta är en viktig födelsedatum och kan inte återställas.`,
          warningLevel: 'high'
        };
      case 'birthday':
        return {
          title: 'Radera födelsedag?',
          description: `Vill du verkligen radera "${eventTitle}"? Detta är grundläggande information om hunden.`,
          warningLevel: 'medium'
        };
      case 'heat-active':
        return {
          title: 'Radera löpcykel?',
          description: `Vill du verkligen radera "${eventTitle}"? Detta är en verklig löpcykel från medicinsk historik.`,
          warningLevel: 'medium'
        };
      case 'vaccination':
        return {
          title: 'Radera vaccination?',
          description: `Vill du verkligen radera "${eventTitle}"? Detta är medicinsk historik som kan behövas för veterinär eller myndigheter.`,
          warningLevel: 'medium'
        };
      default:
        return {
          title: 'Radera händelse?',
          description: `Vill du verkligen radera "${eventTitle}"?`,
          warningLevel: 'low'
        };
    }
  }
};
