import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Loader } from '@/shared/components/ui/Loader'
import { BlogSidebar } from '../components/BlogSidebar'
import { useBlogPost } from '../hooks/useBlogPost'
import { useBlogPosts } from '../hooks/useBlogPosts'

function formatDate(value: string | null) {
  if (!value) return 'Unpublished'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function renderContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (block.startsWith('## ')) {
        return <h2 key={index} className="mt-8 border-b border-app-border pb-2 font-ui text-2xl font-semibold text-app-ink">{block.replace(/^## /, '')}</h2>
      }
      if (block.startsWith('# ')) {
        return <h2 key={index} className="mt-8 font-ui text-2xl font-semibold text-app-ink">{block.replace(/^# /, '')}</h2>
      }
      return <p key={index} className="text-sm leading-7 text-app-ink">{block}</p>
    })
}

export default function BlogDetailPage() {
  const { slug } = useParams()
  const { data: post, isLoading, error } = useBlogPost(slug)
  const { data: posts = [] } = useBlogPosts()

  if (isLoading) return <Loader fullScreen label="Loading article" />

  if (!post) {
    return (
      <section className="app-shell section-shell min-h-screen bg-app-subtle pb-16 pt-4">
        <div className="mx-auto max-w-3xl rounded-lg border border-app-border bg-white p-8 text-center shadow-sm">
          <h1 className="font-ui text-2xl font-semibold text-app-ink">Article not found</h1>
          <p className="mt-2 text-sm text-app-muted">{error ? (error as Error).message : 'This blog post does not exist or is not published.'}</p>
          <Link to="/blog" className="app-primary mt-6 inline-flex px-5 py-2 text-sm font-semibold">Back to blog</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="app-shell section-shell min-h-screen bg-app-subtle pb-16 pt-4">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-lg border border-app-border bg-white p-6 shadow-sm md:p-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-app-accent">
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-app-accent">{post.category ?? 'Beauty Tech'}</p>
            <h1 className="mt-3 max-w-4xl font-ui text-3xl font-semibold leading-tight text-app-ink md:text-5xl">{post.title}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-app-muted">
              <span>{post.authorName ?? 'Beauty Team'}</span>
              <span>/</span>
              <span>{formatDate(post.publishedAt)}</span>
            </div>
          </div>

          {post.coverImageUrl ? (
            <img src={post.coverImageUrl} alt={post.title} className="mt-8 aspect-[16/8] w-full rounded-lg object-cover" />
          ) : null}

          {post.excerpt ? (
            <p className="mt-8 border-l-4 border-app-accent bg-app-subtle p-4 text-base leading-7 text-app-ink">
              {post.excerpt}
            </p>
          ) : null}

          <div className="prose-none mt-8 space-y-5">{renderContent(post.content)}</div>

          {post.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-app-border bg-app-subtle px-3 py-1 text-xs font-semibold text-app-muted">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </article>

        <BlogSidebar posts={posts.filter((item) => item.id !== post.id)} />
      </div>
    </section>
  )
}
