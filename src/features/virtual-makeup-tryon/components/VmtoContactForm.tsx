import { useState, type FormEvent } from 'react'
import { Reveal, SectionHeader } from './vmto-ui'
import { useToast } from '@/shared/hooks/useToast'

type FormState = {
  firstName: string
  lastName: string
  email: string
  company: string
  jobTitle: string
  phone: string
  solution: string
  message: string
  agree: boolean
}

const initialState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  jobTitle: '',
  phone: '',
  solution: 'Virtual Makeup Try-On',
  message: '',
  agree: false,
}

const solutions = [
  'Virtual Makeup Try-On',
  'AI Skin Analysis',
  'AR Hair Try-On',
  'Jewelry & Eyewear Try-On',
  'Custom Enterprise Solution',
]

const fieldClass =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
const labelClass = 'mb-1.5 block text-xs font-semibold text-gray-700'

export default function VmtoContactForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const { success, error } = useToast()

  const update =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
      setForm((f) => ({ ...f, [key]: value }))
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.firstName.trim()) next.firstName = 'Required'
    if (!form.lastName.trim()) next.lastName = 'Required'
    if (!form.email.trim()) next.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email'
    if (!form.company.trim()) next.company = 'Required'
    if (!form.agree) next.agree = 'Please accept the privacy policy'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      error('Please fix the highlighted fields and try again.', 'Incomplete form')
      return
    }
    success("Thanks for reaching out — our team will contact you within 1 business day.", 'Request received')
    setForm(initialState)
  }

  return (
    <section className="bg-gray-50 py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader
            eyebrow="Let's Talk"
            title="Elevate Your Business Strategy with Makeup Try-On"
            subtitle="Fill out the form below and our team will get in touch within 1 business day."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gray-100 bg-white p-6 shadow-card sm:p-10"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="firstName">First Name *</label>
                <input id="firstName" className={fieldClass} value={form.firstName} onChange={update('firstName')} />
                {errors.firstName && <p className="mt-1 text-xs text-rose-600">{errors.firstName}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="lastName">Last Name *</label>
                <input id="lastName" className={fieldClass} value={form.lastName} onChange={update('lastName')} />
                {errors.lastName && <p className="mt-1 text-xs text-rose-600">{errors.lastName}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="email">Business Email *</label>
                <input id="email" type="email" className={fieldClass} value={form.email} onChange={update('email')} />
                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="company">Company Name *</label>
                <input id="company" className={fieldClass} value={form.company} onChange={update('company')} />
                {errors.company && <p className="mt-1 text-xs text-rose-600">{errors.company}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="jobTitle">Job Title</label>
                <input id="jobTitle" className={fieldClass} value={form.jobTitle} onChange={update('jobTitle')} />
              </div>
              <div>
                <label className={labelClass} htmlFor="phone">Phone Number</label>
                <input id="phone" type="tel" className={fieldClass} value={form.phone} onChange={update('phone')} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="solution">Solution You're Looking For</label>
                <select id="solution" className={fieldClass} value={form.solution} onChange={update('solution')}>
                  {solutions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="message">How can we help?</label>
                <textarea
                  id="message"
                  rows={4}
                  className={`${fieldClass} resize-none`}
                  value={form.message}
                  onChange={update('message')}
                />
              </div>
            </div>

            <label className="mt-5 flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={update('agree')}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-400"
              />
              <span className="text-xs leading-relaxed text-gray-600">
                I agree to the processing of my personal data in accordance with the
                Privacy Policy and consent to be contacted about products and services.
              </span>
            </label>
            {errors.agree && <p className="mt-1 text-xs text-rose-600">{errors.agree}</p>}

            <button
              type="submit"
              className="mt-7 w-full rounded-md bg-rose-600 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-700 sm:w-auto"
            >
              Submit Request
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
