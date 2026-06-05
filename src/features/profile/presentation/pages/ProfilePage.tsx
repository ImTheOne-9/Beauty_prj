import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Camera, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { useAuth } from '@/features/auth/presentation/hooks/useAuth'
import { useDependencies } from '@/app/providers/DependencyProvider'

import { getUserInitials } from '@/shared/lib/profile'
import { useToast } from '@/shared/hooks/useToast'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ProfilePage() {
  const { user, profile, role, isAdmin, displayName, avatarUrl, subscriptionTier, refreshProfile } = useAuth()
  const { useCases } = useDependencies()
  const userId = user?.id ?? ''
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const [firstName, setFirstName] = useState(profile?.firstName ?? '')
  const [lastName, setLastName] = useState(profile?.lastName ?? '')
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)

  useEffect(() => {
    setFirstName(profile?.firstName ?? '')
    setLastName(profile?.lastName ?? '')
  }, [profile?.firstName, profile?.lastName])

  useEffect(() => {
    if (profile?.avatarUrl) {
      setPreviewAvatar(profile.avatarUrl)
    }
  }, [profile?.avatarUrl])

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Please sign in to update your profile.')
      return useCases.auth.updateProfile(userId, {
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
      })
    },
    onSuccess: async () => {
      await refreshProfile()
      toast.success('Profile updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not save profile')
    },
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error('Please sign in to upload an avatar.')

      if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
        throw new Error('Please choose a JPG, PNG, or WebP image.')
      }

      if (file.size > MAX_AVATAR_BYTES) {
        throw new Error('Image must be smaller than 2MB.')
      }

      return useCases.auth.uploadAvatar(userId, file)
    },
    onSuccess: async (avatarUrl) => {
      setPreviewAvatar(`${avatarUrl}?t=${Date.now()}`)
      await refreshProfile()
      toast.success('Avatar saved to your account')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not upload avatar')
    },
  })

  const handleAvatarPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setPreviewAvatar(objectUrl)
    uploadAvatarMutation.mutate(file, {
      onSettled: () => URL.revokeObjectURL(objectUrl),
    })
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  if (!user) {
    return (
      <section className="app-shell section-shell min-h-screen bg-app-subtle pb-16 pt-4">
        <Card className="mx-auto max-w-lg border border-app-border bg-white p-8 text-center">
          <h1 className="font-ui text-2xl font-semibold text-app-ink">Profile</h1>
          <p className="mt-2 text-sm text-app-muted">Please sign in to manage your profile.</p>
          <Link to="/auth" className="mt-4 inline-block">
            <Button>Sign in</Button>
          </Link>
        </Card>
      </section>
    )
  }

  const currentAvatar = previewAvatar ?? avatarUrl
  const initials = getUserInitials(displayName)
  const isSaving = saveProfileMutation.isPending
  const isUploading = uploadAvatarMutation.isPending

  return (
    <section className="app-shell section-shell min-h-screen bg-app-subtle pb-16 pt-4">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="border border-app-border bg-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-app-accent">Profile</p>
          <h1 className="mt-2 font-ui text-3xl font-semibold text-app-ink">Your account</h1>
          <p className="mt-2 text-sm text-app-muted">Update your avatar and personal details.</p>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Card className="border border-app-border bg-white p-6 text-center">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="group relative mx-auto inline-flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-app-border bg-app-subtle transition hover:border-app-accent"
            >
              {currentAvatar ? (
                <img src={currentAvatar} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <span className="font-ui text-3xl font-bold text-app-accent">{initials}</span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition group-hover:opacity-100">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_AVATAR_TYPES.join(',')}
              className="hidden"
              onChange={handleAvatarPick}
            />
            <p className="mt-4 text-sm font-semibold text-app-ink">{displayName}</p>
            <p className="mt-1 text-xs text-app-muted">{user.email}</p>
            <p className="mt-3 text-[11px] text-app-muted">Click avatar to upload to Supabase (max 2MB)</p>
          </Card>

          <div className="space-y-4">
            <Card className="border border-app-border bg-white p-6">
              <h2 className="font-ui text-2xl font-semibold text-app-ink">Edit profile</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-app-muted">First name</label>
                  <Input
                    className="mt-2"
                    placeholder="First name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-app-muted">Last name</label>
                  <Input
                    className="mt-2"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button className="app-primary" onClick={() => saveProfileMutation.mutate()} disabled={isSaving || isUploading}>
                  {isSaving ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </Card>

            <Card className="border border-app-border bg-white p-6">
              <h2 className="font-ui text-2xl font-semibold text-app-ink">Account details</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-app-border bg-app-subtle px-4 py-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-app-accent">Email</dt>
                  <dd className="mt-1 text-sm text-app-ink break-all">{profile?.email ?? user.email}</dd>
                </div>
                <div className="rounded-2xl border border-app-border bg-app-subtle px-4 py-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-app-accent">Role</dt>
                  <dd className="mt-1 text-sm capitalize text-app-ink">{role}</dd>
                </div>
                <div className="rounded-2xl border border-app-border bg-app-subtle px-4 py-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-app-accent">Plan</dt>
                  <dd className="mt-1 text-sm text-app-ink">{profile?.plan?.name ?? null}</dd>
                </div>
                <div className="rounded-2xl border border-app-border bg-app-subtle px-4 py-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-app-accent">Last sign in</dt>
                  <dd className="mt-1 text-sm text-app-ink">{formatDateTime(user.last_sign_in_at)}</dd>
                </div>
              </dl>
            </Card>

            <Card className="border border-app-border bg-white p-6">
              <h2 className="font-ui text-2xl font-semibold text-app-ink">Subscription</h2>
              <p className="mt-2 text-sm text-app-muted">Current plan: {subscriptionTier}</p>
              <div className="mt-4 rounded-2xl border border-app-border bg-app-subtle p-4 text-sm text-app-ink">
                Upgrade anytime to unlock more scans and longer history.
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/plans">
                  <Button className="app-primary">Manage plan</Button>
                </Link>
                <Link to="/scan">
                  <Button className="app-secondary" variant="ghost">Run a scan</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
