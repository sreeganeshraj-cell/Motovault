import { useMemo, useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import {
  IconClipboardList, IconDroplet, IconGauge, IconRoute, IconTool,
  IconPhoto, IconChevronDown,
} from '@tabler/icons-react'
import { useAuthStore } from '../../store/authStore'
import { vehiclesApi } from '../../api/vehicles'
import { serviceLogsApi } from '../../api/serviceLogs'
import { serviceMediaApi } from '../../api/serviceMedia'
import type { ServiceLogResponse, ServiceType } from '../../types'
import type { ElementType } from 'react'

// ─── Config ───────────────────────────────────────────────────────────────────

const serviceTypeConfig: Record<ServiceType, { icon: ElementType; bg: string; color: string }> = {
  Cleaning: { icon: IconDroplet, bg: '#EAF3FB', color: '#185FA5' },
  Idling:   { icon: IconGauge,   bg: '#FFF0D9', color: '#B45309' },
  Ride:     { icon: IconRoute,   bg: '#DCFCE7', color: '#166534' },
  Service:  { icon: IconTool,    bg: '#EDE9FE', color: '#6D28D9' },
}

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

// ─── Read-only media panel ────────────────────────────────────────────────────

function MediaPanel({ logId }: { logId: string }) {
  const { data: media = [], isLoading } = useQuery({
    queryKey: ['service-media', logId],
    queryFn: () => serviceMediaApi.getByServiceLog(logId),
  })

  return (
    <div className="px-5 py-3 border-b" style={{ borderColor: '#EEF1F8', background: '#F7F9FC' }}>
      {isLoading ? (
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-14 h-14 rounded-lg animate-pulse" style={{ background: '#E8EDF5' }} />
          ))}
        </div>
      ) : media.length === 0 ? (
        <p className="text-xs" style={{ color: '#B0BCCF' }}>No photos for this service.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {media.map((m) => (
            <a
              key={m.id}
              href={m.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 block hover:opacity-90 transition-opacity"
              style={{ borderColor: '#DDE3EF' }}
            >
              {m.mediaType === 'Video' ? (
                <video src={m.fileUrl} className="w-full h-full object-cover" />
              ) : (
                <img src={m.fileUrl} alt="" className="w-full h-full object-cover" />
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServiceHistoryPage() {
  const user = useAuthStore((s) => s.user)
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['my-vehicles', user?.id],
    queryFn: () => vehiclesApi.getByOwner(user!.id),
    enabled: !!user?.id,
  })

  const logQueries = useQueries({
    queries: vehicles.map((v) => ({
      queryKey: ['service-logs-vehicle', v.id],
      queryFn: () => serviceLogsApi.getByVehicle(v.id),
      enabled: vehicles.length > 0,
    })),
  })

  const allLogs = useMemo<ServiceLogResponse[]>(() => {
    return logQueries
      .filter((q) => q.isSuccess && q.data)
      .flatMap((q) => q.data as ServiceLogResponse[])
      .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
  }, [logQueries])

  const isLoading = vehiclesLoading || logQueries.some((q) => q.isLoading)

  return (
    <div className="flex flex-col gap-5 p-5">

      <div>
        <h2 className="text-lg font-bold" style={{ color: '#0D1B3E' }}>Service History</h2>
        <p className="text-xs mt-0.5" style={{ color: '#8A97B0' }}>
          {allLogs.length} {allLogs.length === 1 ? 'activity' : 'activities'} recorded
        </p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}>
        {/* Column headers */}
        <div
          className="grid px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            gridTemplateColumns: '1fr 1.3fr 1fr 2.5fr 1.5fr 60px',
            color: '#8A97B0', background: '#F7F9FC', borderBottom: '0.5px solid #EEF1F8',
          }}
        >
          <span>Reg. No.</span>
          <span>Type</span>
          <span>Date</span>
          <span>Notes</span>
          <span>Staff</span>
          <span className="text-right">Media</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 rounded-lg animate-pulse" style={{ background: '#E8EDF5' }} />
            ))}
          </div>
        ) : allLogs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#F0F3F9' }}>
              <IconClipboardList size={24} style={{ color: '#B0BCCF' }} />
            </div>
            <p className="text-sm" style={{ color: '#8A97B0' }}>No service history yet.</p>
          </div>
        ) : (
          allLogs.map((log) => (
            <div key={log.id}>
              <div
                className="grid items-center px-5 py-3 border-b hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                style={{
                  gridTemplateColumns: '1fr 1.3fr 1fr 2.5fr 1.5fr 60px',
                  borderColor: '#F4F6FB',
                }}
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

              {expandedLogId === log.id && <MediaPanel logId={log.id} />}
            </div>
          ))
        )}
      </div>

    </div>
  )
}
