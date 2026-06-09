import { useQuery } from '@tanstack/react-query'
import { IconCar, IconMotorbike, IconReceipt2, IconCircleCheck, IconCircleX, IconClockHour4 } from '@tabler/icons-react'
import { useAuthStore } from '../../store/authStore'
import { vehiclesApi } from '../../api/vehicles'
import { subscriptionsApi } from '../../api/subscriptions'
import type { VehicleResponse, SubscriptionResponse } from '../../types'

// ─── Vehicle card ─────────────────────────────────────────────────────────────

function VehicleCard({ vehicle }: { vehicle: VehicleResponse }) {
  const isBike = vehicle.type === 'Bike'

  const { data: sub, isLoading: subLoading, isError: noSub } = useQuery<SubscriptionResponse>({
    queryKey: ['subscription', 'active', vehicle.id],
    queryFn: () => subscriptionsApi.getActiveByVehicle(vehicle.id),
    retry: false,
  })

  const displayName = [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || vehicle.type

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4"
      style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: isBike ? '#E6F1FB' : '#EAF3DE' }}
        >
          {isBike
            ? <IconMotorbike size={24} style={{ color: '#185FA5' }} />
            : <IconCar       size={24} style={{ color: '#3B6D11' }} />}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold leading-snug" style={{ color: '#0D1B3E' }}>{displayName}</div>
          {vehicle.registrationNumber ? (
            <div className="text-xs font-mono mt-0.5" style={{ color: '#4A5580' }}>
              {vehicle.registrationNumber}
            </div>
          ) : (
            <div className="text-xs mt-0.5" style={{ color: '#B0BCCF' }}>No registration</div>
          )}
        </div>
      </div>

      {/* Subscription status */}
      <div className="rounded-lg px-3 py-2.5" style={{ background: '#F7F9FC' }}>
        {subLoading ? (
          <div className="h-4 rounded animate-pulse" style={{ background: '#E8EDF5' }} />
        ) : noSub || !sub ? (
          <div className="flex items-center gap-2">
            <IconCircleX size={14} style={{ color: '#B0BCCF' }} />
            <span className="text-xs" style={{ color: '#8A97B0' }}>No active subscription</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sub.status === 'Requested'
                  ? <IconClockHour4 size={14} style={{ color: '#B45309' }} />
                  : <IconCircleCheck size={14} style={{ color: '#3B6D11' }} />}
                <span className="text-xs font-semibold" style={{ color: '#0D1B3E' }}>{sub.packageName}</span>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={sub.status === 'Requested'
                  ? { background: '#FEF3C7', color: '#92400E' }
                  : { background: '#EAF3DE', color: '#3B6D11' }}
              >
                {sub.status === 'Requested' ? 'Pending Approval' : sub.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span className="text-xs" style={{ color: '#8A97B0' }}>
                Slot <span className="font-semibold" style={{ color: '#0D1B3E' }}>
                  {sub.vehicleType === 'Bike' ? 'B' : 'C'}-{String(sub.slotNumber).padStart(2, '0')}
                </span>
              </span>
              <span className="text-xs" style={{ color: '#8A97B0' }}>
                Since <span style={{ color: '#4A5580' }}>
                  {(() => { const [y,m,d] = sub.startDate.split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) })()}
                </span>
              </span>
              {sub.endDate && (
                <span className="text-xs" style={{ color: '#8A97B0' }}>
                  Expires <span style={{ color: '#A32D2D' }}>
                    {(() => { const [y,m,d] = sub.endDate!.split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) })()}
                  </span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyVehiclesPage() {
  const user = useAuthStore((s) => s.user)

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['my-vehicles', user?.id],
    queryFn: () => vehiclesApi.getByOwner(user!.id),
    enabled: !!user?.id,
  })

  return (
    <div className="flex flex-col gap-5 p-5">

      <div>
        <h2 className="text-lg font-bold" style={{ color: '#0D1B3E' }}>My Vehicles</h2>
        <p className="text-xs mt-0.5" style={{ color: '#8A97B0' }}>
          {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} registered
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl animate-pulse" style={{ background: '#E8EDF5' }} />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: '#F0F3F9' }}>
            <IconReceipt2 size={28} style={{ color: '#B0BCCF' }} />
          </div>
          <p className="text-sm" style={{ color: '#8A97B0' }}>No vehicles found on your account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
      )}

    </div>
  )
}
