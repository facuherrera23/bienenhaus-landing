import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '../layouts/Layout'
import { HomePage, SalesPage, RentalsPage, NotFoundPage } from '../pages'

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

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={BASENAME}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/venta" element={<SalesPage />} />
            <Route path="/alquiler" element={<RentalsPage />} />
            <Route path="/venta/:id" element={<div>Property detail (venta) - coming soon</div>} />
            <Route path="/alquiler/:id" element={<div>Property detail (alquiler) - coming soon</div>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
