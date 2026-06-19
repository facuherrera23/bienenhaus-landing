export function fmtPrice(value: number | undefined | null, currency: 'USD' | 'ARS' = 'USD'): string {
  if (value == null || isNaN(value)) return currency === 'ARS' ? '$0' : 'USD 0'

  if (currency === 'ARS') {
    return `$${value.toLocaleString('es-AR')}`
  }

  return `USD ${value.toLocaleString('en-US')}`
}

export function fmtType(type: string | undefined | null): string {
  if (!type) return ''
  const map: Record<string, string> = {
    casa: 'Casa',
    departamento: 'Departamento',
    terreno: 'Terreno',
    finca: 'Finca',
    local: 'Local',
    otro: 'Otro',
  }
  return map[type] || type
}

export function fmtStatus(status: string | undefined | null): string {
  if (!status) return ''
  const map: Record<string, string> = {
    disponible: 'Disponible',
    vendida: 'Vendida',
    alquilada: 'Alquilada',
    oculta: 'Oculta',
  }
  return map[status] || status
}
