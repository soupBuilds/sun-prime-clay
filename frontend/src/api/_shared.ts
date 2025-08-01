/**
 * Returns the standard headers for authenticated JSON requests.
 * If `token` is undefined (e.g. public endpoints), Authorization is omitted.
 */
export const headers = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

/**
 * Generic helper that throws on HTTP errors and parses JSON.
 * Usage: const data = await safeFetch('/api/foo', { headers: headers(token) })
 */
export async function safeFetch<T = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}
