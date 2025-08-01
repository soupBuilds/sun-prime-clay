import { useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { poSchema } from '../schemas/po'
import type { POInput } from '../schemas/po'
import { fetchPO, createPO } from '../api/po'
import { AuthContext } from '../contexts/Auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { fetchVendors } from '../api/vendor'

export default function POPage() {
  const { token }  = useContext(AuthContext)
  const qc         = useQueryClient()

  /* -------- fetch list -------- */
  const { data: pos = [], isLoading } = useQuery({
  queryKey: ['po'],
  queryFn:  () => fetchPO(token!),
  enabled:  !!token,
  })

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => fetchVendors(token!),
    enabled: !!token,
  })

  /* -------- form -------- */
  const { register, handleSubmit, reset } = useForm<POInput>({
    resolver: zodResolver(poSchema),
    defaultValues:{ material:'HCL', status:'OPEN' } as POInput,
  })

const mutation = useMutation({
  mutationFn: (body: POInput) => createPO(token!, body),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['po'] }) // v5: object form here too
    reset()
  },
})


  const onSubmit = (data:POInput)=> mutation.mutate(data)

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Purchase Orders</h1>

      {/* ---- List ---- */}
      {isLoading ? 'Loading…' :
        <table className="w-full mb-8">
          <thead><tr className="text-left">
            <th>ID</th><th>Vendor</th><th>Material</th><th>Qty (kg)</th><th>Expected</th>
          </tr></thead>
          <tbody>
            {pos.map((p:any)=>(
              <tr key={p.id} className="border-t">
                <td>{p.id}</td>
                <td>{p.vendor.name}</td>
                <td>{p.material}</td>
                <td>{p.quantityKg}</td>
                <td>{format(new Date(p.expectedDate),'yyyy-MM-dd')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }

      {/* ---- Create form ---- */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        <select {...register('vendorId',{ valueAsNumber:true })} className="border p-2">
          {vendors.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
        ))}
        </select>
        <select {...register('material')} className="border p-2">
          <option value="HCL">HCL</option>
          <option value="BENTONITE">Bentonite</option>
        </select>
        <input {...register('quantityKg',{ valueAsNumber:true })} placeholder="Quantity (kg)" className="border p-2"/>
        <input {...register('unitPriceUSD',{ valueAsNumber:true })} placeholder="Unit Price USD" className="border p-2"/>
        <input {...register('expectedDate')} type="date" className="border p-2 col-span-2"/>
        <button className="bg-blue-700 text-white p-2 col-span-2" disabled={mutation.isLoading}>Create PO</button>
      </form>
    </div>
  )
}
