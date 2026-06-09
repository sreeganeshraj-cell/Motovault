import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth'
import type { Role } from '../../types'

const schema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

// ─── Motorcycle SVG (reused, recoloured for BRG palette) ─────────────────────

function MotorcycleIllustration() {
  const stroke = '#1D6A3A'
  const strokeFaint = `${stroke}80`
  return (
    <svg width="260" height="114" viewBox="0 0 240 106" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="52" cy="76" r="26" stroke={stroke} strokeWidth="2.5" />
      <circle cx="52" cy="76" r="12" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.45" />
      <circle cx="52" cy="76" r="4" fill={stroke} />
      <circle cx="186" cy="76" r="22" stroke={stroke} strokeWidth="2.5" />
      <circle cx="186" cy="76" r="10" stroke={stroke} strokeWidth="1.5" strokeOpacity="0.45" />
      <circle cx="186" cy="76" r="4" fill={stroke} />
      <path d="M52,76 L76,44 L108,62 Z" fill="rgba(29,106,58,0.09)" stroke={stroke} strokeWidth="2.3" strokeLinejoin="round" />
      <path d="M52,76 L96,68 L108,62" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
      <path d="M76,44 Q102,34 126,40" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M72,42 Q94,33 116,36" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      <path d="M84,44 Q100,34 122,40 L126,48 Q108,52 90,50 Z" fill="rgba(29,106,58,0.2)" />
      <line x1="126" y1="40" x2="132" y2="56" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <line x1="128" y1="54" x2="168" y2="72" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="134" y1="52" x2="174" y2="70" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M124,37 L144,28 L148,33" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="96" y="56" width="28" height="18" rx="3" fill="rgba(29,106,58,0.13)" stroke={stroke} strokeWidth="1.5" />
      <path d="M106,72 Q118,80 134,78 Q146,76 150,80" stroke={strokeFaint} strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="186" cy="54" rx="5" ry="4.5" fill="rgba(29,106,58,0.35)" stroke={stroke} strokeWidth="1.5" />
      <line x1="6" y1="68" x2="26" y2="68" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.35" />
      <line x1="2" y1="76" x2="20" y2="76" stroke={stroke} strokeWidth="1" strokeLinecap="round" strokeOpacity="0.22" />
      <line x1="8" y1="60" x2="24" y2="60" stroke={stroke} strokeWidth="1" strokeLinecap="round" strokeOpacity="0.2" />
      <ellipse cx="119" cy="102" rx="72" ry="4" fill="rgba(29,106,58,0.07)" />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

const stats = [
  { value: '500+', label: 'Vaults' },
  { value: '24/7', label: 'Monitoring' },
  { value: '4.9★', label: 'Rating' },
]

const features = [
  { label: 'Vault Security' },
  { label: '24/7 Access' },
  { label: 'Live Tracking' },
  { label: 'Expert Care' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPageV2() {
  const navigate = useNavigate()
  const loginStore = useAuthStore((s) => s.login)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    try {
      const res = await authApi.login(data)
      loginStore(res.token, { id: res.userId, name: res.name, role: res.role as Role })
      if (res.role === 'Owner') {
        navigate('/owner/home')
      } else {
        navigate('/admin/dashboard')
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        'Invalid email or password. Please try again.'
      setServerError(message)
    }
  }

  return (
    <>
      {/* Space Grotesk font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .sg { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      <div className="sg h-screen flex overflow-hidden" style={{ background: '#0D1208' }}>

        {/* ── Left panel — 63% wide, charcoal ─────────────────────── */}
        <div
          className="hidden lg:flex flex-col justify-between px-12 py-9 relative overflow-hidden"
          style={{ width: '63%', background: '#161B22' }}
        >
          {/* Hex-dot texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(29,106,58,0.18) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* BRG ambient glow */}
          <div
            className="absolute -top-32 left-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(29,106,58,0.12) 0%, transparent 65%)' }}
          />
          <div
            className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(29,106,58,0.08) 0%, transparent 65%)' }}
          />

          {/* Brand */}
          <div className="flex items-center gap-3 relative z-10">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #1D6A3A 0%, #22843F 100%)', color: '#fff' }}
            >
              MV
            </div>
            <div>
              <span className="text-white font-semibold tracking-wide" style={{ fontSize: '1.1rem' }}>
                MOTO<span style={{ color: '#1D9E75' }}>VAULT</span>
              </span>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>Vehicle Hostel</div>
            </div>
          </div>

          {/* Hero content — centred */}
          <div className="flex flex-col items-start gap-7 relative z-10 max-w-md">

            {/* Eyebrow badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(29,106,58,0.2)', border: '1px solid rgba(29,106,58,0.35)', color: '#4ADE80' }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: '#1D9E75' }} />
              Premium vehicle storage &amp; care
            </div>

            {/* Headline */}
            <div>
              <h1
                className="font-bold leading-tight"
                style={{ fontSize: '2.6rem', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15 }}
              >
                Your Vehicle's<br />
                <span style={{ color: '#1D9E75' }}>Safe Haven.</span>
              </h1>
              <p className="mt-3 text-base" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 340 }}>
                Trusted storage, expert care, and total peace of mind — all in one place.
              </p>
            </div>

            {/* Motorcycle illustration */}
            <div
              className="w-full rounded-2xl flex items-center justify-center py-6 px-4"
              style={{
                background: 'linear-gradient(135deg, rgba(29,106,58,0.10) 0%, rgba(22,27,34,0.5) 100%)',
                border: '1px solid rgba(29,106,58,0.22)',
                boxShadow: '0 0 50px rgba(29,106,58,0.08) inset',
              }}
            >
              <MotorcycleIllustration />
            </div>

            {/* Stats + feature strip */}
            <div className="flex items-center gap-3 flex-wrap">
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center px-4 py-2.5 rounded-xl"
                  style={{ background: 'rgba(29,106,58,0.12)', border: '1px solid rgba(29,106,58,0.2)' }}
                >
                  <span className="text-white font-bold text-sm">{value}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
                </div>
              ))}
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
              {features.map(({ label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#1D9E75' }}
                  />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs relative z-10" style={{ color: 'rgba(255,255,255,0.2)' }}>
            &copy; {new Date().getFullYear()} MotoVault. All rights reserved.
          </p>
        </div>

        {/* ── Right panel — 37%, diagonal left edge ────────────────── */}
        <div
          className="flex-1 flex items-center justify-center relative overflow-hidden"
          style={{ background: '#F5F7FA' }}
        >
          {/* Diagonal cut on the left edge */}
          <div
            className="absolute left-0 top-0 bottom-0 pointer-events-none"
            style={{
              width: 80,
              background: 'linear-gradient(to bottom right, #161B22 50%, transparent 50%)',
              zIndex: 1,
            }}
          />
          {/* Second triangle to complete the parallelogram slash */}
          <div
            className="absolute left-0 top-0 bottom-0 pointer-events-none"
            style={{
              width: 80,
              background: 'linear-gradient(to top right, #161B22 50%, transparent 50%)',
              opacity: 0,
            }}
          />

          {/* Actual diagonal using clip-path on an overlay strip */}
          <div
            className="absolute inset-y-0 left-0 pointer-events-none"
            style={{
              width: 56,
              background: '#161B22',
              clipPath: 'polygon(0 0, 100% 0, 30% 100%, 0 100%)',
              zIndex: 2,
            }}
          />

          {/* Form card */}
          <div className="relative z-10 w-full max-w-sm px-8">
            {/* Mobile brand */}
            <div className="flex items-center gap-2 mb-7 lg:hidden">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                style={{ background: '#1D6A3A' }}
              >
                MV
              </div>
              <span className="font-semibold" style={{ color: '#161B22' }}>MotoVault</span>
            </div>

            <div className="mb-8">
              <h2 className="font-bold" style={{ fontSize: '1.7rem', color: '#161B22', letterSpacing: '-0.02em' }}>
                Welcome back
              </h2>
              <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>Sign in to access your vault</p>
            </div>

            {serverError && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="v2-email" className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  Email address
                </label>
                <input
                  id="v2-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                  style={{
                    border: errors.email ? '1.5px solid #F87171' : '1.5px solid #E5E7EB',
                    background: '#fff',
                    color: '#111827',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => { if (!errors.email) e.currentTarget.style.borderColor = '#1D6A3A' }}
                  onBlur={(e) => { if (!errors.email) e.currentTarget.style.borderColor = '#E5E7EB' }}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="v2-password" className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="v2-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register('password')}
                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition"
                    style={{
                      border: errors.password ? '1.5px solid #F87171' : '1.5px solid #E5E7EB',
                      background: '#fff',
                      color: '#111827',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => { if (!errors.password) e.currentTarget.style.borderColor = '#1D6A3A' }}
                    onBlur={(e) => { if (!errors.password) e.currentTarget.style.borderColor = '#E5E7EB' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#9CA3AF' }}
                    tabIndex={-1}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl py-3 text-sm font-semibold text-white transition"
                style={{
                  background: isSubmitting ? '#15803D' : 'linear-gradient(135deg, #1D6A3A 0%, #166534 100%)',
                  boxShadow: '0 4px 14px rgba(29,106,58,0.35)',
                  fontFamily: 'inherit',
                  letterSpacing: '0.01em',
                  opacity: isSubmitting ? 0.75 : 1,
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-2a8 8 0 01-8-8z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Unlock Vault →'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: '#6B7280' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold" style={{ color: '#1D6A3A' }}>
                Register here
              </Link>
            </p>

            {/* Preview notice */}
            <div
              className="mt-8 px-3 py-2 rounded-lg text-center text-xs"
              style={{ background: 'rgba(29,106,58,0.07)', color: '#166534', border: '1px solid rgba(29,106,58,0.15)' }}
            >
              Prototype — <Link to="/login" className="underline">back to current design</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
