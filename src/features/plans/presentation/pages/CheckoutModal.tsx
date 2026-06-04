import { useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/features/auth/presentation/hooks/useAuth'
import { useDependencies } from '@/app/providers/DependencyProvider'
import type { Plan } from '../hooks/usePlans'

interface Props {
  plan: Plan
  onClose: () => void
  onSuccess: () => void
}

type Step = 'confirm' | 'processing' | 'error'

export function CheckoutModal({ plan, onClose, onSuccess }: Props) {
  const { user } = useAuth()
  const { useCases } = useDependencies()
  const [step, setStep] = useState<Step>('confirm')
  const [error, setError] = useState<string | null>(null)

  const handleFreePlan = async () => {
    setStep('processing')
    try {
      await useCases.plans.subscribeToFreePlan(user!.id, plan.id)
      onSuccess()
    } catch {
      setError('Co loi xay ra. Vui long thu lai.')
      setStep('error')
    }
  }
  const handleStripePlan = async () => {
    setStep('processing')
    setError(null)

    try {
      window.location.href = await useCases.plans.createStripeCheckout(plan.id)
    } catch (err) {
      setError((err as Error).message || 'Co loi xay ra. Vui long thu lai.')
      setStep('error')
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        {/* Xác nhận */}
        {step === 'confirm' && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Xác nhận đăng ký
            </p>
            <h2 className="mt-2 font-ui text-2xl text-slate-900">{plan.name}</h2>
            <p className="mt-1 text-3xl font-semibold text-slate-900">
              {plan.price === 0 ? (
                'Miễn phí'
              ) : (
                <>
                  ${plan.price.toFixed(2)}
                  <span className="text-sm font-normal text-slate-500">/tháng</span>
                </>
              )}
            </p>

            <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex gap-3">
              <Button
                className="flex-1 !rounded-full !bg-slate-100 !text-slate-700"
                onClick={onClose}
              >
                Hủy
              </Button>
              <Button
                className="flex-1 !rounded-full !bg-app-accent !text-white hover:!bg-app-accent-hover"
                onClick={plan.price === 0 ? handleFreePlan : handleStripePlan}
              >
                {plan.price === 0 ? 'Dùng miễn phí' : `Thanh toán $${plan.price.toFixed(2)}`}
              </Button>
            </div>
          </>
        )}

        {/* Đang xử lý */}
        {step === 'processing' && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-rose-500" />
            <p className="mt-4 text-sm text-slate-600">
              {plan.price === 0 ? 'Đang xử lý...' : 'Đang chuyển sang trang thanh toán...'}
            </p>
          </div>
        )}

        {/* Lỗi */}
        {step === 'error' && (
          <div className="text-center">
            <p className="text-sm text-red-500">{error}</p>
            <Button
              className="mt-4 !rounded-full !bg-slate-900 !text-white"
              onClick={() => setStep('confirm')}
            >
              Thử lại
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}
