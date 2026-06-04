type AdminSectionTitleProps = {
  eyebrow: string
  title: string
  description: string
}

export function AdminSectionTitle({ eyebrow, title, description }: AdminSectionTitleProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
      <h2 className="mt-2 font-admin text-3xl font-semibold text-admin-ink">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}
