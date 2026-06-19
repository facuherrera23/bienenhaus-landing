import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center px-5 bg-bg">
            <div className="text-center max-w-md">
              <span className="font-display text-6xl text-accent/30 block mb-4">!</span>
              <h1 className="font-display text-2xl uppercase text-white mb-4">
                Algo salió mal
              </h1>
              <p className="font-desc text-sm text-text-secondary mb-8">
                Hubo un error inesperado. Recargá la página para intentar de nuevo.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-accent text-black font-elegant font-semibold text-sm py-3 px-6 rounded-md hover:bg-accent-dark transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
