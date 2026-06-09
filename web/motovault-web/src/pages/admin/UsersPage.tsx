import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IconUsers, IconUser, IconShieldHalf, IconTool, IconPlus, IconEye, IconEyeOff } from '@tabler/icons-react'
import Modal from '../../components/Modal'
import { usersApi } from '../../api/users'
import type { Role, UserResponse } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'All' | Role

const tabs: Tab[] = ['All', 'Owner', 'Admin', 'Staff']

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().min(1, 'Email is required').pipe(z.email('Enter a valid email')),
  phone:    z.string().optional(),
  role:     z.enum(['Owner', 'Staff', 'Admin']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const roleStyle = (role: Role): React.CSSProperties => {
  if (role === 'Admin') return { background: '#EAF3FB', color: '#185FA5' }
  if (role === 'Staff') return { background: '#F4F0FB', color: '#5E34A8' }
  return                       { background: '#EAF3DE', color: '#3B6D11' }
}

const RoleIcon = ({ role }: { role: Role }) => {
  if (role === 'Admin') return <IconShieldHalf size={13} />
  if (role === 'Staff') return <IconTool size={13} />
  return <IconUser size={13} />
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function avatarColors(role: Role) {
  if (role === 'Admin') return { bg: '#DDF0FB', text: '#185FA5' }
  if (role === 'Staff') return { bg: '#EDE9FB', text: '#5E34A8' }
  return { bg: '#E3F4D9', text: '#3B6D11' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const inputCls = (err?: string) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 ${
    err ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-[#4A90D9] focus:ring-[#4A90D9]/20'
  }`

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'Owner' },
  })

  const createMut = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      setModalOpen(false)
      reset()
      setShowPassword(false)
    },
  })

  const onSubmit = (data: FormData) => createMut.mutate(data)

  const closeModal = () => { setModalOpen(false); reset(); setShowPassword(false) }

  const filtered: UserResponse[] = activeTab === 'All'
    ? users
    : users.filter((u) => u.role === activeTab)

  const counts = {
    All:   users.length,
    Owner: users.filter((u) => u.role === 'Owner').length,
    Admin: users.filter((u) => u.role === 'Admin').length,
    Staff: users.filter((u) => u.role === 'Staff').length,
  }

  return (
    <div className="flex flex-col gap-5 p-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#0D1B3E' }}>Users</h2>
          <p className="text-xs mt-0.5" style={{ color: '#8A97B0' }}>
            {counts.Owner} owners · {counts.Admin} admins · {counts.Staff} staff
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: '#4A90D9' }}
        >
          <IconPlus size={15} />
          Add Member
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#F0F3F9' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
            style={activeTab === tab
              ? { background: '#fff', color: '#0D1B3E', boxShadow: '0 1px 3px rgba(0,0,0,0.10)' }
              : { color: '#8A97B0' }}
          >
            {tab}
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={activeTab === tab
                ? { background: '#EAF3FB', color: '#4A90D9' }
                : { background: '#E8EDF5', color: '#A0AABB' }}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #DDE3EF' }}>
        <div
          className="grid px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ gridTemplateColumns: '2.5fr 2fr 1.5fr 0.8fr 1fr', color: '#8A97B0', background: '#F7F9FC', borderBottom: '0.5px solid #EEF1F8' }}
        >
          <span>Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Role</span>
          <span>Joined</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-9 rounded-lg animate-pulse" style={{ background: '#E8EDF5' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#F0F3F9' }}>
              <IconUsers size={24} style={{ color: '#B0BCCF' }} />
            </div>
            <p className="text-sm" style={{ color: '#8A97B0' }}>
              No {activeTab === 'All' ? '' : activeTab + ' '}users found.
            </p>
          </div>
        ) : (
          filtered.map((user) => {
            const av = avatarColors(user.role)
            return (
              <div
                key={user.id}
                className="grid items-center px-5 py-3 border-b last:border-b-0 transition-colors hover:bg-[#F7F9FC]"
                style={{ gridTemplateColumns: '2.5fr 2fr 1.5fr 0.8fr 1fr', borderColor: '#F4F6FB' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: av.bg, color: av.text }}
                  >
                    {initials(user.name)}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#0D1B3E' }}>{user.name}</span>
                </div>
                <span className="text-xs" style={{ color: '#8A97B0' }}>{user.email ?? '—'}</span>
                <span className="text-xs" style={{ color: '#8A97B0' }}>{user.phone ?? '—'}</span>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit"
                  style={roleStyle(user.role)}
                >
                  <RoleIcon role={user.role} />
                  {user.role}
                </span>
                <span className="text-xs" style={{ color: '#8A97B0' }}>{formatDate(user.createdAt)}</span>
              </div>
            )
          })
        )}
      </div>

      {/* Add Staff modal */}
      <Modal open={modalOpen} onClose={closeModal} title="Add Member">
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4" noValidate>

          {/* Role picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Owner', 'Staff', 'Admin'] as const).map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition has-[:checked]:border-[#4A90D9] has-[:checked]:bg-[#EAF3FB]"
                  style={{ borderColor: '#D1D9E8' }}
                >
                  <input type="radio" value={r} {...register('role')} className="accent-[#4A90D9]" />
                  {r === 'Owner'
                    ? <IconUser size={15} style={{ color: '#3B6D11' }} />
                    : r === 'Staff'
                    ? <IconTool size={15} style={{ color: '#5E34A8' }} />
                    : <IconShieldHalf size={15} style={{ color: '#185FA5' }} />}
                  <span className="text-sm font-medium" style={{ color: '#0D1B3E' }}>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Arjun Nair"
              {...register('name')}
              className={inputCls(errors.name?.message)}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="email"
              placeholder="arjun@motovault.in"
              {...register('email')}
              className={inputCls(errors.email?.message)}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              {...register('phone')}
              className={inputCls(errors.phone?.message)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temporary password <span className="text-red-400 ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                {...register('password')}
                className={`${inputCls(errors.password?.message)} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          {createMut.isError && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              Failed to create user. The email may already be in use.
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
              disabled={isSubmitting || createMut.isPending}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#4A90D9' }}
            >
              {isSubmitting || createMut.isPending ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
