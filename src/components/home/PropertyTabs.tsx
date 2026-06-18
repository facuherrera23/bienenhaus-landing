import { cn } from '../../lib/utils'

interface PropertyTabsProps {
  activeTab: 'venta' | 'alquiler'
  onTabChange: (tab: 'venta' | 'alquiler') => void
}

export function PropertyTabs({ activeTab, onTabChange }: PropertyTabsProps) {
  return (
    <div className="flex items-center justify-center gap-1 bg-surface-2 border border-border rounded-lg p-1 w-fit mx-auto">
      <button
        onClick={() => onTabChange('venta')}
        className={cn(
          'relative px-6 py-3 text-sm font-elegant font-semibold rounded-md transition-colors',
          activeTab === 'venta'
            ? 'text-white'
            : 'text-text-muted hover:text-text-secondary'
        )}
      >
        {activeTab === 'venta' && (
          <span className="absolute inset-0 bg-accent rounded-md" />
        )}
        <span className="relative z-10">Venta</span>
      </button>
      <button
        onClick={() => onTabChange('alquiler')}
        className={cn(
          'relative px-6 py-3 text-sm font-elegant font-semibold rounded-md transition-colors',
          activeTab === 'alquiler'
            ? 'text-white'
            : 'text-text-muted hover:text-text-secondary'
        )}
      >
        {activeTab === 'alquiler' && (
          <span className="absolute inset-0 bg-accent rounded-md" />
        )}
        <span className="relative z-10">Alquiler</span>
      </button>
    </div>
  )
}
