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
  PlusCircle,
  Search,
  Sliders,
  DollarSign,
  Package,
  RefreshCw,
  UserCheck,
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
  type AdminRecommendationRecord,
  type AdminScanRecord,
} from '@/services/supabase/database-service'
import { canAccessAdminSection, getAdminRoleLabel, type AdminSection, type AdminRole } from '@/shared/lib/admin'
import { parseProductTags, encodeProductTags } from '@/shared/lib/product-tags'
import { type ScanResult, type OrderRecord } from '@/shared/lib/types'

const sidebarSections: Array<{
  id: AdminSection
  label: string
  description: string
  icon: typeof LayoutGrid
}> = [
  { id: 'overview', label: 'Tổng quan', description: 'Sức khỏe hệ thống và số liệu', icon: LayoutGrid },
  { id: 'products', label: 'Sản phẩm', description: 'Thao tác danh mục và đồng bộ trực tiếp', icon: Store },
  { id: 'scans', label: 'Lượt quét da', description: 'Xem kết quả quét và giả lập', icon: Camera },
  { id: 'recommendations', label: 'Đề xuất sản phẩm', description: 'Quản lý liên kết phù hợp', icon: Sparkles },
  { id: 'revenue', label: 'Doanh thu', description: 'Báo cáo doanh số và đơn hàng', icon: DollarSign },
  { id: 'access', label: 'Phân quyền', description: 'Vai trò và phân quyền người dùng', icon: Users },
  { id: 'settings', label: 'Cài đặt', description: 'Nền tảng và cấu hình môi trường', icon: Wrench },
]

type ProductFormState = {
  id: string
  name: string
  description: string
  imageUrl: string
  externalUrl: string
  tags: string
  category: string
  price: string
  originalPrice: string
  discount: string
  stock: string
}

type ScanFormState = {
  id: string
  score: string
  metricsJson: string
}

type RecommendationFormState = {
  id: string
  scanId: string
  productId: string
  reason: string
}

const emptyProductForm: ProductFormState = {
  id: '',
  name: '',
  description: '',
  imageUrl: '',
  externalUrl: '',
  tags: '',
  category: 'Serum',
  price: '',
  originalPrice: '',
  discount: '',
  stock: '',
}

const emptyScanForm: ScanFormState = {
  id: '',
  score: '',
  metricsJson: '{}',
}

const emptyRecommendationForm: RecommendationFormState = {
  id: '',
  scanId: '',
  productId: '',
  reason: '',
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTags(tags: string[]) {
  return tags.length > 0 ? tags.join(', ') : 'No tags'
}

function parseTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function mapProductForm(product: AdminProductRecord): ProductFormState {
  const parsed = parseProductTags(product)
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.image_url,
    externalUrl: product.external_url,
    tags: parsed.cleanTags.join(', '),
    category: parsed.category,
    price: parsed.price ?? '',
    originalPrice: parsed.originalPrice ?? '',
    discount: parsed.discount !== undefined ? String(parsed.discount) : '',
    stock: parsed.stock !== undefined ? String(parsed.stock) : '',
  }
}

function mapScanForm(scan: AdminScanRecord): ScanFormState {
  return {
    id: scan.id,
    score: String(scan.score),
    metricsJson: JSON.stringify(scan.metrics, null, 2),
  }
}

function mapRecommendationForm(recommendation: AdminRecommendationRecord): RecommendationFormState {
  return {
    id: recommendation.id,
    scanId: recommendation.scan_id,
    productId: recommendation.product_id,
    reason: recommendation.reason,
  }
}

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
      <p className="text-xs uppercase tracking-[0.24em] text-cyan">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl text-rose-950">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-mist">{description}</p>
    </div>
  )
}

export default function AdminPage() {
  const { adminRole, signOut, user: currentAuthUser } = useAuth()
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')

  // Forms
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm)
  const [scanForm, setScanForm] = useState<ScanFormState>(emptyScanForm)
  const [recommendationForm, setRecommendationForm] = useState<RecommendationFormState>(emptyRecommendationForm)

  // Filters & Search
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('All')

  const [scanSearch, setScanSearch] = useState('')
  const [scanScoreFilter, setScanScoreFilter] = useState<[number, number]>([0, 100])

  const [recommendationSearch, setRecommendationSearch] = useState('')
  const [recommendationCategoryFilter, setRecommendationCategoryFilter] = useState('All')

  const [userSearch, setUserSearch] = useState('')

  // User Manager Form
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<AdminRole | 'user'>('analyst')

  // Scan Simulator State
  const [targetUserId, setTargetUserId] = useState('')
  const [simHydration, setSimHydration] = useState(70)
  const [simAcne, setSimAcne] = useState(30)
  const [simOiliness, setSimOiliness] = useState(40)
  const [simDarkCircles, setSimDarkCircles] = useState(25)

  // Ping Check
  const [pingTime, setPingTime] = useState<number | null>(null)

  // Order search & filter
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | 'pending' | 'completed' | 'canceled'>('All')
  const [pingStatus, setPingStatus] = useState<'idle' | 'pinging' | 'success' | 'failed'>('idle')

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

  // Queries
  const productsQuery = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => databaseService.getAdminProducts(),
  })

  const scansQuery = useQuery({
    queryKey: ['admin', 'scans'],
    queryFn: () => databaseService.getAdminScans(),
  })

  const recommendationsQuery = useQuery({
    queryKey: ['admin', 'recommendations'],
    queryFn: () => databaseService.getAdminRecommendations(),
  })

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => databaseService.getUsersWithRoles(),
  })

  const ordersQuery = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => databaseService.getOrders(),
  })

  // Lookups & Filters
  const tabs = useMemo(
    () => sidebarSections.filter((section) => canAccessAdminSection(adminRole, section.id)),
    [adminRole],
  )

  useEffect(() => {
    if (tabs.length === 0) return
    if (!tabs.some((section) => section.id === activeSection)) {
      setActiveSection(tabs[0].id)
    }
  }, [activeSection, tabs])

  const productLookup = useMemo(() => {
    return new Map((productsQuery.data ?? []).map((product) => [product.id, product]))
  }, [productsQuery.data])

  const scanLookup = useMemo(() => {
    return new Map((scansQuery.data ?? []).map((scan) => [scan.id, scan]))
  }, [scansQuery.data])

  // Aggregate statistics for Overview
  const scanStats = useMemo(() => {
    const list = scansQuery.data ?? []
    if (list.length === 0) {
      return {
        avgScore: 0,
        avgHydration: 0,
        avgAcne: 0,
        avgOiliness: 0,
        avgDarkCircles: 0,
        scoreRanges: [0, 0, 0, 0, 0], // <60, 60-70, 70-80, 80-90, 90-100
      }
    }

    let totalScore = 0
    let totalHydration = 0
    let totalAcne = 0
    let totalOiliness = 0
    let totalDarkCircles = 0
    const ranges = [0, 0, 0, 0, 0]

    list.forEach((scan) => {
      totalScore += scan.score
      if (scan.score < 60) ranges[0]++
      else if (scan.score < 70) ranges[1]++
      else if (scan.score < 80) ranges[2]++
      else if (scan.score < 90) ranges[3]++
      else ranges[4]++

      const metrics = scan.metrics
      if (metrics) {
        totalHydration += metrics.hydration?.value ?? 0
        totalAcne += metrics.acne?.value ?? 0
        totalOiliness += metrics.oiliness?.value ?? 0
        totalDarkCircles += metrics.darkCircles?.value ?? 0
      }
    })

    const n = list.length
    return {
      avgScore: Math.round(totalScore / n),
      avgHydration: Math.round(totalHydration / n),
      avgAcne: Math.round(totalAcne / n),
      avgOiliness: Math.round(totalOiliness / n),
      avgDarkCircles: Math.round(totalDarkCircles / n),
      scoreRanges: ranges,
    }
  }, [scansQuery.data])

  const maxRangeCount = useMemo(() => {
    return Math.max(...scanStats.scoreRanges, 1)
  }, [scanStats.scoreRanges])

  const filteredOrders = useMemo(() => {
    const list = ordersQuery.data ?? []
    return list.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.shippingInfo.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.shippingInfo.phone.includes(orderSearch) ||
        o.productName.toLowerCase().includes(orderSearch.toLowerCase())

      const matchesStatus =
        orderStatusFilter === 'All' || o.status === orderStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [ordersQuery.data, orderSearch, orderStatusFilter])

  const orderStats = useMemo(() => {
    const list = ordersQuery.data ?? []
    const completedList = list.filter((o) => o.status === 'completed')

    const totalRevenue = completedList.reduce((acc, o) => acc + o.totalPrice, 0)
    const totalOrders = list.length
    const totalUnits = completedList.reduce((acc, o) => acc + o.quantity, 0)
    const avgOrderValue = completedList.length > 0 ? Math.round(totalRevenue / completedList.length) : 0

    // Top Selling Products
    const productSalesMap = new Map<string, { name: string; category: string; image: string; units: number; revenue: number }>()
    completedList.forEach((o) => {
      const existing = productSalesMap.get(o.productId) || {
        name: o.productName,
        category: o.productCategory,
        image: o.productImage,
        units: 0,
        revenue: 0,
      }
      existing.units += o.quantity
      existing.revenue += o.totalPrice
      productSalesMap.set(o.productId, existing)
    })

    const topSellers = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Calculate revenue trend by date for last 7 days
    const dailyRevenueMap = new Map<string, number>()
    for (let i = 6; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * 24 * 3600 * 1000).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })
      dailyRevenueMap.set(dateStr, 0)
    }

    completedList.forEach((o) => {
      const dateStr = new Date(o.createdAt).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })
      if (dailyRevenueMap.has(dateStr)) {
        dailyRevenueMap.set(dateStr, dailyRevenueMap.get(dateStr)! + o.totalPrice)
      }
    })

    const dailyTrend = Array.from(dailyRevenueMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }))

    return {
      totalRevenue,
      totalOrders,
      totalUnits,
      avgOrderValue,
      topSellers,
      dailyTrend,
    }
  }, [ordersQuery.data])

  // Filtered lists
  const filteredProducts = useMemo(() => {
    const list = productsQuery.data ?? []
    return list.filter((p) => {
      const parsed = parseProductTags(p)
      const matchesSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(productSearch.toLowerCase()) ||
        parsed.cleanTags.some((t) => t.toLowerCase().includes(productSearch.toLowerCase()))

      const matchesCat =
        productCategoryFilter === 'All' ||
        parsed.category.toLowerCase() === productCategoryFilter.toLowerCase()
      return matchesSearch && matchesCat
    })
  }, [productsQuery.data, productSearch, productCategoryFilter])

  const filteredScans = useMemo(() => {
    const list = scansQuery.data ?? []
    return list.filter((s) => {
      const matchesSearch =
        s.id.toLowerCase().includes(scanSearch.toLowerCase()) ||
        s.user_id.toLowerCase().includes(scanSearch.toLowerCase())
      const matchesScore = s.score >= scanScoreFilter[0] && s.score <= scanScoreFilter[1]
      return matchesSearch && matchesScore
    })
  }, [scansQuery.data, scanSearch, scanScoreFilter])

  const filteredRecommendations = useMemo(() => {
    const list = recommendationsQuery.data ?? []
    return list.filter((r) => {
      const product = productLookup.get(r.product_id)
      const parsed = product ? parseProductTags(product) : null
      const prodName = product?.name ?? ''

      const matchesSearch =
        r.scan_id.toLowerCase().includes(recommendationSearch.toLowerCase()) ||
        r.product_id.toLowerCase().includes(recommendationSearch.toLowerCase()) ||
        prodName.toLowerCase().includes(recommendationSearch.toLowerCase()) ||
        r.reason.toLowerCase().includes(recommendationSearch.toLowerCase())

      const matchesCat =
        recommendationCategoryFilter === 'All' ||
        (parsed && parsed.category.toLowerCase() === recommendationCategoryFilter.toLowerCase())

      return matchesSearch && matchesCat
    })
  }, [recommendationsQuery.data, productLookup, recommendationSearch, recommendationCategoryFilter])

  const filteredUsers = useMemo(() => {
    const list = usersQuery.data ?? []
    return list.filter((u) => u.email.toLowerCase().includes(userSearch.toLowerCase()))
  }, [usersQuery.data, userSearch])

  // Overview Stats Setup
  const overviewCards = useMemo(
    () => [
      {
        label: 'Sản phẩm',
        value: productsQuery.data?.length ?? 0,
        hint: 'Sản phẩm trong danh mục',
        icon: Store,
      },
      {
        label: 'Lượt quét da',
        value: scansQuery.data?.length ?? 0,
        hint: 'Tổng số lượt quét đã phân tích',
        icon: Camera,
      },
      {
        label: 'Đề xuất',
        value: recommendationsQuery.data?.length ?? 0,
        hint: 'Quy tắc đề xuất sản phẩm',
        icon: Sparkles,
      },
      {
        label: 'Vai trò Admin',
        value: getAdminRoleLabel(adminRole),
        hint: 'Quyền bảo mật đang hoạt động',
        icon: ShieldCheck,
      },
    ],
    [adminRole, productsQuery.data?.length, scansQuery.data?.length, recommendationsQuery.data?.length],
  )

  // Mutations
  const saveProductMutation = useMutation({
    mutationFn: async () => {
      const cleanTagsList = parseTags(productForm.tags)
      const encodedTags = encodeProductTags({
        tags: cleanTagsList,
        category: productForm.category,
        price: productForm.price,
        originalPrice: productForm.originalPrice,
        discount: productForm.discount,
        stock: productForm.stock,
      })

      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        image_url: productForm.imageUrl.trim(),
        external_url: productForm.externalUrl.trim(),
        tags: encodedTags,
      }

      if (!payload.name || !payload.description || !payload.image_url || !payload.external_url) {
        throw new Error('Fill all product fields before saving.')
      }

      if (productForm.id) {
        return databaseService.updateProduct(productForm.id, payload)
      }

      return databaseService.createProduct(payload)
    },
    onSuccess: async () => {
      setProductForm(emptyProductForm)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      await queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] })
      await queryClient.invalidateQueries({ queryKey: ['landing', 'products'] })
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

  const saveScanMutation = useMutation({
    mutationFn: async () => {
      if (!scanForm.id) throw new Error('Select a scan to update.')
      const parsedMetrics = JSON.parse(scanForm.metricsJson)
      const score = Number(scanForm.score)

      if (Number.isNaN(score) || score < 0 || score > 100) {
        throw new Error('Score must be a number between 0 and 100.')
      }

      return databaseService.updateScan(scanForm.id, {
        score,
        metrics: parsedMetrics,
      })
    },
    onSuccess: async () => {
      setScanForm(emptyScanForm)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'scans'] })
      await queryClient.invalidateQueries({ queryKey: ['scan-history'] })
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

  const saveRecommendationMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        scanId: recommendationForm.scanId.trim(),
        productId: recommendationForm.productId.trim(),
        reason: recommendationForm.reason.trim(),
      }

      if (!payload.scanId || !payload.productId || !payload.reason) {
        throw new Error('Fill scan, product and reason before saving.')
      }

      if (recommendationForm.id) {
        return databaseService.updateRecommendation(recommendationForm.id, payload)
      }

      return databaseService.createRecommendation(payload)
    },
    onSuccess: async () => {
      setRecommendationForm(emptyRecommendationForm)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'recommendations'] })
    },
  })

  const deleteRecommendationMutation = useMutation({
    mutationFn: async (id: string) => databaseService.deleteRecommendation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'recommendations'] })
    },
  })

  // User Manager Mutations
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return databaseService.updateUserRole(userId, role)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      await useAuthStore.getState().initialize()
    },
  })

  const createUserRoleMutation = useMutation({
    mutationFn: async () => {
      if (!newUserEmail || !newUserEmail.includes('@')) {
        throw new Error('Please enter a valid email address.')
      }
      return databaseService.createUserWithRole(newUserEmail, newUserRole)
    },
    onSuccess: async () => {
      setNewUserEmail('')
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const deleteUserRoleMutation = useMutation({
    mutationFn: async (userId: string) => {
      return databaseService.deleteUserRole(userId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      await useAuthStore.getState().initialize()
    },
  })

  // Order Mutations
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return databaseService.deleteOrder(orderId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: 'pending' | 'completed' | 'canceled' }) => {
      return databaseService.updateOrderStatus(orderId, status)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const simulateOrderMutation = useMutation({
    mutationFn: async () => {
      const products = productsQuery.data ?? []
      if (products.length === 0) throw new Error('Cần có ít nhất một sản phẩm để tạo đơn hàng giả lập.')

      const prod = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 2) + 1

      const price = (() => {
        const parsed = parseProductTags(prod)
        const priceNum = parsed.price ? parseInt(parsed.price.replace(/\D/g, '')) : 390000
        return priceNum
      })()

      const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi']
      const middleNames = ['Văn', 'Thị', 'Minh', 'Anh', 'Ngọc', 'Khánh', 'Hoàng', 'Đức', 'Phương']
      const lastNames = ['Hùng', 'Hương', 'Hải', 'Trang', 'Tú', 'Linh', 'Dương', 'Phúc', 'Yến']
      const cities = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang']

      const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${middleNames[Math.floor(Math.random() * middleNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
      const phone = `09${Math.floor(10000000 + Math.random() * 90000000)}`
      const address = `${Math.floor(Math.random() * 150) + 1} Đường Lê Lợi, ${cities[Math.floor(Math.random() * cities.length)]}`

      const paymentMethods = ['cod', 'momo', 'visa', 'apple'] as const
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]

      const statuses = ['completed', 'completed', 'pending'] as const
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      const newOrder: OrderRecord = {
        id: `BG-${Math.floor(100000 + Math.random() * 900000)}`,
        productId: prod.id,
        productName: prod.name,
        productImage: prod.image_url,
        productCategory: parseProductTags(prod).category,
        quantity,
        price,
        totalPrice: price * quantity,
        paymentMethod,
        shippingInfo: { name, phone, address },
        status,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 6) * 3600 * 1000).toISOString(),
      }

      return databaseService.createOrder(newOrder)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  // Scan Simulator Mutation
  const runSimulatorMutation = useMutation({
    mutationFn: async () => {
      const userId = targetUserId.trim() || currentAuthUser?.id || 'guest-user'

      const calculatedScore = Math.round(
        (simHydration + (100 - simAcne) + (100 - simOiliness) + (100 - simDarkCircles)) / 4,
      )

      const getStatus = (metric: string, val: number) => {
        if (metric === 'acne') {
          if (val >= 80) return 'great'
          if (val >= 20) return 'moderate'
          return 'attention'
        }
        if (val >= 75) return 'great'
        if (val >= 40) return 'moderate'
        return 'attention'
      }

      const scanResult: ScanResult = {
        skinScore: calculatedScore,
        hydration: { label: 'Hydration', value: simHydration, status: getStatus('hydration', simHydration) },
        acne: { label: 'Acne', value: simAcne, status: getStatus('acne', simAcne) },
        oiliness: { label: 'Oiliness', value: simOiliness, status: getStatus('oiliness', simOiliness) },
        darkCircles: { label: 'Dark Circles', value: simDarkCircles, status: getStatus('darkCircles', simDarkCircles) },
      }

      // Check if we can save to database
      if (userId === 'guest-user' || !currentAuthUser) {
        // Fallback to guest scans array in localStorage
        const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
        const id = makeId()
        const now = new Date().toISOString()
        const products = productsQuery.data || []
        const topProducts = products.slice(0, 3)

        const recommendations = topProducts.map((p, idx) => ({
          id: makeId(),
          productId: p.id,
          reason: `Simulated recommendation: mapped for target ${idx === 0 ? 'hydration' : idx === 1 ? 'acne' : 'dark circles'}`,
        }))

        const scan = { id, userId: null, result: scanResult, created_at: now, recommendations }
        const existing = JSON.parse(localStorage.getItem('guest_scans') || '[]')
        existing.unshift(scan)
        localStorage.setItem('guest_scans', JSON.stringify(existing))
        return id
      }

      // Real Supabase insert
      const products = productsQuery.data || []
      const topProducts = products.slice(0, 3)
      const scanId = await databaseService.saveScan(userId, scanResult)

      await databaseService.saveRecommendations(
        scanId,
        topProducts.map((product, idx) => ({
          productId: product.id,
          reason: `Simulated match for target ${idx === 0 ? 'hydration' : idx === 1 ? 'acne' : 'dark circles'}`,
        })),
      )
      return scanId
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'scans'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'recommendations'] })
    },
  })

  // Simulated events for activity log
  const systemActivityLog = useMemo(() => {
    const logs: Array<{ id: string; user: string; event: string; time: string; type: 'success' | 'info' | 'warning' }> = []
    
    // Add real items if available
    const scans = scansQuery.data ?? []
    scans.slice(0, 4).forEach((scan) => {
      logs.push({
        id: `scan-${scan.id}`,
        user: `Người dùng ${scan.user_id.slice(0, 5)}...`,
        event: `Đã hoàn thành phân tích da với điểm số ${scan.score}`,
        time: formatDate(scan.created_at),
        type: scan.score > 80 ? 'success' : 'info',
      })
    })

    const prods = productsQuery.data ?? []
    prods.slice(0, 3).forEach((prod) => {
      logs.push({
        id: `prod-${prod.id}`,
        user: 'Quản trị viên Danh mục',
        event: `Đã sửa đổi sản phẩm "${prod.name}" trong danh mục`,
        time: formatDate(prod.created_at),
        type: 'success',
      })
    })

    // Fallbacks
    if (logs.length === 0) {
      logs.push(
        { id: '1', user: 'Hệ thống', event: 'Đã thiết lập kết nối cơ sở dữ liệu.', time: 'Vừa xong', type: 'success' },
        { id: '2', user: 'Quản trị tối cao', event: 'Đăng nhập từ địa chỉ IP mới.', time: '10 phút trước', type: 'info' },
      )
    }

    return logs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  }, [scansQuery.data, productsQuery.data])

  const isBusy =
    productsQuery.isLoading ||
    scansQuery.isLoading ||
    recommendationsQuery.isLoading ||
    usersQuery.isLoading

  if (isBusy && !productsQuery.data && !scansQuery.data && !recommendationsQuery.data) {
    return <Loader fullScreen label="Loading admin control room" />
  }

  return (
    <section className="section-shell pb-12">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Sidebar Nav */}
        <aside className="sticky top-[calc(var(--app-header-height)+1rem)] h-fit rounded-[2rem] border border-rose-100 bg-white/80 p-4 shadow-[0_24px_70px_rgba(168,112,134,0.12)] backdrop-blur-xl">
          <div className="rounded-[1.5rem] border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-rose-600">
              <ShieldCheck className="h-4 w-4" />
              {getAdminRoleLabel(adminRole)}
            </div>
            <h1 className="mt-3 font-display text-3xl text-rose-950">Bảng Quản Trị</h1>
            <p className="mt-2 text-sm leading-6 text-mist">
              Quản lý dữ liệu sản phẩm, hồ sơ quét da và phân quyền người dùng trong thời gian thực.
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
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-rose-300 bg-rose-50 text-rose-950 shadow-sm'
                      : 'border-transparent bg-white text-mist hover:border-rose-100 hover:bg-rose-50/60 hover:text-rose-950'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl p-2 ${active ? 'bg-white text-rose-600' : 'bg-rose-50 text-rose-500'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">{section.label}</p>
                      <p className="mt-0.5 text-xs leading-5 text-mist">{section.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>

          <div className="mt-4 space-y-2">
            <Button
              className="w-full justify-center"
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: ['admin'] })
                void testPing()
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới dữ liệu
            </Button>
            <Button variant="ghost" className="w-full justify-center" onClick={() => void signOut()}>
              Đăng xuất
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Dashboard Welcome Header */}
          <Card className="border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-0 overflow-hidden relative">
            <div className="grid gap-6 p-6 lg:grid-cols-[1.35fr_0.9fr] lg:p-8 relative z-10">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">
                  <Database className="h-4 w-4" />
                  Kết nối nền tảng Supabase
                </div>
                <div className="space-y-3">
                  <h2 className="font-display text-4xl text-rose-950 md:text-5xl">
                    Điều hành toàn bộ nền tảng làm đẹp tại một nơi
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-mist md:text-base">
                    Kết nối Supabase thời gian thực đang hoạt động. Các thay đổi đối với danh mục, lượt quét và vai trò người dùng sẽ được đồng bộ ngay lập tức và phản ánh trên ứng dụng công khai.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setActiveSection('products')}>
                    Quản lý sản phẩm
                    <PencilLine className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={() => setActiveSection('scans')}>
                    Lịch sử quét & Giả lập
                  </Button>
                  <Button variant="ghost" onClick={() => setActiveSection('access')}>
                    Phân quyền người dùng
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {overviewCards.map((card) => {
                  const Icon = card.icon

                  return (
                    <div key={card.label} className="rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-cyan">{card.label}</p>
                          <p className="mt-2 font-display text-3xl text-rose-950">{card.value}</p>
                          <p className="mt-1 text-xs text-mist">{card.hint}</p>
                        </div>
                        <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Background design accents */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_bottom_right,rgba(254,200,210,0.45),transparent_70%)] pointer-events-none" />
          </Card>

          {/* OVERVIEW TAB */}
          {activeSection === 'overview' ? (
            <div className="space-y-6">
              {/* Row 1: System Health & Ping Status */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-rose-100 p-5 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-xs uppercase tracking-[0.2em] text-cyan">
                      <span>Liên kết Supabase</span>
                      <Wifi className="h-4 w-4 text-emerald-500 animate-pulse" />
                    </div>
                    <h3 className="mt-3 font-display text-2xl text-rose-950">Hoạt động</h3>
                    <p className="mt-1 text-xs text-mist leading-relaxed">
                      API đang chạy bình thường và sẵn sàng nhận các thao tác cơ sở dữ liệu.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-rose-50 flex items-center justify-between text-xs">
                    <span className="text-mist/70">Độ trễ DB:</span>
                    <span className="font-semibold text-emerald-600">
                      {pingStatus === 'pinging' ? '...' : pingTime && pingTime > 0 ? `${pingTime}ms` : 'Ping thất bại'}
                    </span>
                  </div>
                </Card>

                <Card className="border border-rose-100 p-5 bg-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan">Số lượng bản ghi</p>
                  <h3 className="mt-3 font-display text-2xl text-rose-950">
                    {scansQuery.data ? scansQuery.data.length + (productsQuery.data?.length ?? 0) : '0'} bản ghi
                  </h3>
                  <p className="mt-2 text-xs text-mist">
                    Sản phẩm danh mục, liên kết đề xuất và các lượt quét của khách hàng.
                  </p>
                  <div className="mt-3 pt-3 border-t border-rose-50 text-right">
                    <button
                      onClick={testPing}
                      disabled={pingStatus === 'pinging'}
                      className="text-xs text-rose-600 hover:underline flex items-center justify-end gap-1 ml-auto"
                    >
                      <Activity className="h-3 w-3" />
                      {pingStatus === 'pinging' ? 'Đang kiểm tra...' : 'Kiểm tra Ping Kết Nối'}
                    </button>
                  </div>
                </Card>

                <Card className="border border-rose-100 p-5 bg-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan">Giả lập CPU</p>
                  <h3 className="mt-3 font-display text-2xl text-rose-950">14% - 24%</h3>
                  <div className="w-full bg-rose-50 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-rose-400 to-pink-500 h-full rounded-full w-[18%]" />
                  </div>
                  <p className="mt-2 text-[10px] text-mist/70">Mức sử dụng trung bình của máy chủ tính toán</p>
                </Card>

                <Card className="border border-rose-100 p-5 bg-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan">Tải Bộ Nhớ</p>
                  <h3 className="mt-3 font-display text-2xl text-rose-950">512 MB</h3>
                  <div className="w-full bg-rose-50 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan to-teal-400 h-full rounded-full w-[50%]" />
                  </div>
                  <p className="mt-2 text-[10px] text-mist/70">Đã sử dụng 512MB trong số 1024MB được cấp phát</p>
                </Card>
              </div>

              {/* Row 2: SVG Graphs and Real statistics */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* SVG Graph: Skin Score Histogram */}
                <Card className="border border-rose-100 p-6 bg-white space-y-4">
                  <div>
                    <h3 className="font-display text-xl text-rose-950">Phân Phối Điểm Số Da</h3>
                    <p className="text-xs text-mist">Tần suất điểm số được tạo ra từ lịch sử quét của khách hàng.</p>
                  </div>
                  <div className="h-44 flex items-end justify-between gap-2 border-b border-rose-100 pb-2">
                    {scanStats.scoreRanges.map((count, i) => {
                      const labels = ['<60', '60-70', '70-80', '80-90', '90+']
                      const heightPercent = maxRangeCount > 0 ? (count / maxRangeCount) * 100 : 0
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <span className="text-xs font-semibold text-rose-950">{count}</span>
                          <div className="w-full bg-rose-50 hover:bg-rose-100 rounded-lg overflow-hidden transition-all duration-300 relative" style={{ height: `${heightPercent * 0.7}%` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-rose-400 via-pink-500 to-rose-300" />
                          </div>
                          <span className="text-[10px] text-mist font-medium">{labels[i]}</span>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* Aggregated Skin Metrics */}
                <Card className="border border-rose-100 p-6 bg-white space-y-4">
                  <div>
                    <h3 className="font-display text-xl text-rose-950">Chỉ Số Da Trung Bình</h3>
                    <p className="text-xs text-mist">Chỉ số trung bình được tính toán trên tất cả lượt quét của khách hàng.</p>
                  </div>
                  <div className="space-y-3 pt-2">
                    {[
                      { name: 'Độ ẩm da', val: scanStats.avgHydration, color: 'from-cyan to-blue-400', desc: 'Chỉ số càng cao da càng căng mọng đủ nước' },
                      { name: 'Mức độ mụn', val: scanStats.avgAcne, color: 'from-rose-400 to-pink-500', desc: 'Chỉ số càng thấp da càng ít mụn' },
                      { name: 'Bã nhờn / Dầu thừa', val: scanStats.avgOiliness, color: 'from-amber-400 to-yellow-500', desc: 'Lý tưởng nhất khi cân bằng ở mức ~50%' },
                      { name: 'Quầng thâm mắt', val: scanStats.avgDarkCircles, color: 'from-purple-400 to-indigo-500', desc: 'Chỉ số càng thấp vùng mắt càng sáng khỏe' },
                    ].map((metric) => (
                      <div key={metric.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-rose-950">
                          <span>{metric.name}</span>
                          <span>{metric.val}%</span>
                        </div>
                        <div className="w-full bg-rose-50 h-3 rounded-full overflow-hidden relative">
                          <div
                            className={`bg-gradient-to-r ${metric.color} h-full rounded-full`}
                            style={{ width: `${metric.val}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-mist/60 leading-none">{metric.desc}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Row 3: Live Audit Logs / Activity Log */}
              <Card className="border border-rose-100 p-6 bg-white space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-display text-xl text-rose-950">Nhật Ký Hoạt Động Hệ Thống</h3>
                    <p className="text-xs text-mist">Cập nhật trực tiếp các thao tác quản trị và các lượt quét mới.</p>
                  </div>
                  <span className="text-[10px] bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                    Lịch Sử Hệ Thống
                  </span>
                </div>
                <div className="divide-y divide-rose-50 max-h-60 overflow-y-auto pr-1">
                  {systemActivityLog.map((log) => (
                    <div key={log.id} className="py-3 flex justify-between items-start text-xs gap-3">
                      <div className="flex gap-2">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          log.type === 'success' ? 'bg-emerald-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        <div>
                          <p className="font-semibold text-rose-950">{log.user}</p>
                          <p className="text-mist/90">{log.event}</p>
                        </div>
                      </div>
                      <span className="text-mist/60 whitespace-nowrap">{log.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}

          {/* PRODUCTS TAB */}
          {activeSection === 'products' ? (
            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              {/* Product Form */}
              <Card className="border border-rose-100 p-6 self-start bg-white shadow-sm">
                <AdminSectionTitle
                  eyebrow="Quản lý Danh mục"
                  title={productForm.id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                  description="Thêm mới hoặc sửa đổi các mặt hàng trên hệ thống. Giá cả, tồn kho, và các thẻ giảm giá sẽ được xử lý tự động khi lưu."
                />
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">Tên sản phẩm</label>
                    <Input
                      placeholder="Tên sản phẩm (Ví dụ: Sáp tẩy trang dưỡng ẩm)"
                      value={productForm.name}
                      onChange={(event) => setProductForm((state) => ({ ...state, name: event.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">Mô tả sản phẩm</label>
                    <textarea
                      className="min-h-[90px] w-full rounded-2xl border border-rose-200/80 bg-white/80 px-4 py-3 text-sm text-pearl placeholder:text-mist/70 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/25"
                      placeholder="Nhập mô tả chi tiết về công dụng, thành phần của sản phẩm..."
                      value={productForm.description}
                      onChange={(event) => setProductForm((state) => ({ ...state, description: event.target.value }))}
                    />
                  </div>

                  <div className="grid gap-3 grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">Danh mục</label>
                      <select
                        className="w-full rounded-2xl border border-rose-200/80 bg-white/85 px-4 py-3 text-sm text-pearl focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/25"
                        value={productForm.category}
                        onChange={(event) => setProductForm((state) => ({ ...state, category: event.target.value }))}
                      >
                        <option value="Cleanser">Sữa rửa mặt / Tẩy trang</option>
                        <option value="Serum">Tinh chất / Serum</option>
                        <option value="Moisturizer">Kem dưỡng ẩm</option>
                        <option value="Toner">Nước hoa hồng / Toner</option>
                        <option value="Sunscreen">Kem chống nắng</option>
                        <option value="Treatment">Đặc trị / Treatment</option>
                        <option value="Essence">Nước thần / Essence</option>
                        <option value="Mask">Mặt nạ</option>
                        <option value="Eye Care">Kem mắt / Chăm sóc mắt</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">Số lượng tồn kho</label>
                      <Input
                        placeholder="Số lượng trong kho (Ví dụ: 15)"
                        type="number"
                        value={productForm.stock}
                        onChange={(event) => setProductForm((state) => ({ ...state, stock: event.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 grid-cols-3">
                    <div>
                      <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">Giá bán</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-mist/60" />
                        <Input
                          className="pl-8"
                          placeholder="42"
                          value={productForm.price.replace('$', '')}
                          onChange={(event) => setProductForm((state) => ({ ...state, price: event.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">Giá gốc</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-mist/60" />
                        <Input
                          className="pl-8"
                          placeholder="56"
                          value={productForm.originalPrice.replace('$', '')}
                          onChange={(event) => setProductForm((state) => ({ ...state, originalPrice: event.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">Giảm giá %</label>
                      <Input
                        placeholder="25"
                        type="number"
                        value={productForm.discount}
                        onChange={(event) => setProductForm((state) => ({ ...state, discount: event.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">Đường dẫn hình ảnh (URL)</label>
                    <Input
                      placeholder="Đường dẫn ảnh sản phẩm (Unsplash, CDN...)"
                      value={productForm.imageUrl}
                      onChange={(event) => setProductForm((state) => ({ ...state, imageUrl: event.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">Liên kết tiếp thị (Affiliate)</label>
                    <Input
                      placeholder="Đường dẫn liên kết mua hàng tại đối tác..."
                      value={productForm.externalUrl}
                      onChange={(event) => setProductForm((state) => ({ ...state, externalUrl: event.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">Thẻ phân loại / Tags (Phân cách bằng dấu phẩy)</label>
                    <Input
                      placeholder="nhạy cảm, phục hồi, dưỡng ẩm"
                      value={productForm.tags}
                      onChange={(event) => setProductForm((state) => ({ ...state, tags: event.target.value }))}
                    />
                  </div>

                  {saveProductMutation.error ? (
                    <p className="text-sm text-rose-500">{saveProductMutation.error.message}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      onClick={() => saveProductMutation.mutate()}
                      disabled={saveProductMutation.isPending}
                    >
                      {saveProductMutation.isPending ? 'Đang lưu...' : productForm.id ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                    </Button>
                    <Button variant="ghost" onClick={() => setProductForm(emptyProductForm)}>
                      Đặt lại
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Products List */}
              <div className="space-y-4">
                {/* Search & Filters */}
                <div className="bg-white border border-rose-100 rounded-3xl p-4 flex flex-wrap gap-3 items-center">
                  <div className="flex-1 relative min-w-[200px]">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-mist" />
                    <input
                      type="text"
                      className="w-full rounded-full border border-rose-100 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-200"
                      placeholder="Tìm kiếm sản phẩm theo tên/mô tả..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>

                  <select
                    className="rounded-full border border-rose-100 px-3 py-2 text-sm text-pearl focus:outline-none"
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                  >
                    <option value="All">Tất cả danh mục</option>
                    <option value="Cleanser">Sữa rửa mặt / Tẩy trang</option>
                    <option value="Serum">Serum / Tinh chất</option>
                    <option value="Moisturizer">Kem dưỡng ẩm</option>
                    <option value="Toner">Toner / Nước hoa hồng</option>
                    <option value="Sunscreen">Kem chống nắng</option>
                    <option value="Treatment">Đặc trị / Treatment</option>
                    <option value="Essence">Nước thần / Essence</option>
                    <option value="Mask">Mặt nạ</option>
                    <option value="Eye Care">Chăm sóc mắt</option>
                  </select>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-rose-100 rounded-3xl text-mist">
                    Không có sản phẩm nào khớp với tìm kiếm hoặc danh mục.
                  </div>
                ) : null}

                {filteredProducts.map((product) => {
                  const parsed = parseProductTags(product)
                  return (
                    <Card key={product.id} className="border border-rose-100 p-5 bg-white relative">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-24 w-24 rounded-2xl object-cover border border-rose-50"
                        />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="font-display text-2xl text-rose-950 font-bold leading-tight">{product.name}</h3>
                              <p className="mt-1 text-xs text-mist line-clamp-2">{product.description}</p>
                            </div>
                            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                              {parsed.category}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-rose-950/80 pt-1">
                            {parsed.price && (
                              <span className="flex items-center gap-1">
                                Giá: <span className="text-rose-600 font-extrabold">{parsed.price}</span>
                                {parsed.originalPrice && <span className="text-mist/60 line-through text-[10px]">{parsed.originalPrice}</span>}
                              </span>
                            )}
                            {parsed.discount && (
                              <span className="text-rose-500 font-extrabold">-{parsed.discount}%</span>
                            )}
                            {parsed.stock !== undefined && (
                              <span className={`flex items-center gap-1 ${parsed.stock <= 5 ? 'text-rose-600 font-bold' : 'text-mist/75'}`}>
                                <Package className="h-3 w-3" />
                                {parsed.stock} sản phẩm trong kho
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-mist/70 leading-none">
                            Tags: {formatTags(parsed.cleanTags)}
                          </p>

                          <div className="flex flex-wrap gap-2 pt-2">
                            <Button size="sm" variant="ghost" onClick={() => setProductForm(mapProductForm(product))}>
                              Sửa thuộc tính
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${product.name}?`)) {
                                  deleteProductMutation.mutate(product.id)
                                }
                              }}
                              disabled={deleteProductMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                              Xóa sản phẩm
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ) : null}

          {/* SCANS TAB WITH SCAN SIMULATOR */}
          {activeSection === 'scans' ? (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              {/* Scan Records list */}
              <div className="space-y-4">
                {/* Filters */}
                <div className="bg-white border border-rose-100 rounded-3xl p-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-mist" />
                    <input
                      type="text"
                      className="w-full rounded-full border border-rose-100 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-200"
                      placeholder="Tìm kiếm lượt quét theo UUID người dùng hoặc ID lượt quét..."
                      value={scanSearch}
                      onChange={(e) => setScanSearch(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-rose-950 font-bold uppercase tracking-wider">
                      <span>Khoảng điểm số:</span>
                      <span>{scanScoreFilter[0]} - {scanScoreFilter[1]}</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        className="flex-1 accent-rose-500"
                        value={scanScoreFilter[0]}
                        onChange={(e) => setScanScoreFilter([Number(e.target.value), scanScoreFilter[1]])}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        className="flex-1 accent-rose-500"
                        value={scanScoreFilter[1]}
                        onChange={(e) => setScanScoreFilter([scanScoreFilter[0], Number(e.target.value)])}
                      />
                    </div>
                  </div>
                </div>

                <Card className="border border-rose-100 p-6 bg-white">
                  <AdminSectionTitle
                    eyebrow="Hồ sơ quét da"
                    title="Lịch sử phân tích da"
                    description="Chọn một lượt quét để kiểm tra các chỉ số, thay đổi điểm số hoặc xóa bản ghi lịch sử."
                  />
                  <div className="mt-5 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {filteredScans.length === 0 ? (
                      <p className="text-center py-6 text-mist text-sm">Không có lượt quét nào khớp với bộ lọc.</p>
                    ) : null}

                    {filteredScans.map((scan) => (
                      <button
                        key={scan.id}
                        type="button"
                        onClick={() => setScanForm(mapScanForm(scan))}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          scanForm.id === scan.id
                            ? 'border-rose-300 bg-rose-50 text-rose-950'
                            : 'border-rose-100 bg-white hover:border-rose-200 hover:bg-rose-50/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-rose-950">Lượt quét {scan.id.slice(0, 8)}</p>
                            <p className="mt-0.5 text-xs text-mist truncate">Người dùng: {scan.user_id}</p>
                            <p className="mt-1 text-[10px] text-mist">{formatDate(scan.created_at)}</p>
                          </div>
                          <div className="rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-xs font-bold text-rose-600">
                            Điểm số {scan.score}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Side: Scan Details + Scan Simulator */}
              <div className="space-y-6">
                {/* Selected Scan details/editor */}
                {scanForm.id ? (
                  <Card className="border border-rose-100 p-6 bg-white">
                    <AdminSectionTitle
                      eyebrow="Trình sửa lượt quét"
                      title={`Kiểm tra lượt quét ${scanForm.id.slice(0, 8)}`}
                      description="Cập nhật điểm số hoặc ghi đè thủ công dữ liệu phân tích JSON được lưu trữ."
                    />
                    <div className="mt-5 space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">Điểm số</label>
                        <Input
                          placeholder="Điểm số"
                          type="number"
                          value={scanForm.score}
                          onChange={(event) => setScanForm((state) => ({ ...state, score: event.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">Dữ liệu JSON chỉ số</label>
                        <textarea
                          className="min-h-[140px] w-full rounded-2xl border border-rose-200/80 bg-white/80 px-4 py-3 font-mono text-xs text-pearl placeholder:text-mist/70 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/25"
                          placeholder="Dữ liệu JSON chỉ số"
                          value={scanForm.metricsJson}
                          onChange={(event) => setScanForm((state) => ({ ...state, metricsJson: event.target.value }))}
                        />
                      </div>

                      {saveScanMutation.error ? (
                        <p className="text-sm text-rose-500">{saveScanMutation.error.message}</p>
                      ) : null}

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button onClick={() => saveScanMutation.mutate()} disabled={saveScanMutation.isPending}>
                          Lưu cập nhật
                        </Button>
                        <Button variant="ghost" onClick={() => setScanForm(emptyScanForm)}>
                          Hủy bỏ
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ quét da này không?')) {
                              deleteScanMutation.mutate(scanForm.id)
                            }
                          }}
                          disabled={deleteScanMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa lượt quét
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : null}

                {/* Scan Simulator Panel */}
                <Card className="border border-rose-200 bg-gradient-to-br from-rose-50/50 to-amber-50/30 p-6">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-rose-600 font-extrabold">
                    <Sliders className="h-4 w-4 text-rose-500 animate-pulse" />
                    <span>Studio cho Phát triển</span>
                  </div>
                  <h3 className="mt-2 font-display text-2xl text-rose-950">Trình giả lập Quét da</h3>
                  <p className="mt-1 text-sm text-mist">
                    Kích hoạt các kết quả giả lập và lưu trực tiếp vào Supabase để kiểm tra các quy tắc đề xuất sản phẩm.
                  </p>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">
                        ID người dùng mục tiêu (Để trống để sử dụng tài khoản admin đang đăng nhập)
                      </label>
                      <Input
                        placeholder="UUID Người dùng Supabase (Ví dụ: 5d5a7d8...)"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      {/* Hydration Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-rose-950">
                          <span>Mức độ dưỡng ẩm</span>
                          <span className="text-cyan-600 font-extrabold">{simHydration}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          className="w-full accent-cyan"
                          value={simHydration}
                          onChange={(e) => setSimHydration(Number(e.target.value))}
                        />
                      </div>

                      {/* Acne Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-rose-950">
                          <span>Mức độ mụn (giá trị thấp hơn đại diện cho da sạch mịn hơn)</span>
                          <span className="text-rose-600 font-extrabold">{simAcne}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className="w-full accent-rose-500"
                          value={simAcne}
                          onChange={(e) => setSimAcne(Number(e.target.value))}
                        />
                      </div>

                      {/* Oiliness Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-rose-950">
                          <span>Bã nhờn / Dầu thừa</span>
                          <span className="text-amber-600 font-extrabold">{simOiliness}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          className="w-full accent-amber-500"
                          value={simOiliness}
                          onChange={(e) => setSimOiliness(Number(e.target.value))}
                        />
                      </div>

                      {/* Dark Circles Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-rose-950">
                          <span>Mức độ thâm quầng da mắt</span>
                          <span className="text-purple-600 font-extrabold">{simDarkCircles}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          className="w-full accent-purple-500"
                          value={simDarkCircles}
                          onChange={(e) => setSimDarkCircles(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-2xl border border-rose-100 flex items-center justify-between text-xs">
                      <span className="text-mist font-semibold">Điểm số da tính toán:</span>
                      <span className="text-lg font-bold text-rose-900">
                        {Math.round((simHydration + (100 - simAcne) + (100 - simOiliness) + (100 - simDarkCircles)) / 4)} / 100
                      </span>
                    </div>

                    {runSimulatorMutation.error ? (
                      <p className="text-xs text-rose-500">{runSimulatorMutation.error.message}</p>
                    ) : null}

                    {runSimulatorMutation.isSuccess ? (
                      <p className="text-xs text-emerald-600 font-bold">Lượt quét giả lập đã được tạo và lưu thành công! ✓</p>
                    ) : null}

                    <Button
                      className="w-full justify-center"
                      onClick={() => runSimulatorMutation.mutate()}
                      disabled={runSimulatorMutation.isPending}
                    >
                      {runSimulatorMutation.isPending ? 'Đang lưu bản ghi...' : 'Giả lập quét da & Lưu dữ liệu'}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          ) : null}

          {/* RECOMMENDATIONS TAB */}
          {activeSection === 'recommendations' ? (
            <div className="space-y-4">
              {/* Creator Form */}
              <Card className="border border-rose-100 p-6 bg-white">
                <AdminSectionTitle
                  eyebrow="Quản lý Đề xuất"
                  title={recommendationForm.id ? 'Chỉnh sửa đề xuất' : 'Tạo liên kết đề xuất'}
                  description="Liên kết một sản phẩm cụ thể với một ID lượt quét. Tùy chỉnh lý do phù hợp xuất hiện trên dòng thời gian của khách hàng."
                />
                <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">ID Lượt quét</label>
                    <Input
                      placeholder="UUID lượt quét da của khách hàng..."
                      value={recommendationForm.scanId}
                      onChange={(event) => setRecommendationForm((state) => ({ ...state, scanId: event.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">ID Sản phẩm</label>
                    <Input
                      placeholder="UUID sản phẩm được đề xuất..."
                      value={recommendationForm.productId}
                      onChange={(event) => setRecommendationForm((state) => ({ ...state, productId: event.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1">Lý do đề xuất</label>
                    <Input
                      placeholder="Tại sao sản phẩm này phù hợp (Ví dụ: Thích hợp cho da khô thiếu nước...)"
                      value={recommendationForm.reason}
                      onChange={(event) => setRecommendationForm((state) => ({ ...state, reason: event.target.value }))}
                    />
                  </div>
                </div>

                {saveRecommendationMutation.error ? (
                  <p className="mt-3 text-sm text-rose-500">{saveRecommendationMutation.error.message}</p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => saveRecommendationMutation.mutate()} disabled={saveRecommendationMutation.isPending}>
                    {saveRecommendationMutation.isPending ? 'Đang lưu...' : recommendationForm.id ? 'Cập nhật đề xuất' : 'Tạo đề xuất'}
                  </Button>
                  <Button variant="ghost" onClick={() => setRecommendationForm(emptyRecommendationForm)}>
                    Đặt lại
                  </Button>
                </div>
              </Card>

              {/* Search & Filter */}
              <div className="bg-white border border-rose-100 rounded-3xl p-4 flex flex-wrap gap-3 items-center">
                <div className="flex-1 relative min-w-[200px]">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-mist" />
                  <input
                    type="text"
                    className="w-full rounded-full border border-rose-100 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-200"
                    placeholder="Tìm kiếm theo từ khóa lượt quét, sản phẩm hoặc lý do..."
                    value={recommendationSearch}
                    onChange={(e) => setRecommendationSearch(e.target.value)}
                  />
                </div>

                <select
                  className="rounded-full border border-rose-100 px-3 py-2 text-sm text-pearl focus:outline-none"
                  value={recommendationCategoryFilter}
                  onChange={(e) => setRecommendationCategoryFilter(e.target.value)}
                >
                  <option value="All">Tất cả danh mục</option>
                  <option value="Cleanser">Sữa rửa mặt / Tẩy trang</option>
                  <option value="Serum">Serum / Tinh chất</option>
                  <option value="Moisturizer">Kem dưỡng ẩm</option>
                  <option value="Toner">Toner / Nước hoa hồng</option>
                  <option value="Sunscreen">Kem chống nắng</option>
                  <option value="Treatment">Đặc trị / Treatment</option>
                  <option value="Essence">Nước thần / Essence</option>
                  <option value="Mask">Mặt nạ</option>
                  <option value="Eye Care">Chăm sóc mắt</option>
                </select>
              </div>

              {filteredRecommendations.length === 0 ? (
                <div className="text-center py-12 bg-white border border-rose-100 rounded-3xl text-mist">
                  Không có bản ghi đề xuất nào khớp với tiêu chí tìm kiếm.
                </div>
              ) : null}

              {/* Recommendations grid */}
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredRecommendations.map((recommendation) => {
                  const product = productLookup.get(recommendation.product_id)
                  const scan = scanLookup.get(recommendation.scan_id)
                  const parsedProduct = product ? parseProductTags(product) : null

                  return (
                    <Card key={recommendation.id} className="border border-rose-100 p-5 bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan font-bold">Liên kết phù hợp</p>
                          <h3 className="mt-2 font-display text-2xl text-rose-950 font-bold truncate">
                            {product?.name ?? recommendation.product_id.slice(0, 8)}
                          </h3>
                          {parsedProduct && (
                            <span className="inline-block mt-1 text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-semibold">
                              {parsedProduct.category}
                            </span>
                          )}
                          <p className="mt-2.5 text-xs text-mist leading-relaxed font-medium bg-rose-50/20 border border-rose-100/50 p-2.5 rounded-xl">
                            {recommendation.reason}
                          </p>
                        </div>
                        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-mist shrink-0 font-mono">
                          {formatDate(recommendation.created_at)}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-2 rounded-2xl border border-rose-100 bg-rose-50/60 p-4 text-[11px] text-mist">
                        <p className="truncate"><span className="font-semibold text-rose-950">UUID Lượt quét:</span> {recommendation.scan_id} {scan && `(Điểm số ${scan.score})`}</p>
                        <p className="truncate"><span className="font-semibold text-rose-950">UUID Sản phẩm:</span> {recommendation.product_id}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 pt-1">
                        <Button size="sm" variant="ghost" onClick={() => setRecommendationForm(mapRecommendationForm(recommendation))}>
                          Sửa chi tiết đề xuất
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Bạn có chắc chắn muốn xóa liên kết đề xuất này?')) {
                              deleteRecommendationMutation.mutate(recommendation.id)
                            }
                          }}
                          disabled={deleteRecommendationMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa đề xuất
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ) : null}

          {/* ACCESS CONTROL MANAGER */}
          {activeSection === 'access' ? (
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              {/* Users list and Role Editor */}
              <Card className="border border-rose-100 p-6 bg-white shadow-sm space-y-5">
                <div>
                  <h3 className="font-display text-2xl text-rose-950">Phân quyền Vai trò Người dùng</h3>
                  <p className="text-xs text-mist mt-1">
                    Quản lý phân quyền của người dùng. Việc đổi quyền sang người dùng thường "user" sẽ tước quyền truy cập admin ngay lập tức.
                  </p>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-mist" />
                  <input
                    type="text"
                    className="w-full rounded-full border border-rose-100 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-200"
                    placeholder="Tìm kiếm người dùng theo email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-rose-100 text-rose-950 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-2">Email</th>
                        <th className="pb-3 px-2">Quyền được giao</th>
                        <th className="pb-3 px-2">Ngày tạo</th>
                        <th className="pb-3 pl-2 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-50">
                      {filteredUsers.map((item) => (
                        <tr key={item.id} className="hover:bg-rose-50/20 text-rose-950">
                          <td className="py-3 pr-2 font-medium truncate max-w-[150px]" title={item.email}>
                            {item.email}
                            {item.email.toLowerCase() === currentAuthUser?.email?.toLowerCase() && (
                              <span className="ml-1 text-[9px] bg-cyan/10 text-cyan-700 px-1 py-0.5 rounded font-extrabold">Bạn</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <select
                              className="rounded border border-rose-100 bg-white px-2 py-1 focus:outline-none text-[11px]"
                              value={item.role}
                              onChange={(e) => updateUserRoleMutation.mutate({ userId: item.id, role: e.target.value })}
                            >
                              <option value="superadmin">Super Admin (Tối cao)</option>
                              <option value="catalog">Catalog Admin (Danh mục)</option>
                              <option value="operations">Operations Admin (Vận hành)</option>
                              <option value="content">Content Admin (Nội dung)</option>
                              <option value="analyst">Analyst (Phân tích)</option>
                              <option value="user">User thường (Không có quyền Admin)</option>
                            </select>
                          </td>
                          <td className="py-3 px-2 text-mist">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 pl-2 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc chắn muốn xóa phân quyền tùy chỉnh cho ${item.email}?`)) {
                                  deleteUserRoleMutation.mutate(item.id)
                                }
                              }}
                              className="text-rose-600 hover:text-rose-800"
                              disabled={deleteUserRoleMutation.isPending}
                            >
                              Đặt lại
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Add User Panel & Role Explanations */}
              <div className="space-y-4">
                {/* Add Custom User Form */}
                <Card className="border border-rose-100 p-6 bg-white shadow-sm space-y-4">
                  <h3 className="font-display text-xl text-rose-950 flex items-center gap-1.5">
                    <PlusCircle className="h-5 w-5 text-rose-500" />
                    Gán vai trò cho người dùng
                  </h3>
                  <p className="text-xs text-mist leading-relaxed">
                    Cấp quyền truy cập mô-đun cụ thể cho tài khoản kiểm thử hoặc người dùng Supabase. Quyền hạn sẽ có hiệu lực ngay lập tức.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold text-rose-950 uppercase tracking-wide block mb-1">Email người dùng</label>
                      <Input
                        placeholder="Ví dụ: khachhang@beauty.vn"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-rose-950 uppercase tracking-wide block mb-1">Mức độ truy cập</label>
                      <select
                        className="w-full rounded-2xl border border-rose-200/80 bg-white px-4 py-2.5 text-xs text-pearl focus:outline-none focus:ring-1 focus:ring-rose-300"
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as any)}
                      >
                        <option value="superadmin">Super Admin (Tất cả mô-đun)</option>
                        <option value="catalog">Catalog Admin (Sản phẩm & Đề xuất)</option>
                        <option value="operations">Operations Admin (Sản phẩm & Quét da)</option>
                        <option value="content">Content Admin (Sản phẩm & Viết lý do đề xuất)</option>
                        <option value="analyst">Analyst (Quét da & Xem báo cáo)</option>
                        <option value="user">Regular User (Không có quyền Admin)</option>
                      </select>
                    </div>

                    {createUserRoleMutation.error ? (
                      <p className="text-xs text-rose-500">{createUserRoleMutation.error.message}</p>
                    ) : null}

                    <Button
                      className="w-full justify-center"
                      onClick={() => createUserRoleMutation.mutate()}
                      disabled={createUserRoleMutation.isPending}
                    >
                      {createUserRoleMutation.isPending ? 'Đang gán...' : 'Gán quyền người dùng'}
                    </Button>
                  </div>
                </Card>

                {/* Role Explanations */}
                <Card className="border border-rose-100 p-6 bg-white shadow-sm">
                  <AdminSectionTitle
                    eyebrow="Ma trận quyền hạn"
                    title="Phạm vi các mô-đun vai trò"
                    description="Danh sách hiển thị các mô-đun dựa trên quy tắc phân quyền vai trò."
                  />
                  <div className="mt-5 space-y-3 text-xs text-rose-950">
                    {[
                      { role: 'Super Admin (Tối cao)', scope: 'Toàn quyền truy cập tất cả các phần của trang quản trị và công cụ giả lập.' },
                      { role: 'Catalog Admin (Danh mục)', scope: 'Quản lý danh mục sản phẩm, chi tiết giá cả và kết nối đề xuất sản phẩm.' },
                      { role: 'Operations Admin (Vận hành)', scope: 'Xem danh sách danh mục, kiểm tra lịch sử quét da và công cụ giả lập.' },
                      { role: 'Content Admin (Nội dung)', scope: 'Sửa đổi mô tả thông tin sản phẩm và chỉnh sửa lý do đề xuất.' },
                      { role: 'Analyst (Phân tích)', scope: 'Chỉ xem biểu đồ chỉ số, xem lịch sử quét da và kiểm tra kết nối.' },
                    ].map((item) => (
                      <div key={item.role} className="rounded-2xl border border-rose-50 bg-rose-50/20 px-3 py-2.5">
                        <p className="font-semibold flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-rose-500" />
                          {item.role}
                        </p>
                        <p className="mt-1 text-[11px] text-mist">{item.scope}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          ) : null}

          {/* SETTINGS TAB */}
          {activeSection === 'settings' ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  title: 'Trạng thái nền tảng',
                  detail: 'Danh mục sản phẩm kết nối Supabase, nhật ký quét da và phân quyền quản trị đang hoạt động.',
                  icon: CheckCircle2,
                },
                {
                  title: 'Công cụ đánh giá',
                  detail: 'Cấu hình điểm số quét da, sửa đổi các thẻ phân loại và tùy chỉnh lý do đề xuất.',
                  icon: ListChecks,
                },
                {
                  title: 'Quản trị hệ thống',
                  detail: 'Hạn chế quyền truy cập theo chức năng công việc thông qua phân quyền vai trò chi tiết.',
                  icon: Clock3,
                },
                {
                  title: 'Công cụ giả lập',
                  detail: 'Tạo các kết quả quét da giả lập để kiểm tra danh mục và chu kỳ đề xuất sản phẩm.',
                  icon: Megaphone,
                },
                {
                  title: 'Đồng bộ dữ liệu',
                  detail: 'Trang khách hàng trực tuyến truy xuất dữ liệu từ cơ sở dữ liệu thay vì các tệp giả lập.',
                  icon: Database,
                },
                {
                  title: 'Chu kỳ làm mới',
                  detail: 'Nhấn tải lại hoặc xóa bộ nhớ đệm để cập nhật dữ liệu sau các thay đổi.',
                  icon: Rocket,
                },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <Card key={item.title} className="border border-rose-100 p-5 bg-white flex justify-between items-start gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan font-bold">{item.title}</p>
                      <p className="mt-2 text-xs text-mist leading-relaxed">{item.detail}</p>
                    </div>
                    <div className="rounded-2xl bg-rose-50 p-2.5 text-rose-600 shrink-0">
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
              {/* Overview Title */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <AdminSectionTitle
                  eyebrow="Báo cáo tài chính"
                  title="Doanh thu & Đơn hàng"
                  description="Theo dõi hiệu suất doanh số bán sản phẩm và quản lý thông tin đặt hàng của khách hàng."
                />

                <Button
                  onClick={() => simulateOrderMutation.mutate()}
                  disabled={simulateOrderMutation.isPending || productsQuery.isLoading}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs tracking-wider uppercase py-2.5 px-4 rounded-xl shadow-md justify-center shrink-0"
                >
                  {simulateOrderMutation.isPending ? 'Đang tạo...' : 'Giả lập 1 đơn hàng'}
                </Button>
              </div>

              {/* Metric Grid */}
              {ordersQuery.isLoading ? (
                <Loader />
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border border-rose-100 p-5 bg-white shadow-sm flex items-start gap-4">
                      <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 shrink-0">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-mist font-semibold">Tổng doanh thu</p>
                        <h4 className="mt-1.5 font-display text-2xl font-black text-rose-950">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderStats.totalRevenue)}
                        </h4>
                        <p className="text-[10px] text-emerald-600 mt-1 font-bold">Từ đơn đã hoàn thành</p>
                      </div>
                    </Card>

                    <Card className="border border-rose-100 p-5 bg-white shadow-sm flex items-start gap-4">
                      <div className="rounded-2xl bg-cyan/10 p-3 text-cyan-600 shrink-0">
                        <Activity className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-mist font-semibold">Tổng đơn hàng</p>
                        <h4 className="mt-1.5 font-display text-2xl font-black text-rose-950">
                          {orderStats.totalOrders} đơn
                        </h4>
                        <p className="text-[10px] text-mist mt-1">Bao gồm cả đơn đang xử lý/hủy</p>
                      </div>
                    </Card>

                    <Card className="border border-rose-100 p-5 bg-white shadow-sm flex items-start gap-4">
                      <div className="rounded-2xl bg-rose-50 p-3 text-rose-600 shrink-0">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-mist font-semibold font-bold">Số lượng đã bán</p>
                        <h4 className="mt-1.5 font-display text-2xl font-black text-rose-950">
                          {orderStats.totalUnits} sản phẩm
                        </h4>
                        <p className="text-[10px] text-rose-600 mt-1">Từ các đơn thành công</p>
                      </div>
                    </Card>

                    <Card className="border border-rose-100 p-5 bg-white shadow-sm flex items-start gap-4">
                      <div className="rounded-2xl bg-amber-50 p-3 text-amber-600 shrink-0">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-mist font-semibold">Giá trị TB đơn</p>
                        <h4 className="mt-1.5 font-display text-2xl font-black text-rose-950">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderStats.avgOrderValue)}
                        </h4>
                        <p className="text-[10px] text-amber-600 mt-1 font-bold">Doanh số trung bình / đơn</p>
                      </div>
                    </Card>
                  </div>

                  {/* Charts & Top Sellers Grid */}
                  <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    {/* SVG Trend Chart */}
                    <Card className="border border-rose-100 p-6 bg-white shadow-sm space-y-4">
                      <div>
                        <h3 className="font-display text-lg font-bold text-rose-950">Biến động Doanh thu (7 ngày qua)</h3>
                        <p className="text-xs text-mist">Biểu đồ thể hiện tổng tiền đơn hoàn thành theo ngày.</p>
                      </div>

                      {orderStats.totalRevenue === 0 ? (
                        <div className="h-[200px] flex items-center justify-center text-xs text-mist">
                          Chưa có dữ liệu doanh số hoàn thành.
                        </div>
                      ) : (
                        <div className="w-full">
                          <svg viewBox="0 0 500 160" className="w-full h-auto overflow-visible">
                            <defs>
                              <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.00" />
                              </linearGradient>
                            </defs>

                            {/* Grid Lines */}
                            <line x1="40" y1="20" x2="460" y2="20" stroke="#fff1f2" strokeDasharray="3" />
                            <line x1="40" y1="70" x2="460" y2="70" stroke="#fff1f2" strokeDasharray="3" />
                            <line x1="40" y1="140" x2="460" y2="140" stroke="#ffe4e6" strokeWidth="1.5" />

                            {/* Y Axis Labels */}
                            <text x="32" y="24" textAnchor="end" className="text-[9px] fill-mist font-semibold">
                              {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(Math.max(...orderStats.dailyTrend.map((d) => d.revenue), 1000000))}
                            </text>
                            <text x="32" y="74" textAnchor="end" className="text-[9px] fill-mist font-semibold">
                              {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(Math.max(...orderStats.dailyTrend.map((d) => d.revenue), 1000000) / 2)}
                            </text>
                            <text x="32" y="144" textAnchor="end" className="text-[9px] fill-mist font-semibold">0</text>

                            {/* Area and Line Path */}
                            <path d={(() => {
                              const maxVal = Math.max(...orderStats.dailyTrend.map((d) => d.revenue), 1000000)
                              const points = orderStats.dailyTrend.map((d, i) => {
                                const x = 40 + (i * 420) / 6
                                const y = 140 - (d.revenue / maxVal) * 100
                                return { x, y }
                              })
                              const pathD = points.reduce((acc, p, i) => {
                                return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
                              }, '')
                              return points.length > 0 ? `${pathD} L ${points[points.length - 1].x} 140 L ${points[0].x} 140 Z` : ''
                            })()} fill="url(#revenue-grad)" />

                            <path d={(() => {
                              const maxVal = Math.max(...orderStats.dailyTrend.map((d) => d.revenue), 1000000)
                              const points = orderStats.dailyTrend.map((d, i) => {
                                const x = 40 + (i * 420) / 6
                                const y = 140 - (d.revenue / maxVal) * 100
                                return { x, y }
                              })
                              return points.reduce((acc, p, i) => {
                                return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
                              }, '')
                            })()} fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Dots and Labels */}
                            {(() => {
                              const maxVal = Math.max(...orderStats.dailyTrend.map((d) => d.revenue), 1000000)
                              return orderStats.dailyTrend.map((d, i) => {
                                const x = 40 + (i * 420) / 6
                                const y = 140 - (d.revenue / maxVal) * 100
                                return (
                                  <g key={i} className="group/dot cursor-pointer">
                                    <circle cx={x} cy={y} r="4.5" fill="#ec4899" stroke="#ffffff" strokeWidth="2.5" className="transition-all duration-300 hover:r-6" />
                                    <circle cx={x} cy={y} r="8" fill="#ec4899" opacity="0" className="hover:opacity-10" />
                                    <text x={x} y={y - 10} textAnchor="middle" className="text-[9px] fill-rose-950 font-bold opacity-0 group-hover/dot:opacity-100 transition-opacity bg-white px-1 py-0.5 rounded shadow-sm">
                                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(d.revenue)}
                                    </text>
                                    <text x={x} y="154" textAnchor="middle" className="text-[9px] fill-mist font-bold">
                                      {d.date}
                                    </text>
                                  </g>
                                )
                              })
                            })()}
                          </svg>
                        </div>
                      )}
                    </Card>

                    {/* Top Sellers */}
                    <Card className="border border-rose-100 p-6 bg-white shadow-sm space-y-4">
                      <div>
                        <h3 className="font-display text-lg font-bold text-rose-950">Top Sản phẩm bán chạy nhất</h3>
                        <p className="text-xs text-mist">Xếp hạng theo tổng doanh thu mang lại.</p>
                      </div>

                      {orderStats.topSellers.length === 0 ? (
                        <div className="h-[200px] flex items-center justify-center text-xs text-mist">
                          Chưa có dữ liệu sản phẩm đã bán thành công.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orderStats.topSellers.map((item, index) => {
                            const share = orderStats.totalRevenue > 0 ? (item.revenue / orderStats.totalRevenue) * 100 : 0
                            return (
                              <div key={item.name} className="space-y-1.5">
                                <div className="flex items-center gap-3 justify-between">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="font-mono text-xs font-black text-rose-300 w-4">{index + 1}</span>
                                    <img src={item.image} alt={item.name} className="h-9 w-9 rounded-lg object-cover border border-rose-50" />
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-rose-950 truncate max-w-[140px]" title={item.name}>{item.name}</p>
                                      <p className="text-[10px] text-mist">{item.category}</p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-xs font-extrabold text-cyan-600">
                                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.revenue)}
                                    </p>
                                    <p className="text-[9px] text-mist font-semibold">Đã bán: {item.units}</p>
                                  </div>
                                </div>
                                <div className="h-1.5 w-full bg-rose-50 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full" style={{ width: `${share}%` }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Orders List & Management */}
                  <Card className="border border-rose-100 p-6 bg-white shadow-sm space-y-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-rose-50 pb-4">
                      <div>
                        <h3 className="font-display text-xl text-rose-950 font-bold">Danh sách Đơn hàng</h3>
                        <p className="text-xs text-mist">Kiểm duyệt, thay đổi trạng thái giao vận hoặc xóa đơn hàng.</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(['All', 'pending', 'completed', 'canceled'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => setOrderStatusFilter(status)}
                            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                              orderStatusFilter === status
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'bg-rose-50/50 text-rose-950 hover:bg-rose-100/60'
                            }`}
                          >
                            {status === 'All' && 'Tất cả'}
                            {status === 'pending' && 'Chờ xử lý'}
                            {status === 'completed' && 'Đã hoàn thành'}
                            {status === 'canceled' && 'Đã hủy'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-mist" />
                      <input
                        type="text"
                        className="w-full rounded-full border border-rose-100 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-200"
                        placeholder="Tìm kiếm theo mã đơn, tên khách hàng, số điện thoại hoặc tên sản phẩm..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                      />
                    </div>

                    {/* Table */}
                    {filteredOrders.length === 0 ? (
                      <div className="py-12 text-center text-xs text-mist">
                        Không tìm thấy đơn hàng nào khớp với bộ lọc tìm kiếm.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-rose-100 text-rose-950 font-bold uppercase tracking-wider">
                              <th className="pb-3 pr-2">Mã Đơn</th>
                              <th className="pb-3 px-2">Khách Hàng</th>
                              <th className="pb-3 px-2">Sản Phẩm</th>
                              <th className="pb-3 px-2 text-center">SL</th>
                              <th className="pb-3 px-2 text-right">Tổng Tiền</th>
                              <th className="pb-3 px-2 text-center">Thanh Toán</th>
                              <th className="pb-3 px-2 text-center">Trạng Thái</th>
                              <th className="pb-3 pl-2 text-right">Thao Tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-rose-50">
                            {filteredOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-rose-50/20 text-rose-950 animate-fadeIn">
                                <td className="py-3 pr-2 font-mono font-bold text-cyan-600">{order.id}</td>
                                <td className="py-3 px-2 max-w-[150px] truncate" title={`${order.shippingInfo.name} - ${order.shippingInfo.phone}\n${order.shippingInfo.address}`}>
                                  <p className="font-bold">{order.shippingInfo.name}</p>
                                  <p className="text-[10px] text-mist">{order.shippingInfo.phone}</p>
                                </td>
                                <td className="py-3 px-2 max-w-[160px] truncate" title={order.productName}>
                                  <div className="flex items-center gap-2">
                                    <img src={order.productImage} alt={order.productName} className="h-6 w-6 rounded object-cover border border-rose-50" />
                                    <span className="font-medium truncate">{order.productName}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-center font-bold">{order.quantity}</td>
                                <td className="py-3 px-2 text-right font-extrabold text-cyan-600">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <span className="uppercase text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-extrabold border border-rose-100">
                                    {order.paymentMethod}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-center">
                                  <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatusMutation.mutate({ orderId: order.id, status: e.target.value as any })}
                                    className={`rounded-full px-2 py-1 text-[10px] font-bold focus:outline-none border cursor-pointer ${
                                      order.status === 'completed'
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25'
                                        : order.status === 'pending'
                                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/25'
                                        : 'bg-rose-500/10 text-rose-600 border-rose-500/25'
                                    }`}
                                  >
                                    <option value="pending">Chờ xử lý</option>
                                    <option value="completed">Đã hoàn thành</option>
                                    <option value="canceled">Đã hủy</option>
                                  </select>
                                </td>
                                <td className="py-3 pl-2 text-right">
                                  <button
                                    onClick={() => {
                                      if (confirm(`Xóa đơn hàng ${order.id} khỏi hệ thống?`)) {
                                        deleteOrderMutation.mutate(order.id)
                                      }
                                    }}
                                    className="text-rose-500 hover:text-rose-700 p-1 transition"
                                    disabled={deleteOrderMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
