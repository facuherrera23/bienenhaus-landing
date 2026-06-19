import { useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from '../components/ui/Footer'

export function Layout() {
  const mainRef = useRef<HTMLElement>(null)

  return (
    <div className="min-h-screen bg-bg text-white antialiased flex flex-col">
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-accent focus:text-black focus:px-4 focus:py-2 focus:rounded-md focus:font-elegant focus:text-sm focus:font-semibold"
        onClick={(e) => {
          e.preventDefault()
          mainRef.current?.focus()
        }}
      >
        Saltar al contenido principal
      </a>

      <Header />
      <main
        ref={mainRef}
        id="main-content"
        className="flex-1 pt-[72px] focus:outline-none"
        tabIndex={-1}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
