import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Camera,
  CheckCircle2,
  Clock3,
  Database,
  LayoutGrid,
  ListChecks,
  Megaphone,
  PencilLine,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  Users,
  Wrench,
  Activity,
  Wifi,
  Search,
  DollarSign,
  RefreshCw,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  CreditCard,
  BadgeCheck,
  Key,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Loader } from '@/shared/components/ui/Loader'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { supabase } from '@/services/supabase/client'
import {
  databaseService,
  type AdminProductRecord,
  type AdminProductVariantRecord,
} from '@/services/supabase/database-service'
import { canAccessAdminSection, getAdminRoleLabel, type AdminSection, type AdminRole } from '@/shared/lib/admin'
import { parseProductTags } from '@/shared/lib/product-tags'
import { type OrderRecord } from '@/shared/lib/types'
import { cn } from '@/shared/lib/cn'
import { ProductWithConfigModal } from '../components/Productwithconfigmodal'

const sidebarSections: Array<{
  id: AdminSection
  label: string
  description: string
  icon: typeof LayoutGrid
}> = [
    { id: 'overview', label: 'Overview', description: 'System status and metrics', icon: LayoutGrid },
    { id: 'products', label: 'Products', description: 'Manage goods and catalog', icon: Store },
    { id: 'categories', label: 'Categories', description: 'Manage product categories', icon: ListChecks },
    { id: 'product-configs', label: 'Variants', description: 'Manage product shades and textures', icon: Sparkles },
    { id: 'scans', label: 'Scans', description: 'View scan history and simulation', icon: Camera },
    { id: 'access', label: 'Access', description: 'Roles and permissions', icon: Users },
    { id: 'plans', label: 'Plans', description: 'Manage subscription plans', icon: CreditCard },
    { id: 'subscriptions', label: 'Subscriptions', description: 'Manage user subscriptions', icon: BadgeCheck },
    { id: 'api-keys', label: 'API Keys', description: 'Manage API Keys', icon: Key },
    { id: 'settings', label: 'Settings', description: 'Platform and environment', icon: Wrench },
    { id: 'revenue', label: 'Revenue', description: 'Orders and sales', icon: DollarSign },
  ]

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

// const emptyProductConfigForm: ProductConfigFormState = {
//   id: '',
//   productId: '',
//   hexColor: '#ffffff',
//   texture: 'Smooth',
//   colorIntensity: 50,
//   patternName: '',
//   extraParams: '{}',
// }

const EMPTY_PLAN = {
  name: '',
  slug: '',
  price: 0,
  billing_interval: 'month' as const,
  scan_limit: 10,
  history_days: 30,
  description: '',
  features: [] as string[],
  badge: null as string | null,
  is_active: true,
}
// Thêm state để track product đang edit + configs của nó

// const emptyScanForm: ScanFormState = {
//   id: '',
//   score: '',
//   metricsJson: '{}',
// }

// const emptyRecommendationForm: RecommendationFormState = {
//   id: '',
//   scanId: '',
//   productId: '',
//   reason: '',
// }

const PRODUCT_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80'

function formatDate(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// function mapProductForm(product: AdminProductRecord): ProductFormState {
//   return {
//     id: product.id,
//     name: product.name,
//     description: product.description ?? '',
//     imageUrl: product.image_url ?? '',
//     externalUrl: product.external_url ?? '',
//     categoryId: product.category_id,
//     brand: product.brand ?? '',
//   }
// }

// function mapScanForm(scan: AdminScanRecord): ScanFormState {
//   return {
//     id: scan.id,
//     score: String(scan.score),
//     metricsJson: JSON.stringify(scan.metrics, null, 2),
//   }
// }

// function mapRecommendationForm(recommendation: AdminRecommendationRecord): RecommendationFormState {
//   return {
//     id: recommendation.id,
//     scanId: recommendation.scan_id,
//     productId: recommendation.product_id,
//     reason: recommendation.reason,
//   }
// }

function AdminSectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
      <h2 className="mt-2 font-admin text-3xl font-semibold text-admin-ink">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
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
  const { adminRole, signOut, user: currentAuthUser } = useAuth()
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')

  // Forms
  // const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm)
  // const [scanForm, setScanForm] = useState<ScanFormState>(emptyScanForm)
  // const [recommendationForm, setRecommendationForm] = useState<RecommendationFormState>(emptyRecommendationForm)
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm)

  // Filters & Search
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('All')
  const [productPage, setProductPage] = useState(1)
  const productItemsPerPage = 10

  const [adminScanSearch, setAdminScanSearch]         = useState('')
  const [adminScanModeFilter, setAdminScanModeFilter] = useState<'all' | 'api' | 'demo'>('all')
  const [adminScanPage, setAdminScanPage]             = useState(1)
  const [selectedAdminScan, setSelectedAdminScan]     = useState<any>(null)
  const ADMIN_SCAN_PAGE_SIZE = 10

  const [userSearch, setUserSearch] = useState('')

  const [categoryPage, setCategoryPage] = useState(1)
  const categoryItemsPerPage = 10

  // Revenue state
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All')

  // User Manager Form
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState<AdminRole | 'user'>('user')

  // Ping Check
  const [pingTime, setPingTime] = useState<number | null>(null)
  const [pingStatus, setPingStatus] = useState<'idle' | 'pinging' | 'success' | 'failed'>('idle')

  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [planForm, setPlanForm] = useState(EMPTY_PLAN)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [apiKeyForm, setApiKeyForm] = useState(EMPTY_FORM)

  // Modal states — Products
  const [productModalOpen, setProductModalOpen] = useState(false)

  // Modal states — Categories  
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')

  const [userModalOpen, setUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newUserPlanId, setNewUserPlanId] = useState<string>('')
  const [newUserFirstName, setNewUserFirstName] = useState('')
  const [newUserLastName, setNewUserLastName] = useState('')

  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userPlanFilter, setUserPlanFilter] = useState('all')

  const [editingProduct, setEditingProduct] = useState<AdminProductRecord | null>(null)
  const [configOnlyMode, setConfigOnlyMode] = useState(false)
  
  // ✅ GIỮ NGUYÊN khai báo này:
  const productConfigsQuery = useQuery({
    queryKey: ['admin', 'product-configs'],
    queryFn: () => databaseService.getAdminProductVariants(),
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

  const openUserModal = (user?: any) => {
    if (user) {
      setSelectedUser(user)
      setNewUserEmail(user.email)
      setNewUserFirstName(user.first_name || '')
      setNewUserLastName(user.last_name || '')
      setNewUserRole(user.role ?? 'user')
      setNewUserPlanId(user.plan_id ?? '')
      setNewUserPassword('')
    } else {
      setSelectedUser(null)
      setNewUserEmail('')
      setNewUserPassword('')
      setNewUserFirstName('')
      setNewUserLastName('')
      setNewUserRole('user')
      setNewUserPlanId('')
    }
    setUserModalOpen(true)
  }
  const testPing = async () => {
    setPingStatus('pinging')
    const start = performance.now()
    try {
      await supabase.from('products').select('id').limit(1)
      setPingTime(Math.round(performance.now() - start))
      setPingStatus('success')
    } catch {
      setPingTime(-1)
      setPingStatus('failed')
    }
  }

  // Auto ping on mount
  useEffect(() => {
    void testPing()
  }, [])
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeSection])
  // Queries
  const keysQuery = useQuery({
    queryKey: ['admin', 'api-keys'],
    queryFn: () => databaseService.getAdminApiKeys(),
  })

  const productsQuery = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => databaseService.getAdminProducts(),
  })

  const scansQuery = useQuery({
    queryKey: ['admin', 'scans'],
    queryFn: () => databaseService.getAdminScans(),
  })

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => databaseService.getAdminCategories(),
  })


  const usersQuery = useQuery({
  queryKey: ['admin', 'profiles'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        plan:plans(id, name, slug, price, billing_interval)
      `) as { data: any[] | null; error: any }  // ← cast ở đây
    if (error) throw error
    return data ?? []
  },
})

  const ordersQuery = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => databaseService.getOrders(),
  })

  const plansQuery = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => databaseService.getPlans(),
  })

  

  // Lookups & Filters
  const tabs = useMemo(
    () => sidebarSections.filter((section) => canAccessAdminSection(adminRole, section.id)),
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

  const productLookup = useMemo(() => {
    return new Map((productsQuery.data ?? []).map((product) => [product.id, product]))
  }, [productsQuery.data])

  // const scanLookup = useMemo(() => {
  //   return new Map((scansQuery.data ?? []).map((scan) => [scan.id, scan]))
  // }, [scansQuery.data])

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
        return databaseService.updateApiKey(apiKeyForm.id, payload)
      }
      return databaseService.createApiKey(payload)
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
            databaseService.updateApiKey(k.id, { is_active: false })
          )
        )
      }

      // Sau đó update key được chọn
      return databaseService.updateApiKey(id, { is_active })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] })
    },
  })
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => databaseService.deleteApiKey(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'api-keys'] })
      await queryClient.invalidateQueries({ queryKey: ['catalog', 'api-keys'] })
      await queryClient.invalidateQueries({ queryKey: ['landing', 'api-keys'] })
    },
  })


  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => databaseService.deleteProduct(id),
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
        return databaseService.updateCategory(categoryForm.id, input)
      }

      return databaseService.createCategory(input)
    },
    onSuccess: async () => {
      setCategoryForm(emptyCategoryForm)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => databaseService.deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
    },
  })

  

  const deleteProductConfigMutation = useMutation({
    mutationFn: async (id: string) => databaseService.deleteProductVariant(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'product-configs'] })
    },
  })


  const deleteScanMutation = useMutation({
    mutationFn: async (id: string) => databaseService.deleteScan(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'scans'] })
      await queryClient.invalidateQueries({ queryKey: ['scan-history'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'recommendations'] })
    },
  })

  const createPlanMutation = useMutation({
    mutationFn: (plan: any) => databaseService.createPlan(plan),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] }),
  })

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) =>
      databaseService.updatePlan(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] }),
  })

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => databaseService.deletePlan(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] }),
  })


  // User Manager Mutations
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return databaseService.updateUserRole(userId, role)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
      await useAuthStore.getState().initialize()
    },
  })

  const createUserRoleMutation = useMutation({
    mutationFn: async () => {
      if (!newUserEmail || !newUserEmail.includes('@')) {
        throw new Error('Please enter a valid email address.')
      }
      if (!newUserPassword || newUserPassword.length < 8) {
        throw new Error('Password must be at least 8 characters.')
      }
      return databaseService.createUserWithRole(
        newUserEmail,
        newUserPassword,
        newUserFirstName,
        newUserLastName,
        newUserRole as 'admin' | 'user',
        newUserPlanId,
      )
    },
    onSuccess: async () => {
      setNewUserEmail('')
      setNewUserPassword('')
      setNewUserPlanId('')
      setUserModalOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
    },
  })

  const deleteUserRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      return databaseService.deleteUserRole(userId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
      await useAuthStore.getState().initialize()
    },
  })

  const updateUserPlanMutation = useMutation({
    mutationFn: async ({ userId, planId, role, firstName, lastName }: { userId: string; planId: string, role: string, firstName: string, lastName: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ plan_id: planId || null, role: role, first_name: firstName, last_name: lastName } as any)  // ← thêm `as any`
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
      await useAuthStore.getState().initialize()
    },
  })


  // Order & Revenue Mutations
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: 'pending' | 'completed' | 'canceled' }) => {
      return databaseService.updateOrderStatus(orderId, status)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return databaseService.deleteOrder(orderId)
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

      const newOrder: OrderRecord = {
        id: `BG-${Math.floor(100000 + Math.random() * 900000)}`,
        productId: prod.id,
        productName: prod.name,
        productImage: prod.image_url || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80',
        productCategory: parseProductTags(prod).category || 'Serum',
        quantity,
        price,
        totalPrice: price * quantity,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        shippingInfo: { name, phone, address },
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      return databaseService.createOrder(newOrder)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const subscriptionsQuery = useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: () => databaseService.getSubscriptions(),
  })

  const createSubMutation = useMutation({
    mutationFn: (input: any) => databaseService.createSubscription(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] }),
  })

  const updateSubMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) =>
      databaseService.updateSubscription(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] }),
  })

  const cancelSubMutation = useMutation({
    mutationFn: (id: string) => databaseService.cancelSubscription(id),
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
        {/* Sidebar Nav */}
        <aside className="admin-panel sticky top-[calc(var(--app-header-height)+1rem)] h-fit p-3">
          <div className="rounded-lg border border-admin-border bg-admin-surface p-4">
            <div className="inline-flex items-center gap-2 rounded-md border border-admin-border bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-admin-accent">
              <ShieldCheck className="h-4 w-4" />
              {getAdminRoleLabel(adminRole)}
            </div>
            <h1 className="mt-3 font-admin text-2xl font-semibold text-admin-ink">Dashboard</h1>
            <p className="mt-2 text-sm leading-6 text-admin-muted">
              Manage product data, skin scan history, and user access roles in real-time.
            </p>
          </div>

          <nav className="mt-4 space-y-2">
            {tabs.map((section) => {
              const Icon = section.icon
              const active = activeSection === section.id

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${active
                    ? 'border-admin-border bg-slate-100 text-admin-ink'
                    : 'border-transparent bg-white text-admin-muted hover:border-admin-border hover:bg-admin-surface hover:text-admin-ink'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-md p-2 ${active ? 'bg-white text-admin-ink shadow-sm' : 'bg-admin-surface text-admin-muted'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">{section.label}</p>
                      <p className="mt-0.5 text-xs leading-5 text-admin-muted">{section.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>

          <div className="mt-4 space-y-2">
            <Button
              className="admin-primary w-full justify-center"
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: ['admin'] })
                void testPing()
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
            <Button variant="ghost" className="admin-secondary w-full justify-center" onClick={() => void signOut()}>
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Dashboard Welcome Header */}
          {activeSection === 'overview' && (
            <Card className="relative overflow-hidden border-admin-border bg-white p-0">
              <div className="grid gap-6 p-6 lg:grid-cols-[1.35fr_0.9fr] lg:p-8 relative z-10">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-md border border-admin-border bg-admin-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-admin-accent">
                    <Database className="h-4 w-4" />
                    Supabase Platform Connection
                  </div>
                  <div className="space-y-3">
                    <h2 className="font-admin text-3xl font-semibold text-admin-ink md:text-4xl">
                      Operate the entire beauty platform from one place
                    </h2>
                    <p className="max-w-2xl text-sm leading-7 text-admin-muted md:text-base">
                      Real-time Supabase connection is active. Changes to categories, scans, and roles will sync immediately and reflect on the application.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button className="admin-primary" onClick={() => setActiveSection('products')}>
                      Manage Products
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="admin-secondary" onClick={() => setActiveSection('scans')}>
                      Scans & Simulation
                    </Button>
                    <Button variant="ghost" className="admin-secondary" onClick={() => setActiveSection('access')}>
                      Edit User Roles
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {overviewCards.map((card) => {
                    const Icon = card.icon

                    return (
                      <div key={card.label} className="rounded-lg border border-admin-border bg-admin-surface p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-admin-muted">{card.label}</p>
                            <p className="mt-2 font-admin text-3xl font-semibold text-admin-ink">{card.value}</p>
                            <p className="mt-1 text-xs text-admin-muted">{card.hint}</p>
                          </div>
                          <div className="rounded-md border border-admin-border bg-white p-3 text-admin-accent">
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* OVERVIEW TAB */}
          {activeSection === 'overview' ? (
            <div className="space-y-6">
              {/* Row 1: System Health & Ping Status */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-admin-border p-5 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-xs uppercase tracking-[0.2em] text-admin-accent">
                      <span>Supabase Connection</span>
                      <Wifi className="h-4 w-4 text-emerald-500 animate-pulse" />
                    </div>
                    <h3 className="mt-3 font-admin text-2xl text-admin-ink">Online</h3>
                    <p className="mt-1 text-xs text-admin-muted leading-relaxed">
                      API is active and accepting CRUD operations.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-admin-border flex items-center justify-between text-xs">
                    <span className="text-admin-muted">DB Latency:</span>
                    <span className="font-semibold text-emerald-600">
                      {pingStatus === 'pinging' ? '...' : pingTime && pingTime > 0 ? `${pingTime}ms` : 'Ping Failed'}
                    </span>
                  </div>
                </Card>

                <Card className="border border-admin-border p-5 bg-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-admin-accent">DB Queries</p>
                  <h3 className="mt-3 font-admin text-2xl text-admin-ink">
                    {scansQuery.data ? scansQuery.data.length + (productsQuery.data?.length ?? 0) : '0'} rows
                  </h3>
                  <p className="mt-2 text-xs text-admin-muted">
                    Products, recommendations, and records.
                  </p>
                  <div className="mt-3 pt-3 border-t border-admin-border text-right">
                    <button
                      onClick={testPing}
                      disabled={pingStatus === 'pinging'}
                      className="text-xs text-admin-accent hover:underline flex items-center justify-end gap-1 ml-auto"
                    >
                      <Activity className="h-3 w-3" />
                      {pingStatus === 'pinging' ? 'Checking...' : 'Check Connection'}
                    </button>
                  </div>
                </Card>

                <Card className="border border-admin-border p-5 bg-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-admin-accent">CPU Simulation</p>
                  <h3 className="mt-3 font-admin text-2xl text-admin-ink">14% - 24%</h3>
                  <div className="w-full bg-admin-subtle h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-admin-accent to-admin-accent h-full rounded-full w-[18%]" />
                  </div>
                  <p className="mt-2 text-[10px] text-admin-muted">Average server usage</p>
                </Card>

                <Card className="border border-admin-border p-5 bg-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-admin-accent">Memory Load</p>
                  <h3 className="mt-3 font-admin text-2xl text-admin-ink">512 MB</h3>
                  <div className="w-full bg-admin-subtle h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan to-teal-400 h-full rounded-full w-[50%]" />
                  </div>
                  <p className="mt-2 text-[10px] text-admin-muted">Used 512MB out of 1024MB allocated</p>
                </Card>
              </div>


              {/* Row 3: Live Audit Logs / Activity Log */}
              <Card className="border border-admin-border p-6 bg-white space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-admin text-xl text-admin-ink">System Activity</h3>
                    <p className="text-xs text-admin-muted">Live notifications and activity logs.</p>
                  </div>
                  <span className="text-[10px] bg-admin-subtle text-admin-accent px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                    Logs
                  </span>
                </div>
                <div className="divide-y divide-rose-50 max-h-60 overflow-y-auto pr-1">
                  {systemActivityLog.map((log) => (
                    <div key={log.id} className="py-3 flex justify-between items-start text-xs gap-3">
                      <div className="flex gap-2">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.type === 'success' ? 'bg-emerald-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-admin-subtle0'
                          }`} />
                        <div>
                          <p className="font-semibold text-admin-ink">{log.user}</p>
                          <p className="text-admin-muted">{log.event}</p>
                        </div>
                      </div>
                      <span className="text-admin-muted whitespace-nowrap">{log.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}

          {/* PRODUCTS TAB */}
          {activeSection === 'products' ? (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="bg-white border border-admin-border rounded-3xl p-4 flex flex-wrap gap-3 items-center">
                <div className="flex-1 relative min-w-[200px]">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-admin-muted" />
                  <input
                    type="text"
                    className="w-full rounded-full border border-admin-border pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent/20"
                    placeholder="Search products by name or brand..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <select
                  className="rounded-full border border-admin-border px-3 py-2 text-sm text-admin-ink focus:outline-none"
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {(categoriesQuery.data ?? []).map((category) => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
                <Button onClick={() => openProductModal()}>
                  + Add Product
                </Button>
              </div>

              {/* Products Table */}
              <Card className="border border-admin-border p-6 bg-white shadow-sm overflow-x-auto">
                <AdminSectionTitle
                  eyebrow="Product List"
                  title="Manage Products"
                  description={`${filteredProducts.length} product(s) — image preview, full description, IDs, and partner links.`}
                />
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[960px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-admin-border text-admin-ink font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-3 w-[72px]">Image</th>
                        <th className="pb-3 px-3 min-w-[200px]">Product</th>
                        <th className="pb-3 px-3">Brand</th>
                        <th className="pb-3 px-3">Category</th>
                        <th className="pb-3 px-3 min-w-[180px]">Links</th>
                        <th className="pb-3 px-3 whitespace-nowrap">Created</th>
                        <th className="pb-3 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {paginatedProducts.map((product) => {
                        const categoryName = categoriesQuery.data?.find((c) => c.id === product.category_id)?.name ?? 'Unknown'
                        const imageSrc = product.image_url?.trim() || PRODUCT_PLACEHOLDER_IMAGE
                        return (
                          <tr key={product.id} className="hover:bg-admin-subtle text-admin-ink align-top">
                            <td className="py-3 pr-3">
                              <img
                                src={imageSrc}
                                alt={product.name}
                                loading="lazy"
                                className="h-14 w-14 shrink-0 rounded-xl border border-admin-border bg-admin-subtle object-cover"
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PRODUCT_PLACEHOLDER_IMAGE }}
                              />
                            </td>
                            <td className="py-3 px-3">
                              <div className="min-w-0 max-w-[280px]">
                                <p className="font-bold text-sm leading-tight text-admin-ink">{product.name}</p>
                                <p className="mt-1 font-mono text-[10px] text-admin-muted break-all">ID: {product.id}</p>
                                <p className="mt-1.5 text-[11px] leading-relaxed text-admin-muted whitespace-pre-wrap break-words">
                                  {product.description?.trim() || '—'}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-admin-muted whitespace-nowrap">{product.brand?.trim() || '—'}</td>
                            <td className="py-3 px-3">
                              <p className="font-semibold text-admin-accent">{categoryName}</p>
                              <p className="mt-0.5 font-mono text-[10px] text-admin-muted break-all">{product.category_id}</p>
                            </td>
                            <td className="py-3 px-3 text-admin-muted">
                              <div className="space-y-2 min-w-0 max-w-[220px]">
                                {product.image_url?.trim() ? (
                                  <a href={product.image_url} target="_blank" rel="noreferrer"
                                    className="inline-flex items-start gap-1 text-[10px] text-admin-accent hover:underline break-all">
                                    <ExternalLink className="h-3 w-3 shrink-0 mt-0.5" /> Image URL
                                  </a>
                                ) : <span className="text-[10px]">No image URL</span>}
                                {product.external_url?.trim() ? (
                                  <a href={product.external_url} target="_blank" rel="noreferrer"
                                    className="inline-flex items-start gap-1 text-[10px] text-admin-accent hover:underline break-all">
                                    <ExternalLink className="h-3 w-3 shrink-0 mt-0.5" /> Partner URL
                                  </a>
                                ) : <span className="text-[10px]">No partner URL</span>}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-admin-muted whitespace-nowrap">{formatDate(product.created_at)}</td>
                            <td className="py-3 pl-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="sm" variant="ghost" onClick={() => openProductModal(product)}>
                                  <PencilLine className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost"
                                  onClick={() => { if (confirm(`Delete ${product.name}?`)) deleteProductMutation.mutate(product.id) }}
                                  disabled={deleteProductMutation.isPending}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {paginatedProducts.length === 0 && (
                    <div className="text-center py-12 text-admin-muted text-sm">
                      No products match the search or category filter.
                    </div>
                  )}
                </div>
                {totalProductPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t border-admin-border">
                    <Button variant="ghost" size="sm" disabled={productPage === 1}
                      onClick={() => setProductPage(p => Math.max(1, p - 1))}>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    <span className="text-xs font-semibold text-admin-ink">Page {productPage} of {totalProductPages}</span>
                    <Button variant="ghost" size="sm" disabled={productPage === totalProductPages}
                      onClick={() => setProductPage(p => Math.min(totalProductPages, p + 1))}>
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </Card>

              
            </div>
          ) : null}
          {/* ─── Product Modal ─── */}
              <ProductWithConfigModal
                configOnly={configOnlyMode}
                open={productModalOpen}
                onClose={() => { 
                  setConfigOnlyMode(false)  // ← quan trọng: reset mode khi close
                  setProductModalOpen(false)
                  setEditingProduct(null) }}
                categories={categoriesQuery.data ?? []}
                initial={editingProduct}
                existingConfigs={existingConfigs}
                onSaved={() => {
                  queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
                  queryClient.invalidateQueries({ queryKey: ['admin', 'product-configs'] })
                  queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
                  queryClient.invalidateQueries({ queryKey: ['makeup', 'catalog'] })
                  setProductModalOpen(false)
                  setEditingProduct(null)
                }}
              />
          {/* CATEGORIES TAB */}
          {activeSection === 'categories' ? (
            <div className="space-y-4">
              {/* Header + Add button */}
              <div className="bg-white border border-admin-border rounded-3xl p-4 flex flex-wrap gap-3 items-center">
              <div className="flex-1 relative min-w-[200px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-admin-muted" />
                <input
                  type="text"
                  className="w-full rounded-full border border-admin-border pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent/20"
                  placeholder="Search by name or API key..."
                  value={categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value)
                    setCategoryPage(1) // reset về trang 1 khi tìm
                  }}
                />
              </div>
              <Button onClick={() => openCategoryModal()}>
                + Add Category
              </Button>
            </div>

              {/* Categories Table */}
              <Card className="border border-admin-border p-6 bg-white shadow-sm">
                <AdminSectionTitle
                  eyebrow="Category List"
                  title="Manage Categories"
                  description={`${filteredCategories.length} categor${filteredCategories.length === 1 ? 'y' : 'ies'} found.`}
                />
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-admin-border text-admin-ink font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-3">Category Name</th>
                        <th className="pb-3 px-3">API Key</th>
                        <th className="pb-3 px-3">Created At</th>
                        <th className="pb-3 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {paginatedCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-admin-subtle text-admin-ink">
                          <td className="py-3 pr-3 font-medium">{category.name}</td>
                          <td className="py-3 px-3 text-admin-muted">{category.api_category_key}</td>
                          <td className="py-3 px-3 text-admin-muted">{formatDate(category.created_at)}</td>
                          <td className="py-3 pl-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => openCategoryModal(category)}>
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm(`Delete category ${category.name}?`)) {
                                    deleteCategoryMutation.mutate(category.id)
                                  }
                                }}
                                disabled={deleteCategoryMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {paginatedCategories.length === 0 && (
                    <p className="mt-4 text-sm text-admin-muted text-center py-4">
                      No categories available. Click "Add Category" to get started.
                    </p>
                  )}
                </div>
                {totalCategoryPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t border-admin-border">
                    <Button variant="ghost" size="sm" disabled={categoryPage === 1}
                      onClick={() => setCategoryPage(p => Math.max(1, p - 1))}>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    <span className="text-xs font-semibold text-admin-ink">Page {categoryPage} of {totalCategoryPages}</span>
                    <Button variant="ghost" size="sm" disabled={categoryPage === totalCategoryPages}
                      onClick={() => setCategoryPage(p => Math.min(totalCategoryPages, p + 1))}>
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </Card>

              {/* ─── Category Modal ─── */}
              {categoryModalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                  onClick={(e) => { if (e.target === e.currentTarget) setCategoryModalOpen(false) }}
                >
                  <div className="relative w-full max-w-md rounded-[2rem] border border-admin-border bg-white p-6 shadow-xl space-y-4">
                    <button
                      onClick={() => setCategoryModalOpen(false)}
                      className="absolute right-4 top-4 rounded-full p-1.5 text-admin-muted hover:bg-admin-subtle transition"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <h2 className="font-admin text-xl text-admin-ink">
                      {categoryForm.id ? 'Edit Category' : 'Add New Category'}
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">Category Name</label>
                        <Input
                          placeholder="e.g. Lipstick"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm((s) => ({ ...s, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">API Category Key</label>
                        <Input
                          placeholder="e.g. lip_color"
                          value={categoryForm.apiCategoryKey}
                          onChange={(e) => setCategoryForm((s) => ({ ...s, apiCategoryKey: e.target.value }))}
                        />
                      </div>

                      {saveCategoryMutation.error && (
                        <p className="text-sm text-admin-accent">{saveCategoryMutation.error.message}</p>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setCategoryModalOpen(false)}>Cancel</Button>
                        <Button
                          onClick={async () => {
                            await saveCategoryMutation.mutateAsync()
                            setCategoryModalOpen(false)
                          }}
                          disabled={saveCategoryMutation.isPending}
                        >
                          {saveCategoryMutation.isPending
                            ? 'Saving...'
                            : categoryForm.id ? 'Update Category' : 'Create Category'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* PRODUCT CONFIGS TAB */}
          {activeSection === 'product-configs' ? (
            <div className="space-y-4">
              {/* Bảng xem nhanh tất cả configs */}
              <Card className="border border-admin-border p-6 bg-white shadow-sm">
                <AdminSectionTitle
                  eyebrow="Config List"
                  title="All Product Variants"
                  description={`${productConfigsQuery.data?.length ?? 0} variant(s) - one row per shade or texture.`}
                />
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-admin-border text-admin-ink font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-3">Product</th>
                        <th className="pb-3 px-3">Variant</th>
                        <th className="pb-3 px-3">Color</th>
                        <th className="pb-3 px-3 min-w-[180px]">Texture</th>
                        <th className="pb-3 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {(productConfigsQuery.data ?? []).map((config) => (
                        <tr key={config.id} className="hover:bg-admin-subtle text-admin-ink align-top">
                          <td className="py-3 pr-3 font-medium">
                            {productLookup.get(config.product_id)?.name ?? 'Unknown'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="rounded-full bg-admin-subtle border border-admin-border px-2 py-0.5 text-[11px] font-medium text-admin-accent capitalize">
                              {config.name || 'Default shade'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {config.color_hex ? (
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-4 w-4 rounded-full border border-white shadow-sm shrink-0"
                                  style={{ backgroundColor: config.color_hex }}
                                />
                                <span className="font-mono text-[11px] text-admin-muted uppercase">
                                  {config.color_hex}
                                </span>
                              </div>
                            ) : (
                              <span className="text-admin-muted">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {config.texture ? (
                              <span className="font-mono text-[11px] text-admin-muted capitalize">
                                {config.texture}
                              </span>
                            ) : (
                              <span className="text-admin-muted">—</span>
                            )}
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const product = productLookup.get(config.product_id)
                                  if (product) {
                                    setEditingProduct(product)
                                    setConfigOnlyMode(true)
                                    setProductModalOpen(true)
                                  }
                                }}
                              >
                                <PencilLine className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm('Delete this variant?')) {
                                    deleteProductConfigMutation.mutate(config.id)
                                  }
                                }}
                                disabled={deleteProductConfigMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(productConfigsQuery.data?.length ?? 0) === 0 && (
                    <div className="text-center py-12 text-admin-muted text-sm">
                      No variants yet. Add variants from the Products tab.
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : null}

          {/* SCANS TAB WITH SCAN SIMULATOR */}
          {activeSection === 'scans' && (
            <div className="space-y-4">
              {/* Search & filter */}
              <div className="bg-white border border-admin-border rounded-3xl p-4 flex flex-wrap gap-3 items-center">
                <div className="flex-1 relative min-w-[200px]">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-admin-muted" />
                  <input
                    type="text"
                    className="w-full rounded-full border border-admin-border pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent/20"
                    placeholder="Search by Scan ID, User UUID or Email..."
                    value={adminScanSearch}
                    onChange={(e) => { setAdminScanSearch(e.target.value); setAdminScanPage(1) }}
                  />
                </div>
                <select
                  className="rounded-full border border-admin-border px-3 py-2 text-sm text-admin-ink focus:outline-none"
                  value={adminScanModeFilter}
                  onChange={(e) => { setAdminScanModeFilter(e.target.value as any); setAdminScanPage(1) }}
                >
                  <option value="all">All Modes</option>
                  <option value="api">API Mode</option>
                  <option value="demo">Demo Mode</option>
                </select>
              </div>

              <Card className="border border-admin-border p-6 bg-white shadow-sm">
                <AdminSectionTitle
                  eyebrow="Scan History"
                  title="All Users Scans"
                  description={`${filteredAdminScans.length} scan record(s) — image preview, user email, applied effects.`}
                />

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-admin-border text-admin-ink font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-3 w-[100px]">Images</th>
                        <th className="pb-3 px-3">Scan ID</th>
                        <th className="pb-3 px-3">Email</th>
                        <th className="pb-3 px-3">Mode</th>
                        <th className="pb-3 px-3 min-w-[200px]">Effects</th>
                        <th className="pb-3 px-3 whitespace-nowrap">Created</th>
                        <th className="pb-3 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {paginatedAdminScans.map((scan) => {
                        // const enabledEffects = (scan.effects ?? []).filter((e: any) => e.enabled)
                        const email = scan.user_id ? (userLookup.get(scan.user_id)?.email ?? scan.user_id.slice(0, 8) + '...') : 'Guest'
                        return (
                          <tr key={scan.id} className="hover:bg-admin-subtle text-admin-ink align-middle">
                            <td className="py-3 pr-3">
                              <div className="flex gap-1">
                                {[scan.original_image, scan.image_url].map((url, i) => (
                                  <img
                                    key={i}
                                    src={url || 'https://placehold.co/40x40/fce7f3/9f1239?text=?'}
                                    alt={i === 0 ? 'Before' : 'After'}
                                    className="h-10 w-10 rounded-lg border border-admin-border object-cover bg-admin-subtle"
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono font-semibold" title={scan.id}>
                              {scan.id.slice(0, 8)}...
                            </td>
                            <td className="py-3 px-3 text-admin-muted max-w-[180px] truncate" title={email}>
                              {email}
                            </td>
                            <td className="py-3 px-3">
                              <span className={cn(
                                'text-[10px] font-bold rounded-lg px-2 py-0.5 border',
                                scan.mode === 'api'
                                  ? 'text-emerald-700 bg-emerald-50/50 border-emerald-100'
                                  : 'text-admin-accent bg-admin-subtle border-admin-border',
                              )}>
                                {scan.mode === 'api' ? 'API' : 'Demo'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-wrap gap-1.5">
                                {(scan.effects ?? []).map((e: any) => (
                                  <span
                                    key={e.category}
                                    className={cn(
                                      'rounded-full px-2.5 py-0.5 text-[11px] capitalize',
                                      e.enabled
                                        ? 'bg-admin-subtle border border-admin-border text-admin-accent'
                                        : 'bg-admin-subtle border border-admin-border text-admin-muted',
                                    )}
                                  >
                                    {e.category.replace(/_/g, ' ')}
                                    {e.enabled ? ' (Active)' : ' (Disabled)'}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-admin-muted whitespace-nowrap">
                              {formatDate(scan.created_at)}
                            </td>
                            <td className="py-3 pl-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setSelectedAdminScan(scan)}>
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => { if (confirm('Delete this scan?')) deleteScanMutation.mutate(scan.id) }}
                                  disabled={deleteScanMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {paginatedAdminScans.length === 0 && (
                    <div className="text-center py-12 text-admin-muted text-sm">No scan records found.</div>
                  )}
                </div>

                {totalAdminScanPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t border-admin-border">
                    <Button variant="ghost" size="sm" disabled={adminScanPage === 1} onClick={() => setAdminScanPage(p => Math.max(1, p - 1))}>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    <span className="text-xs font-semibold text-admin-ink">Page {adminScanPage} of {totalAdminScanPages}</span>
                    <Button variant="ghost" size="sm" disabled={adminScanPage === totalAdminScanPages} onClick={() => setAdminScanPage(p => Math.min(totalAdminScanPages, p + 1))}>
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </Card>

              {/* Detail modal — matches RecommendationsPage ScanDetailModal */}
              {selectedAdminScan && (() => {
                const allEffects = selectedAdminScan.effects ?? []

                const renderAdminEffectDetails = (effect: any) => {
                  const details: { label: string; value: React.ReactNode }[] = []
                  if (effect.palettes && effect.palettes.length > 0) {
                    effect.palettes.forEach((p: any, i: number) => {
                      const labelSuffix = effect.palettes.length > 1 ? ` #${i + 1}` : ''
                      details.push({
                        label: `Color${labelSuffix}`,
                        value: (
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-4 h-4 rounded-full border border-admin-border/20 shadow-sm" style={{ backgroundColor: p.color }} />
                            <span className="font-mono text-[11px] uppercase text-admin-ink font-semibold">{p.color}</span>
                          </div>
                        ),
                      })
                      if (p.texture) details.push({ label: `Texture${labelSuffix}`, value: <span className="capitalize">{p.texture}</span> })
                      if (p.colorIntensity != null) details.push({ label: `Color Intensity${labelSuffix}`, value: `${p.colorIntensity}%` })
                      if (p.glowIntensity != null) details.push({ label: `Glow Intensity${labelSuffix}`, value: `${p.glowIntensity}%` })
                      if (p.shimmerIntensity != null) details.push({ label: `Shimmer Intensity${labelSuffix}`, value: `${p.shimmerIntensity}%` })
                    })
                  }
                  if (effect.pattern?.name) details.push({ label: 'Pattern', value: <span className="capitalize">{effect.pattern.name}</span> })
                  if (effect.shape?.name) details.push({ label: 'Shape', value: <span className="capitalize">{effect.shape.name}</span> })
                  if (effect.style?.type) details.push({ label: 'Style', value: <span className="capitalize">{effect.style.type}</span> })
                  if (effect.skinSmoothStrength != null) details.push({ label: 'Smoothness Strength', value: `${effect.skinSmoothStrength}%` })
                  if (details.length === 0) return null
                  return (
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs border-t border-admin-border pt-2">
                      {details.map((d, index) => (
                        <div key={index} className="flex flex-col gap-0.5">
                          <span className="text-[9px] uppercase font-bold text-admin-muted tracking-wider">{d.label}</span>
                          <span className="text-admin-ink font-semibold">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  )
                }

                return (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
                  onClick={(e) => { if (e.target === e.currentTarget) setSelectedAdminScan(null) }}
                >
                  <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-admin-border bg-white shadow-2xl flex flex-col max-h-[90vh]">
                    <button
                      onClick={() => setSelectedAdminScan(null)}
                      className="absolute right-5 top-5 z-10 rounded-full p-2 text-admin-muted bg-white/90 hover:bg-admin-subtle hover:text-admin-accent transition shadow-sm"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-rose-100 overflow-y-auto flex-1">
                      {/* Left Side: Images */}
                      <div className="lg:col-span-5 p-6 md:p-8 space-y-4">
                        <h3 className="font-admin text-lg font-bold text-admin-ink">Visual Comparison</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative rounded-2xl overflow-hidden bg-admin-subtle border border-admin-border aspect-[3/4]">
                            {selectedAdminScan.original_image ? (
                              <img src={selectedAdminScan.original_image} className="h-full w-full object-cover" alt="Before" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-sm text-admin-muted">Before</div>
                            )}
                            <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-0.5 text-xs font-semibold text-white">Before</span>
                          </div>
                          <div className="relative rounded-2xl overflow-hidden bg-admin-subtle border border-admin-border aspect-[3/4]">
                            {selectedAdminScan.image_url ? (
                              <img src={selectedAdminScan.image_url} className="h-full w-full object-cover" alt="After" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-sm text-admin-muted">After</div>
                            )}
                            <span className="absolute bottom-3 left-3 rounded-full bg-admin-accent px-2.5 py-0.5 text-xs font-semibold text-white">After</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Details & All Effects */}
                      <div className="lg:col-span-7 p-6 md:p-8 space-y-6 overflow-y-auto">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-admin-accent">Scan Details</p>
                          <h2 className="mt-1 font-admin text-2xl text-admin-ink font-extrabold">Metadata & Effects</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-admin-subtle border border-admin-border p-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-admin-muted block">Scan ID</span>
                            <span className="font-mono text-xs text-admin-ink font-semibold break-all">{selectedAdminScan.id}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-admin-muted block">Email</span>
                            <span className="text-xs text-admin-ink font-semibold break-all">
                              {selectedAdminScan.user_id ? (userLookup.get(selectedAdminScan.user_id)?.email ?? 'Unknown') : 'Guest'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-admin-muted block">Mode</span>
                            <span className={cn(
                              'inline-block rounded-full px-2 py-0.5 text-[10px] font-bold border mt-0.5 uppercase',
                              selectedAdminScan.mode === 'api' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-admin-subtle text-admin-accent border-admin-border',
                            )}>
                              {selectedAdminScan.mode === 'api' ? 'API' : 'Demo'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-admin-muted block">Created</span>
                            <div className="flex items-center gap-2 text-xs text-admin-ink font-medium mt-0.5">
                              {formatDate(selectedAdminScan.created_at)}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs uppercase font-bold tracking-widest text-admin-muted mb-3">All Makeup Effects</h3>
                          {allEffects.length === 0 ? (
                            <p className="text-xs text-admin-muted">No makeup effects recorded for this scan.</p>
                          ) : (
                            <div className="space-y-4">
                              {allEffects.map((e: any) => (
                                <div key={e.category} className="rounded-2xl border border-admin-border bg-admin-subtle p-4 shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold capitalize text-admin-ink">
                                      {e.category.replace(/_/g, ' ')}
                                    </span>
                                    <span className={cn(
                                      'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border',
                                      e.enabled
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                        : 'bg-gray-50 border-gray-200 text-gray-400',
                                    )}>
                                      {e.enabled ? 'Active' : 'Disabled'}
                                    </span>
                                  </div>
                                  {renderAdminEffectDetails(e)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )
              })()}
            </div>
          )}

          {/* ACCESS CONTROL MANAGER */}
          {activeSection === 'access' ? (
            <div className="space-y-4">
              {/* Search + Add */}
              <div className="bg-white border border-admin-border rounded-3xl p-4 flex flex-wrap gap-3 items-center">
                {/* Search */}
                <div className="flex-1 relative min-w-[200px]">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-admin-muted" />
                  <input
                    type="text"
                    className="w-full rounded-full border border-admin-border pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent/20"
                    placeholder="Search by email or name..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>

                {/* Role filter */}
                <select
                  className="rounded-full border border-admin-border px-3 py-2 text-sm text-admin-ink focus:outline-none"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>

                {/* Plan filter — dynamic từ plansQuery */}
                <select
                  className="rounded-full border border-admin-border px-3 py-2 text-sm text-admin-ink focus:outline-none"
                  value={userPlanFilter}
                  onChange={(e) => setUserPlanFilter(e.target.value)}
                >
                  <option value="all">All Plans</option>
                  <option value="">No Plan</option>
                  {(plansQuery.data ?? []).map((p: any) => (
                    <option key={p.id} value={p.slug}>{p.name}</option>
                  ))}
                </select>

                <Button onClick={() => openUserModal()}>
                  + Add User
                </Button>
              </div>

              {/* Table */}
              <Card className="border border-admin-border p-6 bg-white shadow-sm">
                <AdminSectionTitle
                  eyebrow="User Access Control"
                  title="Manage Users"
                  description={`${filteredUsers.length} user(s) — role, plan, and profile details.`}
                />

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-admin-border text-admin-ink font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-3">User</th>
                        <th className="pb-3 px-3">Role</th>
                        <th className="pb-3 px-3">Plan</th>
                        <th className="pb-3 px-3">Updated At</th>
                        <th className="pb-3 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {filteredUsers.map((item: any) => {
                        const fullName = [item.first_name, item.last_name].filter(Boolean).join(' ')
                        return (
                          <tr key={item.id} className="hover:bg-admin-subtle text-admin-ink align-middle">
                            {/* Avatar + name + email */}
                            <td className="py-3 pr-3">
                              <div className="flex items-center gap-3">
                                {item.avatar_url ? (
                                  <img
                                    src={item.avatar_url}
                                    alt={fullName || item.email}
                                    className="h-9 w-9 rounded-full border border-admin-border object-cover shrink-0"
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                  />
                                ) : (
                                  <div className="h-9 w-9 rounded-full bg-admin-subtle flex items-center justify-center shrink-0 text-admin-accent font-bold text-sm">
                                    {(item.email?.[0] ?? '?').toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-admin-ink truncate max-w-[180px]">
                                    {fullName || <span className="text-admin-muted italic font-normal">No name</span>}
                                    {item.email?.toLowerCase() === currentAuthUser?.email?.toLowerCase() && (
                                      <span className="ml-1 text-[9px] bg-admin-accent/10 text-admin-accent px-1.5 py-0.5 rounded font-extrabold">You</span>
                                    )}
                                  </p>
                                  <p className="text-admin-muted truncate max-w-[180px]" title={item.email}>{item.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Role badge */}
                            <td className="py-3 px-3">
                              <span className={cn(
                                'rounded-lg px-2.5 py-1 text-[10px] font-bold border uppercase tracking-wide',
                                item.role === 'admin'
                                  ? 'bg-admin-subtle text-admin-accent border-admin-border'
                                  : 'bg-gray-50 text-gray-500 border-gray-200',
                              )}>
                                {item.role ?? 'user'}
                              </span>
                            </td>

                            {/* Plan badge */}
                            <td className="py-3 px-3">
                              {item.plan ? (
                                <div>
                                  <span className={cn(
                                    'rounded-lg px-2.5 py-1 text-[10px] font-bold border uppercase tracking-wide',
                                    item.plan.slug === 'pro'
                                      ? 'bg-admin-accent/10 text-admin-accent border-admin-accent/20'
                                      : item.plan.slug === 'premium'
                                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                                      : 'bg-gray-50 text-gray-500 border-gray-200',
                                  )}>
                                    {item.plan.name}
                                  </span>
                                  <p className="mt-1 text-[10px] text-admin-muted">
                                    ${Number(item.plan.price).toFixed(2)}/{item.plan.billing_interval}
                                  </p>
                                </div>
                              ) : (
                                <span className="rounded-lg px-2.5 py-1 text-[10px] font-bold border uppercase bg-gray-50 text-gray-400 border-gray-200">
                                  No Plan
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-admin-muted whitespace-nowrap">
                              {new Date(item.updated_at).toLocaleDateString('vi-VN')}
                            </td>

                            <td className="py-3 pl-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="sm" variant="ghost" onClick={() => openUserModal(item)}>
                                  <PencilLine className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    if (confirm(`Delete account ${item.email}? This action cannot be undone.`)) {
                                      deleteUserRoleMutation.mutate(item.id)
                                    }
                                  }}
                                  disabled={deleteUserRoleMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-admin-muted text-sm">No users found.</div>
                  )}
                </div>
              </Card>

              {/* Role Matrix */}
              <Card className="border border-admin-border p-6 bg-white shadow-sm">
                <AdminSectionTitle
                  eyebrow="Access Matrix"
                  title="Role Module Scopes"
                  description="List of visible modules based on role mapping rules."
                />
                <div className="mt-5 space-y-3 text-xs text-admin-ink">
                  {[
                    { role: 'Admin', scope: 'Full access to manage users, catalog, scans, recommendations and settings.' },
                    { role: 'User', scope: 'Standard access without admin panels. Can run scans and use subscription benefits.' },
                  ].map((item) => (
                    <div key={item.role} className="rounded-2xl border border-admin-border bg-admin-subtle px-3 py-2.5">
                      <p className="font-semibold flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-admin-accent" />
                        {item.role}
                      </p>
                      <p className="mt-1 text-[11px] text-admin-muted">{item.scope}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* ─── User Modal ─── */}
              {userModalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                  onClick={(e) => { if (e.target === e.currentTarget) setUserModalOpen(false) }}
                >
                  <div className="relative w-full max-w-md overflow-y-auto max-h-[90vh] rounded-[2rem] border border-admin-border bg-white p-6 shadow-xl space-y-4">
                    <button
                      onClick={() => setUserModalOpen(false)}
                      className="absolute right-4 top-4 rounded-full p-1.5 text-admin-muted hover:bg-admin-subtle transition"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <h2 className="font-admin text-xl text-admin-ink">
                      {selectedUser ? 'Edit User' : 'Create New User'}
                    </h2>

                    <div className="space-y-4">
                      {/* Edit mode: avatar + editable name */}
                      {selectedUser && (
                        <div className="space-y-3">
                          {/* Avatar preview */}
                          <div className="flex items-center gap-3 rounded-2xl bg-admin-subtle border border-admin-border px-4 py-3">
                            {selectedUser.avatar_url ? (
                              <img src={selectedUser.avatar_url} alt=""
                                className="h-10 w-10 rounded-full border border-admin-border object-cover shrink-0" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-admin-subtle flex items-center justify-center shrink-0 text-admin-accent font-bold">
                                {(selectedUser.email?.[0] ?? '?').toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs text-admin-muted truncate">{selectedUser.email}</p>
                            </div>
                          </div>

                          {/* Editable name fields */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">First Name</label>
                              <Input
                                placeholder="e.g. Jane"
                                value={newUserFirstName}
                                onChange={(e) => setNewUserFirstName(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">Last Name</label>
                              <Input
                                placeholder="e.g. Doe"
                                value={newUserLastName}
                                onChange={(e) => setNewUserLastName(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {!selectedUser && (
                        <div>
                          <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">FirstName</label>
                          <Input
                            placeholder="FirstName"
                            value={newUserFirstName}
                            onChange={(e) => setNewUserFirstName(e.target.value)}
                          />
                        </div>
                      )}

                      {!selectedUser && (
                        <div>
                          <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">LastName</label>
                          <Input
                            placeholder="LastName"
                            value={newUserLastName}
                            onChange={(e) => setNewUserLastName(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Email — chỉ create */}
                      {!selectedUser && (
                        <div>
                          <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">Email</label>
                          <Input
                            placeholder="e.g. client@lumina.ai"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Password — chỉ create */}
                      {!selectedUser && (
                        <div>
                          <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">Password</label>
                          <Input
                            type="password"
                            placeholder="Minimum 8 characters"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Role */}
                      <div>
                        <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">Access Level</label>
                        <select
                          className="w-full rounded-2xl border border-admin-border bg-white/85 px-4 py-3 text-sm text-admin-ink focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/25"
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as any)}
                        >
                          <option value="admin">Admin</option>
                          <option value="user">Standard User</option>
                        </select>
                      </div>

                      {/* Plan — select từ danh sách plans thật */}
                      <div>
                        <label className="text-xs font-semibold text-admin-ink uppercase tracking-wide block mb-1">Subscription Plan</label>
                        <select
                          className="w-full rounded-2xl border border-admin-border bg-white/85 px-4 py-3 text-sm text-admin-ink focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/25"
                          value={newUserPlanId}
                          onChange={(e) => {
                            setNewUserPlanId(e.target.value)
                          }}
                        >
                          <option value="">No Plan</option>
                          {(plansQuery.data ?? []).map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — ${Number(p.price).toFixed(2)}/{p.billing_interval}
                            </option>
                          ))}
                        </select>
                      </div>

                      {createUserRoleMutation.error && (
                        <p className="text-sm text-admin-accent">{createUserRoleMutation.error.message}</p>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setUserModalOpen(false)}>Cancel</Button>
                        <Button
                          onClick={async () => {
                            if (selectedUser) {
                              await updateUserPlanMutation.mutateAsync({
                                userId: selectedUser.id,
                                planId: newUserPlanId,
                                role: newUserRole,
                                firstName: newUserFirstName,
                                lastName: newUserLastName,
                              })
                              setUserModalOpen(false)
                            } else {
                              await createUserRoleMutation.mutateAsync()
                              setUserModalOpen(false)
                            }  // ← đóng else
                          }}  // ← đóng onClick
                          disabled={
                            createUserRoleMutation.isPending ||
                            updateUserRoleMutation.isPending ||
                            updateUserPlanMutation.isPending
                          }
                        >
                          {createUserRoleMutation.isPending || updateUserRoleMutation.isPending
                            ? 'Saving...'
                            : selectedUser ? 'Save Changes' : 'Create User'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
          {activeSection === 'plans' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <AdminSectionTitle
                  eyebrow="Subscription Plans"
                  title="Manage Plans"
                  description={`${plansQuery.data?.length ?? 0} plan(s) configured.`}
                />
                <Button onClick={() => {
                  setPlanForm(EMPTY_PLAN)
                  setSelectedPlan(null)
                  setPlanModalOpen(true)
                }}>
                  + Add Plan
                </Button>
              </div>

              {/* Plans grid */}
              {(plansQuery.data?.length ?? 0) === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-admin-border bg-white/80 p-12 text-center text-sm text-admin-muted">
                  No plans yet. Click "Add Plan" to create one.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(plansQuery.data ?? []).map((plan: any) => (
                    <div key={plan.id} className={cn(
                      'rounded-2xl border bg-white p-5 space-y-3 transition',
                      plan.is_active ? 'border-admin-border' : 'border-admin-border opacity-60',
                    )}>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-admin-ink">{plan.name}</p>
                          <p className="text-[11px] text-admin-muted font-mono mt-0.5">slug: {plan.slug}</p>
                        </div>
                        {plan.badge && (
                          <span className="rounded-full bg-admin-accent/10 px-2 py-0.5 text-[10px] font-bold text-admin-accent shrink-0">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-admin-ink">${Number(plan.price).toFixed(2)}</span>
                        <span className="text-xs text-admin-muted">/ {plan.billing_interval}</span>
                      </div>

                      {/* Description */}
                      {plan.description && (
                        <p className="text-xs text-admin-muted leading-relaxed">{plan.description}</p>
                      )}

                      {/* Limits */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-admin-subtle px-3 py-2">
                          <p className="text-admin-muted">Scans</p>
                          <p className="font-semibold text-admin-ink">{plan.scan_limit}</p>
                        </div>
                        <div className="rounded-xl bg-admin-subtle px-3 py-2">
                          <p className="text-admin-muted">History</p>
                          <p className="font-semibold text-admin-ink">{plan.history_days} days</p>
                        </div>
                      </div>

                      {/* Features */}
                      {(plan.features as string[]).length > 0 && (
                        <ul className="space-y-1">
                          {(plan.features as string[]).map((f: string, i: number) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-admin-muted">
                              <span className="h-1 w-1 shrink-0 rounded-full bg-admin-accent" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-1 border-t border-admin-border">
                        <button
                          onClick={() => updatePlanMutation.mutate({ id: plan.id, patch: { is_active: !plan.is_active } })}
                          disabled={updatePlanMutation.isPending}
                          className={cn(
                            'rounded-full px-3 py-1 text-[10px] font-bold border transition',
                            plan.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                              : 'bg-admin-subtle text-admin-accent border-admin-border hover:bg-admin-subtle',
                          )}
                        >
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </button>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => {
                            setSelectedPlan(plan)
                            setPlanForm({
                              name: plan.name,
                              slug: plan.slug,
                              price: plan.price,
                              billing_interval: plan.billing_interval,
                              scan_limit: plan.scan_limit,
                              history_days: plan.history_days,
                              description: plan.description ?? '',
                              features: plan.features ?? [],
                              badge: plan.badge ?? null,
                              is_active: plan.is_active,
                            })
                            setPlanModalOpen(true)
                          }}>
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost"
                            disabled={deletePlanMutation.isPending}
                            onClick={() => {
                              if (confirm(`Delete plan "${plan.name}"?`)) deletePlanMutation.mutate(plan.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create / Edit modal */}
              {planModalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                  onClick={(e) => { if (e.target === e.currentTarget) setPlanModalOpen(false) }}
                >
                  <div className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-[2rem] border border-admin-border bg-white p-6 shadow-xl space-y-4">
                    <button
                      onClick={() => setPlanModalOpen(false)}
                      className="absolute right-4 top-4 rounded-full p-1.5 text-admin-muted hover:bg-admin-subtle transition"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <h2 className="font-admin text-xl text-admin-ink">
                      {selectedPlan ? 'Edit Plan' : 'New Plan'}
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs text-admin-muted mb-1 block">Name</label>
                        <Input value={planForm.name}
                          onChange={(e) => setPlanForm((f: any) => ({ ...f, name: e.target.value }))} />
                      </div>

                      <div>
                        <label className="text-xs text-admin-muted mb-1 block">Slug</label>
                        <Input placeholder="free / pro / premium"
                          value={planForm.slug}
                          onChange={(e) => setPlanForm((f: any) => ({ ...f, slug: e.target.value }))} />
                      </div>

                      <div>
                        <label className="text-xs text-admin-muted mb-1 block">Badge</label>
                        <Input placeholder="MOST POPULAR"
                          value={planForm.badge ?? ''}
                          onChange={(e) => setPlanForm((f: any) => ({ ...f, badge: e.target.value || null }))} />
                      </div>

                      <div>
                        <label className="text-xs text-admin-muted mb-1 block">Price ($)</label>
                        <Input type="number" min={0} step={0.01}
                          value={planForm.price}
                          onChange={(e) => setPlanForm((f: any) => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
                      </div>

                      <div>
                        <label className="text-xs text-admin-muted mb-1 block">Billing</label>
                        <select
                          className="w-full rounded-2xl border border-admin-border bg-white/85 px-4 py-3 text-sm text-admin-ink focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/25"
                          value={planForm.billing_interval}
                          onChange={(e) => setPlanForm((f: any) => ({ ...f, billing_interval: e.target.value }))}
                        >
                          <option value="month">Monthly</option>
                          <option value="year">Yearly</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-admin-muted mb-1 block">Scan Limit</label>
                        <Input type="number" min={0}
                          value={planForm.scan_limit}
                          onChange={(e) => setPlanForm((f: any) => ({ ...f, scan_limit: parseInt(e.target.value) || 0 }))} />
                      </div>

                      <div>
                        <label className="text-xs text-admin-muted mb-1 block">History Days</label>
                        <Input type="number" min={0}
                          value={planForm.history_days}
                          onChange={(e) => setPlanForm((f: any) => ({ ...f, history_days: parseInt(e.target.value) || 0 }))} />
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs text-admin-muted mb-1 block">Description</label>
                        <textarea rows={2}
                          className="w-full rounded-2xl border border-admin-border bg-white/80 px-4 py-3 text-sm text-admin-ink placeholder:text-admin-muted focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/25 resize-none"
                          value={planForm.description ?? ''}
                          onChange={(e) => setPlanForm((f: any) => ({ ...f, description: e.target.value }))} />
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs text-admin-muted mb-1 block">Features</label>
                        <textarea
                          rows={5}
                          className="w-full rounded-2xl border border-admin-border bg-white/80 px-4 py-3 text-sm font-mono text-admin-ink placeholder:text-admin-muted focus:border-admin-accent focus:outline-none focus:ring-2 focus:ring-admin-accent/25 resize-none"
                          placeholder={"Unlimited scans\nPriority support\nAdvanced analytics"}
                          value={(planForm.features as string[]).join('\n')}
                          onChange={(e) => setPlanForm((f: any) => ({
                            ...f,
                            features: e.target.value.split('\n'), // không filter để giữ dòng trống khi gõ
                          }))}
                          onBlur={(e) => setPlanForm((f: any) => ({
                            ...f,
                            features: e.target.value.split('\n').filter(Boolean), // filter khi blur
                          }))}
                        />
                      </div>

                      <div className="col-span-2 flex items-center gap-2">
                        <input type="checkbox" id="is_active" checked={planForm.is_active}
                          onChange={(e) => setPlanForm((f: any) => ({ ...f, is_active: e.target.checked }))} />
                        <label htmlFor="is_active" className="text-sm text-admin-ink">Active (hiển thị cho người dùng)</label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="ghost" onClick={() => setPlanModalOpen(false)}>Cancel</Button>
                      <Button
                        disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                        onClick={async () => {
                          if (selectedPlan) {
                            await updatePlanMutation.mutateAsync({ id: selectedPlan.id, patch: planForm })
                          } else {
                            await createPlanMutation.mutateAsync(planForm)
                          }
                          setPlanModalOpen(false)
                        }}
                      >
                        {createPlanMutation.isPending || updatePlanMutation.isPending
                          ? 'Saving...'
                          : selectedPlan ? 'Save Changes' : 'Create Plan'
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
          {activeSection === 'settings' ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  title: 'Platform Status',
                  detail: 'Supabase-powered catalog, scan logs, and admin permissions are live.',
                  icon: CheckCircle2,
                },
                {
                  title: 'Evaluation Engine',
                  detail: 'Configure scan scores, modify tags, and customize match reason descriptions.',
                  icon: ListChecks,
                },
                {
                  title: 'Permission Admin',
                  detail: 'Limit access by job function through detailed simulated roles for developers.',
                  icon: Clock3,
                },
                {
                  title: 'Simulation Tools',
                  detail: 'Generate artificial scan results to verify product catalog and recommendation loops.',
                  icon: Megaphone,
                },
                {
                  title: 'Data Sync',
                  detail: 'Actual client pages fetch items from the database instead of simulated files.',
                  icon: Database,
                },
                {
                  title: 'Reload Cycle',
                  detail: 'Click reload or clear cache to revalidate queries after updating.',
                  icon: Rocket,
                },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <Card key={item.title} className="border border-admin-border p-5 bg-white flex justify-between items-start gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-admin-accent font-bold">{item.title}</p>
                      <p className="mt-2 text-xs text-admin-muted leading-relaxed">{item.detail}</p>
                    </div>
                    <div className="rounded-2xl bg-admin-subtle p-2.5 text-admin-accent shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : null}

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
