import type { Category } from '@/core/entities'

interface Props {
  active: string
  categories: Category[]
  onChange: (
    value: string,
  ) => void
}

export default function BeautyProductTabs({
  active,
  categories,
  onChange,
}: Props) {
  return (
    <div className="flex gap-6 overflow-x-auto">
      {categories.map((category, index) => (
        <button
          key={category.id || `category-${index}`}
          onClick={() =>
            onChange(category.id)
          }
          className={`whitespace-nowrap border-b-2 pb-3 text-sm transition-colors ${
            active === category.id
              ? 'border-studio-accent font-semibold text-studio-ink'
              : 'border-transparent text-studio-muted hover:text-studio-ink'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
