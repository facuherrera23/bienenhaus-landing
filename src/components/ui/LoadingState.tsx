import type { ReactNode } from 'react'

interface LoadingStateProps {
  loading: boolean
  error?: string | null
  children: ReactNode
  loader?: ReactNode
}

export function LoadingState({ loading, error, children, loader }: LoadingStateProps) {
  if (loading) {
    return <>{loader || <div className="flex items-center justify-center py-20"><span className="text-text-muted">Cargando...</span></div>}</>
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-error font-desc text-sm">{error}</span>
      </div>
    )
  }

  return <>{children}</>
}
