import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { BackToTop } from './BackToTop'
import { WhatsAppFloat } from './WhatsAppFloat'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg text-white font-body flex flex-col">
      <Header />
      <main className="flex-1 pt-[72px]">{children}</main>
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
    </div>
  )
}
