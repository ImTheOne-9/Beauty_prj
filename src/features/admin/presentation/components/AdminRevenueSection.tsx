import { RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import type { Order } from '@/core/entities'
import { useAdminPagination } from '../hooks/useAdminPagination'
import { AdminPagination } from './AdminPagination'
import { AdminSectionTitle } from './AdminSectionTitle'
import { AdminTableCard } from './AdminTableCard'
import { AdminToolbar } from './AdminToolbar'

type RevenueBreakdownItem = {
  name: string
  value: number
}

type RevenueStats = {
  totalRevenue: number
  pendingAmount: number
  completedCount: number
  pendingCount: number
  canceledCount: number
  totalCount: number
  categoryBreakdown: RevenueBreakdownItem[]
  paymentBreakdown: RevenueBreakdownItem[]
}

type AdminRevenueSectionProps = {
  orders: Order[]
  stats: RevenueStats
  search: string
  statusFilter: string
  isSimulating: boolean
  isUpdatingStatus: boolean
  isDeleting: boolean
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onSimulateOrder: () => void
  onUpdateStatus: (orderId: string, status: Order['status']) => void
  onDelete: (orderId: string) => void
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}₫`
}

export function AdminRevenueSection({
  orders,
  stats,
  search,
  statusFilter,
  isSimulating,
  isUpdatingStatus,
  isDeleting,
  onSearchChange,
  onStatusFilterChange,
  onSimulateOrder,
  onUpdateStatus,
  onDelete,
}: AdminRevenueSectionProps) {
  const averageOrderValue = stats.completedCount ? stats.totalRevenue / stats.completedCount : 0
  const { page, totalPages, paginatedItems, setPage } = useAdminPagination(orders, 10)

  return (
    <div className="space-y-4">
      <Card className="border border-admin-border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <AdminSectionTitle
            eyebrow="Revenue"
            title="Revenue & Orders"
            description="Track order status, payment mix, and simulated sales data."
          />
          <Button onClick={onSimulateOrder} disabled={isSimulating} className="flex items-center gap-1">
            {isSimulating ? 'Simulating...' : 'Simulate Order'}
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <RevenueMetricCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} hint="Completed" />
        <RevenueMetricCard label="Pending Revenue" value={formatCurrency(stats.pendingAmount)} hint="Pending" />
        <RevenueMetricCard label="Order Count" value={String(stats.totalCount)} hint="Total Orders" />
        <RevenueMetricCard label="Average Order Value" value={formatCurrency(Math.round(averageOrderValue))} hint="AOV" />
      </div>

      <AdminToolbar>
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="min-w-[220px] flex-1"
        />
        <select
          className="rounded-full border border-admin-border px-3 py-2 text-sm text-admin-ink focus:outline-none"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
        >
          <option value="All">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
        </select>
      </AdminToolbar>

      <AdminTableCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-admin-border font-bold uppercase tracking-wider text-admin-ink">
                <th className="pb-3 pr-3">Order ID</th>
                <th className="px-3 pb-3">Product</th>
                <th className="px-3 pb-3">Price</th>
                <th className="px-3 pb-3">Status</th>
                <th className="pb-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {paginatedItems.map((order) => (
                <tr key={order.id} className="text-admin-ink hover:bg-admin-subtle">
                  <td className="py-3 pr-3 font-medium">{order.id}</td>
                  <td className="px-3 py-3">{order.productName}</td>
                  <td className="px-3 py-3">{formatCurrency(order.totalPrice)}</td>
                  <td className="px-3 py-3">
                    <select
                      className="rounded-full border border-admin-border bg-white px-2 py-1 text-xs"
                      value={order.status}
                      onChange={(event) => onUpdateStatus(order.id, event.target.value as Order['status'])}
                      disabled={isUpdatingStatus}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => onDelete(order.id)} disabled={isDeleting}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-sm text-admin-muted">
              No orders match the current filters.
            </div>
          ) : null}
        </div>
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </AdminTableCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownCard title="Revenue by Category" items={stats.categoryBreakdown} />
        <BreakdownCard title="Revenue by Payment Method" items={stats.paymentBreakdown} />
      </div>
    </div>
  )
}

function RevenueMetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="border border-admin-border bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-accent">{label}</p>
      <h4 className="mt-2 font-admin text-2xl text-admin-ink">{value}</h4>
      <p className="mt-1 text-xs text-admin-muted">{hint}</p>
    </Card>
  )
}

function BreakdownCard({ title, items }: { title: string; items: RevenueBreakdownItem[] }) {
  return (
    <Card className="border border-admin-border bg-white p-5 shadow-sm">
      <h4 className="mb-3 font-admin text-lg text-admin-ink">{title}</h4>
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.name} className="flex justify-between gap-3 text-sm">
              <span className="text-admin-muted">{item.name}</span>
              <span className="font-semibold text-admin-ink">{formatCurrency(item.value)}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-admin-muted">No completed revenue yet.</p>
        )}
      </div>
    </Card>
  )
}
