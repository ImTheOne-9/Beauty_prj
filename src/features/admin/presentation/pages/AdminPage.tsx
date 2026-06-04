import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Camera,
  PencilLine,
  ShieldCheck,
  Store,
  Trash2,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Loader } from '@/shared/components/ui/Loader'
import { useAuth } from '@/features/auth/presentation/hooks/useAuth'
import { useAuthStore } from '@/features/auth/presentation/store/auth-store'
import type { AdminProductRecord, AdminProductVariantRecord } from '@/application/dtos/admin'
import { useDependencies } from '@/app/providers/DependencyProvider'
import { canAccessAdminSection, getAdminRoleLabel, type AdminSection } from '@/shared/lib/admin'
import { parseProductTags } from '@/shared/lib/product-tags'
import { type Order } from '@/core/entities'
import { cn } from '@/shared/lib/cn'
import { AdminSidebar } from '../components/AdminSidebar'
import { AdminSettingsSection } from '../components/AdminSettingsSection'
import { AdminOverviewSection } from '../components/AdminOverviewSection'
import { AdminProductsSection } from '../components/AdminProductsSection'
import { AdminCategoriesSection } from '../components/AdminCategoriesSection'
import { AdminSectionTitle } from '../components/AdminSectionTitle'
import { AdminProductVariantsSection } from '../components/AdminProductVariantsSection'
import { adminNavigationSections } from '../config/admin-navigation'
import { useAdminHealth } from '../hooks/useAdminHealth'
import { AdminScansSection } from '../components/Adminscanssection'
import { AdminAccessSection } from '../components/AdminAccessSection'
import { AdminPlansSection } from '../components/AdminPlansSection'
// type ApiKeyFormState = {
//   id: string
//   name: string
//   key_value: string
//   provider: string
//   is_active: boolean
// }
const EMPTY_FORM = { id: '', name: '', key_value: '', provider: 'virtual_makeup_ai', is_active: true }

// type ProductFormState = {
//   id: string
//   name: string
//   description: string
//   imageUrl: string
//   externalUrl: string
//   categoryId: string
//   brand: string
// }

type CategoryFormState = {
  id: string
  name: string
  apiCategoryKey: string
}

// type ProductConfigFormState = {
//   id: string
//   productId: string
//   hexColor: string
//   texture: string
//   colorIntensity: number
//   patternName: string
//   extraParams: string
// }

// const emptyProductForm: ProductFormState = {
//   id: '',
//   name: '',
//   description: '',
//   imageUrl: '',
//   externalUrl: '',
//   categoryId: '',
//   brand: '',
// }

const emptyCategoryForm: CategoryFormState = {
  id: '',
  name: '',
  apiCategoryKey: '',
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SubForm({ initial, plans, users, onSubmit, isPending }: {
  initial: any | null
  plans: any[]
  users: any[]
  onSubmit: (values: any) => Promise<void>
  isPending: boolean
}) {
  const [form, setForm] = useState({
    user_id:    initial?.user_id ?? '',
    plan_id:    initial?.plan_id ?? '',
    status:     initial?.status ?? 'active',
    started_at: initial?.started_at
      ? initial.started_at.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    expires_at: initial?.expires_at ? initial.expires_at.slice(0, 10) : '',
  })

  const inputCls = 'admin-input'

  return (
    <div className="space-y-3">
      {/* User — chỉ hiện khi tạo mới */}
      {!initial && (
        <div>
          <label className="admin-label">User</label>
          <select className={inputCls} value={form.user_id}
            onChange={(e) => setForm(f => ({ ...f, user_id: e.target.value }))}>
            <option value="">Select user...</option>
            {users.map((u: any) => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>
        </div>
      )}

      {/* Plan */}
      <div>
        <label className="admin-label">Plan</label>
        <select className={inputCls} value={form.plan_id}
          onChange={(e) => setForm(f => ({ ...f, plan_id: e.target.value }))}>
          <option value="">Select plan...</option>
          {plans.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name} — ${Number(p.price).toFixed(2)}/{p.billing_interval}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="admin-label">Status</label>
        <select className={inputCls} value={form.status}
          onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Started At */}
      <div>
        <label className="admin-label">Started At</label>
        <input type="date" className={inputCls} value={form.started_at}
          onChange={(e) => setForm(f => ({ ...f, started_at: e.target.value }))} />
      </div>

      {/* Expires At */}
      <div>
        <label className="admin-label">
          Expires At <span className="text-admin-muted font-normal normal-case">(để trống = không hết hạn)</span>
        </label>
        <input type="date" className={inputCls} value={form.expires_at}
          onChange={(e) => setForm(f => ({ ...f, expires_at: e.target.value }))} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          disabled={isPending || !form.user_id || !form.plan_id}
          onClick={() => onSubmit({
            ...form,
            started_at: new Date(form.started_at).toISOString(),
            expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
          })}
        >
          {isPending ? 'Saving...' : initial ? 'Save Changes' : 'Create'}
        </Button>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { useCases } = useDependencies()
  const adminUseCases = useCases.admin
  const { pingTime, pingStatus, testPing } = useAdminHealth(adminUseCases.pingDatabase)
  const { adminRole, signOut, user: currentAuthUser } = useAuth()
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')

  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm)

  // Filters & Search
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('All')
  const [productPage, setProductPage] = useState(1)
  const productItemsPerPage = 10

  const [adminScanSearch, setAdminScanSearch]         = useState('')
  const [adminScanModeFilter, setAdminScanModeFilter] = useState<'all' | 'api' | 'demo'>('all')
  const [adminScanPage, setAdminScanPage]             = useState(1)
  const ADMIN_SCAN_PAGE_SIZE = 10

  const [userSearch, setUserSearch] = useState('')

  const [categoryPage, setCategoryPage] = useState(1)
  const categoryItemsPerPage = 10

  // Revenue state
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All')

  // User Manager Form

  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [apiKeyForm, setApiKeyForm] = useState(EMPTY_FORM)

  // Modal states — Products
  const [productModalOpen, setProductModalOpen] = useState(false)

  // Modal states — Categories  
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')

  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userPlanFilter, setUserPlanFilter] = useState('all')

  const [editingProduct, setEditingProduct] = useState<AdminProductRecord | null>(null)
  const [configOnlyMode, setConfigOnlyMode] = useState(false)
  
  // ✅ GIỮ NGUYÊN khai báo này:
  const productConfigsQuery = useQuery({
    queryKey: ['admin', 'product-configs'],
    queryFn: () => adminUseCases.getAdminProductVariants(),
  })

  // ✅ THÊM existingConfigs ngay đây:
  const existingConfigs = useMemo(() => {
    if (!editingProduct) return []
    return (productConfigsQuery.data ?? []).filter(
      c => c.product_id === editingProduct.id
    ) as AdminProductVariantRecord[]
  }, [editingProduct, productConfigsQuery.data])
    const openProductModal = (product?: AdminProductRecord) => {
      setEditingProduct(product ?? null)
      setConfigOnlyMode(false)  // ← reset chế độ
      setProductModalOpen(true)
  }

  const openCategoryModal = (category?: { id: string; name: string; api_category_key: string }) => {
    setCategoryForm(category
      ? { id: category.id, name: category.name, apiCategoryKey: category.api_category_key }
      : emptyCategoryForm
    )
    setCategoryModalOpen(true)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeSection])
  // Queries
  const keysQuery = useQuery({
    queryKey: ['admin', 'api-keys'],
    queryFn: () => adminUseCases.getAdminApiKeys(),
  })

  const productsQuery = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminUseCases.getAdminProducts(),
  })

  const scansQuery = useQuery({
    queryKey: ['admin', 'scans'],
    queryFn: () => adminUseCases.getAdminScans(),
  })

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminUseCases.getAdminCategories(),
  })


  const usersQuery = useQuery({
    queryKey: ['admin', 'profiles'],
    queryFn: () => adminUseCases.getProfilesWithPlans(),
  })
  const ordersQuery = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => adminUseCases.getOrders(),
  })

  const plansQuery = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => adminUseCases.getPlans(),
  })

  

  // Lookups & Filters
  const tabs = useMemo(
    () => adminNavigationSections.filter((section) => canAccessAdminSection(adminRole, section.id)),
    [adminRole],
  )

  // Map userId → email
  const userLookup = useMemo(() => {
    const map = new Map<string, { email: string; role: string }>()
    for (const u of usersQuery.data ?? []) map.set(u.id, u)
    return map
  }, [usersQuery.data])

  useEffect(() => {
    if (tabs.length === 0) return
    if (!tabs.some((section) => section.id === activeSection)) {
      setActiveSection(tabs[0].id)
    }
  }, [activeSection, tabs])

  const filteredOrders = useMemo(() => {
    const list = ordersQuery.data ?? []
    return list.filter((order) => {
      const matchSearch =
        order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.productName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.shippingInfo.name.toLowerCase().includes(orderSearch.toLowerCase())

      const matchStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter
      return matchSearch && matchStatus
    })
  }, [ordersQuery.data, orderSearch, orderStatusFilter])

  const filteredUsers = useMemo(() => {
    const list = usersQuery.data ?? []
    return list.filter((u: any) => {
    const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ').toLowerCase()
      const q = userSearch.toLowerCase()
      const matchSearch = u.email.toLowerCase().includes(q) || fullName.includes(q)
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter
      const matchPlan = userPlanFilter === 'all' || u.plan?.slug === userPlanFilter
      return matchSearch && matchRole && matchPlan
    })
  }, [usersQuery.data, userSearch, userRoleFilter, userPlanFilter])

  const filteredAdminScans = useMemo(() => {
    return (scansQuery.data ?? []).filter((scan) => {
      const userEmail = scan.user_id ? (userLookup.get(scan.user_id)?.email ?? '') : 'Guest'
      const matchSearch =
        scan.id.toLowerCase().includes(adminScanSearch.toLowerCase()) ||
        (scan.user_id ?? '').toLowerCase().includes(adminScanSearch.toLowerCase()) ||
        userEmail.toLowerCase().includes(adminScanSearch.toLowerCase())
      const matchMode = adminScanModeFilter === 'all' || scan.mode === adminScanModeFilter
      return matchSearch && matchMode
    })
  }, [scansQuery.data, adminScanSearch, adminScanModeFilter, userLookup])


  const totalAdminScanPages = Math.max(1, Math.ceil(filteredAdminScans.length / ADMIN_SCAN_PAGE_SIZE))
  const paginatedAdminScans = filteredAdminScans.slice(
    (adminScanPage - 1) * ADMIN_SCAN_PAGE_SIZE,
    adminScanPage * ADMIN_SCAN_PAGE_SIZE,
  )

  const revenueStats = useMemo(() => {
    const list = ordersQuery.data ?? []
    const completed = list.filter((o) => o.status === 'completed')
    const pending = list.filter((o) => o.status === 'pending')
    const canceled = list.filter((o) => o.status === 'canceled')

    const totalRevenue = completed.reduce((sum, o) => sum + o.totalPrice, 0)
    const pendingAmount = pending.reduce((sum, o) => sum + o.totalPrice, 0)

    // Category Breakdown
    const categoryMap = new Map<string, number>()
    completed.forEach((o) => {
      const cat = o.productCategory || 'Other'
      categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + o.totalPrice)
    })
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))

    // Payment breakdown
    const paymentMap = new Map<string, number>()
    completed.forEach((o) => {
      const pm = o.paymentMethod.toUpperCase()
      paymentMap.set(pm, (paymentMap.get(pm) ?? 0) + o.totalPrice)
    })
    const paymentBreakdown = Array.from(paymentMap.entries()).map(([name, value]) => ({ name, value }))

    return {
      totalRevenue,
      pendingAmount,
      completedCount: completed.length,
      pendingCount: pending.length,
      canceledCount: canceled.length,
      totalCount: list.length,
      categoryBreakdown,
      paymentBreakdown,
    }
  }, [ordersQuery.data])


  // Filtered lists
  const filteredProducts = useMemo(() => {
    const list = productsQuery.data ?? []
    const normalizedSearch = productSearch.toLowerCase()
    return list.filter((p) => {
      const categoryName = categoriesQuery.data?.find((category) => category.id === p.category_id)?.name ?? ''
      const matchesSearch =
        p.name.toLowerCase().includes(normalizedSearch) ||
        (p.brand?.toLowerCase().includes(normalizedSearch) ?? false)

      const matchesCat =
        productCategoryFilter === 'All' ||
        categoryName.toLowerCase() === productCategoryFilter.toLowerCase()
      return matchesSearch && matchesCat
    })
  }, [productsQuery.data, productSearch, productCategoryFilter, categoriesQuery.data])


  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((productPage - 1) * productItemsPerPage, productPage * productItemsPerPage)
  }, [filteredProducts, productPage])
  const totalProductPages = Math.ceil(filteredProducts.length / productItemsPerPage)

  // MỚI
  const filteredCategories = useMemo(() => {
    const list = categoriesQuery.data ?? []
    const q = categorySearch.toLowerCase()
    return q
      ? list.filter((c) =>
          c.name.toLowerCase().includes(q) ||
          c.api_category_key.toLowerCase().includes(q)
        )
      : list
  }, [categoriesQuery.data, categorySearch])

  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice(
      (categoryPage - 1) * categoryItemsPerPage,
      categoryPage * categoryItemsPerPage,
    )
  }, [filteredCategories, categoryPage])

  const totalCategoryPages = Math.ceil(filteredCategories.length / categoryItemsPerPage)

  // Overview Stats Setup
  const overviewCards = useMemo(
    () => [
      {
        label: 'Products',
        value: productsQuery.data?.length ?? 0,
        hint: 'Active catalog items',
        icon: Store,
      },
      {
        label: 'Scans',
        value: scansQuery.data?.length ?? 0,
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
    [adminRole, productsQuery.data?.length, scansQuery.data?.length],
  )

  // Mutations
  const saveApiKeyMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: apiKeyForm.name.trim(),
        key_value: apiKeyForm.key_value.trim() || null,
        provider: apiKeyForm.provider.trim() || null,
        is_active: apiKeyForm.is_active,
      }

      if (!payload.name) throw new Error('Please provide a key name.')
      if (!payload.key_value) throw new Error('Please provide a key value.')

      if (apiKeyForm.id) {
        return adminUseCases.updateApiKey(apiKeyForm.id, payload)
      }
      return adminUseCases.createApiKey(payload)
    },
    onSuccess: async () => {
      setApiKeyForm(EMPTY_FORM)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] })
    },
  })
  const toggleApiKeyActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      // Nếu đang set active = true → deactivate tất cả key khác cùng provider trước
      if (is_active) {
        const allKeys = keysQuery.data ?? []
        const others = allKeys.filter((k: any) => k.id !== id)

        // Set tất cả còn lại thành inactive
        await Promise.all(
          others.map((k: any) =>
            adminUseCases.updateApiKey(k.id, { is_active: false })
          )
        )
      }

      // Sau đó update key được chọn
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


  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => adminUseCases.deleteProduct(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      await queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
      await queryClient.invalidateQueries({ queryKey: ['landing', 'products'] })
    },
  })

  const saveCategoryMutation = useMutation({
    mutationFn: async () => {
      const input = {
        name: categoryForm.name.trim(),
        api_category_key: categoryForm.apiCategoryKey.trim().toLowerCase(),
      }

      if (!input.name || !input.api_category_key) {
        throw new Error('Please fill in all category details.')
      }

      if (categoryForm.id) {
        return adminUseCases.updateCategory(categoryForm.id, input)
      }

      return adminUseCases.createCategory(input)
    },
    onSuccess: async () => {
      setCategoryForm(emptyCategoryForm)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => adminUseCases.deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })

  

  const deleteProductConfigMutation = useMutation({
    mutationFn: async (id: string) => adminUseCases.deleteProductVariant(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'product-configs'] })
    },
  })


  const deleteScanMutation = useMutation({
    mutationFn: async (id: string) => adminUseCases.deleteScan(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'scans'] })
      await queryClient.invalidateQueries({ queryKey: ['scan-history'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'recommendations'] })
    },
  })

  const createPlanMutation = useMutation({
    mutationFn: (plan: any) => adminUseCases.createPlan(plan),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] }),
  })

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) =>
      adminUseCases.updatePlan(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] }),
  })

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => adminUseCases.deletePlan(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] }),
  })

  const deleteUserRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      return adminUseCases.deleteUserRole(userId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
      await useAuthStore.getState().initialize()
    },
  })

  const updateUserPlanMutation = useMutation({
    mutationFn: async ({ userId, planId, role, firstName, lastName }: { userId: string; planId: string; role: string; firstName: string; lastName: string }) => {
      await adminUseCases.updateUserProfile({ userId, planId, role, firstName, lastName })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
      await useAuthStore.getState().initialize()
    },
  })
  // Order & Revenue Mutations
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: 'pending' | 'completed' | 'canceled' }) => {
      return adminUseCases.updateOrderStatus(orderId, status)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return adminUseCases.deleteOrder(orderId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const simulateOrderMutation = useMutation({
    mutationFn: async () => {
      const products = productsQuery.data || []
      if (products.length === 0) throw new Error('No products available to simulate order.')
      const prod = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 2) + 1
      const price = 250000 + Math.floor(Math.random() * 8) * 50000 // Mock custom price

      const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'Chris', 'Sarah', 'David', 'Jessica']
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
      const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
      const phone = `098${Math.floor(1000000 + Math.random() * 9000000)}`
      const address = `${Math.floor(Math.random() * 100) + 1} Main St, New York`

      const paymentMethods = ['cod', 'momo', 'visa', 'apple'] as const

      const newOrder: Order = {
        id: `BG-${Math.floor(100000 + Math.random() * 900000)}`,
        productId: prod.id,
        productName: prod.name,
        productImage: prod.image_url || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80',
        productCategory: parseProductTags(prod as any).category || 'Serum',
        quantity,
        price,
        totalPrice: price * quantity,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        shippingInfo: { name, phone, address },
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      return adminUseCases.createOrder(newOrder)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const subscriptionsQuery = useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: () => adminUseCases.getSubscriptions(),
  })

  const createSubMutation = useMutation({
    mutationFn: (input: any) => adminUseCases.createSubscription(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] }),
  })

  const updateSubMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) =>
      adminUseCases.updateSubscription(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] }),
  })

  const cancelSubMutation = useMutation({
    mutationFn: (id: string) => adminUseCases.cancelSubscription(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] }),
  })

  const [subSearch, setSubSearch] = useState('')
  const [subStatusFilter, setSubStatusFilter] = useState('all')
  const [subPage, setSubPage] = useState(1)
  const [subModalOpen, setSubModalOpen] = useState(false)
  const [selectedSub, setSelectedSub] = useState<any>(null)
  const SUB_PAGE_SIZE = 10

  const filteredSubs = useMemo(() => {
    return (subscriptionsQuery.data ?? []).filter((s: any) => {
      const email = s.user_id ? (userLookup.get(s.user_id)?.email ?? '') : ''
      const matchSearch = subSearch === ''
        || s.id.toLowerCase().includes(subSearch.toLowerCase())
        || s.user_id?.toLowerCase().includes(subSearch.toLowerCase())
        || email.toLowerCase().includes(subSearch.toLowerCase())
      const matchStatus = subStatusFilter === 'all' || s.status === subStatusFilter
      return matchSearch && matchStatus
    })
  }, [subscriptionsQuery.data, subSearch, subStatusFilter, userLookup])

  const totalSubPages = Math.max(1, Math.ceil(filteredSubs.length / SUB_PAGE_SIZE))
  const paginatedSubs = filteredSubs.slice(
    (subPage - 1) * SUB_PAGE_SIZE,
    subPage * SUB_PAGE_SIZE,
  )

  // Simulated events for activity log
  const systemActivityLog = useMemo(() => {
    const logs: Array<{ id: string; user: string; event: string; time: string; type: 'success' | 'info' | 'warning' }> = []

    // Add real items if available
    const scans = scansQuery.data ?? []
    scans.slice(0, 4).forEach((scan) => {
      const effectCount = (scan.effects ?? []).filter((e: any) => e.enabled).length;
      logs.push({
        id: `scan-${scan.id}`,
        user: `User ${scan.user_id?.slice(0, 5) ?? '??'}...`,
        event: `Completed skin analysis with ${effectCount} effect(s)`,
        time: formatDate(scan.created_at),
        type: effectCount > 2 ? 'success' : 'info',
      })
    })

    const prods = productsQuery.data ?? []
    prods.slice(0, 3).forEach((prod) => {
      logs.push({
        id: `prod-${prod.id}`,
        user: 'Admin',
        event: `Edited category item "${prod.name}"`,
        time: formatDate(prod.created_at),
        type: 'success',
      })
    })

    // Fallbacks
    if (logs.length === 0) {
      logs.push(
        { id: '1', user: 'System', event: 'Database connection successful.', time: 'Just now', type: 'success' },
        { id: '2', user: 'Super Admin', event: 'Logged in from new IP address.', time: '10 mins ago', type: 'info' },
      )
    }

    return logs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  }, [scansQuery.data, productsQuery.data])

  const isBusy =
    productsQuery.isLoading ||
    scansQuery.isLoading ||
    usersQuery.isLoading

  if (isBusy && !productsQuery.data && !scansQuery.data) {
    return <Loader fullScreen label="Loading admin dashboard" />
  }

  return (
    <section className="admin-shell section-shell min-h-screen bg-admin-surface pb-12 pt-4">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AdminSidebar
          adminRole={adminRole}
          activeSection={activeSection}
          sections={tabs}
          onSectionChange={setActiveSection}
          onRefresh={() => {
            void queryClient.invalidateQueries({ queryKey: ['admin'] })
            void testPing()
          }}
          onSignOut={() => void signOut()}
        />

        {/* Content Area */}
        <div className="space-y-6">
          {activeSection === 'overview' ? (
            <AdminOverviewSection
              cards={overviewCards}
              activityLog={systemActivityLog}
              rowCount={(scansQuery.data?.length ?? 0) + (productsQuery.data?.length ?? 0)}
              pingTime={pingTime}
              pingStatus={pingStatus}
              onPing={testPing}
              onNavigate={setActiveSection}
            />
          ) : null}
          {/* PRODUCTS TAB */}
          {activeSection === 'products' ? (
            <AdminProductsSection
              products={paginatedProducts}
              filteredCount={filteredProducts.length}
              categories={categoriesQuery.data ?? []}
              search={productSearch}
              categoryFilter={productCategoryFilter}
              page={productPage}
              totalPages={totalProductPages}
              isDeleting={deleteProductMutation.isPending}
              modalOpen={productModalOpen}
              configOnly={configOnlyMode}
              editingProduct={editingProduct}
              existingConfigs={existingConfigs}
              onSearchChange={(value) => {
                setProductSearch(value)
                setProductPage(1)
              }}
              onCategoryFilterChange={(value) => {
                setProductCategoryFilter(value)
                setProductPage(1)
              }}
              onPageChange={setProductPage}
              onAdd={() => openProductModal()}
              onEdit={openProductModal}
              onDelete={(product) => {
                if (confirm(`Delete ${product.name}?`)) {
                  deleteProductMutation.mutate(product.id)
                }
              }}
              onModalClose={() => {
                setConfigOnlyMode(false)
                setProductModalOpen(false)
                setEditingProduct(null)
              }}
              onSaved={() => {
                queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
                queryClient.invalidateQueries({ queryKey: ['admin', 'product-configs'] })
                queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
                queryClient.invalidateQueries({ queryKey: ['makeup', 'catalog'] })
                setProductModalOpen(false)
                setEditingProduct(null)
              }}
            />
          ) : null}
          {/* CATEGORIES TAB */}
          {activeSection === 'categories' ? (
            <AdminCategoriesSection
              categories={paginatedCategories}
              filteredCount={filteredCategories.length}
              search={categorySearch}
              page={categoryPage}
              totalPages={totalCategoryPages}
              modalOpen={categoryModalOpen}
              form={categoryForm}
              isDeleting={deleteCategoryMutation.isPending}
              isSaving={saveCategoryMutation.isPending}
              saveError={saveCategoryMutation.error?.message}
              onSearchChange={(value) => {
                setCategorySearch(value)
                setCategoryPage(1)
              }}
              onPageChange={setCategoryPage}
              onAdd={() => openCategoryModal()}
              onEdit={openCategoryModal}
              onDelete={(category) => {
                if (confirm(`Delete category ${category.name}?`)) {
                  deleteCategoryMutation.mutate(category.id)
                }
              }}
              onModalClose={() => setCategoryModalOpen(false)}
              onFormChange={setCategoryForm}
              onSave={async () => {
                await saveCategoryMutation.mutateAsync()
                setCategoryModalOpen(false)
              }}
            />
          ) : null}

          {/* PRODUCT CONFIGS TAB */}
          {activeSection === 'product-configs' ? (
            <AdminProductVariantsSection
              variants={productConfigsQuery.data ?? []}
              products={productsQuery.data ?? []}
              isDeleting={deleteProductConfigMutation.isPending}
              onEdit={(product) => {
                setEditingProduct(product)
                setConfigOnlyMode(true)
                setProductModalOpen(true)
              }}
              onDelete={(variant) => {
                if (confirm('Delete this variant?')) {
                  deleteProductConfigMutation.mutate(variant.id)
                }
              }}
            />
          ) : null}

          {/* SCANS TAB WITH SCAN SIMULATOR */}
          {activeSection === 'scans' && (
            <AdminScansSection
              scans={paginatedAdminScans}
              filteredCount={filteredAdminScans.length}
              search={adminScanSearch}
              modeFilter={adminScanModeFilter}
              page={adminScanPage}
              totalPages={totalAdminScanPages}
              isDeleting={deleteScanMutation.isPending}
              userLookup={userLookup}
              onSearchChange={(v) => { setAdminScanSearch(v); setAdminScanPage(1) }}
              onModeFilterChange={(v) => { setAdminScanModeFilter(v); setAdminScanPage(1) }}
              onPageChange={setAdminScanPage}
              onDelete={(id) => deleteScanMutation.mutate(id)}
            />
          )}

          {/* ACCESS CONTROL MANAGER */}
          {activeSection === 'access' && (
            <AdminAccessSection
              users={filteredUsers}
              filteredCount={filteredUsers.length}
              plans={plansQuery.data ?? []}
              currentUserEmail={currentAuthUser?.email}
              search={userSearch}
              roleFilter={userRoleFilter}
              planFilter={userPlanFilter}
              onSearchChange={setUserSearch}
              onRoleFilterChange={setUserRoleFilter}
              onPlanFilterChange={setUserPlanFilter}
              isDeleting={deleteUserRoleMutation.isPending}
              onDelete={(user) => {
                if (confirm(`Delete account ${user.email}? This action cannot be undone.`)) {
                  deleteUserRoleMutation.mutate(user.id)
                }
              }}
              onCreateUser={async ({ email, password, firstName, lastName, role, planId }) => {
                if (!email || !email.includes('@')) throw new Error('Please enter a valid email address.')
                if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.')
                await adminUseCases.createUserWithRole(email, password, firstName, lastName, role as 'admin' | 'user', planId)
                await queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
              }}
              isCreating={false}
              onUpdateUser={async ({ userId, firstName, lastName, role, planId }) => {
                await updateUserPlanMutation.mutateAsync({ userId, planId, role, firstName, lastName })
              }}
              isUpdating={updateUserPlanMutation.isPending}
            />
          )}
          {activeSection === 'plans' && (
            <AdminPlansSection
              plans={plansQuery.data ?? []}
              isCreating={createPlanMutation.isPending}
              isUpdating={updatePlanMutation.isPending}
              isDeleting={deletePlanMutation.isPending}
              onCreatePlan={(plan) => createPlanMutation.mutateAsync(plan)}
              onUpdatePlan={(id, patch) => updatePlanMutation.mutateAsync({ id, patch })}
              onDeletePlan={(id) => deletePlanMutation.mutateAsync(id)}
            />
          )}
          {/* API KEYS TAB */}
          {activeSection === 'api-keys' && (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-white border border-admin-border rounded-3xl p-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-admin-ink">
                  {keysQuery.data?.length ?? 0} key(s) configured
                </p>
                <Button onClick={() => {
                  setApiKeyForm(EMPTY_FORM)
                  setApiKeyModalOpen(true)
                }}>
                  + Add Key
                </Button>
              </div>

              {/* Table */}
              <Card className="border border-admin-border p-6 bg-white shadow-sm">
                <AdminSectionTitle
                  eyebrow="API Keys"
                  title="Virtual Makeup AI Keys"
                  description="Manage, rotate and enable/disable API keys used by the makeup engine."
                />
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-admin-border text-admin-ink font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-3">Name</th>
                        <th className="pb-3 px-3">Provider</th>
                        <th className="pb-3 px-3">Key Value</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3 whitespace-nowrap">Created</th>
                        <th className="pb-3 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {(keysQuery.data ?? []).map((key: any) => (
                        <tr key={key.id} className="hover:bg-admin-subtle text-admin-ink align-middle">
                          <td className="py-3 pr-3 font-semibold">{key.name}</td>
                          <td className="py-3 px-3 text-admin-muted">{key.provider}</td>
                          <td className="py-3 px-3 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-admin-muted font-mono tracking-widest">
                                ••••••••••••••••
                              </span>
                              <span className="text-[10px] text-admin-muted italic">hidden for security</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => toggleApiKeyActiveMutation.mutate({
                                id: key.id,
                                is_active: !key.is_active,
                              })}
                              disabled={toggleApiKeyActiveMutation.isPending}
                              className={cn(
                                'rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition',
                                key.is_active
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                                  : 'bg-admin-subtle text-admin-accent border-admin-border hover:bg-admin-subtle',
                              )}
                            >
                              {toggleApiKeyActiveMutation.isPending ? '...' : key.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-admin-muted whitespace-nowrap">
                            {formatDate(key.created_at)}
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => {
                                setApiKeyForm({
                                  id: key.id,
                                  name: key.name,
                                  key_value: key.key_value,
                                  provider: key.provider,
                                  is_active: key.is_active,
                                })
                                setApiKeyModalOpen(true)
                              }}>
                                <PencilLine className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm" variant="ghost"
                                onClick={() => {
                                  if (confirm(`Delete key "${key.name}"?`)) {
                                    deleteApiKeyMutation.mutate(key.id)
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(keysQuery.data?.length ?? 0) === 0 && (
                    <div className="text-center py-12 text-admin-muted text-sm">
                      No API keys yet. Click "+ Add Key" to add one.
                    </div>
                  )}
                </div>
              </Card>

              {/* Modal */}
              {apiKeyModalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                  onClick={(e) => { if (e.target === e.currentTarget) setApiKeyModalOpen(false) }}
                >
                  <div className="relative w-full max-w-md rounded-[2rem] border border-admin-border bg-white p-6 shadow-xl space-y-4">
                    <button
                      onClick={() => setApiKeyModalOpen(false)}
                      className="absolute right-4 top-4 rounded-full p-1.5 text-admin-muted hover:bg-admin-subtle transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <h2 className="font-admin text-xl text-admin-ink">
                      {apiKeyForm.key_value && keysQuery.data?.some((k: any) => k.key_value === apiKeyForm.key_value)
                        ? 'Edit API Key' : 'Add API Key'}
                    </h2>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">Name</label>
                        <Input
                          placeholder="e.g. Production Key"
                          value={apiKeyForm.name}
                          onChange={(e) => setApiKeyForm(f => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">Provider</label>
                        <Input
                          placeholder="e.g. virtual_makeup_ai"
                          value={apiKeyForm.provider}
                          onChange={(e) => setApiKeyForm(f => ({ ...f, provider: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">Key Value</label>
                        <Input
                          type="password"
                          placeholder="Paste your API key here"
                          value={apiKeyForm.key_value}
                          onChange={(e) => setApiKeyForm(f => ({ ...f, key_value: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="key_active"
                          checked={apiKeyForm.is_active}
                          onChange={(e) => setApiKeyForm(f => ({ ...f, is_active: e.target.checked }))}
                        />
                        <label htmlFor="key_active" className="text-sm text-admin-ink">Active</label>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setApiKeyModalOpen(false)}>Cancel</Button>
                        <Button
                          onClick={async () => {
                            await saveApiKeyMutation.mutateAsync()
                            setApiKeyModalOpen(false)
                          }}
                        >
                          Save Key
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* SETTINGS TAB */}
          {activeSection === 'settings' ? <AdminSettingsSection /> : null}

          {/* REVENUE TAB */}
          {activeSection === 'revenue' ? (
            <div className="space-y-6">
              {/* Revenue header */}
              <Card className="border border-admin-border p-6 bg-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-admin text-2xl text-admin-ink">Revenue & Orders</h3>
                  <Button
                    onClick={() => simulateOrderMutation.mutate()}
                    disabled={simulateOrderMutation.isPending}
                    className="flex items-center gap-1"
                  >
                    {simulateOrderMutation.isPending ? 'Simulating...' : 'Simulate Order'}
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              {/* Metrics grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-admin-border p-5 bg-white">
                  <p className="text-xs uppercase text-admin-accent">Total Revenue</p>
                  <h4 className="mt-2 font-admin text-2xl text-admin-ink">
                    {revenueStats.totalRevenue.toLocaleString('vi-VN')}₫
                  </h4>
                  <p className="mt-1 text-xs text-admin-muted">Completed</p>
                </Card>
                <Card className="border border-admin-border p-5 bg-white">
                  <p className="text-xs uppercase text-admin-accent">Pending Revenue</p>
                  <h4 className="mt-2 font-admin text-2xl text-admin-ink">
                    {revenueStats.pendingAmount.toLocaleString('vi-VN')}₫
                  </h4>
                  <p className="mt-1 text-xs text-admin-muted">Pending</p>
                </Card>
                <Card className="border border-admin-border p-5 bg-white">
                  <p className="text-xs uppercase text-admin-accent">Order Count</p>
                  <h4 className="mt-2 font-admin text-2xl text-admin-ink">{revenueStats.totalCount}</h4>
                  <p className="mt-1 text-xs text-admin-muted">Total Orders</p>
                </Card>
                <Card className="border border-admin-border p-5 bg-white">
                  <p className="text-xs uppercase text-admin-accent">Average Order Value</p>
                  <h4 className="mt-2 font-admin text-2xl text-admin-ink">
                    {(revenueStats.completedCount ? (revenueStats.totalRevenue / revenueStats.completedCount).toFixed(0) : 0).toLocaleString('vi-VN')}₫
                  </h4>
                  <p className="mt-1 text-xs text-admin-muted">AOV</p>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search orders..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="flex-1"
                />
                <select
                  className="rounded border border-admin-border px-3 py-1 text-sm"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              {/* Orders table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="border-b border-admin-border text-admin-ink font-bold uppercase">
                    <tr>
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-admin-subtle text-admin-ink">
                        <td className="py-2 font-medium">{order.id}</td>
                        <td className="py-2">{order.productName}</td>
                        <td className="py-2">{order.totalPrice.toLocaleString('vi-VN')}₫</td>
                        <td className="py-2">
                          <select
                            className="rounded border border-admin-border bg-white px-2 py-1 text-xs"
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatusMutation.mutate({
                                orderId: order.id,
                                status: e.target.value as any,
                              })
                            }
                            disabled={updateOrderStatusMutation.isPending}
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="canceled">Canceled</option>
                          </select>
                        </td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Delete order ${order.id}?`)) deleteOrderMutation.mutate(order.id);
                            }}
                            disabled={deleteOrderMutation.isPending}
                            className="text-admin-accent hover:text-admin-accent flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Category breakdown */}
              <Card className="border border-admin-border p-5 bg-white">
                <h4 className="font-admin text-lg text-admin-ink mb-2">Revenue by Category</h4>
                <div className="space-y-2">
                  {revenueStats.categoryBreakdown.map((cat) => (
                    <div key={cat.name} className="flex justify-between text-sm">
                      <span>{cat.name}</span>
                      <span>{cat.value.toLocaleString('vi-VN')}₫</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Payment breakdown */}
              <Card className="border border-admin-border p-5 bg-white">
                <h4 className="font-admin text-lg text-admin-ink mb-2">Revenue by Payment Method</h4>
                <div className="space-y-2">
                  {revenueStats.paymentBreakdown.map((pay) => (
                    <div key={pay.name} className="flex justify-between text-sm">
                      <span>{pay.name}</span>
                      <span>{pay.value.toLocaleString('vi-VN')}₫</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}

          {activeSection === 'subscriptions' && (
            <div className="space-y-4">
              {/* Search & filter */}
              <div className="bg-white border border-admin-border rounded-3xl p-4 flex flex-wrap gap-3 items-center">
                <div className="flex-1 relative min-w-[200px]">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-admin-muted" />
                  <input type="text"
                    className="w-full rounded-full border border-admin-border pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent/20"
                    placeholder="Search by email, UUID or subscription ID..."
                    value={subSearch}
                    onChange={(e) => { setSubSearch(e.target.value); setSubPage(1) }}
                  />
                </div>
                <select
                  className="rounded-full border border-admin-border px-3 py-2 text-sm focus:outline-none"
                  value={subStatusFilter}
                  onChange={(e) => { setSubStatusFilter(e.target.value); setSubPage(1) }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>
                <Button onClick={() => { setSelectedSub(null); setSubModalOpen(true) }}>
                  + Add Subscription
                </Button>
              </div>

              <Card className="border border-admin-border p-6 bg-white shadow-sm">
                <AdminSectionTitle
                  eyebrow="Subscriptions"
                  title="User Subscriptions"
                  description={`${filteredSubs.length} subscription(s) found.`}
                />

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-admin-border text-admin-ink font-bold uppercase tracking-wider">
                        <th className="pb-3 px-3">Email</th>
                        <th className="pb-3 px-3">Plan</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3 whitespace-nowrap">Started</th>
                        <th className="pb-3 px-3 whitespace-nowrap">Expires</th>
                        <th className="pb-3 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {paginatedSubs.map((sub: any) => {
                        const email = sub.user_id
                          ? (userLookup.get(sub.user_id)?.email ?? sub.user_id.slice(0, 8) + '...')
                          : 'Guest'
                        const statusColors: Record<string, string> = {
                          active:    'bg-emerald-50 text-emerald-700 border-emerald-100',
                          cancelled: 'bg-admin-subtle text-admin-accent border-admin-border',
                          expired:   'bg-gray-50 text-gray-500 border-gray-200',
                          pending:   'bg-amber-50 text-amber-700 border-amber-100',
                        }
                        return (
                          <tr key={sub.id} className="hover:bg-admin-subtle text-admin-ink align-middle">
                            <td className="py-3 px-3 max-w-[180px] truncate" title={email}>{email}</td>
                            <td className="py-3 px-3">
                              <p className="font-medium">{sub.plan?.name ?? '—'}</p>
                              <p className="text-[10px] text-admin-muted font-mono">
                                ${Number(sub.plan?.price ?? 0).toFixed(2)}/{sub.plan?.billing_interval}
                              </p>
                            </td>
                            <td className="py-3 px-3">
                              <span className={cn(
                                'rounded-lg px-2 py-0.5 text-[10px] font-bold border',
                                statusColors[sub.status] ?? '',
                              )}>
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-admin-muted whitespace-nowrap">
                              {formatDate(sub.started_at)}
                            </td>
                            <td className="py-3 px-3 text-admin-muted whitespace-nowrap">
                              {sub.expires_at ? formatDate(sub.expires_at) : '—'}
                            </td>
                            <td className="py-3 pl-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="sm" variant="ghost"
                                  onClick={() => { setSelectedSub(sub); setSubModalOpen(true) }}>
                                  Edit
                                </Button>
                                {sub.status === 'active' && (
                                  <Button size="sm" variant="ghost"
                                    disabled={cancelSubMutation.isPending}
                                    onClick={() => {
                                      if (confirm('Cancel this subscription?')) cancelSubMutation.mutate(sub.id)
                                    }}>
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {paginatedSubs.length === 0 && (
                    <div className="text-center py-12 text-admin-muted text-sm">No subscriptions found.</div>
                  )}
                </div>

                {totalSubPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t border-admin-border">
                    <Button variant="ghost" size="sm" disabled={subPage === 1}
                      onClick={() => setSubPage(p => Math.max(1, p - 1))}>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    <span className="text-xs font-semibold text-admin-ink">
                      Page {subPage} of {totalSubPages}
                    </span>
                    <Button variant="ghost" size="sm" disabled={subPage === totalSubPages}
                      onClick={() => setSubPage(p => Math.min(totalSubPages, p + 1))}>
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </Card>

              {/* Modal */}
              {subModalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                  onClick={(e) => { if (e.target === e.currentTarget) setSubModalOpen(false) }}
                >
                  <div className="relative w-full max-w-md rounded-[2rem] border border-admin-border bg-white p-6 shadow-xl space-y-4">
                    <button onClick={() => setSubModalOpen(false)}
                      className="absolute right-4 top-4 rounded-full p-1.5 text-admin-muted hover:bg-admin-subtle transition">
                      <X className="h-4 w-4" />
                    </button>
                    <h2 className="font-admin text-xl text-admin-ink">
                      {selectedSub ? 'Edit Subscription' : 'New Subscription'}
                    </h2>
                    <SubForm
                      initial={selectedSub}
                      plans={plansQuery.data ?? []}
                      users={usersQuery.data ?? []}
                      onSubmit={async (values) => {
                        if (selectedSub) {
                          await updateSubMutation.mutateAsync({ id: selectedSub.id, patch: values })
                        } else {
                          await createSubMutation.mutateAsync(values)
                        }
                        setSubModalOpen(false)
                      }}
                      isPending={createSubMutation.isPending || updateSubMutation.isPending}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
