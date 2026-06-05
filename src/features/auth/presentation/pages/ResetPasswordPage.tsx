import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDependencies } from '@/app/providers/DependencyProvider'
import { Card } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { LockKeyhole } from 'lucide-react'
export default function ResetPasswordPage() {
  const { useCases } = useDependencies()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const navigate = useNavigate()
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsPending(true)
    setError(null)
    try {
      await useCases.auth.updatePassword(password)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setIsPending(false)
    }
  }
  return (
    <section className="section-shell pb-12">
      <Card className="mx-auto max-w-md space-y-6 p-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-app-accent/10 p-4">
            <LockKeyhole className="h-8 w-8 text-app-accent" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h1 className="font-ui text-2xl text-app-ink">Set New Password</h1>
          <p className="text-sm text-sand/80">
            Please enter your new password below.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </Card>
    </section>
  )
}
