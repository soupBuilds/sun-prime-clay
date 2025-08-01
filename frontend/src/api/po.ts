import { headers, safeFetch } from './_shared.ts'

export const fetchPO = (token: string) =>
  safeFetch('/api/po', { headers: headers(token) })

export const createPO = (token: string, body: unknown) =>
  safeFetch('/api/po', {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  })


export const updatePO = async (token:string, id:number, body:unknown) => {
  const r = await fetch(`/api/po/${id}`, { method:'PUT', headers: headers(token), body:JSON.stringify(body)})  
  if(!r.ok) throw new Error('HTTP ${r.status')
  return r.json()
}

export const deletePO = async (token:string, id:number) => {
  const r = await fetch(`/api/po/${id}`, { method:'DELETE', headers: headers(token)})
  if(!r.ok) throw new Error('HTTP ${r.status')
  return r.json()  
}
  
