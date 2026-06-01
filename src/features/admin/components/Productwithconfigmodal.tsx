/**
 * ProductWithConfigModal.tsx
 *
 * Drop-in replacement cho product modal trong AdminPage.
 * Step 1 — thông tin product cơ bản
 * Step 2 — thêm effects (mỗi effect = 1 row trong product_configs với effect_data JSONB)
 *
 * Dùng đúng style rose/cyan đã có trong project.
 *
 * Usage:
 *   import { ProductWithConfigModal } from './ProductWithConfigModal'
 *
 *   <ProductWithConfigModal
 *     open={productModalOpen}
 *     onClose={() => setProductModalOpen(false)}
 *     categories={categoriesQuery.data ?? []}
 *     initial={editingProduct}          // null → create mode
 *     existingConfigs={existingConfigs} // product_configs rows của product này
 *     onSaved={() => {
 *       queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
 *       queryClient.invalidateQueries({ queryKey: ['admin', 'product-configs'] })
 *     }}
 *   />
 */

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, ChevronRight, ChevronLeft, Package, Sparkles, Check } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { supabase } from '@/services/supabase/client'
import { cn } from '@/shared/lib/cn'

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = {
  id: string
  name: string
  api_category_key: string
}

type ProductFormState = {
  id: string
  name: string
  description: string
  imageUrl: string
  externalUrl: string
  categoryId: string
  brand: string
}

// Một effect object — khớp 100% với MakeupAR API payload structure
type EffectEntry = {
  /** uuid client-side, chỉ dùng để React key */
  _key: string
  /** tên category API: blush, lip_color, eye_shadow, v.v. */
  effect_category: string
  /** hex của palette đầu tiên, dùng để hiển thị color swatch */
  primary_color: string
  /** toàn bộ effect object dưới dạng JSON string để edit trong textarea */
  effect_data_raw: string
}

type ExistingConfig = {
  id: string
  product_id: string
  effect_category: string
  primary_color: string | null
  effect_data: Record<string, unknown>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EFFECT_CATEGORIES = [
  'blush', 'bronzer', 'concealer', 'contour',
  'eye_liner', 'eye_shadow', 'eyebrows', 'eyelashes',
  'foundation', 'highlighter', 'lip_color', 'lip_liner', 'skin_smooth',
]

/** Template JSON cho từng category để admin có starting point */
const EFFECT_TEMPLATES: Record<string, object> = {
  blush: {
    category: 'blush',
    pattern: { name: '1color1' },
    palettes: [{ color: '#FF8BA7', texture: 'matte', colorIntensity: 50 }],
  },
  bronzer: {
    category: 'bronzer',
    pattern: { name: 'Bronzer1' },
    palettes: [{ color: '#9F7C50', colorIntensity: 50 }],
  },
  concealer: {
    category: 'concealer',
    palettes: [{ color: '#FBF5E9', colorIntensity: 50, colorUnderEyeIntensity: 50, coverageLevel: 50 }],
  },
  contour: {
    category: 'contour',
    pattern: { name: 'OvalFace6' },
    palettes: [{ color: '#9F7C50', colorIntensity: 50 }],
  },
  eye_liner: {
    category: 'eye_liner',
    pattern: { name: 'Arabic3' },
    palettes: [{ color: '#000000', texture: 'matte', colorIntensity: 50 }],
  },
  eye_shadow: {
    category: 'eye_shadow',
    pattern: { name: '1color1' },
    palettes: [{ color: '#AB7EF7', texture: 'matte', colorIntensity: 50 }],
  },
  eyebrows: {
    category: 'eyebrows',
    pattern: { type: 'shape', name: 'SoftArch1', curvature: 0, thickness: 0, definition: 50 },
    palettes: [{ color: '#3D2B1F', colorIntensity: 70, texture: 'matte' }],
  },
  eyelashes: {
    category: 'eyelashes',
    pattern: { name: 'Natural1' },
    palettes: [{ color: '#000000', colorIntensity: 60 }],
  },
  foundation: {
    category: 'foundation',
    palettes: [{ color: '#EAC595', colorIntensity: 50, coverageIntensity: 50, glowIntensity: 0 }],
  },
  highlighter: {
    category: 'highlighter',
    pattern: { name: 'OvalFace2' },
    palettes: [{ color: '#FFF7F8', colorIntensity: 50, glowIntensity: 50, shimmerIntensity: 50, shimmerDensity: 50, shimmerSize: 50 }],
  },
  lip_color: {
    category: 'lip_color',
    shape: { name: 'original' },
    style: { type: 'full' },
    morphology: { fullness: 0, wrinkless: 0 },
    palettes: [{ color: '#E11C43', texture: 'matte', colorIntensity: 70 }],
  },
  lip_liner: {
    category: 'lip_liner',
    pattern: { name: 'Natural1' },
    palettes: [{ color: '#C0392B', texture: 'matte', colorIntensity: 60, thickness: 40, smoothness: 60 }],
  },
  skin_smooth: {
    category: 'skin_smooth',
    skinSmoothStrength: 50,
    skinSmoothColorIntensity: 50,
  },
}

const emptyProductForm: ProductFormState = {
  id: '', name: '', description: '', imageUrl: '', externalUrl: '', categoryId: '', brand: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2)
}

function extractPrimaryColor(raw: string): string {
  try {
    const obj = JSON.parse(raw)
    if (obj.palettes?.[0]?.color) return obj.palettes[0].color
  } catch { /* ignore */ }
  return '#888888'
}

function isValidJson(s: string) {
  try { JSON.parse(s); return true } catch { return false }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {[
        { n: 1, label: 'Product Info', icon: Package },
        { n: 2, label: 'Effect Configs', icon: Sparkles },
      ].map(({ n, label, icon: Icon }, i) => (
        <div key={n} className="flex items-center gap-2">
          {i > 0 && <div className={cn('h-px w-8 transition-colors', step > 1 ? 'bg-rose-300' : 'bg-rose-100')} />}
          <div className={cn(
            'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
            step === n
              ? 'bg-rose-600 text-white shadow-sm'
              : step > n
                ? 'bg-rose-100 text-rose-600'
                : 'bg-rose-50 text-mist',
          )}>
            {step > n
              ? <Check className="h-3.5 w-3.5" />
              : <Icon className="h-3.5 w-3.5" />
            }
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

function EffectRow({
  entry,
  onChange,
  onRemove,
}: {
  entry: EffectEntry
  onChange: (updated: EffectEntry) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isJson = isValidJson(entry.effect_data_raw)
  const color = extractPrimaryColor(entry.effect_data_raw)

  return (
    <div className={cn(
      'rounded-2xl border transition-all',
      isJson ? 'border-rose-100' : 'border-rose-400',
    )}>
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Color swatch */}
        <span
          className="h-5 w-5 rounded-full border border-white shadow-sm shrink-0"
          style={{ backgroundColor: color }}
        />

        {/* Category select — stop propagation để click không toggle */}
        <select
          className="rounded-xl border border-rose-100 bg-white px-2 py-1 text-xs text-pearl focus:outline-none focus:ring-1 focus:ring-rose-300 capitalize"
          value={entry.effect_category}
          onClick={e => e.stopPropagation()}
          onChange={e => {
            const cat = e.target.value
            const template = EFFECT_TEMPLATES[cat] ?? { category: cat, palettes: [] }
            onChange({
              ...entry,
              effect_category: cat,
              effect_data_raw: JSON.stringify(template, null, 2),
              primary_color: extractPrimaryColor(JSON.stringify(template)),
            })
          }}
        >
          {EFFECT_CATEGORIES.map(c => (
            <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <span className="flex-1 text-[11px] text-mist truncate font-mono">
          {isJson ? '' : '⚠ invalid JSON'}
        </span>

        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            className="rounded-lg p-1.5 text-mist hover:text-rose-600 hover:bg-rose-50 transition"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="rounded-lg p-1.5 text-mist hover:text-rose-600 hover:bg-rose-50 transition">
            {expanded
              ? <ChevronLeft className="h-3.5 w-3.5 rotate-90" />
              : <ChevronRight className="h-3.5 w-3.5 rotate-90" />
            }
          </button>
        </div>
      </div>

      {/* Expanded JSON editor */}
      {expanded && (
        <div className="border-t border-rose-50 px-4 pb-4 pt-3">
          <p className="text-[10px] uppercase font-bold text-mist/60 mb-1.5 tracking-wider">Effect JSON</p>
          <textarea
            className={cn(
              'w-full font-mono text-[11px] leading-relaxed rounded-xl border bg-rose-50/30 px-3 py-2.5 focus:outline-none focus:ring-1 resize-none',
              isJson
                ? 'border-rose-100 focus:ring-rose-200 text-rose-950'
                : 'border-rose-400 focus:ring-rose-400 text-rose-700',
            )}
            rows={12}
            value={entry.effect_data_raw}
            onChange={e => onChange({
              ...entry,
              effect_data_raw: e.target.value,
              primary_color: extractPrimaryColor(e.target.value),
            })}
            spellCheck={false}
          />
          {!isJson && (
            <p className="mt-1.5 text-xs text-rose-500">JSON không hợp lệ — vui lòng kiểm tra lại cú pháp.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductWithConfigModal({
  open,
  onClose,
  categories,
  initial,
  existingConfigs = [],
  onSaved,
}: {
  open: boolean
  onClose: () => void
  categories: Category[]
  initial?: {
    id: string
    name: string
    description?: string | null
    image_url?: string | null
    external_url?: string | null
    category_id: string
    brand?: string | null
  } | null
  existingConfigs?: ExistingConfig[]
  onSaved: () => void
}) {
  const isEdit = !!initial?.id

  const [step, setStep] = useState<1 | 2>(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 state
  const [form, setForm] = useState<ProductFormState>(emptyProductForm)

  // Step 2 state
  const [effects, setEffects] = useState<EffectEntry[]>([])

  // Sync khi mở modal
  useEffect(() => {
    if (!open) return
    setStep(1)
    setError(null)

    if (initial) {
      setForm({
        id: initial.id,
        name: initial.name,
        description: initial.description ?? '',
        imageUrl: initial.image_url ?? '',
        externalUrl: initial.external_url ?? '',
        categoryId: initial.category_id,
        brand: initial.brand ?? '',
      })
      // Load existing configs thành EffectEntry
      setEffects(existingConfigs.map(c => ({
        _key: c.id, // dùng DB id làm key khi edit
        effect_category: c.effect_category,
        primary_color: c.primary_color ?? '#888888',
        effect_data_raw: JSON.stringify(c.effect_data, null, 2),
      })))
    } else {
      setForm(emptyProductForm)
      setEffects([])
    }
  }, [open, initial])

  if (!open) return null

  // ── Handlers ────────────────────────────────────────────────────────────────

  function addEffect(cat: string) {
    const template = EFFECT_TEMPLATES[cat] ?? { category: cat, palettes: [] }
    setEffects(prev => [...prev, {
      _key: uid(),
      effect_category: cat,
      primary_color: extractPrimaryColor(JSON.stringify(template)),
      effect_data_raw: JSON.stringify(template, null, 2),
    }])
  }

  function updateEffect(key: string, updated: EffectEntry) {
    setEffects(prev => prev.map(e => e._key === key ? updated : e))
  }

  function removeEffect(key: string) {
    setEffects(prev => prev.filter(e => e._key !== key))
  }

  async function handleSave() {
    setError(null)

    // Validate JSON
    const invalid = effects.find(e => !isValidJson(e.effect_data_raw))
    if (invalid) {
      setError(`Effect "${invalid.effect_category}" có JSON không hợp lệ.`)
      return
    }

    setSaving(true)
    try {
      let productId = form.id

      // 1. Upsert product
      const productPayload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        image_url: form.imageUrl.trim() || null,
        external_url: form.externalUrl.trim() || null,
        brand: form.brand.trim() || null,
        category_id: form.categoryId,
      }

      if (!productPayload.name) throw new Error('Vui lòng nhập tên sản phẩm.')
      if (!productPayload.category_id) throw new Error('Vui lòng chọn category.')

      if (isEdit) {
        const { error: e } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', productId)
        if (e) throw e
      } else {
        const { data, error: e } = await supabase
          .from('products')
          .insert(productPayload)
          .select('id')
          .single()
        if (e) throw e
        productId = data.id
      }

      // 2. Sync product_configs
      // Xóa tất cả config cũ → insert lại (đơn giản, đáng tin cậy)
      // Nếu product có nhiều configs, cách này an toàn hơn diff
      const { error: delErr } = await supabase
        .from('product_configs')
        .delete()
        .eq('product_id', productId)
      if (delErr) throw delErr

      if (effects.length > 0) {
        const configRows = effects.map(e => ({
          product_id: productId,
          effect_category: e.effect_category,
          primary_color: extractPrimaryColor(e.effect_data_raw),
          effect_data: JSON.parse(e.effect_data_raw),
        }))
        const { error: insErr } = await supabase
          .from('product_configs')
          .insert(configRows)
        if (insErr) throw insErr
      }

      onSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const inputCls = 'w-full rounded-2xl border border-rose-200/80 bg-white/85 px-4 py-3 text-sm text-pearl placeholder:text-mist/60 focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/25'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-[2rem] border border-rose-100 bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-rose-50 shrink-0">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-1.5 text-mist hover:bg-rose-50 hover:text-rose-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="font-display text-2xl text-rose-950 pr-8">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="mt-1 text-xs text-mist">
            {isEdit ? 'Cập nhật thông tin và effect configs của sản phẩm.' : 'Điền thông tin sản phẩm và cấu hình makeup effects.'}
          </p>
          <div className="mt-4">
            <StepIndicator step={step} />
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── STEP 1: Product Info ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1.5">
                  Product Name <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="VD: MAC Matte Lipstick Ruby Woo"
                  value={form.name}
                  onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1.5">Brand</label>
                  <Input
                    placeholder="VD: MAC Cosmetics"
                    value={form.brand}
                    onChange={e => setForm(s => ({ ...s, brand: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1.5">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    className={inputCls}
                    value={form.categoryId}
                    onChange={e => setForm(s => ({ ...s, categoryId: e.target.value }))}
                  >
                    <option value="">Chọn category...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1.5">Description</label>
                <textarea
                  className={cn(inputCls, 'min-h-[80px] resize-none')}
                  placeholder="Mô tả sản phẩm..."
                  value={form.description}
                  onChange={e => setForm(s => ({ ...s, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1.5">Image URL</label>
                <Input
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={e => setForm(s => ({ ...s, imageUrl: e.target.value }))}
                />
                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="preview"
                    className="mt-2 h-16 w-16 rounded-xl border border-rose-100 object-cover"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-rose-950 uppercase tracking-wide block mb-1.5">Partner URL (optional)</label>
                <Input
                  placeholder="https://shop.example.com/product"
                  value={form.externalUrl}
                  onChange={e => setForm(s => ({ ...s, externalUrl: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* ── STEP 2: Effect Configs ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-rose-50/50 border border-rose-100 px-4 py-3 text-xs text-mist leading-relaxed">
                Mỗi effect tương ứng 1 row trong <code className="font-mono bg-rose-100 px-1 rounded">product_configs</code>.
                Khi chạy scan, tất cả effects sẽ được gộp thành array gửi lên MakeupAR API.
              </div>

              {/* Effect list */}
              {effects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-rose-200 p-8 text-center text-sm text-mist">
                  Chưa có effect nào. Thêm ít nhất 1 effect để sản phẩm hoạt động với AI.
                </div>
              ) : (
                <div className="space-y-2">
                  {effects.map(e => (
                    <EffectRow
                      key={e._key}
                      entry={e}
                      onChange={updated => updateEffect(e._key, updated)}
                      onRemove={() => removeEffect(e._key)}
                    />
                  ))}
                </div>
              )}

              {/* Quick-add buttons */}
              <div>
                <p className="text-[10px] uppercase font-bold text-mist/60 tracking-wider mb-2">Thêm effect</p>
                <div className="flex flex-wrap gap-1.5">
                  {EFFECT_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => addEffect(cat)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[11px] font-medium transition capitalize',
                        effects.some(e => e.effect_category === cat)
                          ? 'border-rose-200 bg-rose-50 text-rose-600'
                          : 'border-rose-100 bg-white text-mist hover:border-rose-300 hover:text-rose-700',
                      )}
                    >
                      <Plus className="inline h-3 w-3 mr-0.5 -mt-0.5" />
                      {cat.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview payload */}
              {effects.length > 0 && (
                <details className="rounded-2xl border border-rose-100 overflow-hidden">
                  <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-rose-950 hover:bg-rose-50 transition select-none">
                    Preview API Payload ({effects.length} effect{effects.length !== 1 ? 's' : ''})
                  </summary>
                  <div className="border-t border-rose-50 bg-rose-50/30 px-4 py-3">
                    <pre className="text-[10px] font-mono text-rose-900 leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
                      {JSON.stringify(
                        {
                          version: '1.0',
                          effects: effects
                            .filter(e => isValidJson(e.effect_data_raw))
                            .map(e => JSON.parse(e.effect_data_raw)),
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-rose-50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-mist">
            {step === 1 ? 'Bước 1 / 2' : 'Bước 2 / 2'}
          </div>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <Button variant="ghost" onClick={() => setStep(1)} disabled={saving}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            {step === 1 ? (
              <Button
                onClick={() => {
                  if (!form.name.trim()) { setError('Vui lòng nhập tên sản phẩm.'); return }
                  if (!form.categoryId) { setError('Vui lòng chọn category.'); return }
                  setError(null)
                  setStep(2)
                }}
              >
                Tiếp theo <ChevronRight className="h-4 w-4 ml-1" />
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