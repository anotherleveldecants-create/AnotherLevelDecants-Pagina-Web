import { CONFIG } from '../config.js'

export class CartManager {
  constructor() {
    this.items = new Map()
    this.loadFromStorage()
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) {
        const data = JSON.parse(saved)
        data.forEach(item => {
          this.items.set(item.key, item)
        })
      }
    } catch (e) {
      console.error('Error loading cart from storage:', e)
    }
  }

  saveToStorage() {
    try {
      const data = Array.from(this.items.values())
      localStorage.setItem('cart', JSON.stringify(data))
    } catch (e) {
      console.error('Error saving cart to storage:', e)
    }
  }

  addItem(perfume, size, quantity = 1) {
    const key = `${perfume.id}-${size}`
    const price = size === 5 ? perfume.price5 : perfume.price10

    if (this.items.has(key)) {
      const item = this.items.get(key)
      item.qty += quantity
    } else {
      this.items.set(key, {
        key,
        id: perfume.id,
        brand: perfume.brand,
        name: perfume.name,
        size,
        price,
        qty: quantity,
        isPack: false
      })
    }
    this.saveToStorage()
    // Emitir evento personalizado para actualizar la UI
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  addPack(pack, packPrice, productManager, quantity = 1) {
    const key = `pack-${pack.id}`
    
    // Generar descripción detallada del pack con nombres de perfumes
    const packDetails = pack.items
      .map(item => {
        const perfume = productManager.getPerfumeById(item.perfId)
        return perfume ? `${perfume.name} (${item.size}ml)` : `Perfume ${item.perfId} (${item.size}ml)`
      })
      .join(', ')

    if (this.items.has(key)) {
      const item = this.items.get(key)
      item.qty += quantity
    } else {
      this.items.set(key, {
        key,
        id: pack.id,
        brand: '🎁 Pack',
        name: pack.name,
        size: null,
        price: packPrice,
        qty: quantity,
        isPack: true,
        packDetails
      })
    }
    this.saveToStorage()
    // Emitir evento personalizado para actualizar la UI
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  removeItem(key) {
    this.items.delete(key)
    this.saveToStorage()
    // Emitir evento personalizado para actualizar la UI
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  changeQuantity(key, delta) {
    if (this.items.has(key)) {
      const item = this.items.get(key)
      item.qty += delta
      if (item.qty <= 0) {
        this.items.delete(key)
      }
    }
    this.saveToStorage()
    // Emitir evento personalizado para actualizar la UI
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }

  getTotal() {
    let total = 0
    this.items.forEach(item => {
      total += item.price * item.qty
    })
    return Math.round(total * 100) / 100
  }

  getCount() {
    let count = 0
    this.items.forEach(item => {
      count += item.qty
    })
    return count
  }

  getAllItems() {
    return Array.from(this.items.values())
  }

  isEmpty() {
    return this.items.size === 0
  }

  clear() {
    this.items.clear()
    this.saveToStorage()
  }

  async checkout() {
    const items = this.getAllItems()

    if (items.length === 0) return

    // En desarrollo local, redirigir a página de confirmación
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Guardar los datos del carrito en sessionStorage para la página de confirmación
      sessionStorage.setItem('checkoutItems', JSON.stringify(items))
      
      // Redirigir a la página de confirmación
      window.location.href = '/confirmacion.html?dev=true'
      return
    }

    try {
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Ha ocurrido un error al iniciar el pago. Inténtalo de nuevo.')
      }
    } catch (err) {
      console.error(err)
      alert('Ha ocurrido un error al conectar con el servidor de pagos.')
    }
  }
}
