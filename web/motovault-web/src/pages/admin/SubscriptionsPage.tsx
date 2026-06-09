import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  IconReceipt2, IconPlus, IconMotorbike, IconCar, IconUser,
  IconCircleCheck, IconCircleX, IconClockHour4,
} from '@tabler/icons-react'
import OnboardModal from '../../components/OnboardModal'
import { subscriptionsApi } from '../../api/subscriptions'
import type { SubscriptionResponse, VehicleType } from '../../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const slotLabel = (type: VehicleType, num: number) =>
  `${type === 'Bike' ? 'B' : 'C'}-${String(num).padStart(2, '0')}`

function formatDate(d: string | undefined | null) {
  if (!d) return '—'
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const statusStyle = (s: string): React.CSSProperties => {
  if (s === 'Active')    return { background: '#EAF3DE', color: '#3B6D11' }
  if (s === 'Completed') return { background: '#EAF3FB', color: '#185FA5' }
  if (s === 'Requested') return { background: '#FEF3C7', color: '#92400E' }
  return                        { background: '#FEF0F0', color: '#A32D2D' }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionsApi.getAll,
  })

  const approveMut = useMutation({
    mutationFn: ({ id }: { id: string }) => subscriptionsApi.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      qc.invalidateQueries({ queryKey: ['subscriptions', 'pending'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })

  const cancelMut = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      subscriptionsApi.cancel(id, new Date().toISOString().slice(0, 10)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  })

  const completeMut = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      subscriptionsApi.complete(id, new Date().toISOString().slice(0, 10)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
  })

  // Sort: Requested first, then Active, then rest
  const sorted = [...subscriptions].sort((a, b) => {
    const order: Record<string, number> = { Requested: 0, Active: 1, Completed: 2, Cancelled: 3 }
    return (order[a.status] ?? 9) - (order[b.status] ?? 9)
  })

  const active    = subscriptions.filter((s) => s.status === 'Active').length
  const pending   = subscriptions.filter((s) => s.status === 'Requested').length
  const completed = subscriptions.filter((s) => s.status === 'Completed').length
  const cancelled = subscriptions.filter((s) => s.status === 'Cancelled').length

  return (
    <div className="flex flex-col gap-5 p-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#0D1B3E' }}>Subscriptions</h2>
          <p className="text-xs mt-0.5" style={{ color: '#8A97B0' }}>
            {pending > 0 && (
              <span style={{ color: '#B45309', fontWeight: 600 }}>
                {pending} pending approval ·{' '}
              </span>
            )}
            {active} active · {completed} completed · {cancelled} cancelled
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: '#4A90D9' }}
        >
          <IconPlus size={15} />
          Walk-in Onboard
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}>
        <div
          className="grid px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ gridTemplateColumns: '2fr 1.8fr 1.5fr 0.9fr 1fr 1fr 0.9fr 1.4fr', color: '#8A97B0', background: '#F7F9FC', borderBottom: '0.5px solid #EEF1F8' }}
        >
          <span>Vehicle</span>
          <span>Owner</span>
          <span>Package</span>
          <span>Slot</span>
          <span>Start date</span>
          <span>Expires</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 rounded-lg animate-pulse" style={{ background: '#E8EDF5' }} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#F0F3F9' }}>
              <IconReceipt2 size={24} style={{ color: '#B0BCCF' }} />
            </div>
            <p className="text-sm" style={{ color: '#8A97B0' }}>No subscriptions yet. Use Walk-in Onboard to add one.</p>
          </div>
        ) : (
          sorted.map((sub: SubscriptionResponse) => {
            const isRequested = sub.status === 'Requested'
            const isApproving = approveMut.isPending && approveMut.variables?.id === sub.id

            return (
              <div
                key={sub.id}
                className="grid items-center px-5 py-3 border-b last:border-b-0 transition-colors hover:bg-[#F7F9FC]"
                style={{
                  gridTemplateColumns: '2fr 1.8fr 1.5fr 0.9fr 1fr 1fr 0.9fr 1.4fr',
                  borderColor: '#F4F6FB',
                  background: isRequested ? '#FFFDF4' : undefined,
                }}
              >
                {/* Vehicle */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F0F3F9' }}>
                    {sub.vehicleType === 'Bike'
                      ? <IconMotorbike size={14} style={{ color: '#4A90D9' }} />
                      : <IconCar       size={14} style={{ color: '#4A90D9' }} />}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#0D1B3E' }}>
                    {sub.vehicleRegistrationNumber || '—'}
                  </span>
                </div>

                {/* Owner */}
                <div className="flex items-center gap-1.5">
                  <IconUser size={13} style={{ color: '#8A97B0' }} />
                  <span className="text-xs" style={{ color: '#8A97B0' }}>{sub.ownerName}</span>
                </div>

                {/* Package */}
                <span className="text-xs" style={{ color: '#0D1B3E' }}>{sub.packageName}</span>

                {/* Slot */}
                <span className="text-xs font-semibold" style={{ color: '#0D1B3E' }}>
                  {slotLabel(sub.vehicleType, sub.slotNumber)}
                </span>

                {/* Start date */}
                <span className="text-xs" style={{ color: '#8A97B0' }}>{formatDate(sub.startDate)}</span>

                {/* End date */}
                <span className="text-xs" style={{ color: sub.endDate ? '#8A97B0' : '#B0BCCF' }}>
                  {formatDate(sub.endDate)}
                </span>

                {/* Status */}
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full w-fit"
                  style={statusStyle(sub.status)}
                >
                  {isRequested && <IconClockHour4 size={10} />}
                  {sub.status === 'Requested' ? 'Requested' : sub.status}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {isRequested && (
                    <button
                      onClick={() => approveMut.mutate({ id: sub.id })}
                      disabled={isApproving}
                      title="Approve booking"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                      style={{ background: '#1D9E75' }}
                    >
                      {isApproving ? (
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-2a8 8 0 01-8-8z" />
                        </svg>
                      ) : (
                        <IconCircleCheck size={13} />
                      )}
                      Approve
                    </button>
                  )}
                  {isRequested && (
                    <button
                      onClick={() => cancelMut.mutate({ id: sub.id })}
                      disabled={cancelMut.isPending}
                      title="Decline request"
                      className="p-1.5 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                    >
                      <IconCircleX size={14} style={{ color: '#A32D2D' }} />
                    </button>
                  )}
                  {sub.status === 'Active' && (
                    <>
                      <button
                        onClick={() => completeMut.mutate({ id: sub.id })}
                        disabled={completeMut.isPending}
                        title="Mark complete"
                        className="p-1.5 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
                      >
                        <IconCircleCheck size={15} style={{ color: '#185FA5' }} />
                      </button>
                      <button
                        onClick={() => cancelMut.mutate({ id: sub.id })}
                        disabled={cancelMut.isPending}
                        title="Cancel"
                        className="p-1.5 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                      >
                        <IconCircleX size={15} style={{ color: '#A32D2D' }} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <OnboardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false)
          qc.invalidateQueries({ queryKey: ['subscriptions'] })
          qc.invalidateQueries({ queryKey: ['slots'] })
          qc.invalidateQueries({ queryKey: ['users'] })
        }}
      />
    </div>
  )
}
