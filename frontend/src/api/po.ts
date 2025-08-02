import { headers, safeFetch } from './_shared'

export type Material = 'HCL' | 'BENTONITE'

export interface PO {
  id:           number
  vendorId:     number
  vendor:       { id: number; name: string }   // we include vendor for UI
  material:     Material
  quantityKg:   number
  unitPriceUSD: number
  expectedDate: string        // ISO string
  status:       'OPEN' | 'CANCELLED' | 'RECEIVED'
  createdAt:    string
}

/* ──────────────────────────────────────────────────────────────── *
 *   GET  /api/po                                                  *
 * ──────────────────────────────────────────────────────────────── */
export const fetchPO = (token: string) =>
  safeFetch<PO[]>('/api/po', { headers: headers(token) })

/* ──────────────────────────────────────────────────────────────── *
 *   POST /api/po  — Create                                         *
 * ──────────────────────────────────────────────────────────────── */
export interface POInput {
  vendorId:     number
  material:     Material
  quantityKg:   number
  unitPriceUSD: number
  expectedDate: string      // 'YYYY-MM-DD' from the form
  status?:      'OPEN'      // auto-defaulted in DB; optional here
}

export const createPO = (token: string, body: POInput) =>
  safeFetch<PO>('/api/po', {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  })

/* ──────────────────────────────────────────────────────────────── *
 *   PUT /api/po/:id  — Update                                      *
 * ──────────────────────────────────────────────────────────────── */
export const updatePO = (token: string, id: number, body: Partial<POInput>) =>
  safeFetch<PO>(`/api/po/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(body),
  })

/* ──────────────────────────────────────────────────────────────── *
 *   DELETE /api/po/:id  — Cancel                                   *
 * ──────────────────────────────────────────────────────────────── */
export const deletePO = (token: string, id: number) =>
  safeFetch<void>(`/api/po/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  })
