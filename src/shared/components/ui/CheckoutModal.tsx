import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  Wallet,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Modal } from '@/shared/components/ui/Modal'
import { type ProductRecommendation } from '@/shared/lib/types'
import { databaseService } from '@/services/supabase/database-service'

type CheckoutModalProps = {
  open: boolean
  onClose: () => void
  product: ProductRecommendation
}

const paymentMethods = [
  { id: 'cod', name: 'COD (Cash)', icon: Truck },
  { id: 'momo', name: 'MoMo Wallet', icon: Wallet },
  { id: 'visa', name: 'Visa/Mastercard', icon: CreditCard },
  { id: 'apple', name: 'Apple Pay', icon: ShoppingBag },
] as const

type PaymentMethod = (typeof paymentMethods)[number]['id']

export function CheckoutModal({ open, onClose, product }: CheckoutModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
  })
  const [phase, setPhase] = useState<'form' | 'processing' | 'success'>('form')
  const [orderId, setOrderId] = useState('')

  const hasImage = Boolean(product.image?.trim())

  const price = (() => {
    const num = product.id.replace(/\D/g, '')
    const base = num ? parseInt(num) : product.name.charCodeAt(0) || 1
    return (base % 4) * 100000 + 390000
  })()

  const formattedPrice = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

  useEffect(() => {
    if (phase !== 'success') return

    const rand = Math.floor(100000 + Math.random() * 900000)
    const newOrderId = `BG-${rand}`
    setOrderId(newOrderId)

    databaseService.createOrder({
      id: newOrderId,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      productCategory: product.category,
      quantity,
      price,
      totalPrice: price * quantity,
      paymentMethod,
      shippingInfo,
      status: 'completed',
      createdAt: new Date().toISOString(),
    })
  }, [paymentMethod, phase, price, product.category, product.id, product.image, product.name, quantity, shippingInfo])

  useEffect(() => {
    if (open) return

    const timer = window.setTimeout(() => {
      setQuantity(1)
      setPaymentMethod('cod')
      setShippingInfo({ name: '', phone: '', address: '' })
      setPhase('form')
    }, 300)

    return () => window.clearTimeout(timer)
  }, [open])

  const handleInputChange = (field: keyof typeof shippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid =
    shippingInfo.name.trim() !== '' &&
    shippingInfo.phone.trim() !== '' &&
    shippingInfo.address.trim() !== ''

  const handleConfirmOrder = (event: React.FormEvent) => {
    event.preventDefault()
    if (!isFormValid) return

    setPhase('processing')
    window.setTimeout(() => setPhase('success'), 1800)
  }

  return (
    <Modal open={open} title="Quick Checkout" onClose={onClose}>
      <AnimatePresence mode="wait">
        {phase === 'form' ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleConfirmOrder}
            className="space-y-6 pt-1 text-[var(--ui-ink)]"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-subtle)] p-4 shadow-sm">
              <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-xl bg-[var(--ui-accent)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
                <Sparkles className="h-3 w-3" />
                AI Pick
              </div>
              <div className="flex gap-4">
                {hasImage ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-20 w-20 rounded-xl border border-[var(--ui-border)] object-cover shadow-inner shadow-black/5"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[10px] font-semibold uppercase tracking-wider text-[var(--ui-muted)]">
                    No image
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col justify-center pr-16">
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-[var(--ui-accent)]">
                    {product.category}
                  </span>
                  <h4 className="mt-0.5 truncate font-ui text-base font-extrabold text-[var(--ui-ink)]">{product.name}</h4>
                  <p className="mt-1 text-sm font-extrabold text-[var(--ui-accent)]">{formattedPrice(price)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-4 shadow-sm">
              <div>
                <p className="text-sm font-extrabold text-[var(--ui-ink)]">Quantity</p>
                <p className="text-xs text-[var(--ui-muted)]">Select product quantity</p>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-subtle)] p-1">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-accent)] transition hover:bg-[var(--ui-accent)]/10"
                >
                  <Minus className="h-4 w-4" />
                </motion.button>
                <span className="w-8 text-center font-ui text-base font-extrabold text-[var(--ui-ink)]">{quantity}</span>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-accent)] transition hover:bg-[var(--ui-accent)]/10"
                >
                  <Plus className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            <div className="space-y-3.5">
              <p className="flex items-center gap-1.5 text-sm font-extrabold text-[var(--ui-ink)]">
                <Truck className="h-4 w-4 text-[var(--ui-accent)]" />
                Shipping Information
              </p>

              {[
                { field: 'name', icon: User, placeholder: 'Your full name', type: 'text' },
                { field: 'phone', icon: Phone, placeholder: 'Phone number', type: 'tel' },
                { field: 'address', icon: MapPin, placeholder: 'Shipping address (House number, Street, City)', type: 'text' },
              ].map((item) => {
                const Icon = item.icon
                const field = item.field as keyof typeof shippingInfo
                return (
                  <div key={item.field} className="relative">
                    <span className="absolute left-4 top-3.5 text-[var(--ui-accent)]/75">
                      <Icon className="h-4 w-4" />
                    </span>
                    <Input
                      type={item.type}
                      placeholder={item.placeholder}
                      value={shippingInfo[field]}
                      onChange={(event) => handleInputChange(field, event.target.value)}
                      className="pl-11"
                      required
                    />
                  </div>
                )
              })}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-extrabold text-[var(--ui-ink)]">Payment Method</p>
              <div className="grid grid-cols-2 gap-2.5">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const active = paymentMethod === method.id
                  return (
                    <motion.button
                      key={method.id}
                      type="button"
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`relative flex items-center gap-3 overflow-hidden rounded-xl border p-3.5 text-left transition-all duration-300 ${
                        active
                          ? 'border-[var(--ui-accent)] bg-[var(--ui-accent)]/10 font-bold text-[var(--ui-accent)] shadow-sm'
                          : 'border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-ink)] hover:bg-[var(--ui-subtle)]'
                      }`}
                    >
                      {active ? (
                        <div className="absolute right-0 top-0 flex h-3 w-3 items-center justify-center rounded-bl-md bg-[var(--ui-accent)]">
                          <Check className="h-2 w-2 text-white stroke-[3px]" />
                        </div>
                      ) : null}
                      <Icon className={`h-5 w-5 ${active ? 'text-[var(--ui-accent)]' : 'text-[var(--ui-muted)]'}`} />
                      <span className="text-xs tracking-wide">{method.name}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <div className="border-t border-[var(--ui-border)] pt-4">
              <div className="mb-4 flex items-center justify-between px-1">
                <span className="text-sm font-extrabold uppercase tracking-wider text-[var(--ui-muted)]">Total Payment:</span>
                <span className="font-ui text-2xl font-black tracking-wide text-[var(--ui-accent)]">
                  {formattedPrice(price * quantity)}
                </span>
              </div>
              <motion.button
                type="submit"
                whileHover={isFormValid ? { scale: 1.01, filter: 'brightness(1.05)' } : {}}
                whileTap={isFormValid ? { scale: 0.99 } : {}}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-extrabold uppercase tracking-widest text-white shadow-lg transition-all duration-300 ${
                  isFormValid
                    ? 'bg-[var(--ui-accent)] shadow-[0_10px_30px_rgba(15,23,42,0.12)] hover:bg-[var(--ui-accent-hover)]'
                    : 'cursor-not-allowed bg-[var(--ui-muted)] opacity-45 shadow-none'
                }`}
                disabled={!isFormValid}
              >
                Confirm Order
              </motion.button>
            </div>
          </motion.form>
        ) : null}

        {phase === 'processing' ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-5 py-16 text-center"
          >
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--ui-border)] bg-[var(--ui-subtle)] shadow-inner">
                <Loader2 className="h-10 w-10 animate-spin text-[var(--ui-accent)]" />
              </div>
              <div className="absolute -inset-2 -z-10 rounded-full bg-[var(--ui-accent)]/10 blur-xl" />
            </div>
            <div className="max-w-sm space-y-1.5">
              <h4 className="font-ui text-xl font-black text-[var(--ui-ink)]">Connecting to payment gateway</h4>
              <p className="px-4 text-xs leading-relaxed text-[var(--ui-muted)]">
                System is encrypting transaction and creating secure order. Please do not close the browser...
              </p>
            </div>
          </motion.div>
        ) : null}

        {phase === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center space-y-6 py-6 text-center"
          >
            <motion.div
              className="flex h-24 w-24 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-500 shadow-xl shadow-emerald-500/20"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.12, 1] }}
              transition={{ duration: 0.6, type: 'spring' }}
            >
              <Check className="h-12 w-12 text-white stroke-[3.5px]" />
            </motion.div>

            <div className="max-w-sm space-y-1.5">
              <h4 className="font-ui text-2xl font-black tracking-wide text-emerald-600">Order Placed Successfully!</h4>
              <p className="px-2 text-xs leading-relaxed text-[var(--ui-muted)]">
                Thank you for choosing skincare with Beauty AI. Your order has been approved and is being prepared for shipping.
              </p>
            </div>

            <div className="relative w-full space-y-3.5 overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-subtle)] p-5 text-left text-xs text-[var(--ui-ink)] shadow-sm">
              <div className="flex justify-between border-b border-[var(--ui-border)] pb-2.5">
                <span className="font-extrabold uppercase tracking-wider text-[var(--ui-muted)]">Order ID:</span>
                <span className="font-mono text-sm font-black tracking-wider text-[var(--ui-accent)]">{orderId}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between gap-4">
                  <span className="font-semibold text-[var(--ui-muted)]">Product:</span>
                  <span className="max-w-[200px] truncate text-right font-extrabold text-[var(--ui-ink)]">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[var(--ui-muted)]">Quantity:</span>
                  <span className="font-extrabold text-[var(--ui-ink)]">{quantity} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[var(--ui-muted)]">Method:</span>
                  <span className="font-extrabold uppercase text-[var(--ui-ink)]">
                    {paymentMethod === 'cod' ? 'COD (Cash)' : paymentMethod}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--ui-border)] pt-3.5 font-semibold">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--ui-ink)]">Total Amount:</span>
                <span className="font-ui text-lg font-black tracking-wide text-[var(--ui-accent)]">
                  {formattedPrice(price * quantity)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[10px] text-emerald-700 shadow-inner">
                <Truck className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="font-medium">Your items are being transferred to the shipping carrier. Expected delivery in 2-3 business days.</span>
              </div>
            </div>

            <Button onClick={onClose} className="mt-2 w-full justify-center py-3 font-extrabold tracking-widest">
              Close and Continue
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Modal>
  )
}
