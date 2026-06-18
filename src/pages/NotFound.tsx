import { Link } from 'react-router-dom'
import { Container } from '../components/ui/Container'

export default function NotFound() {
  return (
    <div className="pt-32 pb-24">
      <Container>
        <div className="text-center max-w-md mx-auto">
          <p className="font-num text-6xl font-bold text-accent mb-4">404</p>
          <h1 className="font-display text-2xl uppercase tracking-tight mb-3">Página no encontrada</h1>
          <p className="font-desc text-sm text-text-secondary mb-8">
            La página que buscás no existe o fue movida.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-md font-elegant font-semibold transition-all duration-200 text-sm py-3 px-8 bg-accent text-black hover:bg-accent-dark"
          >
            Volver al inicio
          </Link>
        </div>
      </Container>
    </div>
  )
}
