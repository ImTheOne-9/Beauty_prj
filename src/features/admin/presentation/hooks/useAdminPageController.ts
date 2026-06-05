import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Camera, ShieldCheck, Store } from 'lucide-react'
import { useDependencies } from '@/app/providers/DependencyProvider'
import { useAuth } from '@/features/auth/presentation/hooks/useAuth'
import { canAccessAdminSection, getAdminRoleLabel, type AdminSection } from '@/shared/lib/admin'
import { adminNavigationSections } from '../config/admin-navigation'
import { useAdminAccess } from './useAdminAccess'
import { useAdminApiKeys } from './useAdminApiKeys'
import { useAdminCatalog } from './useAdminCatalog'
import { useAdminHealth } from './useAdminHealth'
import { useAdminPlans } from './useAdminPlans'
import { useAdminRevenue } from './useAdminRevenue'
import { useAdminScans } from './useAdminScans'

function formatDate(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function useAdminPageController() {
  const { useCases } = useDependencies()
  const adminUseCases = useCases.admin
  const { pingTime, pingStatus, testPing } = useAdminHealth(adminUseCases.pingDatabase)
  const { adminRole, signOut, user: currentAuthUser } = useAuth()
  const queryClient = useQueryClient()

  const [activeSection, setActiveSection] = useState<AdminSection>('overview')

  const catalog = useAdminCatalog(adminUseCases)
  const apiKeys = useAdminApiKeys(adminUseCases)
  const access = useAdminAccess(adminUseCases)
  const plans = useAdminPlans(adminUseCases)

  const tabs = useMemo(
    () => adminNavigationSections.filter((section) => canAccessAdminSection(adminRole, section.id)),
    [adminRole],
  )

  const scans = useAdminScans(adminUseCases, access.userLookup)
  const revenue = useAdminRevenue(adminUseCases, catalog.productsQuery.data ?? [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeSection])

  useEffect(() => {
    if (tabs.length === 0) return
    if (!tabs.some((section) => section.id === activeSection)) {
      setActiveSection(tabs[0].id)
    }
  }, [activeSection, tabs])

  const overviewCards = useMemo(
    () => [
      {
        label: 'Products',
        value: catalog.productsQuery.data?.length ?? 0,
        hint: 'Active catalog items',
        icon: Store,
      },
      {
        label: 'Scans',
        value: scans.scansQuery.data?.length ?? 0,
        hint: 'Total analyzed scans',
        icon: Camera,
      },
      {
        label: 'Admin Role',
        value: getAdminRoleLabel(adminRole),
        hint: 'Active security context',
        icon: ShieldCheck,
      },
    ],
    [adminRole, catalog.productsQuery.data?.length, scans.scansQuery.data?.length],
  )

  const systemActivityLog = useMemo(() => {
    const logs: Array<{ id: string; user: string; event: string; time: string; type: 'success' | 'info' | 'warning' }> = []

    const scanRows = scans.scansQuery.data ?? []
    scanRows.slice(0, 4).forEach((scan: any) => {
      const effectCount = (scan.effects ?? []).filter((effect: any) => effect.enabled).length
      logs.push({
        id: `scan-${scan.id}`,
        user: `User ${scan.user_id?.slice(0, 5) ?? '??'}...`,
        event: `Completed skin analysis with ${effectCount} effect(s)`,
        time: formatDate(scan.created_at),
        type: effectCount > 2 ? 'success' : 'info',
      })
    })

    const products = catalog.productsQuery.data ?? []
    products.slice(0, 3).forEach((product: any) => {
      logs.push({
        id: `prod-${product.id}`,
        user: 'Admin',
        event: `Edited category item "${product.name}"`,
        time: formatDate(product.created_at),
        type: 'success',
      })
    })

    if (logs.length === 0) {
      logs.push(
        { id: '1', user: 'System', event: 'Database connection successful.', time: 'Just now', type: 'success' },
        { id: '2', user: 'Super Admin', event: 'Logged in from new IP address.', time: '10 mins ago', type: 'info' },
      )
    }

    return logs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  }, [scans.scansQuery.data, catalog.productsQuery.data])

  const shouldShowLoader =
    (catalog.productsQuery.isLoading || scans.scansQuery.isLoading || access.usersQuery.isLoading) &&
    !catalog.productsQuery.data &&
    !scans.scansQuery.data

  const refreshAdmin = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] })
    void testPing()
  }

  const changeSection = (section: AdminSection) => {
    setActiveSection(section)
  }

  return {
    activeSection,
    adminRole,
    signOut,
    currentAuthUser,
    adminUseCases,
    pingTime,
    pingStatus,
    testPing,
    tabs,
    keysQuery: apiKeys.keysQuery,
    productsQuery: catalog.productsQuery,
    scansQuery: scans.scansQuery,
    categoriesQuery: catalog.categoriesQuery,
    usersQuery: access.usersQuery,
    plansQuery: plans.plansQuery,
    productConfigsQuery: catalog.productConfigsQuery,
    existingConfigs: catalog.existingConfigs,
    productSearch: catalog.productSearch,
    productCategoryFilter: catalog.productCategoryFilter,
    productPage: catalog.productPage,
    productModalOpen: catalog.productModalOpen,
    configOnlyMode: catalog.configOnlyMode,
    editingProduct: catalog.editingProduct,
    paginatedProducts: catalog.paginatedProducts,
    filteredProducts: catalog.filteredProducts,
    totalProductPages: catalog.totalProductPages,
    categorySearch: catalog.categorySearch,
    categoryPage: catalog.categoryPage,
    categoryModalOpen: catalog.categoryModalOpen,
    categoryForm: catalog.categoryForm,
    paginatedCategories: catalog.paginatedCategories,
    filteredCategories: catalog.filteredCategories,
    totalCategoryPages: catalog.totalCategoryPages,
    adminScanSearch: scans.adminScanSearch,
    adminScanModeFilter: scans.adminScanModeFilter,
    adminScanPage: scans.adminScanPage,
    paginatedAdminScans: scans.paginatedAdminScans,
    filteredAdminScans: scans.filteredAdminScans,
    totalAdminScanPages: scans.totalAdminScanPages,
    userLookup: access.userLookup,
    userSearch: access.userSearch,
    userRoleFilter: access.userRoleFilter,
    userPlanFilter: access.userPlanFilter,
    filteredUsers: access.filteredUsers,
    orderSearch: revenue.orderSearch,
    orderStatusFilter: revenue.orderStatusFilter,
    filteredOrders: revenue.filteredOrders,
    revenueStats: revenue.revenueStats,
    overviewCards,
    systemActivityLog,
    toggleApiKeyActiveMutation: apiKeys.toggleApiKeyActiveMutation,
    deleteApiKeyMutation: apiKeys.deleteApiKeyMutation,
    deleteProductMutation: catalog.deleteProductMutation,
    saveCategoryMutation: catalog.saveCategoryMutation,
    deleteCategoryMutation: catalog.deleteCategoryMutation,
    deleteProductConfigMutation: catalog.deleteProductConfigMutation,
    deleteScanMutation: scans.deleteScanMutation,
    createPlanMutation: plans.createPlanMutation,
    updatePlanMutation: plans.updatePlanMutation,
    deletePlanMutation: plans.deletePlanMutation,
    deleteUserRoleMutation: access.deleteUserRoleMutation,
    updateUserPlanMutation: access.updateUserPlanMutation,
    updateOrderStatusMutation: revenue.updateOrderStatusMutation,
    deleteOrderMutation: revenue.deleteOrderMutation,
    simulateOrderMutation: revenue.simulateOrderMutation,
    refreshAdmin,
    changeSection,
    updateProductSearch: catalog.updateProductSearch,
    updateProductCategoryFilter: catalog.updateProductCategoryFilter,
    updateProductPage: catalog.updateProductPage,
    openProductModal: catalog.openProductModal,
    closeProductModal: catalog.closeProductModal,
    handleProductSaved: catalog.handleProductSaved,
    deleteProduct: catalog.deleteProduct,
    updateCategorySearch: catalog.updateCategorySearch,
    updateCategoryPage: catalog.updateCategoryPage,
    updateCategoryForm: catalog.updateCategoryForm,
    openCategoryModal: catalog.openCategoryModal,
    deleteCategory: catalog.deleteCategory,
    saveCategory: catalog.saveCategory,
    closeCategoryModal: catalog.closeCategoryModal,
    editVariant: catalog.editVariant,
    deleteVariant: catalog.deleteVariant,
    updateScanSearch: scans.updateScanSearch,
    updateScanModeFilter: scans.updateScanModeFilter,
    updateScanPage: scans.updateScanPage,
    deleteScan: scans.deleteScan,
    updateUserSearch: access.updateUserSearch,
    updateUserRoleFilter: access.updateUserRoleFilter,
    updateUserPlanFilter: access.updateUserPlanFilter,
    deleteAccessUser: access.deleteAccessUser,
    createAccessUser: access.createAccessUser,
    updateAccessUser: access.updateAccessUser,
    saveApiKey: apiKeys.saveApiKey,
    createPlan: plans.createPlan,
    updatePlan: plans.updatePlan,
    deletePlan: plans.deletePlan,
    toggleApiKeyActive: apiKeys.toggleApiKeyActive,
    deleteApiKey: apiKeys.deleteApiKey,
    updateOrderSearch: revenue.updateOrderSearch,
    updateOrderStatusFilter: revenue.updateOrderStatusFilter,
    simulateOrder: revenue.simulateOrder,
    updateOrderStatus: revenue.updateOrderStatus,
    deleteOrder: revenue.deleteOrder,
    shouldShowLoader,
  }
}
