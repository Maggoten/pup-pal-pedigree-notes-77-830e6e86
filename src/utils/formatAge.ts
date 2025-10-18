/**
 * Formats age to nearest 0.5 increment
 * Examples: 2.3 -> "2", 2.6 -> "2.5", 3.0 -> "3"
 */
export const formatAge = (age: number): string => {
  // Round DOWN to nearest 0.5 (floor instead of round)
  const roundedAge = Math.floor(age * 2) / 2;
  
  // If it's a whole number, show without decimals
  // Otherwise show with one decimal
  return roundedAge % 1 === 0 
    ? roundedAge.toFixed(0) 
    : roundedAge.toFixed(1);
};
