/**
 * Formatera heat interval i olika format
 * @param days - Antal dagar
 * @param format - 'short' (210 dagar), 'compact' (~7 mån), 'long' (~7 månader (210 dagar))
 * @param locale - 'sv' eller 'en'
 */
export const formatHeatInterval = (
  days: number, 
  format: 'short' | 'compact' | 'long',
  locale: 'sv' | 'en' = 'sv'
): string => {
  const months = Math.round(days / 30);
  
  if (format === 'short') {
    return locale === 'sv' ? `${days} dagar` : `${days} days`;
  }
  
  const monthLabel = locale === 'sv' ? 'mån' : 'mo';
  const monthsLabel = locale === 'sv' ? 'månader' : 'months';
  
  if (format === 'compact') {
    return `~${months} ${monthLabel}`;
  }
  
  // format === 'long'
  return locale === 'sv' 
    ? `~${months} ${monthsLabel} (${days} dagar)`
    : `~${months} ${months === 1 ? 'month' : 'months'} (${days} days)`;
};
