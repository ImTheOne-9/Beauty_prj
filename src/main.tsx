import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function FatalStartupError({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'The application could not start.'

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-slate-950">
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Startup error</p>
        <h1 className="mt-3 text-2xl font-semibold">The app could not load</h1>
        <p className="mt-3 break-words text-sm leading-6 text-slate-600">{message}</p>
        <button
          type="button"
          className="mt-6 rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    </main>
  )
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root was not found.')
}

const root = createRoot(rootElement)

async function startApp() {
  try {
    const [{ AppProviders }, { App }] = await Promise.all([
      import('@/app/providers/AppProviders'),
      import('@/app/App'),
    ])

    root.render(
      <StrictMode>
        <AppProviders>
          <App />
        </AppProviders>
      </StrictMode>,
    )
  } catch (error) {
    console.error('Application startup failed:', error)
    root.render(<FatalStartupError error={error} />)
  }
}

void startApp()
