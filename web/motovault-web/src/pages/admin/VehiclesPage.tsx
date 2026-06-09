import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IconCar, IconMotorbike, IconPlus, IconTrash, IconCheck, IconX } from '@tabler/icons-react'
import Modal from '../../components/Modal'
import { vehiclesApi } from '../../api/vehicles'
import { usersApi } from '../../api/users'
import type { VehicleType } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'All' | VehicleType

const tabs: Tab[] = ['All', 'Car', 'Bike']

const schema = z.object({
  ownerId:            z.string().min(1, 'Select an owner'),
  type:               z.enum(['Car', 'Bike']),
  brand:              z.string().optional(),
  model:              z.string().optional(),
  registrationNumber: z.string().optional(),
})

type FormData = z.infer<typeof schema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VehicleIcon = ({ type, size = 15 }: { type: VehicleType; size?: number }) =>
  type === 'Car' ? <IconCar size={size} /> : <IconMotorbike size={size} />

const typeStyle = (type: VehicleType): React.CSSProperties =>
  type === 'Car'
    ? { background: '#EAF3FB', color: '#185FA5' }
    : { background: '#FFF0D9', color: '#B45309' }

const avatarStyle = (type: VehicleType): React.CSSProperties =>
  type === 'Car'
    ? { background: '#DDF0FB', color: '#185FA5' }
    : { background: '#FFF0D9', color: '#B45309' }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const inputCls = (err?: string) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
    err ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20'
  }`

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VehiclesPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll,
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
    enabled: modalOpen,
  })

  const owners = users.filter((u) => u.role === 'Owner')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'Car' },
  })

  const createMut = useMutation({
    mutationFn: vehiclesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      setModalOpen(false)
      reset()
    },
  })

  const deleteMut = useMutation({
    mutationFn: vehiclesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      setConfirmDelete(null)
    },
  })

  const onSubmit = (data: FormData) => createMut.mutate(data)
  const closeModal = () => { setModalOpen(false); reset() }

  const filtered = activeTab === 'All' ? vehicles : vehicles.filter((v) => v.type === activeTab)

  const counts = {
    All:  vehicles.length,
    Car:  vehicles.filter((v) => v.type === 'Car').length,
    Bike: vehicles.filter((v) => v.type === 'Bike').length,
  }

  return (
    <div className="flex flex-col gap-5 p-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#0D1B3E' }}>Vehicles</h2>
          <p className="text-xs mt-0.5" style={{ color: '#8A97B0' }}>
            {counts.Car} cars · {counts.Bike} bikes in storage
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: '#4A90D9' }}
        >
          <IconPlus size={15} />
          Register Vehicle
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#F0F3F9' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
            style={activeTab === tab
              ? { background: '#fff', color: '#0D1B3E', boxShadow: '0 1px 3px rgba(0,0,0,0.10)' }
              : { color: '#8A97B0' }}
          >
            {tab}
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={activeTab === tab
                ? { background: '#EAF3FB', color: '#4A90D9' }
                : { background: '#E8EDF5', color: '#A0AABB' }}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}>
        <div
          className="grid px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ gridTemplateColumns: '2.5fr 1.5fr 1.5fr 0.7fr 1fr 40px', color: '#8A97B0', background: '#F7F9FC', borderBottom: '0.5px solid #EEF1F8' }}
        >
          <span>Vehicle</span>
          <span>Owner</span>
          <span>Reg. Number</span>
          <span>Type</span>
          <span>Registered</span>
          <span />
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-9 rounded-lg animate-pulse" style={{ background: '#E8EDF5' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#F0F3F9' }}>
              <IconCar size={24} style={{ color: '#B0BCCF' }} />
            </div>
            <p className="text-sm" style={{ color: '#8A97B0' }}>
              No {activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}vehicles found.
            </p>
          </div>
        ) : (
          filtered.map((v) => (
            <div
              key={v.id}
              className="group grid items-center px-5 py-3 border-b last:border-b-0 transition-colors hover:bg-[#F7F9FC]"
              style={{ gridTemplateColumns: '2.5fr 1.5fr 1.5fr 0.7fr 1fr 40px', borderColor: '#F4F6FB' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={avatarStyle(v.type)}
                >
                  <VehicleIcon type={v.type} size={15} />
                </div>
                <span className="text-sm font-medium" style={{ color: '#0D1B3E' }}>
                  {[v.brand, v.model].filter(Boolean).join(' ') || <span style={{ color: '#B0BCCF' }}>Unknown</span>}
                </span>
              </div>
              <span className="text-xs" style={{ color: '#8A97B0' }}>{v.ownerName}</span>
              <span className="text-xs font-mono tracking-wide" style={{ color: '#0D1B3E' }}>
                {v.registrationNumber ?? <span style={{ color: '#B0BCCF' }}>—</span>}
              </span>
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit"
                style={typeStyle(v.type)}
              >
                <VehicleIcon type={v.type} size={10} />
                {v.type}
              </span>
              <span className="text-xs" style={{ color: '#8A97B0' }}>{formatDate(v.createdAt)}</span>

              {/* Delete / confirm */}
              <div className="flex items-center justify-end">
                {confirmDelete === v.id ? (
                  <div className="flex items-center gap-1" title={deleteMut.isError ? 'Cannot delete: active subscription exists' : undefined}>
                    <button
                      onClick={() => deleteMut.mutate(v.id)}
                      disabled={deleteMut.isPending}
                      className="w-6 h-6 rounded flex items-center justify-center transition hover:bg-red-100"
                      style={{ color: deleteMut.isError ? '#aaa' : '#E03131' }}
                      title={deleteMut.isError ? 'Active subscription — cannot delete' : 'Confirm delete'}
                    >
                      <IconCheck size={13} />
                    </button>
                    <button
                      onClick={() => { setConfirmDelete(null); deleteMut.reset() }}
                      className="w-6 h-6 rounded flex items-center justify-center transition hover:bg-gray-100"
                      style={{ color: '#8A97B0' }}
                      title="Cancel"
                    >
                      <IconX size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(v.id)}
                    className="w-7 h-7 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                    style={{ color: '#C9323A' }}
                    title="Delete vehicle"
                  >
                    <IconTrash size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Register Vehicle Modal */}
      <Modal open={modalOpen} onClose={closeModal} title="Register Vehicle">
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4" noValidate>

          {/* Type picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Car', 'Bike'] as const).map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition has-[:checked]:border-[#4A90D9] has-[:checked]:bg-[#EAF3FB]"
                  style={{ borderColor: '#D1D9E8' }}
                >
                  <input type="radio" value={t} {...register('type')} className="accent-[#4A90D9]" />
                  {t === 'Car'
                    ? <IconCar size={15} style={{ color: '#185FA5' }} />
                    : <IconMotorbike size={15} style={{ color: '#B45309' }} />}
                  <span className="text-sm font-medium" style={{ color: '#0D1B3E' }}>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Owner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner <span className="text-red-400 ml-0.5">*</span>
            </label>
            <select {...register('ownerId')} className={inputCls(errors.ownerId?.message)} defaultValue="">
              <option value="" disabled>Select an owner</option>
              {owners.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            {errors.ownerId && <p className="mt-1 text-xs text-red-600">{errors.ownerId.message}</p>}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input type="text" placeholder="e.g. Royal Enfield" {...register('brand')} className={inputCls()} />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input type="text" placeholder="e.g. Classic 350" {...register('model')} className={inputCls()} />
          </div>

          {/* Registration Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
            <input
              type="text"
              placeholder="e.g. KL01AB1234"
              {...register('registrationNumber')}
              onInput={(e) => { e.currentTarget.value = e.currentTarget.value.toUpperCase() }}
              className={inputCls()}
            />
          </div>

          {createMut.isError && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              Failed to register vehicle. Please try again.
            </p>
          )}

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
              disabled={isSubmitting || createMut.isPending}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#4A90D9' }}
            >
              {isSubmitting || createMut.isPending ? 'Registering…' : 'Register'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
