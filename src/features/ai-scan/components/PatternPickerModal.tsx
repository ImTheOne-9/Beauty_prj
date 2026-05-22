import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import type { PatternCatalogItem } from '@/features/ai-scan/lib/makeup-patterns'
import { getPatternTabGroups } from '@/features/ai-scan/lib/makeup-patterns'
import { cn } from '@/shared/lib/cn'

type PatternPickerModalProps = {
  open: boolean
  title?: string
  catalog: PatternCatalogItem[]
  isLoading: boolean
  selectedLabel?: string
  onClose: () => void
  onChoose: (pattern: PatternCatalogItem) => void
}

export function PatternPickerModal({
  open,
  title = 'Choose a pattern',
  catalog,
  isLoading,
  selectedLabel,
  onClose,
  onChoose,
}: PatternPickerModalProps) {
  const [search, setSearch] = useState('')
  const [pendingLabel, setPendingLabel] = useState(selectedLabel)
  const tabGroups = useMemo(() => getPatternTabGroups(catalog), [catalog])
  const [activeTab, setActiveTab] = useState(tabGroups[0]?.name ?? '')

  useEffect(() => {
    if (!tabGroups.length) return
    if (!tabGroups.some((tab) => tab.name === activeTab)) {
      setActiveTab(tabGroups[0].name)
    }
  }, [activeTab, tabGroups])

  useEffect(() => {
    if (open) setPendingLabel(selectedLabel)
  }, [open, selectedLabel])

  const filteredItems = useMemo(() => {
    const group = tabGroups.find((tab) => tab.name === activeTab)?.items ?? catalog
    const query = search.trim().toLowerCase()
    if (!query) return group
    return group.filter((item) => item.label.toLowerCase().includes(query))
  }, [activeTab, catalog, search, tabGroups])

  if (!open) return null

  const pending = catalog.find((item) => item.label === pendingLabel)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-rose-100 px-4 py-3">
          <h3 className="shrink-0 text-lg font-semibold text-rose-950">{title}</h3>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
            <Input
              className="h-9 pl-9"
              placeholder="Search..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-mist hover:bg-rose-50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-rose-100 px-4">
          {tabGroups.map((tab) => (
            <button
              key={tab.name}
              type="button"
              onClick={() => setActiveTab(tab.name)}
              className={cn(
                'relative shrink-0 px-3 py-2 text-sm font-semibold whitespace-nowrap',
                activeTab === tab.name ? 'text-cyan-700' : 'text-rose-900 hover:text-cyan-600',
              )}
            >
              {tab.name}
              {activeTab === tab.name ? (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-cyan-600" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <p className="py-12 text-center text-sm text-mist">Loading patterns...</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {filteredItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setPendingLabel(item.label)}
                  className={cn(
                    'rounded-lg border p-1 transition',
                    pendingLabel === item.label ? 'border-cyan-500 ring-2 ring-cyan/30' : 'border-rose-100 hover:border-rose-300',
                  )}
                >
                  <img src={item.thumbnail} alt={item.label} className="aspect-square w-full rounded object-cover" />
                  <p className="mt-1 truncate text-center text-[10px] text-rose-800">{item.label}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-rose-100 px-4 py-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!pending}
            onClick={() => {
              if (pending) onChoose(pending)
            }}
          >
            Choose
          </Button>
        </div>
      </div>
    </div>
  )
}
