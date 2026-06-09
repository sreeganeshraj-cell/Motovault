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

function MotorcycleIllustration() {
  return (
    <svg width="240" height="106" viewBox="0 0 240 106" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rear wheel */}
      <circle cx="52" cy="76" r="26" stroke="#4A90D9" strokeWidth="2.5" />
      <circle cx="52" cy="76" r="12" stroke="#4A90D9" strokeWidth="1.5" strokeOpacity="0.45" />
      <circle cx="52" cy="76" r="4" fill="#4A90D9" />

      {/* Front wheel */}
      <circle cx="186" cy="76" r="22" stroke="#4A90D9" strokeWidth="2.5" />
      <circle cx="186" cy="76" r="10" stroke="#4A90D9" strokeWidth="1.5" strokeOpacity="0.45" />
      <circle cx="186" cy="76" r="4" fill="#4A90D9" />

      {/* Main frame triangle (rear axle → seat post → engine) */}
      <path d="M52,76 L76,44 L108,62 Z" fill="rgba(74,144,217,0.07)" stroke="#4A90D9" strokeWidth="2.3" strokeLinejoin="round" />

      {/* Rear sub-frame */}
      <path d="M52,76 L96,68 L108,62" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />

      {/* Top tube (seat → head) */}
      <path d="M76,44 Q102,34 126,40" stroke="#4A90D9" strokeWidth="2.5" strokeLinecap="round" />

      {/* Seat */}
      <path d="M72,42 Q94,33 116,36" stroke="#4A90D9" strokeWidth="4" strokeLinecap="round" />

      {/* Tank (filled) */}
      <path d="M84,44 Q100,34 122,40 L126,48 Q108,52 90,50 Z" fill="rgba(74,144,217,0.18)" />

      {/* Head tube */}
      <line x1="126" y1="40" x2="132" y2="56" stroke="#4A90D9" strokeWidth="3" strokeLinecap="round" />

      {/* Fork — two legs */}
      <line x1="128" y1="54" x2="168" y2="72" stroke="#4A90D9" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="134" y1="52" x2="174" y2="70" stroke="#4A90D9" strokeWidth="2.5" strokeLinecap="round" />

      {/* Handlebar */}
      <path d="M124,37 L144,28 L148,33" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Engine block */}
      <rect x="96" y="56" width="28" height="18" rx="3" fill="rgba(74,144,217,0.12)" stroke="#4A90D9" strokeWidth="1.5" />

      {/* Exhaust */}
      <path d="M106,72 Q118,80 134,78 Q146,76 150,80" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.55" />

      {/* Headlight */}
      <ellipse cx="186" cy="54" rx="5" ry="4.5" fill="rgba(74,144,217,0.4)" stroke="#4A90D9" strokeWidth="1.5" />

      {/* Motion speed lines */}
      <line x1="6" y1="68" x2="26" y2="68" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.35" />
      <line x1="2" y1="76" x2="20" y2="76" stroke="#4A90D9" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.22" />
      <line x1="8" y1="60" x2="24" y2="60" stroke="#4A90D9" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.2" />

      {/* Ground shadow */}
      <ellipse cx="119" cy="102" rx="72" ry="4" fill="rgba(74,144,217,0.07)" />
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
  { value: '500+', label: 'Vaults Secured' },
  { value: '24/7', label: 'Monitoring' },
  { value: '4.9★', label: 'Rating' },
]

const features = [
  {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    label: 'Vault Security',
  },
  {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    label: '24/7 Access',
  },
  {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    label: 'Live Tracking',
  },
  {
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>,
    label: 'Expert Care',
  },
]

export default function LoginPage() {
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
    <div className="h-screen flex overflow-hidden">

      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between px-10 py-8 relative overflow-hidden"
        style={{ backgroundColor: '#0D1B3E' }}
      >
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(74,144,217,0.12) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* Ambient glow — top right */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(74,144,217,0.11) 0%, transparent 68%)' }} />
        {/* Ambient glow — bottom left */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(29,158,117,0.09) 0%, transparent 68%)' }} />

        {/* Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: '#4A90D9', color: '#fff' }}>
            MV
          </div>
          <span className="text-white text-lg font-semibold tracking-wide">MotoVault</span>
        </div>

        {/* Hero — centered */}
        <div className="flex flex-col items-center text-center gap-5 relative z-10">

          {/* Illustration in a framed card */}
          <div
            className="w-full max-w-xs rounded-2xl flex items-center justify-center py-5"
            style={{
              background: 'linear-gradient(135deg, rgba(74,144,217,0.08) 0%, rgba(29,158,117,0.05) 100%)',
              border: '1px solid rgba(74,144,217,0.18)',
              boxShadow: '0 0 40px rgba(74,144,217,0.10) inset',
            }}
          >
            <MotorcycleIllustration />
          </div>

          {/* Headline */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-2"
              style={{ backgroundColor: 'rgba(74,144,217,0.15)', color: '#7ab8e8' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ backgroundColor: '#4A90D9' }} />
              Premium vehicle storage &amp; care
            </div>
            <h1 className="text-white font-bold leading-tight" style={{ fontSize: '1.75rem' }}>
              Your Vehicle's<br />
              <span style={{ color: '#4A90D9' }}>Safe Haven</span>
            </h1>
            <p className="text-sm mt-1.5" style={{ color: '#7a9fc0' }}>
              Trusted storage, expert care, total peace of mind.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center py-2.5 rounded-xl"
                style={{ backgroundColor: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.14)' }}>
                <span className="text-white font-bold text-sm">{value}</span>
                <span className="text-xs mt-0.5" style={{ color: '#4d7090', lineHeight: 1.3 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Feature chips — 2×2 grid */}
          <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
            {features.map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ backgroundColor: 'rgba(74,144,217,0.16)' }}>
                  {icon}
                </span>
                <span className="text-xs font-medium" style={{ color: '#9bbdd8' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-center relative z-10" style={{ color: '#3a5570' }}>
          &copy; {new Date().getFullYear()} MotoVault. All rights reserved.
        </p>
      </div>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto"
        style={{ backgroundColor: '#F0F3F9' }}
      >
        <div className="w-full max-w-md">

          {/* Form card */}
          <div className="bg-white rounded-2xl p-8"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 20px rgba(13,27,62,0.07)' }}>

            {/* Mobile brand */}
            <div className="flex items-center gap-2 mb-7 lg:hidden">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                style={{ backgroundColor: '#0D1B3E' }}>MV</div>
              <span className="text-gray-900 text-lg font-semibold">MotoVault</span>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-1 text-sm">Sign in to access your vault</p>
            </div>

            {serverError && (
              <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-300 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register('password')}
                    className={`w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 ${
                      errors.password
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-gray-300 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#4A90D9' }}
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
                  'Unlock Vault'
                )}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium hover:underline" style={{ color: '#4A90D9' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
