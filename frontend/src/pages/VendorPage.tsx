/*  Vendor management (ADMIN only)
 *  - Lists vendors
 *  - Adds new vendor
 *  - Edits/deletes via dialog
 */

import { useContext, useState }         from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast, { Toaster }               from 'react-hot-toast'
import * as Dialog                      from '@radix-ui/react-dialog'
import { useForm }                      from 'react-hook-form'
import { z }                            from 'zod'
import { zodResolver }                  from '@hookform/resolvers/zod'

import { AuthContext }   from '../contexts/Auth'
import { fetchVendors, type Vendor } from '../api/vendor'
import { headers, safeFetch } from '../api/_shared'

/* ── schema ─────────────────────────────────────────────────────────────── */
const vendorSchema = z.object({
  name:    z.string().min(2),
  contact: z.string().email().optional(),
})
type VendorInput = z.infer<typeof vendorSchema>

/* ── helpers ────────────────────────────────────────────────────────────── */
const createVendor = (token: string, body: VendorInput) =>
  safeFetch<Vendor>('/api/vendor', {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  })

const updateVendor = (token: string, id: number, body: VendorInput) =>
  safeFetch<Vendor>(`/api/vendor/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(body),
  })

const deleteVendor = (token: string, id: number) =>
  safeFetch<void>(`/api/vendor/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  })

/* ── component ─────────────────────────────────────────────────────────── */
export default function VendorPage() {
  const { token } = useContext(AuthContext)
  const qc        = useQueryClient()

  /* list */
  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn : () => fetchVendors(token!),
    enabled : !!token,
  })

  /* mutations */
  const createMutation = useMutation({
    mutationFn: (body: VendorInput) => createVendor(token!, body),
    onSuccess : () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: VendorInput }) =>
      updateVendor(token!, id, body),
    onSuccess : () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteVendor(token!, id),
    onSuccess : () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  })

  /* create form */
  const { register, handleSubmit, reset } = useForm<VendorInput>({
    resolver: zodResolver(vendorSchema),
  })
  const onCreate = (data: VendorInput) =>
    toast.promise(
      createMutation.mutateAsync(data).then(() => reset()),
      { loading: 'Creating…', success: 'Created', error: 'Error' }
    )

  /* edit dialog */
  const [editRow, setEditRow] = useState<Vendor | null>(null)
  const {
    register: regEdit,
    handleSubmit: handleEdit,
    reset: resetEdit,
  } = useForm<VendorInput>({ resolver: zodResolver(vendorSchema) })

  const openEdit = (v: Vendor) => {
    setEditRow(v)
    resetEdit({ name: v.name, contact: v.contact ?? '' })
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Toaster position="bottom-right" />
      <h1 className="mb-6 text-2xl font-bold">Vendors</h1>

      {/* list */}
      <table className="mb-8 w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th>ID</th><th>Name</th><th>Contact</th><th></th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v.id} className="border-b">
              <td>{v.id}</td>
              <td>{v.name}</td>
              <td>{v.contact}</td>
              <td className="flex gap-2 py-1">
                <button
                  onClick={() => openEdit(v)}
                  className="text-blue-600 underline"
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    toast.promise(deleteMutation.mutateAsync(v.id), {
                      loading: 'Deleting…',
                      success: 'Deleted',
                      error: 'Error',
                    })
                  }
                  className="text-red-600 underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* create */}
      <h2 className="mb-2 text-lg font-semibold">Add Vendor</h2>
      <form
        onSubmit={handleSubmit(onCreate)}
        className="mb-10 flex max-w-md flex-col gap-3"
      >
        <input {...register('name')}    placeholder="Name"    className="border p-2" />
        <input {...register('contact')} placeholder="Contact" className="border p-2" />
        <button
          disabled={createMutation.isLoading}
          className="bg-blue-700 p-2 text-white"
        >
          Create
        </button>
      </form>

      {/* edit dialog */}
      <Dialog.Root open={!!editRow} onOpenChange={() => setEditRow(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-80 -translate-x-1/2 -translate-y-1/2 rounded bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">
              Edit Vendor #{editRow?.id}
            </h2>

            <form
              onSubmit={handleEdit((data) =>
                toast
                  .promise(
                    updateMutation.mutateAsync({ id: editRow!.id, body: data }),
                    { loading: 'Saving…', success: 'Saved', error: 'Error' }
                  )
                  .then(() => setEditRow(null))
              )}
              className="flex flex-col gap-3"
            >
              <input {...regEdit('name')}    className="border p-2" />
              <input {...regEdit('contact')} className="border p-2" />
              <button className="bg-blue-700 p-2 text-white">Save</button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
