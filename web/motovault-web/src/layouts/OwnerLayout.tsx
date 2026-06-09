import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  IconCar, IconReceipt2, IconClipboardList, IconLogout, IconBell, IconHome,
} from '@tabler/icons-react'

const navItems = [
  { to: '/owner/vehicles',        icon: IconCar,           label: 'My Vehicles'     },
  { to: '/owner/subscription',    icon: IconReceipt2,      label: 'My Subscription' },
  { to: '/owner/service-history', icon: IconClipboardList, label: 'Service History' },
]

const pathLabels: Record<string, string> = {
  '/owner/vehicles':        'My Vehicles',
  '/owner/subscription':    'My Subscription',
  '/owner/service-history': 'Service History',
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export default function OwnerLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const pageLabel = pathLabels[location.pathname] ?? 'Owner Portal'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#F0F3F9' }}>

      {/* Titlebar */}
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
          Owner Portal &rsaquo;{' '}
          <span style={{ color: 'rgba(255,255,255,0.75)' }}>{pageLabel}</span>
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 transition" title="Notifications">
            <IconBell size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
          <div className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold cursor-pointer select-none"
            style={{ backgroundColor: '#1D9E75', fontSize: 10 }}
            title={user?.name}
          >
            {user ? initials(user.name) : 'U'}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Nav Rail */}
        <nav
          className="flex flex-col items-center py-2 gap-0.5 flex-shrink-0"
          style={{ width: 52, backgroundColor: '#0D1B3E' }}
        >
          <NavLink
            to="/owner/home"
            title="Back to Home"
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-white/8"
          >
            {({ isActive }) => (
              <IconHome size={20} style={{ color: isActive ? '#1D9E75' : 'rgba(255,255,255,0.4)' }} />
            )}
          </NavLink>

          <div className="w-7 h-px my-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? 'bg-[#1D9E75]/20' : 'hover:bg-white/8'
                }`
              }
            >
              {({ isActive }) => (
                <Icon size={20} style={{ color: isActive ? '#1D9E75' : 'rgba(255,255,255,0.4)' }} />
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
