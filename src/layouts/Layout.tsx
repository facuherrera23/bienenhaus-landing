import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from '../components/ui/Footer'

export function Layout() {
  return (
    <div className="min-h-screen bg-bg text-white antialiased flex flex-col">
      <Header />
      <main className="flex-1 pt-[72px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
