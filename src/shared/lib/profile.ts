import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/shared/types/auth'
import type { UserProfile as CoreUserProfile } from '@/core/entities'
import { getLocalStorageItem, setLocalStorageItem } from '@/shared/lib/storage'

type ProfileOverride = {
  displayName?: string
  avatarUrl?: string
}

type ProfileMap = Record<string, ProfileOverride>

const PROFILE_KEY = 'lumina_profile_overrides'

export function getProfileOverride(userId: string) {
  const map = getLocalStorageItem<ProfileMap>(PROFILE_KEY, {})
  return map[userId]
}

export function setProfileOverride(userId: string, override: ProfileOverride) {
  const map = getLocalStorageItem<ProfileMap>(PROFILE_KEY, {})
  map[userId] = { ...(map[userId] ?? {}), ...override }
  setLocalStorageItem(PROFILE_KEY, map)
}

type ProfileLike = UserProfile | CoreUserProfile

function readString(profile: ProfileLike | null, snakeKey: keyof UserProfile, camelKey: keyof CoreUserProfile) {
  if (!profile) return ''
  const snakeValue = (profile as UserProfile)[snakeKey]
  if (typeof snakeValue === 'string') return snakeValue
  const camelValue = (profile as CoreUserProfile)[camelKey]
  return typeof camelValue === 'string' ? camelValue : ''
}

export function getDisplayName(profile: ProfileLike | null, user: User | null, userId?: string) {
  const override = userId ? getProfileOverride(userId)?.displayName : undefined
  if (override?.trim()) return override.trim()

  const first = readString(profile, 'first_name', 'firstName').trim()
  const last = readString(profile, 'last_name', 'lastName').trim()
  const fullName = `${first} ${last}`.trim()
  if (fullName) return fullName

  const metaFirst = typeof user?.user_metadata?.first_name === 'string' ? user.user_metadata.first_name : ''
  const metaLast = typeof user?.user_metadata?.last_name === 'string' ? user.user_metadata.last_name : ''
  const metaName = `${metaFirst} ${metaLast}`.trim()
  if (metaName) return metaName

  return user?.email?.split('@')[0] ?? 'User'
}

export function getAvatarUrl(profile: ProfileLike | null, user: User | null, userId?: string) {
  const profileAvatar = readString(profile, 'avatar_url', 'avatarUrl').trim()
  if (profileAvatar) return profileAvatar

  const metaAvatar =
    typeof user?.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null
  if (metaAvatar?.trim()) return metaAvatar.trim()

  const override = userId ? getProfileOverride(userId)?.avatarUrl : undefined
  return override?.trim() || null
}

export function getUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}
