import { ChecklistItem } from './types';
import { TFunction } from 'i18next';

// Mapping of item IDs to translation keys
const getItemTranslationKey = (id: string): string | null => {
  if (id.includes('deworm-2w')) return 'firstDeworming';
  if (id.includes('deworm-4w')) return 'secondDeworming';  
  if (id.includes('deworm-6w')) return 'thirdDeworming';
  if (id.includes('deworm-8w')) return 'finalDeworming';
  if (id.includes('vet-6w')) return 'vetVisit';
  if (id.includes('vacc-6w')) return 'firstVaccination';
  if (id.includes('vacc-9w')) return 'secondVaccination';
  if (id.includes('weaning-3w')) return 'startWeaning';
  if (id.includes('weaning-4w')) return 'continueWeaning';
  if (id.includes('weaning-5w')) return 'completeWeaning';
  if (id.includes('socialization-3w')) return 'beginSocialization';
  if (id.includes('socialization-5w')) return 'increaseSocialization';
  if (id.includes('temp-4w')) return 'temperamentTesting';
  if (id.includes('microchip-7w')) return 'microchipPuppies';
  if (id.includes('photos-6w')) return 'professionalPhotos';
  if (id.includes('register-7w')) return 'registerLitter';
  if (id.includes('puppy-pack')) return 'preparePuppyPacks';
  if (id.includes('contracts-7w')) return 'prepareContracts';
  return null;
};

const getCategoryForItemId = (id: string): string => {
  if (id.includes('deworm') || id.includes('vet') || id.includes('vacc')) return 'health';
  if (id.includes('weaning') || id.includes('socialization') || id.includes('temp')) return 'development';
  return 'admin';
};

export const translateChecklistItems = (items: ChecklistItem[], t: TFunction): ChecklistItem[] => {
  return items.map(item => {
    const itemKey = getItemTranslationKey(item.id);
    const category = getCategoryForItemId(item.id);
    
    if (itemKey) {
      return {
        ...item,
        title: t(`checklist.items.${category}.${itemKey}.title`),
        description: t(`checklist.items.${category}.${itemKey}.description`)
      };
    }
    
    return item;
  });
};

// Timeline segment name mappings
export const getTimelineSegmentTranslations = (t: TFunction) => ({
  'Birth (0-1 weeks)': t('checklist.timeline.birth'),
  'Neonatal Period (1-2 weeks)': t('checklist.timeline.neonatal'),
  'Transition Period (2-4 weeks)': t('checklist.timeline.transition'),
  'Socialization Period (4-12 weeks)': t('checklist.timeline.socialization'),
  'Juvenile Period (12+ weeks)': t('checklist.timeline.juvenile')
});