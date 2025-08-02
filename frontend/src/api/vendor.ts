import { headers, safeFetch } from './_shared'

export interface Vendor {
  id: number
  name: string
  contact: string | null
}

/**
 * GET /api/vendor — returns array of vendors.
 *
 * @param token  The current user's JWT access token.
 */
export const fetchVendors = (token: string) =>
  safeFetch<Vendor[]>('/api/vendor', { headers: headers(token) })
