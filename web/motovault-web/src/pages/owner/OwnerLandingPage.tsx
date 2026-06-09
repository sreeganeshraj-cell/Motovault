import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  IconShieldCheck, IconTool, IconCamera, IconBolt,
  IconMotorbike, IconCar, IconLogout, IconArrowRight,
  IconBuildingWarehouse, IconCalendarEvent, IconStar,
} from '@tabler/icons-react'
import { useAuthStore } from '../../store/authStore'
import { packagesApi } from '../../api/packages'
import BookingModal from '../../components/BookingModal'

// ─── Image URLs (replace with real photos before launch) ─────────────────────

const IMG = {
  hero:    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
  concept: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=900&q=80',
  bike1:   'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80',
  car1:    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80',
  garage:  'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=600&q=80',
  slots:   'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&q=80',
}

function imgFallback(e: React.SyntheticEvent<HTMLImageElement>, color: string) {
  const el = e.currentTarget
  el.style.display = 'none'
  const parent = el.parentElement
  if (parent) parent.style.background = color
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureCard({ icon: Icon, title, desc, accent }: {
  icon: React.ElementType; title: string; desc: string; accent: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl p-6" style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: accent + '20' }}>
        <Icon size={22} style={{ color: accent }} />
      </div>
      <div>
        <div className="font-bold text-sm mb-1" style={{ color: '#0D1B3E' }}>{title}</div>
        <p className="text-xs leading-relaxed" style={{ color: '#8A97B0' }}>{desc}</p>
      </div>
    </div>
  )
}

function StepBadge({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 mt-0.5"
        style={{ background: '#4A90D9' }}
      >
        {n}
      </div>
      <div>
        <div className="font-bold text-sm mb-1" style={{ color: '#0D1B3E' }}>{title}</div>
        <p className="text-xs leading-relaxed" style={{ color: '#8A97B0' }}>{desc}</p>
      </div>
    </div>
  )
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OwnerLandingPage() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: packagesApi.getAll,
  })
  const activePackages = packages.filter((p) => p.isActive)

  function handleLogout() { logout(); navigate('/login') }

  return (
    <div className="min-h-screen" style={{ background: '#F0F3F9', fontFamily: 'inherit' }}>

      {/* ── Sticky Header ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center px-6 lg:px-10 gap-4"
        style={{ height: 52, background: '#0D1B3E', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 select-none">
          <div className="w-6 h-6 border-2 rounded-sm flex items-center justify-center" style={{ borderColor: '#4A90D9' }}>
            <div className="w-2.5 h-2.5 rounded-full border" style={{ borderColor: '#4A90D9' }} />
          </div>
          <span className="text-white font-bold text-sm tracking-widest">
            MOTO<span style={{ color: '#4A90D9' }}>VAULT</span>
          </span>
        </div>

        <div className="flex-1" />

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: 'Facilities', href: '#facilities' },
            { label: 'Packages', href: '#packages' },
            { label: 'How it works', href: '#how-it-works' },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="w-px h-5 mx-2 hidden md:block" style={{ background: 'rgba(255,255,255,0.12)' }} />

        {user && (
          <>
            <button
              onClick={() => navigate('/owner/subscription')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.65)', border: '0.5px solid rgba(255,255,255,0.18)' }}
            >
              My Portal
            </button>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold cursor-pointer select-none"
              style={{ background: '#1D9E75', fontSize: 10 }}
              title={user.name}
            >
              {initials(user.name)}
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition"
            >
              <IconLogout size={15} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>
          </>
        )}
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: '92vh' }}
      >
        {/* Background image */}
        <div className="absolute inset-0" style={{ background: '#0a1428' }}>
          <img
            src={IMG.hero}
            alt=""
            onError={(e) => imgFallback(e, '#0a1428')}
            className="w-full h-full object-cover opacity-40"
            style={{ objectPosition: 'center 40%' }}
          />
          {/* gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(13,27,62,0.92) 0%, rgba(13,27,62,0.65) 60%, rgba(13,27,62,0.82) 100%)' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold"
            style={{ background: 'rgba(74,144,217,0.15)', border: '0.5px solid rgba(74,144,217,0.4)', color: '#4A90D9' }}
          >
            <IconStar size={12} />
            Kerala's First Professional Vehicle Hostel
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
            Your Vehicle's<br />
            <span style={{ color: '#4A90D9' }}>Home Away</span><br />
            from Home
          </h1>

          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Professional storage, expert maintenance, and complete peace of mind — all in one secure facility. We treat your vehicle the way you do.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setBookingOpen(true)}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white text-sm transition hover:opacity-90 active:scale-95"
              style={{ background: '#4A90D9', boxShadow: '0 0 30px rgba(74,144,217,0.4)' }}
            >
              Reserve Your Slot
              <IconArrowRight size={16} />
            </button>
            <a
              href="#packages"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)' }}
            >
              View Packages
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5" style={{ borderColor: 'rgba(255,255,255,0.25)' }}>
            <div className="w-1 h-2 rounded-full" style={{ background: '#4A90D9' }} />
          </div>
        </div>
      </section>

      {/* ── Trust Strip ────────────────────────────────────────────── */}
      <section style={{ background: '#0D1B3E' }}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap justify-center gap-8">
          {[
            { icon: IconBuildingWarehouse, label: '50+ Storage Bays' },
            { icon: IconShieldCheck,       label: 'Secure 24 / 7'    },
            { icon: IconTool,              label: 'Expert Technicians' },
            { icon: IconCamera,            label: 'Photo Reports'     },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon size={16} style={{ color: '#4A90D9' }} />
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Concept ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden" style={{ height: 360, background: '#CBD5E1' }}>
            <img
              src={IMG.concept}
              alt="MotoVault facility"
              onError={(e) => imgFallback(e, '#CBD5E1')}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div
              className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider"
              style={{ background: '#EBF4FD', color: '#185FA5' }}
            >
              The Vehicle Hostel Concept
            </div>
            <h2 className="text-3xl font-black mb-4 leading-tight" style={{ color: '#0D1B3E' }}>
              More than a parking space — it's a sanctuary
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#4A5580' }}>
              At MotoVault, we invented the concept of a <strong>Vehicle Hostel</strong> — a dedicated, climate-aware facility where your bike or car lives safely while you're away, and receives professional care during its stay.
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#4A5580' }}>
              Each vehicle gets an assigned bay, regular health checks, and a documented service history with photographic records. Think of it as a five-star stay for your machine.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: IconMotorbike, label: 'Bike Bays', sub: 'Climate-monitored' },
                { icon: IconCar,       label: 'Car Bays',  sub: 'Dedicated spaces'  },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="rounded-xl p-3 flex items-center gap-3" style={{ background: '#F7F9FC', border: '0.5px solid #DDE3EF' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#EBF4FD' }}>
                    <Icon size={18} style={{ color: '#185FA5' }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: '#0D1B3E' }}>{label}</div>
                    <div className="text-[10px]" style={{ color: '#8A97B0' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="facilities" className="py-16" style={{ background: '#fff' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#4A90D9' }}>Why MotoVault</div>
            <h2 className="text-3xl font-black" style={{ color: '#0D1B3E' }}>Everything your vehicle deserves</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={IconShieldCheck}
              title="Secure Storage Bay"
              desc="Assigned numbered bay with CCTV monitoring and secure access control. Your vehicle never sits in an open lot."
              accent="#185FA5"
            />
            <FeatureCard
              icon={IconTool}
              title="Expert Maintenance"
              desc="Monthly service by qualified technicians — engine oil, tyres, brakes, battery and full visual inspection."
              accent="#1D9E75"
            />
            <FeatureCard
              icon={IconCamera}
              title="Photo & Video Reports"
              desc="Before and after photos for every service. See exactly what was done from your phone, anytime."
              accent="#B45309"
            />
            <FeatureCard
              icon={IconBolt}
              title="Instant Activity Alerts"
              desc="Real-time service logs and updates so you always know your vehicle's status without stepping in."
              accent="#6D28D9"
            />
          </div>
        </div>
      </section>

      {/* ── Gallery ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black" style={{ color: '#0D1B3E' }}>Inside MotoVault</h2>
          <p className="text-sm mt-1" style={{ color: '#8A97B0' }}>A peek at where your vehicle will live</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { src: IMG.bike1,  label: 'Bike Bay',       color: '#1e3a5f' },
            { src: IMG.car1,   label: 'Car Storage',    color: '#3b1f0e' },
            { src: IMG.garage, label: 'Facility Entry', color: '#1a2e1a' },
            { src: IMG.slots,  label: 'Numbered Slots', color: '#1c1c2e' },
          ].map(({ src, label, color }) => (
            <div key={label} className="relative rounded-xl overflow-hidden group" style={{ height: 180, background: color }}>
              <img
                src={src}
                alt={label}
                onError={(e) => imgFallback(e, color)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 flex items-end p-3"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }}
              >
                <span className="text-xs font-semibold text-white">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Packages ───────────────────────────────────────────────── */}
      <section id="packages" className="py-16" style={{ background: '#fff' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#4A90D9' }}>Pricing</div>
            <h2 className="text-3xl font-black" style={{ color: '#0D1B3E' }}>Choose your plan</h2>
            <p className="text-sm mt-2" style={{ color: '#8A97B0' }}>All plans include a dedicated bay and regular health checks</p>
          </div>

          {activePackages.length === 0 ? (
            <p className="text-center text-sm" style={{ color: '#B0BCCF' }}>Loading packages…</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePackages.map((pkg, i) => {
                const featured = i === 1
                return (
                  <div
                    key={pkg.id}
                    className="rounded-2xl overflow-hidden flex flex-col"
                    style={{
                      background: featured ? '#0D1B3E' : '#fff',
                      border: featured ? 'none' : '0.5px solid #DDE3EF',
                      boxShadow: featured ? '0 20px 60px rgba(13,27,62,0.25)' : 'none',
                      transform: featured ? 'scale(1.04)' : 'none',
                    }}
                  >
                    {featured && (
                      <div className="text-center py-2 text-[10px] font-bold uppercase tracking-widest" style={{ background: '#4A90D9', color: '#fff' }}>
                        Most Popular
                      </div>
                    )}
                    <div className="p-6 flex flex-col gap-4 flex-1">
                      <div>
                        <div className="font-bold text-lg mb-1" style={{ color: featured ? '#fff' : '#0D1B3E' }}>{pkg.name}</div>
                        {pkg.price != null && (
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black" style={{ color: featured ? '#4A90D9' : '#0D1B3E' }}>
                              ₹{pkg.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs" style={{ color: featured ? 'rgba(255,255,255,0.4)' : '#8A97B0' }}>/month</span>
                          </div>
                        )}
                      </div>
                      {pkg.description && (
                        <p className="text-xs leading-relaxed" style={{ color: featured ? 'rgba(255,255,255,0.55)' : '#8A97B0' }}>
                          {pkg.description}
                        </p>
                      )}
                      <div className="mt-auto pt-2">
                        <button
                          onClick={() => setBookingOpen(true)}
                          className="w-full py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
                          style={{
                            background: featured ? '#4A90D9' : '#EBF4FD',
                            color: featured ? '#fff' : '#185FA5',
                          }}
                        >
                          Book This Plan
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#4A90D9' }}>Simple Process</div>
            <h2 className="text-3xl font-black mb-8" style={{ color: '#0D1B3E' }}>How it works</h2>
            <div className="flex flex-col gap-7">
              <StepBadge
                n={1}
                title="Create your account"
                desc="Register in under a minute. No paperwork, no deposit needed upfront."
              />
              <StepBadge
                n={2}
                title="Book your slot"
                desc="Pick a package that fits your needs, add your vehicle details, and choose your storage duration."
              />
              <StepBadge
                n={3}
                title="Drop off your vehicle"
                desc="Bring your vehicle to our facility. We assign your numbered bay and take over from there."
              />
              <StepBadge
                n={4}
                title="Track everything online"
                desc="Log in anytime to see service reports, photos, and your vehicle's status — from anywhere."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: IconCalendarEvent, label: 'Book Online',      sub: 'Pick date & package',        color: '#EBF4FD', accent: '#185FA5' },
              { icon: IconBuildingWarehouse, label: 'Assigned Bay', sub: 'Your own numbered slot',     color: '#EAF3DE', accent: '#3B6D11' },
              { icon: IconTool,          label: 'Regular Care',     sub: 'Monthly service done for you', color: '#FFF0D9', accent: '#B45309' },
              { icon: IconCamera,        label: 'Photo Proof',      sub: 'Every service documented',   color: '#EDE9FE', accent: '#6D28D9' },
            ].map(({ icon: Icon, label, sub, color, accent }) => (
              <div key={label} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: color }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#fff' }}>
                  <Icon size={18} style={{ color: accent }} />
                </div>
                <div className="text-xs font-bold" style={{ color: '#0D1B3E' }}>{label}</div>
                <div className="text-[10px]" style={{ color: '#8A97B0' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#0D1B3E' }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #4A90D9 0%, transparent 60%), radial-gradient(circle at 80% 50%, #1D9E75 0%, transparent 60%)' }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to give your vehicle<br />the care it deserves?
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Join MotoVault today. Slots fill up fast — secure yours now.
          </p>
          <button
            onClick={() => setBookingOpen(true)}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-white text-sm transition hover:opacity-90 active:scale-95"
            style={{ background: '#4A90D9', boxShadow: '0 0 40px rgba(74,144,217,0.4)' }}
          >
            Reserve Your Slot Today
            <IconArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{ background: '#060e1f' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 border-2 rounded-sm flex items-center justify-center" style={{ borderColor: '#4A90D9' }}>
              <div className="w-2 h-2 rounded-full border" style={{ borderColor: '#4A90D9' }} />
            </div>
            <span className="text-white font-bold text-xs tracking-widest">
              MOTO<span style={{ color: '#4A90D9' }}>VAULT</span>
            </span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            &copy; {new Date().getFullYear()} MotoVault. All rights reserved.
          </p>
        </div>
      </footer>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  )
}
