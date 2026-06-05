import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Order } from '@/core/entities'
import { parseProductTags } from '@/shared/lib/product-tags'
import type { AdminProductRecord } from '@/application/dtos/admin'

export function useAdminRevenue(adminUseCases: any, products: AdminProductRecord[]) {
  const queryClient = useQueryClient()
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All')

  const ordersQuery = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => adminUseCases.getOrders(),
  })

  const filteredOrders = useMemo(() => {
    const list = ordersQuery.data ?? []
    const normalizedSearch = orderSearch.toLowerCase()

    return list.filter((order: Order) => {
      const matchSearch =
        order.id.toLowerCase().includes(normalizedSearch) ||
        order.productName.toLowerCase().includes(normalizedSearch) ||
        order.shippingInfo.name.toLowerCase().includes(normalizedSearch)
      const matchStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter
      return matchSearch && matchStatus
    })
  }, [ordersQuery.data, orderSearch, orderStatusFilter])

  const revenueStats = useMemo(() => {
    const list = ordersQuery.data ?? []
    const completed = list.filter((order: Order) => order.status === 'completed')
    const pending = list.filter((order: Order) => order.status === 'pending')
    const canceled = list.filter((order: Order) => order.status === 'canceled')

    const totalRevenue = completed.reduce((sum: number, order: Order) => sum + order.totalPrice, 0)
    const pendingAmount = pending.reduce((sum: number, order: Order) => sum + order.totalPrice, 0)

    const categoryMap = new Map<string, number>()
    completed.forEach((order: Order) => {
      const category = order.productCategory || 'Other'
      categoryMap.set(category, (categoryMap.get(category) ?? 0) + order.totalPrice)
    })

    const paymentMap = new Map<string, number>()
    completed.forEach((order: Order) => {
      const paymentMethod = order.paymentMethod.toUpperCase()
      paymentMap.set(paymentMethod, (paymentMap.get(paymentMethod) ?? 0) + order.totalPrice)
    })

    return {
      totalRevenue,
      pendingAmount,
      completedCount: completed.length,
      pendingCount: pending.length,
      canceledCount: canceled.length,
      totalCount: list.length,
      categoryBreakdown: Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })),
      paymentBreakdown: Array.from(paymentMap.entries()).map(([name, value]) => ({ name, value })),
    }
  }, [ordersQuery.data])

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: 'pending' | 'completed' | 'canceled' }) => {
      return adminUseCases.updateOrderStatus(orderId, status)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => adminUseCases.deleteOrder(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const simulateOrderMutation = useMutation({
    mutationFn: async () => {
      if (products.length === 0) throw new Error('No products available to simulate order.')
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 2) + 1
      const price = 250000 + Math.floor(Math.random() * 8) * 50000

      const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'Chris', 'Sarah', 'David', 'Jessica']
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
      const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
      const phone = `098${Math.floor(1000000 + Math.random() * 9000000)}`
      const address = `${Math.floor(Math.random() * 100) + 1} Main St, New York`
      const paymentMethods = ['cod', 'momo', 'visa', 'apple'] as const

      const newOrder: Order = {
        id: `BG-${Math.floor(100000 + Math.random() * 900000)}`,
        productId: product.id,
        productName: product.name,
        productImage:
          product.image_url ||
          'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80',
        productCategory: parseProductTags(product as any).category || 'Serum',
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

  const updateOrderSearch = (value: string) => {
    setOrderSearch(value)
  }

  const updateOrderStatusFilter = (value: string) => {
    setOrderStatusFilter(value)
  }

  const simulateOrder = () => {
    simulateOrderMutation.mutate()
  }

  const updateOrderStatus = (orderId: string, status: 'pending' | 'completed' | 'canceled') => {
    updateOrderStatusMutation.mutate({ orderId, status })
  }

  const deleteOrder = (orderId: string) => {
    if (confirm(`Delete order ${orderId}?`)) {
      deleteOrderMutation.mutate(orderId)
    }
  }

  return {
    ordersQuery,
    orderSearch,
    orderStatusFilter,
    filteredOrders,
    revenueStats,
    updateOrderStatusMutation,
    deleteOrderMutation,
    simulateOrderMutation,
    updateOrderSearch,
    updateOrderStatusFilter,
    simulateOrder,
    updateOrderStatus,
    deleteOrder,
  }
}
