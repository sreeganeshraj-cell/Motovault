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
  { to: '/admin/dashboard',     icon: IconLayoutDashboard,   label: 'Dashboard'     },
  { to: '/admin/vehicles',      icon: IconCar,               label: 'Vehicles'      },
  { to: '/admin/users',         icon: IconUsers,             label: 'Users'         },
  { to: '/admin/slots',         icon: IconBuildingWarehouse, label: 'Storage Slots' },
  { to: '/admin/packages',      icon: IconPackage,           label: 'Packages'      },
  { to: '/admin/subscriptions', icon: IconReceipt2,          label: 'Subscriptions' },
  { to: '/admin/service-logs',  icon: IconClipboardList,     label: 'Service Logs'  },
]

const staffNavItems = [
  { to: '/admin/dashboard',    icon: IconLayoutDashboard, label: 'Dashboard'    },
  { to: '/admin/service-logs', icon: IconClipboardList,   label: 'Service Logs' },
]

const pathLabels: Record<string, string> = {
  '/admin/dashboard':     'Dashboard',
  '/admin/vehicles':      'Vehicles',
  '/admin/users':         'Users',
  '/admin/slots':         'Storage Slots',
  '/admin/packages':      'Packages',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/service-logs':  'Service Logs',
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
      className="absolute top-full right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50"
      style={{
        background: '#1C2128',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Booking Requests
          </span>
          {items.length > 0 && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#1D9E75', color: '#fff', fontSize: 10 }}>
              {items.length}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-xs font-medium" style={{ color: '#1D9E75' }}>
          Dismiss
        </button>
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <IconClockHour4 size={28} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 8px' }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>No pending requests</p>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto">
          {items.map((item) => {
            const isBike = item.vehicleType === 'Bike'
            const vehicleDesc = [item.brand, item.model].filter(Boolean).join(' ') || item.vehicleType
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 px-4 py-3 border-b transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: isBike ? 'rgba(29,106,58,0.25)' : 'rgba(74,144,217,0.18)' }}
                >
                  {isBike
                    ? <IconMotorbike size={15} style={{ color: '#1D9E75' }} />
                    : <IconCar       size={15} style={{ color: '#4A90D9' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate text-white">{item.ownerName}</span>
                    <span className="text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {vehicleDesc} · {item.packageName}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); onApprove(item.id) }}
                      disabled={approvingId === item.id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                      style={{ background: '#1D6A3A' }}
                    >
                      {approvingId === item.id ? (
                        <svg className="animate-spin h-2.5 w-2.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-2a8 8 0 01-8-8z"/>
                        </svg>
                      ) : '✓'} Approve
                    </button>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                      Awaiting
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="px-4 py-2.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <NavLink
            to="/admin/subscriptions"
            onClick={onClose}
            className="flex items-center justify-between text-xs font-medium"
            style={{ color: '#1D9E75' }}
          >
            <span>View all in Subscriptions</span>
            <IconChevronRight size={13} />
          </NavLink>
        </div>
      )}
    </div>
  )
}

export default function AdminLayoutV2() {
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .sg { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      <div className="sg flex h-screen" style={{ background: '#0D1208' }}>

        {/* ── Floating Sidebar ─────────────────────────────────────────── */}
        <aside
          className="flex flex-col m-2.5 rounded-2xl flex-shrink-0 overflow-hidden"
          style={{
            width: 196,
            background: '#161B22',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          }}
        >
          {/* Brand */}
          <div className="px-4 pt-5 pb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1D6A3A 0%, #166534 100%)' }}
              >
                MV
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest" style={{ color: '#fff' }}>
                  MOTO<span style={{ color: '#1D9E75' }}>VAULT</span>
                </div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>Vehicle Hostel</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 mb-3" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Nav items */}
          <nav className="flex-1 flex flex-col gap-0.5 px-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                title={label}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'active-nav-item' : 'inactive-nav-item'
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? 'rgba(29,106,58,0.25)' : 'transparent',
                  color: isActive ? '#1D9E75' : 'rgba(255,255,255,0.42)',
                  borderLeft: isActive ? '3px solid #1D9E75' : '3px solid transparent',
                })}
              >
                <Icon size={17} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mx-4 my-2" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Bottom section — avatar + logout */}
          <div className="px-3 pb-4 flex flex-col gap-1">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1D6A3A 0%, #22843F 100%)', fontSize: 10 }}
              >
                {user ? initials(user.name) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                <div className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.role}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              <IconLogout size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* ── Main area ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Topbar */}
          <header
            className="flex items-center gap-4 px-5 flex-shrink-0"
            style={{ height: 52 }}
          >
            {/* Page title */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>Vehicle Hostel</span>
                <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10 }}>›</span>
                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>{pageLabel}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">

              {/* Bell */}
              <div ref={bellRef} className="relative">
                <button
                  onClick={() => setBellOpen((o) => !o)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center relative transition"
                  style={{ background: bellOpen ? 'rgba(29,106,58,0.25)' : 'rgba(255,255,255,0.05)' }}
                  title="Booking requests"
                >
                  <IconBell size={16} style={{ color: 'rgba(255,255,255,0.55)' }} />
                  {pendingCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full flex items-center justify-center text-white font-bold border"
                      style={{ background: '#1D9E75', borderColor: '#0D1208', fontSize: 8, padding: '0 2px' }}
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

              <button
                className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                style={{ background: 'rgba(255,255,255,0.05)' }}
                title="Help"
              >
                <IconHelpCircle size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </button>
              <button
                className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                style={{ background: 'rgba(255,255,255,0.05)' }}
                title="Settings"
              >
                <IconSettings size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
              </button>
            </div>
          </header>

          {/* Content area */}
          <main
            className="flex-1 overflow-y-auto mx-2.5 mb-2.5 rounded-2xl"
            style={{
              background: '#F5F7FA',
              boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
            }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
