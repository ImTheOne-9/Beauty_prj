import type { AdminCategoryRecord } from '@/services/supabase/database-service'

interface Props {
  active: string
  categories: AdminCategoryRecord[]
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
    <div className="flex gap-6 overflow-x-auto border-b">
      {categories.map((category, index) => (
        <button
          key={category.id || `category-${index}`}
          onClick={() =>
            onChange(category.id)
          }
          className={`whitespace-nowrap pb-4 ${
            active === category.id
              ? 'border-b-2 border-black font-semibold'
              : 'text-neutral-500'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
