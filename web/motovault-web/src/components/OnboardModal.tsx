import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IconMotorbike, IconCar, IconEye, IconEyeOff } from '@tabler/icons-react'
import Modal from './Modal'
import { subscriptionsApi } from '../api/subscriptions'
import { vehiclesApi } from '../api/vehicles'
import { usersApi } from '../api/users'
import { packagesApi } from '../api/packages'
import { slotsApi } from '../api/slots'
import type { VehicleType } from '../types'

const slotLabel = (type: VehicleType, num: number) =>
  `${type === 'Bike' ? 'B' : 'C'}-${String(num).padStart(2, '0')}`

type OwnerMode = 'new' | 'existing'

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
  if (duration === '1w')      d.setDate(d.getDate() + 7)
  else if (duration === '2w') d.setDate(d.getDate() + 14)
  else if (duration === '1m') d.setMonth(d.getMonth() + 1)
  else if (duration === '3m') d.setMonth(d.getMonth() + 3)
  else if (duration === '6m') d.setMonth(d.getMonth() + 6)
  else if (duration === '1y') d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

const EMPTY_NEW_OWNER = { name: '', email: '', phone: '', password: '' }
const EMPTY_VEHICLE   = { type: 'Bike' as VehicleType, brand: '', model: '', registrationNumber: '' }
const EMPTY_SUB       = { packageId: '', slotId: '', startDate: new Date().toISOString().slice(0, 10), duration: '1m' }

export default function OnboardModal({ open, onClose, onSuccess }: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [ownerMode, setOwnerMode] = useState<OwnerMode>('new')
  const [newOwner, setNewOwner] = useState(EMPTY_NEW_OWNER)
  const [existingOwnerId, setExistingOwnerId] = useState('')
  const [vehicle, setVehicle] = useState(EMPTY_VEHICLE)
  const [sub, setSub] = useState(EMPTY_SUB)
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { data: owners = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
    enabled: open,
    select: (u) => u.filter((x) => x.role === 'Owner'),
  })

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: packagesApi.getAll,
    enabled: open,
    select: (p) => p.filter((x) => x.isActive),
  })

  const { data: allSlots = [] } = useQuery({
    queryKey: ['slots'],
    queryFn: slotsApi.getAll,
    enabled: open,
  })

  const slots = useMemo(
    () => allSlots.filter((x) => x.status === 'Available' && x.type === vehicle.type),
    [allSlots, vehicle.type],
  )

  const reset = () => {
    setStep(1); setOwnerMode('new'); setNewOwner(EMPTY_NEW_OWNER)
    setExistingOwnerId(''); setVehicle(EMPTY_VEHICLE); setSub(EMPTY_SUB)
    setShowPw(false); setErrors({}); setSubmitting(false); setSubmitError('')
  }

  const handleClose = () => { reset(); onClose() }

  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (ownerMode === 'new') {
      if (newOwner.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
      if (!newOwner.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newOwner.email)) e.email = 'Enter a valid email'
      if (newOwner.password.length < 6) e.password = 'Password must be at least 6 characters'
    } else {
      if (!existingOwnerId) e.existingOwner = 'Select an owner'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep3 = () => {
    const e: Record<string, string> = {}
    if (!sub.packageId) e.packageId = 'Select a package'
    if (!sub.slotId)    e.slotId    = 'Select a slot'
    if (!sub.startDate) e.startDate = 'Select a start date'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return
    setErrors({})
    setStep((s) => (s === 1 ? 2 : 3) as 1 | 2 | 3)
  }

  const prevStep = () => {
    setErrors({})
    setStep((s) => (s === 3 ? 2 : 1) as 1 | 2 | 3)
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return
    setSubmitting(true)
    setSubmitError('')

    const extractError = (err: unknown, stepName: string) => {
      const e = err as { response?: { data?: Record<string, unknown> | string; status?: number } }
      const data = e?.response?.data
      const detail = typeof data === 'object' && data !== null
        ? (data.detail ?? data.message ?? data.title ?? JSON.stringify(data))
        : data
      return `[${stepName}] ${detail ?? `HTTP ${e?.response?.status ?? 'error'}`}`
    }

    try {
      let ownerId = existingOwnerId
      if (ownerMode === 'new') {
        let created
        try {
          created = await usersApi.create({
            name: newOwner.name.trim(),
            email: newOwner.email.trim(),
            phone: newOwner.phone.trim() || undefined,
            role: 'Owner',
            password: newOwner.password,
          })
        } catch (err) { throw new Error(extractError(err, 'Create owner')) }
        ownerId = created.id
      }

      let createdVehicle
      try {
        createdVehicle = await vehiclesApi.create({
          ownerId,
          type: vehicle.type,
          brand: vehicle.brand.trim() || undefined,
          model: vehicle.model.trim() || undefined,
          registrationNumber: vehicle.registrationNumber.trim() || undefined,
        })
      } catch (err) { throw new Error(extractError(err, 'Create vehicle')) }

      try {
        await subscriptionsApi.create({
          vehicleId: createdVehicle.id,
          packageId: sub.packageId,
          slotId: sub.slotId,
          startDate: sub.startDate,
          endDate: calcEndDate(sub.startDate, sub.duration),
        })
      } catch (err) { throw new Error(extractError(err, 'Create subscription')) }

      reset()
      onSuccess()
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Unexpected error — check backend logs.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = (field: string) =>
    `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
      errors[field]
        ? 'border-red-400 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20'
    }`

  const stepLabels = ['Owner', 'Vehicle', 'Subscription']

  return (
    <Modal open={open} onClose={handleClose} title="Walk-in Onboard" maxWidth="max-w-lg">
      <div className="px-6 pb-6 pt-4 space-y-5">

        {/* Step indicator */}
        <div className="flex items-center gap-0">
          {stepLabels.map((label, i) => {
            const n = i + 1
            const active = step === n
            const done   = step > n
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                    style={done
                      ? { background: '#EAF3DE', color: '#3B6D11' }
                      : active
                      ? { background: '#4A90D9', color: '#fff' }
                      : { background: '#F0F3F9', color: '#8A97B0' }}
                  >
                    {done ? '✓' : n}
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: active ? '#4A90D9' : '#8A97B0' }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div className="flex-1 h-0.5 mb-5 mx-1" style={{ background: done ? '#C3DCAD' : '#E8EDF5' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step 1: Owner */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(['new', 'existing'] as const).map((m) => (
                <button key={m} type="button"
                  onClick={() => { setOwnerMode(m); setErrors({}) }}
                  className="rounded-lg border py-2 text-sm font-semibold transition"
                  style={ownerMode === m
                    ? { borderColor: '#4A90D9', background: '#EAF3FB', color: '#185FA5' }
                    : { borderColor: '#D1D9E8', color: '#8A97B0' }}
                >
                  {m === 'new' ? 'New Owner' : 'Existing Owner'}
                </button>
              ))}
            </div>

            {ownerMode === 'new' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full name <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="e.g. Rajesh Kumar"
                    value={newOwner.name}
                    onChange={(e) => setNewOwner((p) => ({ ...p, name: e.target.value }))}
                    className={inputCls('name')}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-400">*</span></label>
                  <input type="email" placeholder="rajesh@email.com"
                    value={newOwner.email}
                    onChange={(e) => setNewOwner((p) => ({ ...p, email: e.target.value }))}
                    className={inputCls('email')}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" placeholder="+91 98765 43210"
                    value={newOwner.phone}
                    onChange={(e) => setNewOwner((p) => ({ ...p, phone: e.target.value }))}
                    className={inputCls('phone')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temporary password <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                      value={newOwner.password}
                      onChange={(e) => setNewOwner((p) => ({ ...p, password: e.target.value }))}
                      className={`${inputCls('password')} pr-10`}
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showPw ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select owner <span className="text-red-400">*</span></label>
                <select value={existingOwnerId} onChange={(e) => setExistingOwnerId(e.target.value)} className={inputCls('existingOwner')}>
                  <option value="">— choose owner —</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}{o.email ? ` (${o.email})` : ''}</option>
                  ))}
                </select>
                {errors.existingOwner && <p className="mt-1 text-xs text-red-600">{errors.existingOwner}</p>}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Vehicle */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle type <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {(['Bike', 'Car'] as const).map((t) => (
                  <button key={t} type="button"
                    onClick={() => { setVehicle((p) => ({ ...p, type: t })); setSub((p) => ({ ...p, slotId: '' })) }}
                    className="flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-semibold transition"
                    style={vehicle.type === t
                      ? { borderColor: '#4A90D9', background: '#EAF3FB', color: '#185FA5' }
                      : { borderColor: '#D1D9E8', color: '#8A97B0' }}
                  >
                    {t === 'Bike' ? <IconMotorbike size={16} /> : <IconCar size={16} />}
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input type="text" placeholder="e.g. Honda"
                  value={vehicle.brand}
                  onChange={(e) => setVehicle((p) => ({ ...p, brand: e.target.value }))}
                  className={inputCls('')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input type="text" placeholder="e.g. Activa"
                  value={vehicle.model}
                  onChange={(e) => setVehicle((p) => ({ ...p, model: e.target.value }))}
                  className={inputCls('')}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration number</label>
              <input type="text" placeholder="e.g. KL 01 AB 1234"
                value={vehicle.registrationNumber}
                onChange={(e) => setVehicle((p) => ({ ...p, registrationNumber: e.target.value.toUpperCase() }))}
                className={inputCls('')}
              />
            </div>
          </div>
        )}

        {/* Step 3: Subscription */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package <span className="text-red-400">*</span></label>
              <select value={sub.packageId} onChange={(e) => setSub((p) => ({ ...p, packageId: e.target.value }))} className={inputCls('packageId')}>
                <option value="">— choose package —</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}{pkg.price != null ? ` — ₹${pkg.price.toLocaleString('en-IN')}/mo` : ''}
                  </option>
                ))}
              </select>
              {errors.packageId && <p className="mt-1 text-xs text-red-600">{errors.packageId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slot ({vehicle.type} — available only) <span className="text-red-400">*</span>
              </label>
              <select value={sub.slotId} onChange={(e) => setSub((p) => ({ ...p, slotId: e.target.value }))} className={inputCls('slotId')}>
                <option value="">— choose slot —</option>
                {slots.map((sl) => (
                  <option key={sl.id} value={sl.id}>{slotLabel(sl.type, sl.slotNumber)}</option>
                ))}
              </select>
              {slots.length === 0 && <p className="mt-1 text-xs text-amber-600">No available {vehicle.type} slots right now.</p>}
              {errors.slotId && <p className="mt-1 text-xs text-red-600">{errors.slotId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start date <span className="text-red-400">*</span></label>
              <input type="date" value={sub.startDate}
                onChange={(e) => setSub((p) => ({ ...p, startDate: e.target.value }))}
                className={inputCls('startDate')}
              />
              {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button"
                    onClick={() => setSub((p) => ({ ...p, duration: opt.value }))}
                    className="rounded-lg border py-2 text-xs font-semibold transition"
                    style={sub.duration === opt.value
                      ? { borderColor: '#4A90D9', background: '#EAF3FB', color: '#185FA5' }
                      : { borderColor: '#D1D9E8', color: '#8A97B0' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {sub.startDate && (
              <div className="rounded-lg px-4 py-3 flex items-center justify-between"
                style={{ background: '#F7F9FC', border: '0.5px solid #DDE3EF' }}>
                <span className="text-xs" style={{ color: '#8A97B0' }}>Expires on</span>
                <span className="text-sm font-semibold" style={{ color: '#0D1B3E' }}>
                  {new Date(calcEndDate(sub.startDate, sub.duration) + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>
            )}
            {submitError && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{submitError}</p>
            )}
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex gap-3 pt-1">
          {step > 1 ? (
            <button type="button" onClick={prevStep}
              className="flex-1 rounded-lg py-2.5 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
              Back
            </button>
          ) : (
            <button type="button" onClick={handleClose}
              className="flex-1 rounded-lg py-2.5 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
          )}
          {step < 3 ? (
            <button type="button" onClick={nextStep}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: '#4A90D9' }}>
              Next
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#4A90D9' }}>
              {submitting ? 'Onboarding…' : 'Confirm & Onboard'}
            </button>
          )}
        </div>

      </div>
    </Modal>
  )
}
