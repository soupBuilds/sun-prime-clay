import { headers, safeFetch } from './_shared.ts'

export const fetchVendors = (token: string) =>
  safeFetch('/api/vendor', { headers: headers(token) })
