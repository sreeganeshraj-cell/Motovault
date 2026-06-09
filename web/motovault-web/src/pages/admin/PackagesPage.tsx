import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  IconPackage, IconPlus, IconEdit, IconCircleMinus, IconCircleCheck,
} from '@tabler/icons-react'
import Modal from '../../components/Modal'
import { packagesApi } from '../../api/packages'
import type { PackageResponse } from '../../types'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().positive('Must be positive').or(z.nan().transform(() => undefined)).optional(),
})

type FormData = z.infer<typeof schema>

function FieldInput({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const inputCls = (err?: string) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
    err ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20'
  }`

export default function PackagesPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PackageResponse | null>(null)

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: packagesApi.getAll,
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['packages'] })

  const createMut  = useMutation({ mutationFn: packagesApi.create,      onSuccess: () => { invalidate(); closeModal() } })
  const updateMut  = useMutation({ mutationFn: ({ id, data }: { id: string; data: FormData }) => packagesApi.update(id, data), onSuccess: () => { invalidate(); closeModal() } })
  const retireMut  = useMutation({ mutationFn: packagesApi.retire,      onSuccess: invalidate })
  const reactMut   = useMutation({ mutationFn: packagesApi.reactivate,  onSuccess: invalidate })

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', description: '', price: undefined })
    setModalOpen(true)
  }

  const openEdit = (pkg: PackageResponse) => {
    setEditing(pkg)
    reset({ name: pkg.name, description: pkg.description ?? '', price: pkg.price ?? undefined })
    setModalOpen(true)
  }

  const closeModal = () => { setModalOpen(false); setEditing(null); reset() }

  const onSubmit = (data: FormData) => {
    if (editing) updateMut.mutate({ id: editing.id, data })
    else createMut.mutate(data)
  }

  const active   = packages.filter((p) => p.isActive).length
  const inactive = packages.filter((p) => !p.isActive).length

  return (
    <div className="flex flex-col gap-5 p-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#0D1B3E' }}>Packages</h2>
          <p className="text-xs mt-0.5" style={{ color: '#8A97B0' }}>
            {active} active · {inactive} inactive
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: '#4A90D9' }}
        >
          <IconPlus size={15} />
          New Package
        </button>
      </div>

      {/* Table card */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}>
        {/* Column headers */}
        <div
          className="grid px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ gridTemplateColumns: '2fr 3fr 1.2fr 0.9fr 1.1fr', color: '#8A97B0', background: '#F7F9FC', borderBottom: '0.5px solid #EEF1F8' }}
        >
          <span>Name</span>
          <span>Description</span>
          <span>Monthly price</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-9 rounded-lg animate-pulse" style={{ background: '#E8EDF5' }} />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#F0F3F9' }}>
              <IconPackage size={24} style={{ color: '#B0BCCF' }} />
            </div>
            <p className="text-sm" style={{ color: '#8A97B0' }}>No packages yet. Create your first one.</p>
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg.id}
              className="grid items-center px-5 py-3.5 border-b last:border-b-0 transition-colors hover:bg-[#F7F9FC]"
              style={{
                gridTemplateColumns: '2fr 3fr 1.2fr 0.9fr 1.1fr',
                borderColor: '#F4F6FB',
                opacity: pkg.isActive ? 1 : 0.55,
              }}
            >
              {/* Name */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: pkg.isActive ? '#E6F1FB' : '#F0F3F9' }}>
                  <IconPackage size={15} style={{ color: pkg.isActive ? '#185FA5' : '#9AAABB' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: '#0D1B3E' }}>{pkg.name}</span>
              </div>

              {/* Description */}
              <span className="text-xs pr-6 line-clamp-1" style={{ color: '#8A97B0' }}>
                {pkg.description ?? '—'}
              </span>

              {/* Price */}
              <span className="text-sm font-semibold" style={{ color: '#0D1B3E' }}>
                {pkg.price != null ? `₹${pkg.price.toLocaleString('en-IN')}` : '—'}
              </span>

              {/* Status */}
              <span
                className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full w-fit"
                style={pkg.isActive
                  ? { background: '#EAF3DE', color: '#3B6D11' }
                  : { background: '#F0F3F9', color: '#8A97B0' }}
              >
                {pkg.isActive ? 'Active' : 'Inactive'}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(pkg)}
                  title="Edit"
                  className="p-1.5 rounded-lg hover:bg-blue-50 transition"
                >
                  <IconEdit size={15} style={{ color: '#4A90D9' }} />
                </button>
                {pkg.isActive ? (
                  <button
                    onClick={() => retireMut.mutate(pkg.id)}
                    title="Deactivate"
                    disabled={retireMut.isPending}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                  >
                    <IconCircleMinus size={15} style={{ color: '#A32D2D' }} />
                  </button>
                ) : (
                  <button
                    onClick={() => reactMut.mutate(pkg.id)}
                    title="Reactivate"
                    disabled={reactMut.isPending}
                    className="p-1.5 rounded-lg hover:bg-green-50 transition disabled:opacity-50"
                  >
                    <IconCircleCheck size={15} style={{ color: '#3B6D11' }} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Package' : 'New Package'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4" noValidate>
          <FieldInput label="Package name" required error={errors.name?.message}>
            <input
              type="text"
              placeholder="e.g. Premium Care"
              {...register('name')}
              className={inputCls(errors.name?.message)}
            />
          </FieldInput>

          <FieldInput label="Description" error={errors.description?.message}>
            <textarea
              rows={3}
              placeholder="What's included in this package…"
              {...register('description')}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none resize-none transition focus:ring-2 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20"
            />
          </FieldInput>

          <FieldInput label="Monthly price (₹)" error={errors.price?.message}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="0"
                {...register('price', { valueAsNumber: true })}
                className={`${inputCls(errors.price?.message)} pl-7`}
              />
            </div>
          </FieldInput>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-lg py-2.5 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createMut.isPending || updateMut.isPending}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#4A90D9' }}
            >
              {isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Create package'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
