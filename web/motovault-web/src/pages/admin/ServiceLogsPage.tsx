import { useRef, useState, type ElementType } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  IconClipboardList, IconPlus, IconDroplet, IconGauge, IconRoute, IconTool,
  IconPhoto, IconAlertTriangle, IconX, IconTrash, IconChevronDown,
} from '@tabler/icons-react'
import Modal from '../../components/Modal'
import { serviceLogsApi } from '../../api/serviceLogs'
import { serviceMediaApi } from '../../api/serviceMedia'
import { subscriptionsApi } from '../../api/subscriptions'
import { vehiclesApi } from '../../api/vehicles'
import { useAuthStore } from '../../store/authStore'
import type { ServiceType } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

const schema = z.object({
  vehicleId:   z.string().min(1, 'Select a vehicle'),
  serviceType: z.enum(['Cleaning', 'Idling', 'Ride', 'Service']),
  serviceDate: z.string().min(1, 'Pick a date'),
  notes:       z.string().optional(),
})

type FormData = z.infer<typeof schema>

// ─── Config ───────────────────────────────────────────────────────────────────

const SERVICE_TYPES: ServiceType[] = ['Cleaning', 'Idling', 'Ride', 'Service']

const serviceTypeConfig: Record<ServiceType, { icon: ElementType; bg: string; color: string }> = {
  Cleaning: { icon: IconDroplet, bg: '#EAF3FB', color: '#185FA5' },
  Idling:   { icon: IconGauge,   bg: '#FFF0D9', color: '#B45309' },
  Ride:     { icon: IconRoute,   bg: '#DCFCE7', color: '#166534' },
  Service:  { icon: IconTool,    bg: '#EDE9FE', color: '#6D28D9' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ServiceTypeBadge({ type }: { type: ServiceType }) {
  const { icon: Icon, bg, color } = serviceTypeConfig[type]
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit"
      style={{ background: bg, color }}
    >
      <Icon size={10} />
      {type}
    </span>
  )
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const today = new Date().toISOString().split('T')[0]

const inputCls = (err?: string) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
    err ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20'
  }`

// ─── MediaPanel ───────────────────────────────────────────────────────────────

function MediaPanel({ logId }: { logId: string }) {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['service-media', logId],
    queryFn: () => serviceMediaApi.getByServiceLog(logId),
  })

  const handleAdd = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadError(null)
    try {
      for (const file of Array.from(files)) {
        const { fileUrl, mediaType } = await serviceMediaApi.upload(file)
        await serviceMediaApi.create({ serviceLogId: logId, fileUrl, mediaType })
      }
      qc.invalidateQueries({ queryKey: ['service-media', logId] })
      qc.invalidateQueries({ queryKey: ['service-logs'] })
    } catch {
      setUploadError('Upload failed. Check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await serviceMediaApi.delete(id)
    qc.invalidateQueries({ queryKey: ['service-media', logId] })
    qc.invalidateQueries({ queryKey: ['service-logs'] })
  }

  return (
    <div className="px-5 py-3 border-b" style={{ borderColor: '#EEF1F8', background: '#F7F9FC' }}>
      {isLoading ? (
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-16 h-16 rounded-lg animate-pulse" style={{ background: '#E8EDF5' }} />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 items-center">
          {media.map((m) => (
            <div
              key={m.id}
              className="relative group w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0"
              style={{ borderColor: '#DDE3EF' }}
            >
              {m.mediaType === 'Video' ? (
                <video src={m.fileUrl} className="w-full h-full object-cover" />
              ) : (
                <img src={m.fileUrl} alt="" className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => handleDelete(m.id)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <IconTrash size={14} style={{ color: 'white' }} />
              </button>
            </div>
          ))}
          {media.length === 0 && (
            <span className="text-xs mr-2" style={{ color: '#8A97B0' }}>No photos yet</span>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-16 h-16 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition hover:bg-white/80 disabled:opacity-50 flex-shrink-0"
            style={{ borderColor: '#D1D9E8' }}
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-[#4A90D9] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <IconPlus size={14} style={{ color: '#8A97B0' }} />
                <span className="text-[9px]" style={{ color: '#8A97B0' }}>Add</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => { handleAdd(e.target.files); e.target.value = '' }}
          />
        </div>
      )}
      {uploadError && (
        <p className="mt-2 text-xs" style={{ color: '#B45309' }}>{uploadError}</p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServiceLogsPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const filePickerRef = useRef<HTMLInputElement>(null)

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['service-logs'],
    queryFn: serviceLogsApi.getAll,
  })

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll,
    enabled: modalOpen,
  })

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { serviceType: 'Cleaning', serviceDate: today },
  })

  const vehicleId = watch('vehicleId')

  const { data: activeSub, isLoading: subLoading, isError: noActiveSub } = useQuery({
    queryKey: ['subscription', 'active', vehicleId],
    queryFn: () => subscriptionsApi.getActiveByVehicle(vehicleId),
    enabled: !!vehicleId,
    retry: false,
  })

  const createMut = useMutation({
    mutationFn: serviceLogsApi.create,
  })

  const onSubmit = async (data: FormData) => {
    if (!activeSub) return

    let log
    try {
      log = await createMut.mutateAsync({
        vehicleId:      data.vehicleId,
        subscriptionId: activeSub.id,
        serviceDate:    data.serviceDate,
        serviceType:    data.serviceType,
        notes:          data.notes || undefined,
        createdBy:      user?.id,
      })
    } catch {
      return
    }

    if (pendingFiles.length > 0) {
      setUploading(true)
      try {
        for (const file of pendingFiles) {
          const { fileUrl, mediaType } = await serviceMediaApi.upload(file)
          await serviceMediaApi.create({ serviceLogId: log.id, fileUrl, mediaType })
        }
      } catch {
        // log is created; media upload failed — non-fatal
      } finally {
        setUploading(false)
      }
    }

    qc.invalidateQueries({ queryKey: ['service-logs'] })
    closeModal()
  }

  const closeModal = () => {
    setModalOpen(false)
    reset()
    setPendingFiles([])
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return
    setPendingFiles((prev) => [...prev, ...Array.from(files)])
  }

  return (
    <div className="flex flex-col gap-5 p-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#0D1B3E' }}>Service Logs</h2>
          <p className="text-xs mt-0.5" style={{ color: '#8A97B0' }}>
            {logs.length} {logs.length === 1 ? 'activity' : 'activities'} recorded
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: '#4A90D9' }}
        >
          <IconPlus size={15} />
          Log Service
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}>
        <div
          className="grid px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ gridTemplateColumns: '1.8fr 1.3fr 1fr 2.5fr 1.5fr 70px', color: '#8A97B0', background: '#F7F9FC', borderBottom: '0.5px solid #EEF1F8' }}
        >
          <span>Vehicle</span>
          <span>Type</span>
          <span>Date</span>
          <span>Notes</span>
          <span>Staff</span>
          <span className="text-right">Media</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-9 rounded-lg animate-pulse" style={{ background: '#E8EDF5' }} />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#F0F3F9' }}>
              <IconClipboardList size={24} style={{ color: '#B0BCCF' }} />
            </div>
            <p className="text-sm" style={{ color: '#8A97B0' }}>No service logs yet.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id}>
              {/* Row */}
              <div
                className="grid items-center px-5 py-3 border-b hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                style={{ gridTemplateColumns: '1.8fr 1.3fr 1fr 2.5fr 1.5fr 70px', borderColor: '#F4F6FB' }}
                onClick={() => setExpandedLogId((prev) => (prev === log.id ? null : log.id))}
              >
                <span className="text-sm font-mono font-medium" style={{ color: '#0D1B3E' }}>
                  {log.vehicleRegistrationNumber || <span style={{ color: '#B0BCCF' }}>—</span>}
                </span>
                <ServiceTypeBadge type={log.serviceType} />
                <span className="text-xs" style={{ color: '#8A97B0' }}>{formatDate(log.serviceDate)}</span>
                <span className="text-xs truncate pr-4" style={{ color: '#4B5563' }}>
                  {log.notes || <span style={{ color: '#B0BCCF' }}>—</span>}
                </span>
                <span className="text-xs" style={{ color: '#8A97B0' }}>{log.createdByName ?? '—'}</span>
                <div className="flex items-center justify-end gap-1.5">
                  {log.mediaCount > 0 && (
                    <span
                      className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: '#EDE9FE', color: '#6D28D9' }}
                    >
                      <IconPhoto size={10} />
                      {log.mediaCount}
                    </span>
                  )}
                  <IconChevronDown
                    size={13}
                    style={{
                      color: '#B0BCCF',
                      transform: expandedLogId === log.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s',
                    }}
                  />
                </div>
              </div>

              {/* Media panel */}
              {expandedLogId === log.id && <MediaPanel logId={log.id} />}
            </div>
          ))
        )}
      </div>

      {/* Log Service Modal */}
      <Modal open={modalOpen} onClose={closeModal} title="Log Service">
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4" noValidate>

          {/* Vehicle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle <span className="text-red-400 ml-0.5">*</span>
            </label>
            <select {...register('vehicleId')} className={inputCls(errors.vehicleId?.message)} defaultValue="">
              <option value="" disabled>Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber
                    ? v.registrationNumber
                    : [v.brand, v.model].filter(Boolean).join(' ') || 'Unnamed vehicle'}
                </option>
              ))}
            </select>
            {errors.vehicleId && <p className="mt-1 text-xs text-red-600">{errors.vehicleId.message}</p>}
          </div>

          {/* Active subscription indicator */}
          {vehicleId && (
            subLoading ? (
              <div className="h-8 rounded-lg animate-pulse" style={{ background: '#E8EDF5' }} />
            ) : noActiveSub ? (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium" style={{ background: '#FFF7ED', color: '#B45309' }}>
                <IconAlertTriangle size={14} />
                No active subscription for this vehicle.
              </div>
            ) : activeSub ? (
              <div className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium" style={{ background: '#F0FDF4', color: '#166534' }}>
                <span className="text-base leading-none" style={{ color: '#4ADE80' }}>●</span>
                Active: {activeSub.packageName} · Slot {activeSub.slotNumber}
              </div>
            ) : null
          )}

          {/* Service type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type <span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_TYPES.map((type) => {
                const { icon: Icon, color } = serviceTypeConfig[type]
                return (
                  <label
                    key={type}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition has-[:checked]:border-[#4A90D9] has-[:checked]:bg-[#EAF3FB]"
                    style={{ borderColor: '#D1D9E8' }}
                  >
                    <input type="radio" value={type} {...register('serviceType')} className="accent-[#4A90D9]" />
                    <Icon size={15} style={{ color }} />
                    <span className="text-sm font-medium" style={{ color: '#0D1B3E' }}>{type}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input type="date" {...register('serviceDate')} className={inputCls(errors.serviceDate?.message)} />
            {errors.serviceDate && <p className="mt-1 text-xs text-red-600">{errors.serviceDate.message}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              placeholder="Optional notes about this service…"
              {...register('notes')}
              className={`${inputCls()} resize-none`}
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Photos / Videos</label>
            <div className="flex flex-wrap gap-2 items-center">
              {pendingFiles.map((file, i) => (
                <div
                  key={i}
                  className="relative w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0"
                  style={{ borderColor: '#DDE3EF' }}
                >
                  {file.type.startsWith('video') ? (
                    <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                  ) : (
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setPendingFiles((f) => f.filter((_, j) => j !== i))}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <IconX size={9} style={{ color: 'white' }} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => filePickerRef.current?.click()}
                className="w-16 h-16 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition hover:bg-gray-50 flex-shrink-0"
                style={{ borderColor: '#D1D9E8' }}
              >
                <IconPlus size={15} style={{ color: '#8A97B0' }} />
                <span className="text-[9px]" style={{ color: '#8A97B0' }}>Add</span>
              </button>
              <input
                ref={filePickerRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => { handleFileSelect(e.target.files); e.target.value = '' }}
              />
            </div>
          </div>

          {createMut.isError && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              Failed to log service. Please try again.
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-lg py-2.5 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createMut.isPending || uploading || !activeSub || noActiveSub}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#4A90D9' }}
            >
              {createMut.isPending ? 'Creating…' : uploading ? 'Uploading…' : 'Log Service'}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  )
}
