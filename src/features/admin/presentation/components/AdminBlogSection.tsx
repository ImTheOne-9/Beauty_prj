import { Edit3, Search, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { AdminSectionTitle } from './AdminSectionTitle'
import type { BlogPost } from '@/core/entities'
import type { BlogFormState } from '../hooks/useAdminBlog'

type AdminBlogSectionProps = {
  posts: BlogPost[]
  search: string
  statusFilter: 'all' | 'draft' | 'published'
  modalOpen: boolean
  form: BlogFormState
  isSaving: boolean
  isDeleting: boolean
  saveError?: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: 'all' | 'draft' | 'published') => void
  onAdd: () => void
  onEdit: (post: BlogPost) => void
  onDelete: (id: string) => void
  onModalClose: () => void
  onFormChange: (patch: Partial<BlogFormState>) => void
  onSave: () => Promise<unknown>
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AdminBlogSection({
  posts,
  search,
  statusFilter,
  modalOpen,
  form,
  isSaving,
  isDeleting,
  saveError,
  onSearchChange,
  onStatusFilterChange,
  onAdd,
  onEdit,
  onDelete,
  onModalClose,
  onFormChange,
  onSave,
}: AdminBlogSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-admin-border bg-white p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-admin-muted" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search title or slug"
            className="admin-input pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as 'all' | 'draft' | 'published')}
          className="admin-input w-auto min-w-[150px]"
        >
          <option value="all">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <Button className="admin-primary" onClick={onAdd}>New post</Button>
      </div>

      <Card className="border border-admin-border bg-white p-6 shadow-sm">
        <AdminSectionTitle
          eyebrow="Publishing"
          title="Blog Posts"
          description={`${posts.length} article(s) found.`}
        />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead>
              <tr className="border-b border-admin-border text-admin-ink font-bold uppercase tracking-wider">
                <th className="px-3 pb-3">Post</th>
                <th className="px-3 pb-3">Category</th>
                <th className="px-3 pb-3">Status</th>
                <th className="px-3 pb-3">Published</th>
                <th className="px-3 pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {posts.map((post) => (
                <tr key={post.id} className="align-middle text-admin-ink hover:bg-admin-subtle">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-20 overflow-hidden rounded-md bg-admin-subtle">
                        {post.coverImageUrl ? (
                          <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <p className="max-w-[360px] truncate font-semibold">{post.title}</p>
                        <p className="mt-1 font-mono text-[10px] text-admin-muted">/{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-admin-muted">{post.category ?? '-'}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${
                      post.status === 'published'
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                        : 'border-admin-border bg-admin-subtle text-admin-muted'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-admin-muted">{formatDate(post.publishedAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(post)}>
                        <Edit3 className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isDeleting}
                        onClick={() => {
                          if (confirm(`Delete "${post.title}"?`)) onDelete(post.id)
                        }}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {posts.length === 0 ? (
            <div className="py-12 text-center text-sm text-admin-muted">No blog posts found.</div>
          ) : null}
        </div>
      </Card>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) onModalClose()
          }}
        >
          <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-admin-border bg-white shadow-2xl">
            <div className="border-b border-admin-border px-6 py-5">
              <button className="admin-icon-button absolute right-4 top-4 p-2" onClick={onModalClose}>
                <X className="h-4 w-4" />
              </button>
              <h2 className="font-admin text-2xl font-semibold text-admin-ink">
                {form.id ? 'Edit blog post' : 'New blog post'}
              </h2>
              <p className="mt-1 text-xs text-admin-muted">Draft posts are hidden from public blog pages.</p>
            </div>

            <div className="grid gap-4 overflow-y-auto p-6 md:grid-cols-2">
              <label className="space-y-1">
                <span className="admin-label">Title</span>
                <input className="admin-input" value={form.title} onChange={(e) => onFormChange({ title: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span className="admin-label">Slug</span>
                <input className="admin-input font-mono text-xs" value={form.slug} onChange={(e) => onFormChange({ slug: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span className="admin-label">Category</span>
                <input className="admin-input" value={form.category} onChange={(e) => onFormChange({ category: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span className="admin-label">Author</span>
                <input className="admin-input" value={form.authorName} onChange={(e) => onFormChange({ authorName: e.target.value })} />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="admin-label">Cover image URL</span>
                <input className="admin-input" value={form.coverImageUrl} onChange={(e) => onFormChange({ coverImageUrl: e.target.value })} />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="admin-label">Excerpt</span>
                <textarea className="admin-input min-h-20" value={form.excerpt} onChange={(e) => onFormChange({ excerpt: e.target.value })} />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className="admin-label">Content</span>
                <textarea className="admin-input min-h-64 font-mono text-xs leading-6" value={form.content} onChange={(e) => onFormChange({ content: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span className="admin-label">Tags</span>
                <input className="admin-input" value={form.tags} onChange={(e) => onFormChange({ tags: e.target.value })} placeholder="AI, try-on, beauty" />
              </label>
              <label className="space-y-1">
                <span className="admin-label">Status</span>
                <select className="admin-input" value={form.status} onChange={(e) => onFormChange({ status: e.target.value as 'draft' | 'published' })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>

              {saveError ? <p className="md:col-span-2 text-sm text-red-600">{saveError}</p> : null}
            </div>

            <div className="flex justify-end gap-3 border-t border-admin-border px-6 py-4">
              <Button variant="ghost" className="admin-secondary" onClick={onModalClose} disabled={isSaving}>Cancel</Button>
              <Button className="admin-primary" onClick={() => void onSave()} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save post'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
