import { AnimatePresence, motion } from 'framer-motion'
import { type PropsWithChildren } from 'react'
import { Button } from '@/shared/components/ui/Button'

type ModalProps = PropsWithChildren<{
  open: boolean
  title: string
  onClose: () => void
}>

export function Modal({ open, title, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 shadow-2xl scrollbar-thin scrollbar-thumb-[var(--ui-border)] scrollbar-track-transparent"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--ui-border) transparent'
            }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-ui text-2xl font-semibold text-[var(--ui-ink)]">{title}</h3>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
