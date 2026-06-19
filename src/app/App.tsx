import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '../layouts/Layout'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { JsonLd } from '../constants/seo'

const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })))
const SalesPage = lazy(() => import('../pages/SalesPage').then((m) => ({ default: m.SalesPage })))
const RentalsPage = lazy(() => import('../pages/RentalsPage').then((m) => ({ default: m.RentalsPage })))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
const PropertyDetailPage = lazy(() => import('../pages/PropertyDetailPage').then((m) => ({ default: m.PropertyDetailPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

const BASENAME = '/bienenhaus-landing'

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <span className="font-elegant text-xs text-text-muted">Cargando...</span>
      </div>
    </div>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={BASENAME}>
        <JsonLd />
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/venta" element={<SalesPage />} />
                <Route path="/alquiler" element={<RentalsPage />} />
                <Route path="/venta/:id" element={<PropertyDetailPage />} />
                <Route path="/alquiler/:id" element={<PropertyDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
