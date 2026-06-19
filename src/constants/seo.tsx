export const SEO = {
  title: 'Bienenhaus — Inmobiliaria Premium en Córdoba',
  description: 'Bienenhaus - Inmobiliaria premium en Córdoba. Compra, venta y alquiler de propiedades con asesoramiento profesional y tecnología de vanguardia.',
  url: 'https://facuherrera23.github.io/bienenhaus-landing',
  image: 'https://facuherrera23.github.io/bienenhaus-landing/og-image.jpg',
  siteName: 'Bienenhaus',
  locale: 'es_AR',
  type: 'website' as const,
  twitterHandle: '@bienenhaus',
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Bienenhaus',
  description: 'Inmobiliaria premium en Córdoba. Compra, venta y alquiler de propiedades.',
  url: 'https://facuherrera23.github.io/bienenhaus-landing',
  telephone: '+549351XXXXXXXX',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Córdoba',
    addressRegion: 'Córdoba',
    addressCountry: 'AR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -31.420083,
    longitude: -64.188776,
  },
  sameAs: [
    'https://www.instagram.com/bienenhaus',
    'https://www.facebook.com/bienenhaus',
  ],
  priceRange: '$$$',
  image: 'https://facuherrera23.github.io/bienenhaus-landing/og-image.jpg',
}

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationSchema),
      }}
    />
  )
}
