import { Link } from 'react-router-dom';
import { Card } from '@/shared/components/ui/Card';
import { MailCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <section className="section-shell pb-12">
      <Card className="mx-auto max-w-md space-y-6 p-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-cyan/10 p-4">
            <MailCheck className="h-12 w-12 text-cyan" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-3xl text-pearl">Check your email</h1>
          <p className="text-sand/80">
            We've sent you a verification link. Please check your email and click the link to activate your account.
          </p>
        </div>
        <div className="pt-4">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-display text-sm font-semibold transition-transform duration-300 border border-rose-100 bg-white/60 text-rose-600 hover:border-rose-200 hover:bg-white/70 w-full"
          >
            Return to login
          </Link>
        </div>
      </Card>
    </section>
  );
}