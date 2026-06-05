import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/presentation/store/auth-store'

export function useAdminAccess(adminUseCases: any) {
  const queryClient = useQueryClient()
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userPlanFilter, setUserPlanFilter] = useState('all')

  const usersQuery = useQuery({
    queryKey: ['admin', 'profiles'],
    queryFn: () => adminUseCases.getProfilesWithPlans(),
  })

  const userLookup = useMemo(() => {
    const map = new Map<string, { email: string; role: string }>()
    for (const user of usersQuery.data ?? []) map.set(user.id, user)
    return map
  }, [usersQuery.data])

  const filteredUsers = useMemo(() => {
    const list = usersQuery.data ?? []
    return list.filter((user: any) => {
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').toLowerCase()
      const normalizedSearch = userSearch.toLowerCase()
      const matchSearch = user.email.toLowerCase().includes(normalizedSearch) || fullName.includes(normalizedSearch)
      const matchRole = userRoleFilter === 'all' || user.role === userRoleFilter
      const matchPlan = userPlanFilter === 'all' || user.plan?.slug === userPlanFilter
      return matchSearch && matchRole && matchPlan
    })
  }, [usersQuery.data, userSearch, userRoleFilter, userPlanFilter])

  const deleteUserRoleMutation = useMutation({
    mutationFn: async (userId: string) => adminUseCases.deleteUserRole(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
      await useAuthStore.getState().initialize()
    },
  })

  const updateUserPlanMutation = useMutation({
    mutationFn: async ({
      userId,
      planId,
      role,
      firstName,
      lastName,
    }: {
      userId: string
      planId: string
      role: string
      firstName: string
      lastName: string
    }) => {
      await adminUseCases.updateUserProfile({ userId, planId, role, firstName, lastName })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
      await useAuthStore.getState().initialize()
    },
  })

  const updateUserSearch = (value: string) => {
    setUserSearch(value)
  }

  const updateUserRoleFilter = (value: string) => {
    setUserRoleFilter(value)
  }

  const updateUserPlanFilter = (value: string) => {
    setUserPlanFilter(value)
  }

  const deleteAccessUser = (user: { id: string; email: string }) => {
    if (confirm(`Delete account ${user.email}? This action cannot be undone.`)) {
      deleteUserRoleMutation.mutate(user.id)
    }
  }

  const createAccessUser = async ({
    email,
    password,
    firstName,
    lastName,
    role,
    planId,
  }: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: string
    planId: string
  }) => {
    if (!email || !email.includes('@')) throw new Error('Please enter a valid email address.')
    if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.')
    await adminUseCases.createUserWithRole(email, password, firstName, lastName, role as 'admin' | 'user', planId)
    await queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
  }

  const updateAccessUser = async ({
    userId,
    firstName,
    lastName,
    role,
    planId,
  }: {
    userId: string
    firstName: string
    lastName: string
    role: string
    planId: string
  }) => {
    await updateUserPlanMutation.mutateAsync({ userId, planId, role, firstName, lastName })
  }

  return {
    usersQuery,
    userLookup,
    userSearch,
    userRoleFilter,
    userPlanFilter,
    filteredUsers,
    deleteUserRoleMutation,
    updateUserPlanMutation,
    updateUserSearch,
    updateUserRoleFilter,
    updateUserPlanFilter,
    deleteAccessUser,
    createAccessUser,
    updateAccessUser,
  }
}
