export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  attempts = 5
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchFn();
    } catch (error: any) {
      if (i === attempts - 1) {
        // Last attempt, re-throw the error
        throw error;
      }
      // Exponential backoff: 1s, 2s, 4s, 8s
      const delay = Math.pow(2, i) * 1000;
      console.log(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  // This line should not be reachable, but typescript needs it
  throw new Error("Retry logic failed unexpectedly.");
}
