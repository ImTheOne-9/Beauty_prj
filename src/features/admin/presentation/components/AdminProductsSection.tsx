import { ChevronLeft, ChevronRight, ExternalLink, PencilLine, Search, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import type { AdminProductRecord, AdminProductVariantRecord } from '@/application/dtos/admin'
import { ProductWithConfigModal } from './Productwithconfigmodal'

type AdminProductCategory = {
  id: string
  name: string
  api_category_key: string
}

type AdminProductsSectionProps = {
  products: AdminProductRecord[]
  filteredCount: number
  categories: AdminProductCategory[]
  search: string
  categoryFilter: string
  page: number
  totalPages: number
  isDeleting: boolean
  modalOpen: boolean
  configOnly: boolean
  editingProduct: AdminProductRecord | null
  existingConfigs: AdminProductVariantRecord[]
  onSearchChange: (value: string) => void
  onCategoryFilterChange: (value: string) => void
  onPageChange: (page: number) => void
  onAdd: () => void
  onEdit: (product: AdminProductRecord) => void
  onDelete: (product: AdminProductRecord) => void
  onModalClose: () => void
  onSaved: () => void
}

const PRODUCT_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=200&q=80'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN')
}

export function AdminProductsSection({
  products,
  filteredCount,
  categories,
  search,
  categoryFilter,
  page,
  totalPages,
  isDeleting,
  modalOpen,
  configOnly,
  editingProduct,
  existingConfigs,
  onSearchChange,
  onCategoryFilterChange,
  onPageChange,
  onAdd,
  onEdit,
  onDelete,
  onModalClose,
  onSaved,
}: AdminProductsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-admin-border bg-white p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-admin-muted" />
          <input
            type="text"
            className="w-full rounded-full border border-admin-border py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent/20"
            placeholder="Search products by name or brand..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <select
          className="rounded-full border border-admin-border px-3 py-2 text-sm text-admin-ink focus:outline-none"
          value={categoryFilter}
          onChange={(event) => onCategoryFilterChange(event.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        <Button onClick={onAdd}>+ Add Product</Button>
      </div>

      <Card className="overflow-x-auto border border-admin-border bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-admin-accent">Product List</p>
          <h2 className="mt-1 text-2xl font-bold text-admin-ink">Manage Products</h2>
          <p className="mt-2 text-sm text-admin-muted">
            {filteredCount} product(s) - image preview, full description, IDs, and partner links.
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-admin-border font-bold uppercase tracking-wider text-admin-ink">
                <th className="w-[72px] pb-3 pr-3">Image</th>
                <th className="min-w-[200px] px-3 pb-3">Product</th>
                <th className="px-3 pb-3">Brand</th>
                <th className="px-3 pb-3">Category</th>
                <th className="min-w-[180px] px-3 pb-3">Links</th>
                <th className="whitespace-nowrap px-3 pb-3">Created</th>
                <th className="pb-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {products.map((product) => {
                const categoryName = categories.find((category) => category.id === product.category_id)?.name ?? 'Unknown'
                const imageUrl = product.image_url?.trim()
                const imageSrc = imageUrl || PRODUCT_PLACEHOLDER_IMAGE

                return (
                  <tr key={product.id} className="align-top text-admin-ink hover:bg-admin-subtle">
                    <td className="py-3 pr-3">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        loading="lazy"
                        className="h-14 w-14 shrink-0 rounded-xl border border-admin-border bg-admin-subtle object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = PRODUCT_PLACEHOLDER_IMAGE
                        }}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="min-w-0 max-w-[280px]">
                        <p className="text-sm font-bold leading-tight text-admin-ink">{product.name}</p>
                        <p className="mt-1 break-all font-mono text-[10px] text-admin-muted">ID: {product.id}</p>
                        <p className="mt-1.5 whitespace-pre-wrap break-words text-[11px] leading-relaxed text-admin-muted">
                          {product.description?.trim() || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-admin-muted">{product.brand?.trim() || '-'}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-admin-accent">{categoryName}</p>
                      <p className="mt-0.5 break-all font-mono text-[10px] text-admin-muted">{product.category_id}</p>
                    </td>
                    <td className="px-3 py-3 text-admin-muted">
                      <div className="min-w-0 max-w-[220px] space-y-2">
                        {imageUrl ? (
                          <a
                            href={imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-start gap-1 break-all text-[10px] text-admin-accent hover:underline"
                          >
                            <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" /> Image URL
                          </a>
                        ) : (
                          <span className="text-[10px]">No image URL</span>
                        )}
                        {product.external_url?.trim() ? (
                          <a
                            href={product.external_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-start gap-1 break-all text-[10px] text-admin-accent hover:underline"
                          >
                            <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" /> Partner URL
                          </a>
                        ) : (
                          <span className="text-[10px]">No partner URL</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-admin-muted">{formatDate(product.created_at)}</td>
                    <td className="py-3 pl-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => onEdit(product)}>
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDelete(product)} disabled={isDeleting}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {products.length === 0 ? (
            <div className="py-12 text-center text-sm text-admin-muted">
              No products match the search or category filter.
            </div>
          ) : null}
        </div>

        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-4 border-t border-admin-border pt-4">
            <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Prev
            </Button>
            <span className="text-xs font-semibold text-admin-ink">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </Card>

      <ProductWithConfigModal
        configOnly={configOnly}
        open={modalOpen}
        onClose={onModalClose}
        categories={categories}
        initial={editingProduct}
        existingConfigs={existingConfigs}
        onSaved={onSaved}
      />
    </div>
  )
}
