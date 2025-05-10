
/**
 * Generate a unique ID for uploads and other operations
 * @returns A unique string ID
 */
export function generateUniqueId(): string {
  const timestamp = new Date().getTime().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`;
}
