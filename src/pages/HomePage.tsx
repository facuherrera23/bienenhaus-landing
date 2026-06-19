import { usePageTitle } from '../hooks/usePageTitle'
import { HeroSection } from '../components/hero'
import { InfiniteCarousel } from '../components/carousel'
import { PremiumSearch } from '../components/search'
import { CuratedCatalog } from '../components/catalog'
import { AboutSection } from '../components/about'
import { AgentsSection } from '../components/agents'
import { TestimonialsSection } from '../components/testimonials'
import { PhilosophySection } from '../components/philosophy'
import { ContactSection } from '../components/contact'

export function HomePage() {
  usePageTitle('Inicio')
  return (
    <>
      <HeroSection />
      <InfiniteCarousel />
      <PremiumSearch />
      <CuratedCatalog />
      <AboutSection />
      <AgentsSection />
      <TestimonialsSection />
      <PhilosophySection />
      <ContactSection />
    </>
  )
}
