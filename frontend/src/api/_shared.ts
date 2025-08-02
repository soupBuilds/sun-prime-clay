/**
 * Build standard headers for JSON requests.
 * Adds Authorization automatically when a token is provided.
 */
export const headers = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

/**
 * Wrapper around fetch that:
 * 1. Throws on non-2xx status
 * 2. Parses JSON
 * 3. Returns the parsed payload with proper typing
 */
export async function safeFetch<T = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
    if (res.status === 204 || res.status === 205) return undefined as T
    return res.json() as Promise<T>
}
