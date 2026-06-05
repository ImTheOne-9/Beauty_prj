import { Search, Trash2, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { AdminPagination } from './AdminPagination'
import { AdminTableCard } from './AdminTableCard'
import { AdminToolbar } from './AdminToolbar'

type AdminCategoryRecord = {
  id: string
  name: string
  api_category_key: string
  created_at: string
}

export type AdminCategoryFormState = {
  id: string
  name: string
  apiCategoryKey: string
}

type AdminCategoriesSectionProps = {
  categories: AdminCategoryRecord[]
  filteredCount: number
  search: string
  page: number
  totalPages: number
  modalOpen: boolean
  form: AdminCategoryFormState
  isDeleting: boolean
  isSaving: boolean
  saveError?: string
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  onAdd: () => void
  onEdit: (category: AdminCategoryRecord) => void
  onDelete: (category: AdminCategoryRecord) => void
  onModalClose: () => void
  onFormChange: (form: AdminCategoryFormState) => void
  onSave: () => Promise<void>
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN')
}

export function AdminCategoriesSection({
  categories,
  filteredCount,
  search,
  page,
  totalPages,
  modalOpen,
  form,
  isDeleting,
  isSaving,
  saveError,
  onSearchChange,
  onPageChange,
  onAdd,
  onEdit,
  onDelete,
  onModalClose,
  onFormChange,
  onSave,
}: AdminCategoriesSectionProps) {
  return (
    <div className="space-y-4">
      <AdminToolbar>
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-admin-muted" />
          <input
            type="text"
            className="w-full rounded-full border border-admin-border py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-admin-accent/20"
            placeholder="Search by name or API key..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <Button onClick={onAdd}>+ Add Category</Button>
      </AdminToolbar>

      <AdminTableCard>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-admin-accent">Category List</p>
          <h2 className="mt-1 text-2xl font-bold text-admin-ink">Manage Categories</h2>
          <p className="mt-2 text-sm text-admin-muted">
            {filteredCount} categor{filteredCount === 1 ? 'y' : 'ies'} found.
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-admin-border font-bold uppercase tracking-wider text-admin-ink">
                <th className="pb-3 pr-3">Category Name</th>
                <th className="px-3 pb-3">API Key</th>
                <th className="px-3 pb-3">Created At</th>
                <th className="pb-3 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {categories.map((category) => (
                <tr key={category.id} className="text-admin-ink hover:bg-admin-subtle">
                  <td className="py-3 pr-3 font-medium">{category.name}</td>
                  <td className="px-3 py-3 text-admin-muted">{category.api_category_key}</td>
                  <td className="px-3 py-3 text-admin-muted">{formatDate(category.created_at)}</td>
                  <td className="py-3 pl-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(category)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete(category)} disabled={isDeleting}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {categories.length === 0 ? (
            <p className="mt-4 py-4 text-center text-sm text-admin-muted">
              No categories available. Click "Add Category" to get started.
            </p>
          ) : null}
        </div>

        <AdminPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </AdminTableCard>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onModalClose()
            }
          }}
        >
          <div className="relative w-full max-w-md space-y-4 rounded-[2rem] border border-admin-border bg-white p-6 shadow-xl">
            <button
              onClick={onModalClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-admin-muted transition hover:bg-admin-subtle"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="font-admin text-xl text-admin-ink">
              {form.id ? 'Edit Category' : 'Add New Category'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-admin-ink">
                  Category Name
                </label>
                <Input
                  placeholder="e.g. Lipstick"
                  value={form.name}
                  onChange={(event) => onFormChange({ ...form, name: event.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-admin-ink">
                  API Category Key
                </label>
                <Input
                  placeholder="e.g. lip_color"
                  value={form.apiCategoryKey}
                  onChange={(event) => onFormChange({ ...form, apiCategoryKey: event.target.value })}
                />
              </div>

              {saveError ? <p className="text-sm text-admin-accent">{saveError}</p> : null}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={onModalClose}>
                  Cancel
                </Button>
                <Button onClick={onSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : form.id ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
