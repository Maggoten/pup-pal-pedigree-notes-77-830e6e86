
/**
 * Utility to retry a fetch operation with exponential backoff
 * 
 * @param fetchFn The function to execute that returns a Promise
 * @param options Configuration options for the retry behavior
 * @returns The result of the fetchFn if successful
 */
export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    backoffFactor?: number;
    onRetry?: (attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 500,
    backoffFactor = 1.5,
    onRetry = () => {}
  } = options;

  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      console.error(`Fetch attempt ${attempt + 1}/${maxRetries} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        // Calculate backoff delay with exponential increase
        const delay = initialDelay * Math.pow(backoffFactor, attempt);
        console.log(`Retrying in ${delay}ms...`);
        
        // Notify about retry
        onRetry(attempt + 1);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}
