// Collar color options for puppies - used in both UI and chart line colors
export interface CollarColor {
  id: string;
  hex: string;
  translationKey: string;
}

export const COLLAR_COLORS: CollarColor[] = [
  { id: 'red', hex: '#ef4444', translationKey: 'collarColors.red' },
  { id: 'orange', hex: '#f97316', translationKey: 'collarColors.orange' },
  { id: 'yellow', hex: '#eab308', translationKey: 'collarColors.yellow' },
  { id: 'green', hex: '#22c55e', translationKey: 'collarColors.green' },
  { id: 'turquoise', hex: '#06b6d4', translationKey: 'collarColors.turquoise' },
  { id: 'blue', hex: '#3b82f6', translationKey: 'collarColors.blue' },
  { id: 'purple', hex: '#8b5cf6', translationKey: 'collarColors.purple' },
  { id: 'pink', hex: '#ec4899', translationKey: 'collarColors.pink' },
  { id: 'white', hex: '#f8fafc', translationKey: 'collarColors.white' },
  { id: 'black', hex: '#1e293b', translationKey: 'collarColors.black' },
  { id: 'gray', hex: '#6b7280', translationKey: 'collarColors.gray' },
  { id: 'brown', hex: '#92400e', translationKey: 'collarColors.brown' },
];

// Get hex color from collar ID
export const getCollarHexColor = (collarId: string | null | undefined): string | null => {
  if (!collarId) return null;
  const color = COLLAR_COLORS.find(c => c.id === collarId);
  return color ? color.hex : null;
};
