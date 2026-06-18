export function fmtPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

export function fmtPriceARS(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

export function fmtType(type: string): string {
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

export function fmtStatus(status: string, operation?: 'venta' | 'alquiler'): string {
  const map: Record<string, string> = {
    disponible: 'Disponible',
    vendida: operation === 'alquiler' ? 'Alquilada' : 'Vendida',
    alquilada: 'Alquilada',
    oculta: 'Oculta',
  }
  return map[status] || status
}
