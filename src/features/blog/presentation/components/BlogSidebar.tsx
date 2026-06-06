import { Link } from 'react-router-dom'
import type { BlogPost } from '@/core/entities'

export function BlogSidebar({ posts }: { posts: BlogPost[] }) {
  return (
    <aside className="space-y-4">
      <div className="rounded-lg border border-app-border bg-white p-5 shadow-sm">
        <h2 className="font-ui text-sm font-bold uppercase tracking-[0.16em] text-app-ink">Popular</h2>
        <div className="mt-4 space-y-4">
          {posts.slice(0, 5).map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="grid grid-cols-[72px_1fr] gap-3">
              <div className="aspect-square overflow-hidden rounded-md bg-app-subtle">
                {post.coverImageUrl ? (
                  <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-app-accent">
                  {post.category ?? 'Blog'}
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-app-ink">{post.title}</p>
              </div>
            </Link>
          ))}
          {posts.length === 0 ? <p className="text-sm text-app-muted">No posts yet.</p> : null}
        </div>
      </div>
    </aside>
  )
}
