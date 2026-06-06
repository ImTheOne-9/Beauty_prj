import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Loader } from '@/shared/components/ui/Loader'
import { BlogCard } from '../components/BlogCard'
import { BlogSidebar } from '../components/BlogSidebar'
import { useBlogPosts } from '../hooks/useBlogPosts'

export default function BlogListPage() {
  const { data: posts = [], isLoading, error } = useBlogPosts()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(posts.map((post) => post.category).filter(Boolean))) as string[]]
  }, [posts])

  const filteredPosts = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return posts.filter((post) => {
      const matchesSearch =
        !normalized ||
        post.title.toLowerCase().includes(normalized) ||
        (post.excerpt?.toLowerCase().includes(normalized) ?? false)
      const matchesCategory = category === 'All' || post.category === category
      return matchesSearch && matchesCategory
    })
  }, [category, posts, search])

  if (isLoading) return <Loader fullScreen label="Loading blog posts" />

  return (
    <section className="app-shell section-shell min-h-screen bg-app-subtle pb-16 pt-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-lg border border-app-border bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-app-accent">Blog</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-ui text-3xl font-semibold text-app-ink md:text-4xl">Beauty tech insights</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-app-muted">
                Product updates, AI beauty workflows, and practical guides for virtual try-on experiences.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-app-muted" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search articles"
                  className="app-input w-full min-w-[240px] pl-9"
                />
              </div>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="app-input">
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {(error as Error).message}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-5 md:grid-cols-2">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
            {filteredPosts.length === 0 ? (
              <div className="rounded-lg border border-app-border bg-white p-8 text-sm text-app-muted">
                No blog posts found.
              </div>
            ) : null}
          </div>
          <BlogSidebar posts={posts} />
        </div>
      </div>
    </section>
  )
}
