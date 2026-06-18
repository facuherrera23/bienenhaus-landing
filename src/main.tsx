import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

const base = import.meta.env.BASE_URL || '/bienenhaus-landing/'

function RedirectHandler({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  React.useEffect(() => {
    const redirect = sessionStorage.getItem('redirect')
    if (redirect) {
      sessionStorage.removeItem('redirect')
      const path = redirect.replace(new RegExp(`^${base}`), '/')
      navigate(path, { replace: true })
    }
  }, [navigate, base])

  return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={base}>
        <RedirectHandler>
          <App />
        </RedirectHandler>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
