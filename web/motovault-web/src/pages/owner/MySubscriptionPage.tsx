import { useQueries, useQuery } from '@tanstack/react-query'
import { IconReceipt2, IconMotorbike, IconCar, IconBuildingWarehouse, IconCalendar, IconCalendarEvent, IconClockHour4, IconCircleCheck } from '@tabler/icons-react'
import { useAuthStore } from '../../store/authStore'
import { vehiclesApi } from '../../api/vehicles'
import { subscriptionsApi } from '../../api/subscriptions'
import type { SubscriptionResponse } from '../../types'

// ─── Subscription card ────────────────────────────────────────────────────────

function SubCard({ sub }: { sub: SubscriptionResponse }) {
  const isBike = sub.vehicleType === 'Bike'
  const slotCode = `${isBike ? 'B' : 'C'}-${String(sub.slotNumber).padStart(2, '0')}`

  function fmtDate(d: string) {
    const [y, m, day] = d.split('-').map(Number)
    return new Date(y, m - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const since = fmtDate(sub.startDate)
  const expires = sub.endDate ? fmtDate(sub.endDate) : null

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}>

      {/* Header band */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#0D1B3E' }}>
        <div>
          <div className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Package</div>
          <div className="text-xl font-bold text-white">{sub.packageName}</div>
        </div>
        {sub.status === 'Requested' ? (
          <span
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: '#F59E0B', color: '#fff' }}
          >
            <IconClockHour4 size={12} />
            Pending Approval
          </span>
        ) : sub.status === 'Active' ? (
          <span
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: '#1D9E75', color: '#fff' }}
          >
            <IconCircleCheck size={12} />
            Active
          </span>
        ) : (
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
          >
            {sub.status}
          </span>
        )}
      </div>

      {/* Pending info banner */}
      {sub.status === 'Requested' && (
        <div
          className="mx-5 mt-3 flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ background: '#FEF9EC', border: '1px solid #F5C842' }}
        >
          <IconClockHour4 size={16} style={{ color: '#B45309', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div className="text-xs font-semibold" style={{ color: '#78350F' }}>
              Your booking is under review
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#92400E' }}>
              Our team will confirm your slot shortly. You'll see this update to Active once approved.
            </div>
          </div>
        </div>
      )}

      {/* Details */}
      <div className={`px-5 py-4 grid gap-4 ${expires ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>

        {/* Vehicle */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: isBike ? '#E6F1FB' : '#EAF3DE' }}>
              {isBike
                ? <IconMotorbike size={13} style={{ color: '#185FA5' }} />
                : <IconCar       size={13} style={{ color: '#3B6D11' }} />}
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8A97B0' }}>Vehicle</span>
          </div>
          <div className="text-sm font-semibold font-mono" style={{ color: '#0D1B3E' }}>
            {sub.vehicleRegistrationNumber || '—'}
          </div>
          <div className="text-xs" style={{ color: '#8A97B0' }}>{sub.vehicleType}</div>
        </div>

        {/* Slot */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#EDE9FE' }}>
              <IconBuildingWarehouse size={13} style={{ color: '#6D28D9' }} />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8A97B0' }}>Bay</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: '#0D1B3E' }}>{slotCode}</div>
        </div>

        {/* Since */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#FFF0D9' }}>
              <IconCalendar size={13} style={{ color: '#B45309' }} />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8A97B0' }}>Since</span>
          </div>
          <div className="text-sm font-semibold" style={{ color: '#0D1B3E' }}>{since}</div>
        </div>

        {/* Expires */}
        {expires && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#FEF0F0' }}>
                <IconCalendarEvent size={13} style={{ color: '#A32D2D' }} />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#8A97B0' }}>Expires</span>
            </div>
            <div className="text-sm font-semibold" style={{ color: '#0D1B3E' }}>{expires}</div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MySubscriptionPage() {
  const user = useAuthStore((s) => s.user)

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['my-vehicles', user?.id],
    queryFn: () => vehiclesApi.getByOwner(user!.id),
    enabled: !!user?.id,
  })

  const subQueries = useQueries({
    queries: vehicles.map((v) => ({
      queryKey: ['subscription', 'active', v.id],
      queryFn: () => subscriptionsApi.getActiveByVehicle(v.id),
      retry: false,
      enabled: vehicles.length > 0,
    })),
  })

  const activeSubs = subQueries
    .filter((q) => q.isSuccess && q.data)
    .map((q) => q.data as SubscriptionResponse)

  const pendingCount  = activeSubs.filter((s) => s.status === 'Requested').length
  const confirmedCount = activeSubs.filter((s) => s.status === 'Active').length

  const isLoading = vehiclesLoading || subQueries.some((q) => q.isLoading)

  return (
    <div className="flex flex-col gap-5 p-5">

      <div>
        <h2 className="text-lg font-bold" style={{ color: '#0D1B3E' }}>My Subscription</h2>
        <p className="text-xs mt-0.5" style={{ color: '#8A97B0' }}>
          {confirmedCount > 0 && `${confirmedCount} active`}
          {confirmedCount > 0 && pendingCount > 0 && ' · '}
          {pendingCount > 0 && <span style={{ color: '#B45309' }}>{pendingCount} pending approval</span>}
          {activeSubs.length === 0 && 'No subscriptions'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(1)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl animate-pulse" style={{ background: '#E8EDF5' }} />
          ))}
        </div>
      ) : activeSubs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: '#F0F3F9' }}>
            <IconReceipt2 size={28} style={{ color: '#B0BCCF' }} />
          </div>
          <p className="text-sm" style={{ color: '#8A97B0' }}>No active subscriptions found.</p>
          <p className="text-xs" style={{ color: '#B0BCCF' }}>Contact staff if you believe this is an error.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-w-2xl">
          {activeSubs.map((sub) => <SubCard key={sub.id} sub={sub} />)}
        </div>
      )}

    </div>
  )
}
