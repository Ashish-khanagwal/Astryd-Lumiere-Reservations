/**
 * Lets the API layer ask the mock backend (MSW) to reconnect this tab after a network-level failure, without
 * the services importing mock code. Unset outside mock mode, so real-backend failures are never retried here.
 */
let recover: (() => Promise<void>) | null = null;

export function setMockRecovery(fn: () => Promise<void>) {
  recover = fn;
}

/** Fetch, and if it fails at the network level in mock mode, reconnect the mock worker and try once more. */
export async function fetchWithMockRecovery(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (!recover) throw error;
    await recover();
    return fetch(input, init);
  }
}
