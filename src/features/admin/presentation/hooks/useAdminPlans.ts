import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useAdminPlans(adminUseCases: any) {
  const queryClient = useQueryClient()

  const plansQuery = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => adminUseCases.getPlans(),
  })

  const createPlanMutation = useMutation({
    mutationFn: (plan: any) => adminUseCases.createPlan(plan),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] }),
  })

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => adminUseCases.updatePlan(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] }),
  })

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => adminUseCases.deletePlan(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] }),
  })

  const createPlan = (plan: any) => createPlanMutation.mutateAsync(plan)
  const updatePlan = (id: string, patch: any) => updatePlanMutation.mutateAsync({ id, patch })
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
