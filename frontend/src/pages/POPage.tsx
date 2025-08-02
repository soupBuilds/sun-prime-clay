import { useState, useContext } from 'react'
import { format } from 'date-fns'
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'
import * as Dialog from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// local modules
import { AuthContext } from '../contexts/Auth'
import {
  fetchVendors,
  type Vendor,
} from '../api/vendor'
import {
  fetchPO,
  createPO,
  updatePO,
  deletePO,
  type PO,
} from '../api/po'
import {
  poSchema,
  type POInput,          // single source-of-truth for the form
} from '../schemas/po'

/*  ──────────────────────────────────────────────────────────────────────────
    Component
    ────────────────────────────────────────────────────────────────────────── */
export default function POPage() {
  /* —————————————————————————————————— hooks ————————————————————————————————— */
  const { token } = useContext(AuthContext)
  const qc        = useQueryClient()

  /* ── vendors for dropdown ─────────────────────────────────────────────── */
  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn : () => fetchVendors(token!),
    enabled : !!token,
  })

  /* ── purchase orders list ─────────────────────────────────────────────── */
  const { data: pos = [], isLoading } = useQuery({
    queryKey: ['po'],
    queryFn : () => fetchPO(token!),
    enabled : !!token,
  }) 

  /* ── mutations (create / update / delete) ─────────────────────────────── */
  const createMutation = useMutation({
    mutationFn : (body: POInput) => createPO(token!, body),
    onSuccess  : () => qc.invalidateQueries({ queryKey: ['po'] }),
  })

  const updateMutation = useMutation({
    mutationFn : (args: { id: number; body: Partial<POInput> }) =>
      updatePO(token!, args.id, args.body),
    onSuccess  : () => qc.invalidateQueries({ queryKey: ['po'] }),
  })

  const deleteMutation = useMutation({
    mutationFn : (id: number) => deletePO(token!, id),
    onSuccess  : () => qc.invalidateQueries({ queryKey: ['po'] }),
  })

  /* ── react-hook-form: create ──────────────────────────────────────────── */
  const {
    register,
    handleSubmit,
    reset,
  } = useForm<POInput>({
    resolver: zodResolver(poSchema),
    defaultValues: { material: 'HCL', status: 'OPEN' } as POInput,
  })

  const onCreate = (data: POInput) =>
    toast.promise(
      createMutation.mutateAsync(data).then(() => reset()),
      { loading: 'Creating…', success: 'Created', error: 'Error' }
    )

  /* ── react-hook-form: edit dialog ─────────────────────────────────────── */
  const [editRow, setEditRow] = useState<PO | null>(null)

  const {
    register: regEdit,
    handleSubmit: handleEdit,
    reset: resetEdit,
  } = useForm<POInput>({ resolver: zodResolver(poSchema) })

  const openEdit = (po: PO) => {
    setEditRow(po)
    resetEdit({
      ...po,
      expectedDate: po.expectedDate.slice(0, 10), // ISO → yyyy-mm-dd
    })
  }

  /* ———————————————————————— render ———————————————————————————————— */
  return (
    <div className="mx-auto max-w-5xl p-6">
      <Toaster position="bottom-right" />
      <h1 className="mb-6 text-2xl font-bold">Purchase Orders</h1>

      {/* table */}
      {isLoading ? (
        'Loading…'
      ) : (
        <table className="mb-8 w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th>ID</th>
              <th>Vendor</th>
              <th>Material</th>
              <th>Qty (kg)</th>
              <th>Expected</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pos.map((po) => (
              <tr key={po.id} className="border-b">
                <td>{po.id}</td>
                <td>{po.vendor?.name}</td>
                <td>{po.material}</td>
                <td>{po.quantityKg}</td>
                <td>{format(new Date(po.expectedDate), 'yyyy-MM-dd')}</td>
                <td className="flex gap-2 py-1">
                  <button
                    onClick={() => openEdit(po)}
                    className="text-blue-600 underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      toast.promise(deleteMutation.mutateAsync(po.id), {
                        loading: 'Cancelling…',
                        success: 'Cancelled',
                        error  : 'Error',
                      })
                    }
                    className="text-red-600 underline"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* create form */}
      <h2 className="mb-2 text-lg font-semibold">New Purchase Order</h2>
      <form
        onSubmit={handleSubmit(onCreate)}
        className="grid max-w-lg grid-cols-2 gap-4"
      >
        <select
          {...register('vendorId', { valueAsNumber: true })}
          className="border p-2"
        >
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        <select {...register('material')} className="border p-2">
          <option value="HCL">HCL</option>
          <option value="BENTONITE">Bentonite</option>
        </select>

        <input
          {...register('quantityKg', { valueAsNumber: true })}
          className="border p-2"
          placeholder="Quantity (kg)"
        />

        <input
          {...register('unitPriceUSD', { valueAsNumber: true })}
          className="border p-2"
          placeholder="Unit Price USD"
        />

        <input
          {...register('expectedDate')}
          type="date"
          className="col-span-2 border p-2"
        />

        <button
          disabled={createMutation.isLoading}
          className="col-span-2 bg-blue-700 p-2 text-white"
        >
          Create
        </button>
      </form>

      {/* edit dialog */}
      <Dialog.Root open={!!editRow} onOpenChange={() => setEditRow(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 rounded bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">
              Edit&nbsp;PO&nbsp;#{editRow?.id}
            </h2>

            <form
              onSubmit={handleEdit((data) =>
                toast
                  .promise(
                    updateMutation.mutateAsync({
                      id: editRow!.id,
                      body: data,
                    }),
                    { loading: 'Saving…', success: 'Saved', error: 'Error' }
                  )
                  .then(() => setEditRow(null))
              )}
              className="flex flex-col gap-4"
            >
              <select
                {...regEdit('vendorId', { valueAsNumber: true })}
                className="border p-2"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>

              <input
                {...regEdit('quantityKg', { valueAsNumber: true })}
                className="border p-2"
              />

              <input
                {...regEdit('unitPriceUSD', { valueAsNumber: true })}
                className="border p-2"
              />

              <input
                {...regEdit('expectedDate')}
                type="date"
                className="border p-2"
              />

              <button className="bg-blue-700 p-2 text-white">Save</button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
