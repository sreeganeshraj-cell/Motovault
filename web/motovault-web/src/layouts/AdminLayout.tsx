import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { subscriptionsApi } from '../api/subscriptions'
import type { PendingSubscriptionDto } from '../types'
import {
  IconLayoutDashboard,
  IconCar,
  IconUsers,
  IconBuildingWarehouse,
  IconPackage,
  IconReceipt2,
  IconClipboardList,
  IconBell,
  IconSettings,
  IconLogout,
  IconHelpCircle,
  IconMotorbike,
  IconClockHour4,
  IconChevronRight,
} from '@tabler/icons-react'

const adminNavItems = [
  { to: '/admin/dashboard',     icon: IconLayoutDashboard,  label: 'Dashboard'     },
  { to: '/admin/vehicles',      icon: IconCar,              label: 'Vehicles'      },
  { to: '/admin/users',         icon: IconUsers,            label: 'Users'         },
  { to: '/admin/slots',         icon: IconBuildingWarehouse,label: 'Storage Slots' },
  { to: '/admin/packages',      icon: IconPackage,          label: 'Packages'      },
  { to: '/admin/subscriptions', icon: IconReceipt2,         label: 'Subscriptions' },
  { to: '/admin/service-logs',  icon: IconClipboardList,    label: 'Service Logs'  },
]

const staffNavItems = [
  { to: '/admin/dashboard',    icon: IconLayoutDashboard, label: 'Dashboard'    },
  { to: '/admin/service-logs', icon: IconClipboardList,   label: 'Service Logs' },
]

const pathLabels: Record<string, string> = {
  '/admin/dashboard':      'Dashboard',
  '/admin/vehicles':       'Vehicles',
  '/admin/users':          'Users',
  '/admin/slots':          'Storage Slots',
  '/admin/packages':       'Packages',
  '/admin/subscriptions':  'Subscriptions',
  '/admin/service-logs':   'Service Logs',
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 2)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function NotificationPanel({
  items,
  onClose,
  onApprove,
  approvingId,
}: {
  items: PendingSubscriptionDto[]
  onClose: () => void
  onApprove: (id: string) => void
  approvingId: string | null
}) {
  return (
    <div
      className="absolute top-full right-0 mt-2 w-80 rounded-xl overflow-hidden z-50"
      style={{
        background: '#fff',
        border: '1px solid #DDE3EF',
        boxShadow: '0 8px 32px rgba(13,27,62,0.14)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#EEF1F8' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: '#0D1B3E' }}>Booking Requests</span>
          {items.length > 0 && (
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: '#E03B3B', color: '#fff', fontSize: 10 }}
            >
              {items.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-xs font-medium hover:underline"
          style={{ color: '#4A90D9' }}
        >
          Dismiss
        </button>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <IconClockHour4 size={28} style={{ color: '#C8D2E0', margin: '0 auto 8px' }} />
          <p className="text-xs" style={{ color: '#8A97B0' }}>No pending requests</p>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto">
          {items.map((item) => {
            const isBike = item.vehicleType === 'Bike'
            const vehicleDesc = [item.brand, item.model].filter(Boolean).join(' ') || item.vehicleType
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 px-4 py-3 border-b hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                style={{ borderColor: '#F4F6FB' }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: isBike ? '#E6F1FB' : '#EAF3DE' }}
                >
                  {isBike
                    ? <IconMotorbike size={15} style={{ color: '#185FA5' }} />
                    : <IconCar       size={15} style={{ color: '#3B6D11' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate" style={{ color: '#0D1B3E' }}>
                      {item.ownerName}
                    </span>
                    <span className="text-[10px] flex-shrink-0" style={{ color: '#B0BCCF' }}>
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs truncate mt-0.5" style={{ color: '#4A5580' }}>
                    {vehicleDesc} · {item.packageName}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); onApprove(item.id) }}
                      disabled={approvingId === item.id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                      style={{ background: '#1D9E75' }}
                    >
                      {approvingId === item.id ? (
                        <svg className="animate-spin h-2.5 w-2.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-2a8 8 0 01-8-8z"/>
                        </svg>
                      ) : '✓'} Approve
                    </button>
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{ background: '#FEF3C7', color: '#92400E' }}
                    >
                      Awaiting
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      {items.length > 0 && (
        <div className="px-4 py-2.5 border-t" style={{ borderColor: '#EEF1F8' }}>
          <NavLink
            to="/admin/subscriptions"
            onClick={onClose}
            className="flex items-center justify-between text-xs font-medium hover:underline"
            style={{ color: '#4A90D9' }}
          >
            <span>View all in Subscriptions</span>
            <IconChevronRight size={13} />
          </NavLink>
        </div>
      )}
    </div>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  const navItems = user?.role === 'Admin' ? adminNavItems : staffNavItems

  const approveMut = useMutation({
    mutationFn: (id: string) => subscriptionsApi.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscriptions', 'pending'] })
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
  const pageLabel = pathLabels[location.pathname] ?? 'Dashboard'

  const { data: pendingItems = [] } = useQuery({
    queryKey: ['subscriptions', 'pending'],
    queryFn: subscriptionsApi.getPending,
    enabled: user?.role === 'Admin',
    refetchInterval: 60_000,
  })

  const pendingCount = pendingItems.length

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    if (bellOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [bellOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#F0F3F9' }}>

      {/* ── Titlebar ─────────────────────────────────────────────────────── */}
      <header
        className="flex items-center px-4 gap-3 flex-shrink-0 z-10"
        style={{ height: 40, backgroundColor: '#0D1B3E' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-5 h-5 border-2 rounded-sm flex items-center justify-center" style={{ borderColor: '#4A90D9' }}>
            <div className="w-2 h-2 rounded-full border" style={{ borderColor: '#4A90D9' }} />
          </div>
          <span className="text-white font-bold text-xs tracking-widest">
            MOTO<span style={{ color: '#4A90D9' }}>VAULT</span>
          </span>
        </div>

        <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.15)' }} />

        {/* Breadcrumb */}
        <span className="text-xs flex-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Vehicle Hostel &rsaquo;{' '}
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{pageLabel}</span>
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">

          {/* Bell with live count */}
          <div ref={bellRef} className="relative">
            <button
              onClick={() => setBellOpen((o) => !o)}
              className="w-7 h-7 rounded-md flex items-center justify-center relative hover:bg-white/10 transition"
              title="Booking requests"
            >
              <IconBell size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
              {pendingCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-white font-bold border"
                  style={{ background: '#E03B3B', borderColor: '#0D1B3E', fontSize: 8, padding: '0 2px' }}
                >
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <NotificationPanel
                items={pendingItems}
                onClose={() => setBellOpen(false)}
                onApprove={(id) => approveMut.mutate(id)}
                approvingId={approveMut.isPending ? (approveMut.variables as string) : null}
              />
            )}
          </div>

          <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 transition" title="Help">
            <IconHelpCircle size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
          <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 transition" title="Settings">
            <IconSettings size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>

          <div className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.15)' }} />

          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold cursor-pointer select-none"
            style={{ backgroundColor: '#4A90D9', fontSize: 10 }}
            title={user?.name}
          >
            {user ? initials(user.name) : 'U'}
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Nav Rail */}
        <nav
          className="flex flex-col items-center py-2 gap-0.5 flex-shrink-0"
          style={{ width: 52, backgroundColor: '#0D1B3E' }}
        >
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? 'bg-[#4A90D9]/20' : 'hover:bg-white/8'
                }`
              }
            >
              {({ isActive }) => (
                <Icon size={20} style={{ color: isActive ? '#4A90D9' : 'rgba(255,255,255,0.4)' }} />
              )}
            </NavLink>
          ))}

          <div className="flex-1" />
          <div className="w-7 h-px my-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-white/8"
          >
            <IconLogout size={20} style={{ color: 'rgba(255,255,255,0.35)' }} />
          </button>
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-y-auto" style={{ background: '#F0F3F9' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
