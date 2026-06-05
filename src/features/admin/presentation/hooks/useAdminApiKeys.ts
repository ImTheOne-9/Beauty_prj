import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

type AdminApiKeyForm = {
  id: string
  name: string
  key_value: string
  provider: string
  is_active: boolean
}

export function useAdminApiKeys(adminUseCases: any) {
  const queryClient = useQueryClient()

  const keysQuery = useQuery({
    queryKey: ['admin', 'api-keys'],
    queryFn: () => adminUseCases.getAdminApiKeys(),
  })

  const toggleApiKeyActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      if (is_active) {
        const allKeys = keysQuery.data ?? []
        const otherKeys = allKeys.filter((key: any) => key.id !== id)
        await Promise.all(
          otherKeys.map((key: any) => adminUseCases.updateApiKey(key.id, { is_active: false })),
        )
      }

      return adminUseCases.updateApiKey(id, { is_active })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] })
    },
  })

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => adminUseCases.deleteApiKey(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] })
      await queryClient.invalidateQueries({ queryKey: ['catalog', 'api-keys'] })
      await queryClient.invalidateQueries({ queryKey: ['landing', 'api-keys'] })
    },
  })

  const saveApiKey = async (form: AdminApiKeyForm) => {
    const payload = {
      name: form.name.trim(),
      key_value: form.key_value.trim() || null,
      provider: form.provider.trim() || null,
      is_active: form.is_active,
    }
    if (!payload.name) throw new Error('Please provide a key name.')
    if (!payload.key_value) throw new Error('Please provide a key value.')
    if (form.id) {
      await adminUseCases.updateApiKey(form.id, payload)
    } else {
      await adminUseCases.createApiKey(payload)
    }
    await queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] })
  }

  const toggleApiKeyActive = async (id: string, isActive: boolean) => {
    await toggleApiKeyActiveMutation.mutateAsync({ id, is_active: isActive })
  }

  const deleteApiKey = async (id: string) => {
    await deleteApiKeyMutation.mutateAsync(id)
  }

  return {
    keysQuery,
    toggleApiKeyActiveMutation,
    deleteApiKeyMutation,
    saveApiKey,
    toggleApiKeyActive,
    deleteApiKey,
  }
}
