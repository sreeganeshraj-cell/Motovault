import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  IconX, IconMotorbike, IconCar, IconArrowRight, IconArrowLeft,
  IconCalendar, IconCheck, IconAlertCircle,
} from '@tabler/icons-react'
import { packagesApi } from '../api/packages'
import { subscriptionsApi } from '../api/subscriptions'
import type { VehicleType } from '../types'

// ─── Duration helpers ─────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { value: '1w', label: '1 Week'   },
  { value: '2w', label: '2 Weeks'  },
  { value: '1m', label: '1 Month'  },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year'   },
]

function calcEndDate(startDate: string, duration: string): string {
  const d = new Date(startDate + 'T00:00:00')
  if      (duration === '1w') d.setDate(d.getDate() + 7)
  else if (duration === '2w') d.setDate(d.getDate() + 14)
  else if (duration === '1m') d.setMonth(d.getMonth() + 1)
  else if (duration === '3m') d.setMonth(d.getMonth() + 3)
  else if (duration === '6m') d.setMonth(d.getMonth() + 6)
  else if (duration === '1y') d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDot({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
        style={{
          background: done ? '#1D9E75' : active ? '#4A90D9' : '#E8EDF5',
          color: done || active ? '#fff' : '#8A97B0',
        }}
      >
        {done ? <IconCheck size={14} /> : n}
      </div>
      <span className="text-[10px] font-semibold" style={{ color: active ? '#0D1B3E' : '#8A97B0' }}>{label}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
}

const today = new Date().toISOString().slice(0, 10)

const EMPTY = {
  vehicleType: 'Bike' as VehicleType,
  brand: '',
  model: '',
  registrationNumber: '',
  packageId: '',
  startDate: today,
  duration: '1m',
}

export default function BookingModal({ open, onClose }: Props) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(EMPTY)
  const [serverError, setServerError] = useState<string | null>(null)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: packagesApi.getAll,
    enabled: open,
  })

  const activePackages = packages.filter((p) => p.isActive)

  const bookMut = useMutation({
    mutationFn: () =>
      subscriptionsApi.book({
        vehicleType: form.vehicleType,
        brand: form.brand || undefined,
        model: form.model || undefined,
        registrationNumber: form.registrationNumber || undefined,
        packageId: form.packageId,
        startDate: form.startDate,
        endDate: calcEndDate(form.startDate, form.duration),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription'] })
      qc.invalidateQueries({ queryKey: ['my-vehicles'] })
      qc.invalidateQueries({ queryKey: ['slots'] })
      handleClose()
      navigate('/owner/subscription')
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string; title?: string } } }).response?.data?.detail ??
        (err as { response?: { data?: { title?: string } } }).response?.data?.title ??
        'Booking failed. Please try again.'
      setServerError(msg)
    },
  })

  function handleClose() {
    setStep(1)
    setForm(EMPTY)
    setServerError(null)
    onClose()
  }

  const selectedPackage = activePackages.find((p) => p.id === form.packageId)
  const endDate = calcEndDate(form.startDate, form.duration)

  const step2Valid = !!form.packageId
  const step3Valid = !!form.startDate

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,27,62,0.55)' }}>
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#fff', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: '#0D1B3E' }}>
          <div>
            <div className="text-white font-bold text-base">Book a Storage Slot</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Step {step} of 3
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition">
            <IconX size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-8 px-6 py-4" style={{ borderBottom: '0.5px solid #EEF1F8' }}>
          <StepDot n={1} label="Vehicle"  active={step === 1} done={step > 1} />
          <div className="w-12 h-px" style={{ background: '#DDE3EF' }} />
          <StepDot n={2} label="Package"  active={step === 2} done={step > 2} />
          <div className="w-12 h-px" style={{ background: '#DDE3EF' }} />
          <StepDot n={3} label="Confirm"  active={step === 3} done={false} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* ── Step 1: Vehicle ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-sm font-semibold mb-3" style={{ color: '#0D1B3E' }}>What type of vehicle?</div>
                <div className="grid grid-cols-2 gap-3">
                  {(['Bike', 'Car'] as VehicleType[]).map((t) => {
                    const active = form.vehicleType === t
                    return (
                      <button
                        key={t}
                        onClick={() => setForm((f) => ({ ...f, vehicleType: t }))}
                        className="flex flex-col items-center gap-2 py-5 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: active ? '#4A90D9' : '#DDE3EF',
                          background: active ? '#EBF4FD' : '#F7F9FC',
                        }}
                      >
                        {t === 'Bike'
                          ? <IconMotorbike size={32} style={{ color: active ? '#185FA5' : '#B0BCCF' }} />
                          : <IconCar       size={32} style={{ color: active ? '#185FA5' : '#B0BCCF' }} />}
                        <span className="text-sm font-semibold" style={{ color: active ? '#0D1B3E' : '#8A97B0' }}>{t}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4A5580' }}>Brand</label>
                  <input
                    value={form.brand}
                    onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                    placeholder="e.g. Honda, Royal Enfield"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2"
                    style={{ borderColor: '#DDE3EF', color: '#0D1B3E' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4A5580' }}>Model</label>
                  <input
                    value={form.model}
                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    placeholder="e.g. CBR, Classic 350"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2"
                    style={{ borderColor: '#DDE3EF', color: '#0D1B3E' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4A5580' }}>
                  Registration Number <span style={{ color: '#B0BCCF', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  value={form.registrationNumber}
                  onChange={(e) => setForm((f) => ({ ...f, registrationNumber: e.target.value.toUpperCase() }))}
                  placeholder="e.g. KL 01 AB 1234"
                  className="w-full rounded-lg border px-3 py-2 text-sm font-mono outline-none transition focus:ring-2"
                  style={{ borderColor: '#DDE3EF', color: '#0D1B3E' }}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Package ─────────────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <div className="text-sm font-semibold mb-1" style={{ color: '#0D1B3E' }}>Choose a package</div>
              {activePackages.map((pkg) => {
                const selected = form.packageId === pkg.id
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setForm((f) => ({ ...f, packageId: pkg.id }))}
                    className="text-left rounded-xl border-2 p-4 transition-all"
                    style={{
                      borderColor: selected ? '#4A90D9' : '#DDE3EF',
                      background: selected ? '#EBF4FD' : '#F7F9FC',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm" style={{ color: '#0D1B3E' }}>{pkg.name}</span>
                      {pkg.price != null && (
                        <span className="text-sm font-bold" style={{ color: selected ? '#185FA5' : '#4A5580' }}>
                          ₹{pkg.price.toLocaleString('en-IN')}<span className="text-xs font-normal">/mo</span>
                        </span>
                      )}
                    </div>
                    {pkg.description && (
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#8A97B0' }}>{pkg.description}</p>
                    )}
                    {selected && (
                      <div className="flex items-center gap-1 mt-2">
                        <IconCheck size={12} style={{ color: '#1D9E75' }} />
                        <span className="text-xs font-semibold" style={{ color: '#1D9E75' }}>Selected</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* ── Step 3: Confirm ─────────────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-5">

              {/* Duration */}
              <div>
                <div className="text-sm font-semibold mb-2" style={{ color: '#0D1B3E' }}>Storage duration</div>
                <div className="grid grid-cols-3 gap-2">
                  {DURATION_OPTIONS.map((opt) => {
                    const active = form.duration === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setForm((f) => ({ ...f, duration: opt.value }))}
                        className="py-2 rounded-lg border-2 text-sm font-semibold transition-all"
                        style={{
                          borderColor: active ? '#4A90D9' : '#DDE3EF',
                          background: active ? '#EBF4FD' : '#F7F9FC',
                          color: active ? '#185FA5' : '#4A5580',
                        }}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Start date */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4A5580' }}>
                  <IconCalendar size={12} className="inline mr-1" />Start date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  min={today}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: '#DDE3EF', color: '#0D1B3E' }}
                />
              </div>

              {/* Expires preview */}
              <div className="rounded-xl p-4" style={{ background: '#F7F9FC', border: '0.5px solid #DDE3EF' }}>
                <div className="text-xs font-semibold mb-0.5" style={{ color: '#8A97B0' }}>Expires on</div>
                <div className="text-base font-bold" style={{ color: '#A32D2D' }}>{fmtDate(endDate)}</div>
              </div>

              {/* Booking summary */}
              <div className="rounded-xl overflow-hidden" style={{ border: '0.5px solid #DDE3EF' }}>
                <div className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ background: '#0D1B3E', color: 'rgba(255,255,255,0.5)' }}>
                  Booking Summary
                </div>
                <div className="px-4 py-3 flex flex-col gap-2">
                  {[
                    ['Vehicle', [form.brand, form.model].filter(Boolean).join(' ') || form.vehicleType],
                    ['Registration', form.registrationNumber || '—'],
                    ['Package', selectedPackage?.name ?? '—'],
                    ['Start', fmtDate(form.startDate)],
                    ['Expires', fmtDate(endDate)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#8A97B0' }}>{label}</span>
                      <span className="text-xs font-semibold" style={{ color: '#0D1B3E' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {serverError && (
                <div className="flex items-start gap-2 rounded-lg px-3 py-2.5" style={{ background: '#FEF0F0', border: '0.5px solid #FECACA' }}>
                  <IconAlertCircle size={14} style={{ color: '#A32D2D', flexShrink: 0, marginTop: 1 }} />
                  <span className="text-xs" style={{ color: '#A32D2D' }}>{serverError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '0.5px solid #EEF1F8', background: '#F7F9FC' }}
        >
          {step > 1 ? (
            <button
              onClick={() => { setStep((s) => s - 1); setServerError(null) }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition hover:bg-white"
              style={{ color: '#4A5580' }}
            >
              <IconArrowLeft size={14} /> Back
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition hover:bg-white"
              style={{ color: '#8A97B0' }}
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 2 && !step2Valid}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              style={{ background: '#4A90D9' }}
            >
              Next <IconArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => bookMut.mutate()}
              disabled={bookMut.isPending || !step3Valid}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              style={{ background: '#1D9E75' }}
            >
              {bookMut.isPending ? 'Booking…' : (
                <><IconCheck size={14} /> Confirm Booking</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
