/**
 * ProductWithConfigModal.tsx
 *
 * Create:     Step 1 (product info) → Step 2 (color + texture)
 * Edit:       Step 1 → Step 2 (full edit)
 * ConfigOnly: Step 2 only (from AI Configs tab)
 */

import { useState, useEffect, useMemo } from 'react'
import { X, ChevronRight, ChevronLeft, Package, Sparkles, Check } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { supabase } from '@/services/supabase/client'
import { cn } from '@/shared/lib/cn'

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = { id: string; name: string; api_category_key: string }

type ExistingConfig = {
  id: string; product_id: string; category_id: string
  primary_color: string | null; texture: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  blush: 'Blush', bronzer: 'Bronzer', concealer: 'Concealer', contour: 'Contour',
  eye_liner: 'Eye Liner', eye_shadow: 'Eye Shadow', eyebrows: 'Eyebrows', eyelashes: 'Eyelashes/Mascara',
  foundation: 'Foundation', highlighter: 'Highlight', lip_color: 'Lip Color',
  lip_liner: 'Lip Liner', skin_smooth: 'Skin Smooth',
}

const TEXTURES_BY_CATEGORY: Record<string, string[]> = {
  blush: ['matte', 'satin', 'shimmer'],
  eye_liner: ['matte', 'shimmer', 'metallic'],
  eye_shadow: ['matte', 'shimmer', 'metallic'],
  eyebrows: ['matte', 'shimmer'],
  lip_color: ['matte', 'gloss', 'holographic', 'metallic', 'satin', 'sheer', 'shimmer'],
  lip_liner: ['matte', 'satin'],
  bronzer: [], contour: [], eyelashes: [], foundation: [], concealer: [], highlighter: [], skin_smooth: [],
}

const DEFAULT_COLOR = '#FF8BA7'
const DEFAULT_TEXTURE = 'matte'

// ─── StepIndicator ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {[{ n: 1, label: 'Product Info', icon: Package }, { n: 2, label: 'Effect Config', icon: Sparkles }].map(({ n, label, icon: Icon }, i) => (
        <div key={n} className="flex items-center gap-2">
          {i > 0 && <div className={cn('h-px w-8 transition-colors', step > 1 ? 'bg-rose-300' : 'bg-rose-100')} />}
          <div className={cn('flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
            step === n ? 'bg-rose-600 text-white shadow-sm' : step > n ? 'bg-rose-100 text-rose-600' : 'bg-rose-50 text-mist')}>
            {step > n ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function ProductWithConfigModal({ open, onClose, categories, initial, existingConfigs = [], configOnly = false, onSaved }: {
  open: boolean
  onClose: () => void
  categories: Category[]
  initial?: { id: string; name: string; description?: string | null; image_url?: string | null; external_url?: string | null; category_id: string; brand?: string | null } | null
  existingConfigs?: ExistingConfig[]
  /** When true: skip product info, only show color + texture editor */
  configOnly?: boolean
  onSaved: () => void
}) {
  const isEdit = !!initial?.id
  const [step, setStep] = useState<1 | 2>(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    id: '', name: '', description: '', imageUrl: '', externalUrl: '', categoryId: '', brand: ''
  })

  const [color, setColor] = useState(DEFAULT_COLOR)
  const [texture, setTexture] = useState(DEFAULT_TEXTURE)

  const selectedApiKey = useMemo(() =>
    categories.find(c => c.id === form.categoryId)?.api_category_key ?? '',
    [categories, form.categoryId]
  )

  const textures = TEXTURES_BY_CATEGORY[selectedApiKey] ?? []

  useEffect(() => {
    if (!open) return
    setError(null)
    // configOnly → always start at step 2
    setStep(configOnly ? 2 : 1)

    if (initial) {
      setForm({
        id: initial.id, name: initial.name,
        description: initial.description ?? '',
        imageUrl: initial.image_url ?? '',
        externalUrl: initial.external_url ?? '',
        categoryId: initial.category_id,
        brand: initial.brand ?? '',
      })
      const cfg = existingConfigs[0]
      setColor(cfg?.primary_color ?? DEFAULT_COLOR)
      setTexture(cfg?.texture ?? DEFAULT_TEXTURE)
    } else {
      setForm({ id: '', name: '', description: '', imageUrl: '', externalUrl: '', categoryId: '', brand: '' })
      setColor(DEFAULT_COLOR)
      setTexture(DEFAULT_TEXTURE)
    }
  }, [open, initial, configOnly])

  if (!open) return null

  const inputCls = 'w-full rounded-2xl border border-rose-200/80 bg-white/85 px-4 py-3 text-sm text-pearl placeholder:text-mist/60 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/25'

  async function handleSave() {
    setError(null); setSaving(true)
    try {
      let productId = form.id
      const productPayload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        image_url: form.imageUrl.trim() || null,
        external_url: form.externalUrl.trim() || null,
        brand: form.brand.trim() || null,
        category_id: form.categoryId,
      }
      if (!productPayload.name) throw new Error('Please enter a product name.')
      if (!productPayload.category_id) throw new Error('Please select a category.')

      // configOnly: only update product_configs, skip products table
      if (!configOnly) {
        if (isEdit) {
          const { error: e } = await supabase.from('products').update(productPayload).eq('id', productId)
          if (e) throw e
        } else {
          const { data, error: e } = await supabase.from('products').insert(productPayload).select('id').single()
          if (e) throw e
          productId = data.id
        }
      }

      const { error: delErr } = await supabase.from('product_configs').delete().eq('product_id', productId)
      if (delErr) throw delErr

      const { error: insErr } = await supabase.from('product_configs').insert({
        product_id: productId,
        category_id: form.categoryId,
        primary_color: color,
        texture: textures.length > 0 ? texture : null,
      } as any)
      if (insErr) throw insErr

      onSaved(); onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-[2rem] border border-rose-100 bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-rose-50 shrink-0">
          <button onClick={onClose} className="absolute right-5 top-5 rounded-full p-1.5 text-mist hover:bg-rose-50 hover:text-rose-600 transition">
            <X className="h-4 w-4" />
          </button>
          <h2 className="font-display text-2xl text-rose-950 pr-8">
            {configOnly ? 'Edit Effect Config' : isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="mt-1 text-xs text-mist">
            {configOnly
              ? `Editing color and texture for "${initial?.name}".`
              : isEdit
                ? 'Update product details and effect config.'
                : 'Fill in product details and choose a color.'}
          </p>
          {/* Step indicator only for create/full edit */}
          {!configOnly && <div className="mt-4"><StepIndicator step={step} /></div>}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Step 1 — Product Info (not shown in configOnly mode) */}
          {!configOnly && step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1.5">
                  Product Name <span className="text-rose-400">*</span>
                </label>
                <Input placeholder="e.g. MAC Matte Lipstick Ruby Woo" value={form.name}
                  onChange={e => setForm(s => ({ ...s, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1.5">Brand</label>
                  <Input placeholder="e.g. MAC Cosmetics" value={form.brand}
                    onChange={e => setForm(s => ({ ...s, brand: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1.5">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select className={inputCls} value={form.categoryId}
                    onChange={e => setForm(s => ({ ...s, categoryId: e.target.value }))}>
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1.5">Description</label>
                <textarea className={cn(inputCls, 'min-h-[80px] resize-none')} placeholder="Product description..."
                  value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1.5">Image URL</label>
                <Input placeholder="https://..." value={form.imageUrl}
                  onChange={e => setForm(s => ({ ...s, imageUrl: e.target.value }))} />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview"
                    className="mt-2 h-16 w-16 rounded-xl border border-rose-100 object-cover"
                    onError={e => { e.currentTarget.style.display = 'none' }} />
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1.5">
                  Partner URL <span className="text-mist font-normal normal-case">(optional)</span>
                </label>
                <Input placeholder="https://..." value={form.externalUrl}
                  onChange={e => setForm(s => ({ ...s, externalUrl: e.target.value }))} />
              </div>
            </div>
          )}

          {/* Step 2 — Effect Config */}
          {(configOnly || step === 2) && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-rose-50/60 border border-rose-100 px-4 py-3 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <span className="text-xs text-mist">
                  Category:{' '}
                  <span className="font-semibold text-rose-700 capitalize">
                    {CATEGORY_LABELS[selectedApiKey] ?? selectedApiKey.replace(/_/g, ' ') ?? '—'}
                  </span>
                </span>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-mist/70 tracking-wider block mb-1.5">Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={color} onChange={e => setColor(e.target.value)}
                      className="h-9 w-9 rounded-xl border border-rose-100 cursor-pointer p-0.5 bg-white" />
                    <input type="text" value={color.toUpperCase()} onChange={e => setColor(e.target.value)}
                      className="flex-1 rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-mono text-rose-950 focus:outline-none focus:ring-1 focus:ring-rose-300 uppercase"
                      maxLength={7} />
                  </div>
                </div>

                {textures.length > 0 && (
                  <div>
                    <label className="text-[10px] uppercase font-bold text-mist/70 tracking-wider block mb-1.5">Texture</label>
                    <div className="flex flex-wrap gap-1.5">
                      {textures.map(t => (
                        <button key={t} type="button" onClick={() => setTexture(t)}
                          className={cn('rounded-full px-3 py-1 text-[11px] font-medium border transition capitalize',
                            texture === t
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-mist border-rose-100 hover:border-rose-300 hover:text-rose-700')}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-rose-50 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-mist">
            {configOnly ? initial?.name ?? '' : `Step ${step} / 2`}
          </span>
          <div className="flex items-center gap-2">
            {!configOnly && step === 2 && (
              <Button variant="ghost" onClick={() => setStep(1)} disabled={saving}>
                <ChevronLeft className="h-4 w-4 mr-1" />Back
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
            {!configOnly && step === 1 ? (
              <Button onClick={() => {
                if (!form.name.trim()) { setError('Please enter a product name.'); return }
                if (!form.categoryId) { setError('Please select a category.'); return }
                setError(null); setStep(2)
              }}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}