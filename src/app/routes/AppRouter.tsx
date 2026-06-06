import { lazy, Suspense } from 'react'
import { createBrowserRouter, isRouteErrorResponse, RouterProvider, useRouteError } from 'react-router-dom'
import { Loader } from '@/shared/components/ui/Loader'
import { AppLayout } from '@/shared/components/layout/AppLayout'
import { ProtectedRoute } from '@/features/auth/presentation/components/ProtectedRoute'
import PlanPage from '@/features/plans/presentation/pages/PlanPage'
import AiNailColorPage from '@/features/ai-nail-color/presentation/pages/AiNailColorPage'
import BeautyTryOnPage from '@/features/beauty-try-on/presentation/pages/BeautyTryOnPage'

const LandingPage = lazy(() => import('@/features/landing/presentation/pages/LandingPage'))
const VirtualMakeupTryOnPage = lazy(() => import('@/features/virtual-makeup-tryon/presentation/pages/VirtualMakeupTryOnPage'))
const AIScanPage = lazy(() => import('@/features/ai-scan/presentation/pages/AIScanPage'))
const RecommendationsPage = lazy(() => import('@/features/recommendations/presentation/pages/RecommendationsPage'))
const ProductsPage = lazy(() => import('@/features/products/presentation/pages/ProductsPage'))
const BlogListPage = lazy(() => import('@/features/blog/presentation/pages/BlogListPage'))
const BlogDetailPage = lazy(() => import('@/features/blog/presentation/pages/BlogDetailPage'))
const AuthPage = lazy(() => import('@/features/auth/presentation/pages/AuthPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/presentation/pages/DashboardPage'))
const AdminPage = lazy(() => import('@/features/admin/presentation/pages/AdminPage'))
const CheckoutPage = lazy(() => import('@/features/checkout/presentation/pages/CheckoutPage'))
const ProfilePage = lazy(() => import('@/features/profile/presentation/pages/ProfilePage'))
const VerifyEmailPage = lazy(() => import('@/features/auth/presentation/pages/VerifyEmailPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/presentation/pages/ResetPasswordPage'))
const AgileHandPage = lazy(() => import('@/features/agile-hand/presentation/pages/AgileHandPage'))
const MakeupArPage = lazy(() => import('@/features/makeup-ar/presentation/pages/MakeupArPage'))

function RouteErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'The page could not be loaded.'

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--ui-surface)] px-6 text-center text-[var(--ui-ink)]">
      <div className="max-w-lg rounded-2xl border border-[var(--ui-border)] bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ui-accent)]">Route error</p>
        <h1 className="mt-3 text-2xl font-semibold">This page could not load</h1>
        <p className="mt-3 break-words text-sm leading-6 text-[var(--ui-muted)]">{message}</p>
        <button
          type="button"
          className="mt-6 rounded-full bg-[var(--ui-ink)] px-5 py-2 text-sm font-semibold text-white"
          onClick={() => window.location.assign('/')}
        >
          Back home
        </button>
      </div>
    </main>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/virtual-makeup-try-on', element: <VirtualMakeupTryOnPage /> },
      { path: '/beauty-try-on', element: <BeautyTryOnPage /> },
      { path: '/ai-nail-color', element: <AiNailColorPage /> },
      { path: '/agile-hand', element: <AgileHandPage /> },
      { path: '/makeup-ar', element: <MakeupArPage /> },
      { path: '/scan', element: <AIScanPage /> },
      { path: '/recommendations', element: <RecommendationsPage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/blog', element: <BlogListPage /> },
      { path: '/blog/:slug', element: <BlogDetailPage /> },
      { path: '/plans', element: <PlanPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/auth', element: <AuthPage /> },
      { path: '/auth/verify', element: <VerifyEmailPage /> },
      { path: '/auth/reset-password', element: <ResetPasswordPage /> },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
])

export function AppRouter() {
  return (
    <Suspense fallback={<Loader fullScreen label="Loading your AI beauty suite" />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
