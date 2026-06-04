import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AIScanner() {
  const [preview, setPreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setPreview(URL.createObjectURL(f))
  }

  const runScan = async () => {
    setScanning(true)
    await new Promise((r) => setTimeout(r, 2200))
    setScanning(false)
  }

  return (
    <div className="grid items-start gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-brand-blush bg-brand-surface/70 p-6 shadow-md backdrop-blur-md">
        <h3 className="font-brand text-2xl font-bold text-brand-ink">AI Skin Scanner</h3>
        <p className="mt-2 text-sm text-brand-muted">Upload a selfie to begin a cinematic scan. Our AI analyzes texture, hydration, and tone.</p>

        <div className="mt-4">
          <label className="inline-flex cursor-pointer items-center gap-3">
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
            <div className="rounded-lg bg-brand-accent px-4 py-2 font-semibold text-white">Upload Selfie</div>
          </label>
          <button onClick={runScan} disabled={!preview || scanning} className="ml-3 rounded-lg border border-brand-blush bg-brand-surface/90 px-4 py-2 font-semibold text-brand-ink disabled:opacity-50">{scanning ? 'Scanning...' : 'Run Scan'}</button>
        </div>

        <div className="mt-4">
          <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-xl bg-brand-paper">
            {preview ? <img src={preview} alt="preview" className="h-full w-full object-cover" /> : <div className="text-sm text-brand-muted">No image yet</div>}
            {scanning ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-gradient-to-t from-black/10" /> : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-blush bg-brand-surface/45 p-6 shadow-sm backdrop-blur-sm">
        <h4 className="font-semibold text-brand-ink">Live Scan Preview</h4>
        <div className="mt-3 flex h-40 items-center justify-center rounded-xl bg-brand-paper">
          <div className="text-sm text-brand-muted">AI processing animation will appear here.</div>
        </div>
      </div>
    </div>
  )
}
