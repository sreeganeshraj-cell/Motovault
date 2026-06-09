import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IconBuildingWarehouse, IconPlus, IconMotorbike, IconCar, IconCircleCheck, IconCircleMinus } from '@tabler/icons-react'
import Modal from '../../components/Modal'
import { slotsApi } from '../../api/slots'
import type { StorageSlotResponse, VehicleType } from '../../types'

const schema = z.object({
  slotNumber: z.number({ message: 'Enter a slot number' }).int().positive('Must be positive'),
  type: z.enum(['Bike', 'Car']),
})

type FormData = z.infer<typeof schema>

const slotLabel = (type: VehicleType, num: number) =>
  `${type === 'Bike' ? 'B' : 'C'}-${String(num).padStart(2, '0')}`

function SlotCard({
  slot,
  onToggle,
  toggling,
}: {
  slot: StorageSlotResponse
  onToggle: () => void
  toggling: boolean
}) {
  const available = slot.status === 'Available'
  const label = slotLabel(slot.type, slot.slotNumber)

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-xl p-4 transition-all"
      style={{
        border: `1.5px solid ${available ? '#C3DCAD' : '#D0D8EA'}`,
        background: available ? '#F4FBF0' : '#F7F9FC',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: available ? '#E3F4D9' : '#EEF1F8' }}
      >
        {slot.type === 'Bike' ? (
          <IconMotorbike size={20} style={{ color: available ? '#3B6D11' : '#8A97B0' }} />
        ) : (
          <IconCar size={20} style={{ color: available ? '#3B6D11' : '#8A97B0' }} />
        )}
      </div>

      <span className="text-sm font-bold" style={{ color: '#0D1B3E' }}>{label}</span>

      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={available
          ? { background: '#EAF3DE', color: '#3B6D11' }
          : { background: '#F0F3F9', color: '#8A97B0' }}
      >
        {slot.status}
      </span>

      <button
        onClick={onToggle}
        disabled={toggling}
        title={available ? 'Mark Occupied' : 'Mark Available'}
        className="mt-1 p-1.5 rounded-lg transition disabled:opacity-50"
        style={{ background: available ? '#FEF0F0' : '#F0FAF0' }}
      >
        {available ? (
          <IconCircleMinus size={15} style={{ color: '#A32D2D' }} />
        ) : (
          <IconCircleCheck size={15} style={{ color: '#3B6D11' }} />
        )}
      </button>
    </div>
  )
}

export default function SlotsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['slots'],
    queryFn: slotsApi.getAll,
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'Bike' },
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['slots'] })

  const createMut = useMutation({
    mutationFn: slotsApi.create,
    onSuccess: () => { invalidate(); setModalOpen(false); reset() },
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Available' | 'Occupied' }) =>
      slotsApi.updateStatus(id, { status }),
    onSuccess: () => { invalidate(); setTogglingId(null) },
    onError: () => setTogglingId(null),
  })

  const handleToggle = (slot: StorageSlotResponse) => {
    setTogglingId(slot.id)
    statusMut.mutate({
      id: slot.id,
      status: slot.status === 'Available' ? 'Occupied' : 'Available',
    })
  }

  const onSubmit = (data: FormData) => createMut.mutate(data)

  const bikes = slots.filter((s) => s.type === 'Bike').sort((a, b) => a.slotNumber - b.slotNumber)
  const cars  = slots.filter((s) => s.type === 'Car').sort((a, b) => a.slotNumber - b.slotNumber)
  const bikeAvail = bikes.filter((s) => s.status === 'Available').length
  const carAvail  = cars.filter((s) => s.status === 'Available').length

  return (
    <div className="flex flex-col gap-5 p-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#0D1B3E' }}>Storage Bays</h2>
          <p className="text-xs mt-0.5" style={{ color: '#8A97B0' }}>
            {bikes.length} bike slots ({bikeAvail} free) · {cars.length} car slots ({carAvail} free)
          </p>
        </div>
        <button
          onClick={() => { reset({ type: 'Bike' }); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: '#4A90D9' }}
        >
          <IconPlus size={15} />
          Add Slot
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
          {[...Array(15)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl animate-pulse" style={{ background: '#E8EDF5' }} />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 rounded-xl" style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#F0F3F9' }}>
            <IconBuildingWarehouse size={24} style={{ color: '#B0BCCF' }} />
          </div>
          <p className="text-sm" style={{ color: '#8A97B0' }}>No slots yet. Add your first bay.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {bikes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <IconMotorbike size={16} style={{ color: '#4A90D9' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A90D9' }}>
                  Motorcycle Bays
                </span>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
                {bikes.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    onToggle={() => handleToggle(slot)}
                    toggling={togglingId === slot.id}
                  />
                ))}
              </div>
            </section>
          )}

          {cars.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <IconCar size={16} style={{ color: '#4A90D9' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4A90D9' }}>
                  Car Bays
                </span>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
                {cars.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    onToggle={() => handleToggle(slot)}
                    toggling={togglingId === slot.id}
                  />
                ))}
              </div>
            </section>
          )}

        </div>
      )}

      {/* Add Slot modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="Add Storage Slot">
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4" noValidate>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle type <span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Bike', 'Car'] as const).map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition has-[:checked]:border-[#4A90D9] has-[:checked]:bg-[#EAF3FB]"
                  style={{ borderColor: '#D1D9E8' }}
                >
                  <input type="radio" value={t} {...register('type')} className="accent-[#4A90D9]" />
                  {t === 'Bike'
                    ? <IconMotorbike size={16} style={{ color: '#4A90D9' }} />
                    : <IconCar size={16} style={{ color: '#4A90D9' }} />}
                  <span className="text-sm font-medium" style={{ color: '#0D1B3E' }}>{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slot number <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 11"
              {...register('slotNumber', { valueAsNumber: true })}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
                errors.slotNumber
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-gray-300 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20'
              }`}
            />
            {errors.slotNumber && <p className="mt-1 text-xs text-red-600">{errors.slotNumber.message}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => { setModalOpen(false); reset() }}
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
              {isSubmitting || createMut.isPending ? 'Adding…' : 'Add slot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
