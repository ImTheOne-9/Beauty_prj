import { useEffect, useMemo, useState } from 'react'
import { RecommendationGrid } from '@/shared/components/ui/RecommendationGrid'
import { Loader } from '@/shared/components/ui/Loader'
import { useQuery } from '@tanstack/react-query'
import { useDependencies } from '@/app/providers/DependencyProvider'
import { type ProductRecommendation } from '@/core/entities'
import { parseProductTags } from '@/shared/lib/product-tags'
import { Button } from '@/shared/components/ui/Button'
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'

export default function ProductsPage() {
  const { useCases } = useDependencies()
  const { data, isLoading, error } = useQuery({
    queryKey: ['catalog', 'products'],
    queryFn: async () => useCases.products.listProducts(),
  })

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const itemsPerPage = 12

  const products: ProductRecommendation[] = useMemo(() => (data ?? []).map((product) => {
    const parsed = parseProductTags(product)
    return {
      ...parsed,
      externalLink: product.externalUrl ?? '',
      reason: `Catalog pick for ${product.brand ?? 'general skincare'}.`,
    }
  }), [data])

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b),
    )
  }, [products])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter
      const matchesSearch =
        !query ||
        [product.name, product.description, product.category, product.brand]
          .some((value) => String(value ?? '').toLowerCase().includes(query))

      return matchesCategory && matchesSearch
    })
  }, [categoryFilter, products, search])

  useEffect(() => {
    setPage(1)
  }, [categoryFilter, search])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))
  const paginated = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  if (isLoading) {
    return <Loader fullScreen label="Loading product catalog" />
  }

  if (error) {
    return (
      <section className="app-shell section-shell min-h-screen bg-app-subtle pb-12 pt-4">
        <div className="app-panel p-12 text-center text-sm text-app-muted">
          Cannot load product catalog. Please allow public read access for products, categories, and variants.
        </div>
      </section>
    )
  }

  return (
    <section className="app-shell section-shell min-h-screen space-y-6 bg-app-subtle pb-12 pt-4">
      <div className="app-panel p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="h-11 w-full rounded-lg border border-[var(--ui-border)] bg-white pl-10 pr-4 text-sm text-app-ink outline-none transition focus:border-[var(--ui-accent)]/45 focus:ring-2 focus:ring-[var(--ui-accent)]/10"
              />
            </div>
            <div className="relative min-w-0 sm:w-60">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted" />
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-[var(--ui-border)] bg-white pl-10 pr-4 text-sm font-medium text-app-ink outline-none transition focus:border-[var(--ui-accent)]/45 focus:ring-2 focus:ring-[var(--ui-accent)]/10"
              >
                <option value="All">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="shrink-0 text-sm font-medium text-app-muted">
            {filteredProducts.length} / {products.length} products
          </p>
        </div>
      </div>
      {products.length === 0 ? (
        <div className="app-panel p-12 text-center text-sm text-app-muted">
          No products in the catalog. Please add new products from the admin page.
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="app-panel p-12 text-center text-sm text-app-muted">
          No products match your search or filter.
        </div>
      ) : (
        <>
          <RecommendationGrid products={paginated} />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <Button className="app-secondary" variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="text-sm font-semibold text-app-ink">Page {page} of {totalPages}</span>
              <Button className="app-secondary" variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
