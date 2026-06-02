import type { AdminProductRecord } from '@/services/supabase/database-service'

interface Props {
  mobile?: boolean
  products: AdminProductRecord[]
  appliedProducts: string[]
  onToggle: (id: string) => void
}

export default function BeautyProductGrid({
  mobile = false,
  products,
  appliedProducts,
  onToggle,
}: Props) {
  if (products.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed p-8 text-center text-sm text-neutral-500">
        No products available for this category.
      </div>
    )
  }

  if (mobile) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4 p-4">
        {products.map((product) => {
          const active =
            appliedProducts.includes(
              product.id,
            )

          return (
            <article
              key={product.id}
              className="flex items-center gap-3 border-b pb-4"
            >
              <img
                src={product.image_url ?? ''}
                alt={product.name}
                className="h-20 w-20 rounded-lg border object-contain"
              />

              <div className="flex-1">
                <h3 className="font-bold">
                  {product.brand}
                </h3>

                <p className="text-sm text-neutral-500">
                  {product.name}
                </p>
              </div>

              <button
                onClick={() =>
                  onToggle(product.id)
                }
                className={`rounded-full px-5 py-2 text-sm font-medium ${
                  active
                    ? 'bg-black text-white'
                    : 'border'
                }`}
              >
                {active
                  ? 'Applied'
                  : 'Apply'}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}

  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => {
          const active =
            appliedProducts.includes(
              product.id,
            )

          return (
            <article
              key={product.id}
              className="group rounded-2xl border bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="overflow-hidden rounded-xl bg-neutral-50">
                <img
                  src={product.image_url ?? ''}
                  alt={product.name}
                  className="aspect-square w-full object-contain p-4"
                />
              </div>

              <div className="mt-4">
                <h3 className="text-center text-sm font-bold uppercase">
                  {product.brand}
                </h3>

                <p className="mt-2 text-center text-sm text-neutral-600">
                  {product.name}
                </p>
              </div>

              <button
                onClick={() =>
                  onToggle(product.id)
                }
                className={`mt-5 w-full rounded-xl py-3 ${
                  active
                    ? 'bg-black text-white'
                    : 'border'
                }`}
              >
                {active
                  ? 'Applied'
                  : 'Try On'}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
