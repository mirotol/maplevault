/**
 * Utility to ensure an asynchronous operation takes at least a minimum amount of time.
 * This helps prevent "flashes" of loading states when data is fetched very quickly.
 *
 * @param promise The original promise to wait for.
 * @param minimumDelay The minimum time in milliseconds to wait.
 */
export async function withMinimumDelay<T>(
  promise: Promise<T>,
  minimumDelay = 0,
): Promise<T> {
  if (minimumDelay <= 0) return promise;
  const delay = new Promise((resolve) => setTimeout(resolve, minimumDelay));
  const [result] = await Promise.all([promise, delay]);
  return result;
}
