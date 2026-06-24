// Escapar HTML para prevenir XSS
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return String(text).replace(/[&<>"']/g, m => map[m])
}

// Formater precios
export function formatPrice(price) {
  if (price === undefined || price === null || isNaN(price)) {
    return '0,00 €'
  }
  return parseFloat(price).toFixed(2).replace('.', ',') + ' €'
}

// Hacer fetch de datos
export async function fetchData(path) {
  try {
    const response = await fetch(path)
    if (!response.ok) throw new Error(`Error fetching ${path}`)
    return await response.json()
  } catch (error) {
    console.error('Error loading data:', error)
    return []
  }
}

// Scroll suave a elemento
export function smoothScroll(elementId) {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
