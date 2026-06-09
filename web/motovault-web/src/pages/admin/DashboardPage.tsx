import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { dashboardApi } from '../../api/dashboard'
import { subscriptionsApi } from '../../api/subscriptions'
import OnboardModal from '../../components/OnboardModal'
import type { ActiveVehicle, RecentActivity } from '../../types'
import {
  IconMotorbike, IconCar, IconBuildingWarehouse, IconReceipt2,
  IconTrendingUp, IconTrendingDown, IconAlertTriangle,
  IconCircleCheck, IconClockExclamation,
  IconPlus, IconRefresh, IconSearch, IconFilter,
  IconTools, IconSpray, IconRoute,
  IconBell, IconChevronRight,
} from '@tabler/icons-react'

// ── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 2)  return 'Just now'
  if (mins  < 60) return `${mins} min ago`
  if (hours < 24) return `${hours} hr ago`
  if (days  < 7)  return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function slotLabel(type: string, num: number) {
  return `${type === 'Bike' ? 'B' : 'C'}-${String(num).padStart(2, '0')}`
}

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, iconClass, trend, trendDir,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  iconClass: string
  trend?: string
  trendDir?: 'up' | 'down' | 'warn'
}) {
  const trendColor = trendDir === 'up' ? '#3B6D11' : trendDir === 'down' ? '#A32D2D' : '#854F0B'
  const TIcon = trendDir === 'up' ? IconTrendingUp : trendDir === 'down' ? IconTrendingDown : IconAlertTriangle
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}>
      <div className="flex justify-between items-start">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconClass}`}>
          <Icon size={19} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: trendColor }}>
            <TIcon size={13} />{trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold leading-none" style={{ color: '#0D1B3E' }}>{value}</div>
      <div className="text-xs" style={{ color: '#8A97B0' }}>{label}</div>
    </div>
  )
}

// ── occupancy bar ─────────────────────────────────────────────────────────────

function OccBar({ label, icon: Icon, iconColor, occupied, total, fill }: {
  label: string; icon: React.ElementType; iconColor: string
  occupied: number; total: number; fill: string
}) {
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1.5 text-xs" style={{ color: '#4A5580' }}>
          <Icon size={14} style={{ color: iconColor }} />{label}
        </span>
        <span className="text-xs font-semibold" style={{ color: '#0D1B3E' }}>
          {occupied} / {total}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#EEF1F8' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: fill }} />
      </div>
    </div>
  )
}

// ── activity item ──────────────────────────────────────────────────────────────

const actCfg: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  Cleaning: { icon: IconSpray,  bg: '#E6F1FB', color: '#185FA5' },
  Service:  { icon: IconTools,  bg: '#EAF3DE', color: '#3B6D11' },
  Idling:   { icon: IconRoute,  bg: '#FAEEDA', color: '#854F0B' },
  Ride:     { icon: IconRefresh, bg: '#F3EBFC', color: '#7B3FA8' },
}

function ActivityItem({ item }: { item: RecentActivity }) {
  const cfg = actCfg[item.serviceType] ?? actCfg.Cleaning
  const Icon = cfg.icon
  const desc = [item.brand, item.model].filter(Boolean).join(' ')

  return (
    <div className="flex gap-2.5 px-4 py-2.5 border-b last:border-b-0" style={{ borderColor: '#F4F6FB' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: cfg.bg }}>
        <Icon size={15} style={{ color: cfg.color }} />
      </div>
      <div className="min-w-0">
        <div className="text-xs leading-snug truncate" style={{ color: '#2C3E6B' }}>
          <span className="font-medium">{item.registrationNumber ?? ''}</span>
          {item.registrationNumber && desc ? ' — ' : ''}{desc}
          {item.notes ? ` · ${item.notes}` : ''}
        </div>
        <div className="text-xs mt-0.5" style={{ color: '#B0BCCF' }}>
          {item.serviceType} · {timeAgo(item.createdAt)}
        </div>
      </div>
    </div>
  )
}

// ── vehicle row ────────────────────────────────────────────────────────────────

function VehicleRow({ v }: { v: ActiveVehicle }) {
  const isBike = v.vehicleType === 'Bike'
  return (
    <div
      className="grid items-center px-4 py-2.5 border-b last:border-b-0 cursor-pointer hover:bg-[#F7F9FC] transition-colors"
      style={{ gridTemplateColumns: '2fr 0.7fr 1.1fr 0.85fr', borderColor: '#F4F6FB' }}
    >
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0`}
          style={{ background: isBike ? '#E6F1FB' : '#EAF3DE' }}>
          {isBike
            ? <IconMotorbike size={14} style={{ color: '#185FA5' }} />
            : <IconCar       size={14} style={{ color: '#3B6D11' }} />}
        </div>
        <div>
          <div className="text-xs font-medium leading-tight" style={{ color: '#0D1B3E' }}>
            {[v.brand, v.model].filter(Boolean).join(' ') || v.vehicleType}
          </div>
          <div className="text-xs" style={{ color: '#8A97B0' }}>{v.registrationNumber ?? '—'}</div>
        </div>
      </div>

      <div className="text-xs font-medium" style={{ color: '#2C3E6B' }}>
        {slotLabel(v.slotType, v.slotNumber)}
      </div>

      <div className="text-xs" style={{ color: '#B0BCCF' }}>
        {formatDate(v.startDate)}
      </div>

      <div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{ background: '#EAF3DE', color: '#3B6D11' }}>
          <IconCircleCheck size={10} />Active
        </span>
      </div>
    </div>
  )
}

// ── skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ h = 28 }: { h?: number }) {
  return <div className="rounded-xl animate-pulse" style={{ height: h, background: '#E8EDF5' }} />
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
    staleTime: 60_000,
  })

  const { data: pendingItems = [] } = useQuery({
    queryKey: ['subscriptions', 'pending'],
    queryFn: subscriptionsApi.getPending,
    enabled: user?.role === 'Admin',
    staleTime: 60_000,
  })

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const totalSlots    = (data?.bikeSlotsTotal ?? 0) + (data?.carSlotsTotal ?? 0)
  const totalOccupied = (data?.bikeSlotsOccupied ?? 0) + (data?.carSlotsOccupied ?? 0)
  const occupancyPct  = totalSlots > 0 ? Math.round((totalOccupied / totalSlots) * 100) : 0

  return (
    <div className="flex flex-col gap-4 p-4">

      {/* ── Ribbon ───────────────────────────────────────────────────────── */}
      <div
        className="flex items-center -mx-4 -mt-4 px-3 mb-1"
        style={{ height: 50, background: '#F4F6FA', borderBottom: '1px solid #DDE3EF' }}
      >
        <div className="flex items-center gap-0.5 pr-2.5 mr-2.5 border-r" style={{ borderColor: '#DDE3EF' }}>
          <button
            onClick={() => setModalOpen(true)}
            className="flex flex-col items-center justify-center gap-1 px-3 rounded-md h-10 text-white transition hover:opacity-90"
            style={{ background: '#0D1B3E', minWidth: 54 }}
            title="New subscription"
          >
            <IconPlus size={17} style={{ color: '#4A90D9' }} />
            <span className="text-[9px] font-medium">New Sub</span>
          </button>
        </div>

        <div className="flex items-center gap-0.5 pr-2.5 mr-2.5 border-r" style={{ borderColor: '#DDE3EF' }}>
          {[
            { icon: IconFilter,  label: 'Filter',  onClick: undefined },
            { icon: IconRefresh, label: 'Refresh', onClick: () => refetch() },
          ].map(({ icon: Icon, label, onClick }) => (
            <button key={label}
              onClick={onClick}
              className="flex flex-col items-center justify-center gap-1 px-2.5 rounded-md h-10 hover:bg-gray-100 transition"
              style={{ minWidth: 52 }}
              title={label}
            >
              <Icon size={17} style={{ color: isFetching && label === 'Refresh' ? '#4A90D9' : '#2C3E6B' }} />
              <span className="text-[9px] font-medium" style={{ color: '#4A5580' }}>{label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 px-3 h-8 rounded-lg border" style={{ background: '#fff', borderColor: '#DDE3EF' }}>
          <IconSearch size={13} style={{ color: '#9AAABB' }} />
          <input
            type="text"
            placeholder="Search vehicles, plates…"
            className="text-xs outline-none bg-transparent text-gray-700 placeholder-gray-400 w-44"
          />
        </div>
      </div>

      {/* ── Pending requests banner ──────────────────────────────────────── */}
      {!bannerDismissed && pendingItems.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #FFF8E7 0%, #FFFBF0 100%)',
            border: '1px solid #F5C842',
          }}
        >
          {/* Icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#FEF3C7' }}
          >
            <IconBell size={18} style={{ color: '#B45309' }} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold" style={{ color: '#78350F' }}>
              {pendingItems.length === 1
                ? '1 new booking request awaiting your approval'
                : `${pendingItems.length} new booking requests awaiting your approval`}
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#92400E' }}>
              {pendingItems.map((p) => p.ownerName).slice(0, 3).join(', ')}
              {pendingItems.length > 3 ? ` and ${pendingItems.length - 3} more` : ''}
            </div>
          </div>

          {/* Preview pills */}
          <div className="hidden xl:flex items-center gap-2 flex-shrink-0">
            {pendingItems.slice(0, 2).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
                style={{ background: 'rgba(245,200,66,0.2)', border: '1px solid rgba(245,200,66,0.4)' }}
              >
                {p.vehicleType === 'Bike'
                  ? <IconMotorbike size={12} style={{ color: '#92400E' }} />
                  : <IconCar size={12} style={{ color: '#92400E' }} />}
                <span style={{ color: '#78350F' }} className="font-medium">{p.ownerName.split(' ')[0]}</span>
                <span style={{ color: '#A16207' }}>· {p.packageName}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="/admin/subscriptions"
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-90 flex-shrink-0"
            style={{ background: '#F59E0B', color: '#fff' }}
          >
            Review <IconChevronRight size={13} />
          </a>

          {/* Dismiss */}
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-xs font-medium ml-1 hover:underline flex-shrink-0"
            style={{ color: '#A16207' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mt-1">
        <div>
          <div className="font-bold text-lg" style={{ color: '#0D1B3E' }}>
            {greeting}, {user?.name?.split(' ')[0] ?? 'Admin'}
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#8A97B0' }}>
            Here&rsquo;s what&rsquo;s happening at MotoVault today
          </div>
        </div>
        <div className="text-xs text-right leading-relaxed" style={{ color: '#8A97B0' }}>
          {todayLabel()}
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} h={112} />)}
        </div>
      ) : isError ? (
        <div className="rounded-xl px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200">
          ⚠ Failed to load dashboard data — check that the backend is running.
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Motorcycles in storage" value={data.bikesInStorage}
            icon={IconMotorbike} iconClass="bg-[#E6F1FB] text-[#185FA5]"
            trend={`+${data.bikesInStorage} active`} trendDir="up" />

          <StatCard label="Cars in storage" value={data.carsInStorage}
            icon={IconCar} iconClass="bg-[#EAF3DE] text-[#3B6D11]"
            trend={`+${data.carsInStorage} active`} trendDir="up" />

          <StatCard label="Slot occupancy" value={`${occupancyPct}%`}
            icon={IconBuildingWarehouse} iconClass="bg-[#FAEEDA] text-[#854F0B]"
            trend={`${totalOccupied}/${totalSlots} bays`}
            trendDir={occupancyPct > 80 ? 'warn' : 'up'} />

          {data.overdueCount > 0 ? (
            <StatCard label="Overdue subscriptions" value={data.overdueCount}
              icon={IconClockExclamation} iconClass="bg-[#FCEBEB] text-[#A32D2D]"
              trend="Needs attention" trendDir="warn" />
          ) : (
            <StatCard label="Active subscriptions" value={data.activeSubscriptionsCount}
              icon={IconReceipt2} iconClass="bg-[#E6F1FB] text-[#185FA5]"
              trend="All current" trendDir="up" />
          )}
        </div>
      ) : null}

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      {data && (
        <div className="grid gap-3" style={{ gridTemplateColumns: '1.6fr 1fr' }}>

          {/* Vehicles table */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#EEF1F8' }}>
              <span className="text-sm font-semibold" style={{ color: '#0D1B3E' }}>Active vehicles</span>
              <span className="text-xs cursor-pointer hover:underline" style={{ color: '#4A90D9' }}>View all</span>
            </div>
            <div className="grid px-4 py-2 text-[9px] font-semibold uppercase tracking-wider"
              style={{ gridTemplateColumns: '2fr 0.7fr 1.1fr 0.85fr', color: '#8A97B0', background: '#F7F9FC', borderBottom: '0.5px solid #EEF1F8' }}>
              <span>Vehicle</span><span>Bay</span><span>Since</span><span>Status</span>
            </div>
            {data.activeVehicles.length === 0
              ? <div className="px-4 py-8 text-center text-xs" style={{ color: '#B0BCCF' }}>No active vehicles yet</div>
              : data.activeVehicles.map((v, i) => <VehicleRow key={i} v={v} />)
            }
          </div>

          {/* Right col */}
          <div className="flex flex-col gap-3">

            {/* Bay occupancy */}
            <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#EEF1F8' }}>
                <span className="text-sm font-semibold" style={{ color: '#0D1B3E' }}>Bay occupancy</span>
                <span className="text-xs cursor-pointer hover:underline" style={{ color: '#4A90D9' }}>Details</span>
              </div>
              <div className="px-4 py-4 flex flex-col gap-4">
                <OccBar label="Motorcycle bays" icon={IconMotorbike} iconColor="#185FA5"
                  occupied={data.bikeSlotsOccupied} total={data.bikeSlotsTotal} fill="#4A90D9" />
                <OccBar label="Car bays" icon={IconCar} iconColor="#3B6D11"
                  occupied={data.carSlotsOccupied} total={data.carSlotsTotal} fill="#1D9E75" />
              </div>
            </div>

            {/* Activity feed */}
            <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#EEF1F8' }}>
                <span className="text-sm font-semibold" style={{ color: '#0D1B3E' }}>Activity feed</span>
                <span className="text-xs cursor-pointer hover:underline" style={{ color: '#4A90D9' }}>See all</span>
              </div>
              {data.recentActivity.length === 0
                ? <div className="px-4 py-8 text-center text-xs" style={{ color: '#B0BCCF' }}>No service activity yet</div>
                : data.recentActivity.map((a, i) => <ActivityItem key={i} item={a} />)
              }
            </div>

          </div>
        </div>
      )}

      <OnboardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false)
          qc.invalidateQueries({ queryKey: ['subscriptions'] })
          qc.invalidateQueries({ queryKey: ['slots'] })
          qc.invalidateQueries({ queryKey: ['users'] })
          refetch()
        }}
      />
    </div>
  )
}
