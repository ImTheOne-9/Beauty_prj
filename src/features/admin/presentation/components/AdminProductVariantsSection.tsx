import { PencilLine, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import type { AdminProductRecord, AdminProductVariantRecord } from '@/application/dtos/admin'
import { AdminSectionTitle } from './AdminSectionTitle'

type AdminProductVariantsSectionProps = {
  variants: AdminProductVariantRecord[]
  products: AdminProductRecord[]
  isDeleting: boolean
  onEdit: (product: AdminProductRecord) => void
  onDelete: (variant: AdminProductVariantRecord) => void
}

export function AdminProductVariantsSection({
  variants,
  products,
  isDeleting,
  onEdit,
  onDelete,
}: AdminProductVariantsSectionProps) {
  const productLookup = new Map(products.map((product) => [product.id, product]))

  return (
    <div className="space-y-4">
      <Card className="border border-admin-border bg-white p-6 shadow-sm">
        <AdminSectionTitle
          eyebrow="Config List"
          title="All Product Variants"
          description={`${variants.length} variant(s) - one row per shade or texture.`}
        />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-admin-border font-bold uppercase tracking-wider text-admin-ink">
                <th className="pb-3 pr-3">Product</th>
                <th className="px-3 pb-3">Variant</th>
                <th className="px-3 pb-3">Color</th>
                <th className="min-w-[180px] px-3 pb-3">Texture</th>
                <th className="pb-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {variants.map((variant) => {
                const product = productLookup.get(variant.product_id)

                return (
                  <tr key={variant.id} className="align-top text-admin-ink hover:bg-admin-subtle">
                    <td className="py-3 pr-3 font-medium">{product?.name ?? 'Unknown'}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full border border-admin-border bg-admin-subtle px-2 py-0.5 text-[11px] font-medium capitalize text-admin-accent">
                        {variant.name || 'Default shade'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {variant.color_hex ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="h-4 w-4 shrink-0 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: variant.color_hex }}
                          />
                          <span className="font-mono text-[11px] uppercase text-admin-muted">
                            {variant.color_hex}
                          </span>
                        </div>
                      ) : (
                        <span className="text-admin-muted">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {variant.texture ? (
                        <span className="font-mono text-[11px] capitalize text-admin-muted">{variant.texture}</span>
                      ) : (
                        <span className="text-admin-muted">-</span>
                      )}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (product) {
                              onEdit(product)
                            }
                          }}
                          disabled={!product}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDelete(variant)} disabled={isDeleting}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {variants.length === 0 ? (
            <div className="py-12 text-center text-sm text-admin-muted">
              No variants yet. Add variants from the Products tab.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
