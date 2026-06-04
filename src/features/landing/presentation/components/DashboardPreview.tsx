import { motion } from 'framer-motion'

export default function DashboardPreview() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <motion.div
        className="rounded-[1.5rem] border border-brand-blush bg-brand-surface/80 p-4 shadow-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-brand text-lg font-semibold text-brand-ink">AI Insights</h4>
          <span className="rounded-full border border-brand-blush bg-brand-paper px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-accent">
            Demo
          </span>
        </div>
        <div className="mt-4 rounded-2xl bg-brand-paper p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-brand-accent">Skin Score</p>
              <p className="mt-1 text-4xl font-black text-brand-ink">86</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.3em] text-brand-accent">Match</p>
              <p className="mt-1 text-lg font-semibold text-brand-deep">98%</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {[
              ['Hydration', 82],
              ['Acne', 63],
              ['Tone', 74],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div className="mb-1 flex items-center justify-between text-xs text-brand-muted">
                  <span>{label as string}</span>
                  <span>{value as number}%</span>
                </div>
                <div className="h-2 rounded-full bg-brand-blush">
                  <div className="h-2 rounded-full bg-brand-accent" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="rounded-[1.5rem] border border-brand-blush bg-brand-surface/80 p-4 shadow-sm"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-brand text-lg font-semibold text-brand-ink">Routine Builder</h4>
          <span className="rounded-full border border-brand-blush bg-brand-paper px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-accent">
            Daily
          </span>
        </div>
        <div className="mt-4 space-y-3 rounded-2xl bg-brand-paper p-4">
          {[
            ['AM', 'Cleanser - Serum - SPF'],
            ['PM', 'Cleanser - Retinol - Moisturizer'],
            ['Weekly', 'Mask - Exfoliant - Recovery'],
          ].map(([slot, routine]) => (
            <div key={slot as string} className="flex items-center justify-between rounded-2xl border border-brand-blush bg-brand-surface/90 px-3 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-accent">{slot as string}</p>
                <p className="mt-1 text-sm font-medium text-brand-deep">{routine as string}</p>
              </div>
              <div className="h-2.5 w-2.5 rounded-full bg-brand-accent shadow-[0_0_0_6px_rgba(190,67,93,0.12)]" />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="rounded-[1.5rem] border border-brand-blush bg-brand-surface/80 p-4 shadow-sm"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-brand text-lg font-semibold text-brand-ink">Trends</h4>
          <span className="rounded-full border border-brand-blush bg-brand-paper px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-accent">
            30 days
          </span>
        </div>
        <div className="mt-4 rounded-2xl bg-brand-paper p-4">
          <div className="flex h-36 items-end gap-2">
            {[30, 48, 42, 66, 58, 72, 86].map((bar, index) => (
              <div key={index} className="flex-1 rounded-t-2xl bg-brand-accent" style={{ height: `${bar}%` }} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-brand-blush bg-brand-surface/90 p-3">
              <p className="text-[10px] uppercase tracking-[0.28em] text-brand-accent">Routine adherence</p>
              <p className="mt-1 text-xl font-bold text-brand-ink">92%</p>
            </div>
            <div className="rounded-2xl border border-brand-blush bg-brand-surface/90 p-3">
              <p className="text-[10px] uppercase tracking-[0.28em] text-brand-accent">Visible glow</p>
              <p className="mt-1 text-xl font-bold text-brand-ink">+18%</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
