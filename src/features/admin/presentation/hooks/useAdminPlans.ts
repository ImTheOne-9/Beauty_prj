import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AdminPlanInput, AdminPlanPatch } from '@/application/dtos/admin'
import type { AdminUseCases } from '@/application/use-cases/admin-use-cases'

export function useAdminPlans(adminUseCases: AdminUseCases) {
  const queryClient = useQueryClient()

  const plansQuery = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => adminUseCases.getPlans(),
  })

  const createPlanMutation = useMutation({
    mutationFn: (plan: AdminPlanInput) => adminUseCases.createPlan(plan),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] }),
  })

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: AdminPlanPatch }) => adminUseCases.updatePlan(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] }),
  })

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => adminUseCases.deletePlan(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] }),
  })

  const createPlan = (plan: AdminPlanInput) => createPlanMutation.mutateAsync(plan)
  const updatePlan = (id: string, patch: AdminPlanPatch) => updatePlanMutation.mutateAsync({ id, patch })
  const deletePlan = (id: string) => deletePlanMutation.mutateAsync(id)

  return {
    plansQuery,
    createPlanMutation,
    updatePlanMutation,
    deletePlanMutation,
    createPlan,
    updatePlan,
    deletePlan,
  }
}
