import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { BlogPost } from '@/core/entities'

function formatDate(value: string | null) {
  if (!value) return 'Draft'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-app-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/blog/${post.slug}`} className="block">
        <div className="aspect-[16/10] bg-app-subtle">
          {post.coverImageUrl ? (
            <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-app-muted">
              Blog
            </div>
          )}
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-app-muted">
            <span>{post.category ?? 'Beauty Tech'}</span>
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          <h2 className="line-clamp-2 font-ui text-xl font-semibold leading-snug text-app-ink">
            {post.title}
          </h2>
          {post.excerpt ? (
            <p className="line-clamp-2 text-sm leading-6 text-app-muted">{post.excerpt}</p>
          ) : null}
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-app-accent">
            Read article
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </article>
  )
}
