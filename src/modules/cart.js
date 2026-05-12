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
  }

  addPack(pack, packPrice, quantity = 1) {
    const key = `pack-${pack.id}`
    const summary = pack.items
      .map(item => `Item ${item.perfId} ${item.size}ml`)
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
        summary
      })
    }
    this.saveToStorage()
  }

  removeItem(key) {
    this.items.delete(key)
    this.saveToStorage()
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

  getCheckoutMessage(productManager) {
    const items = this.getAllItems()
    const total = this.getTotal()

    const lines = items.map(item => {
      const label = item.isPack
        ? `📦 Pack: ${item.name}`
        : `• ${item.name} (${item.brand}) ${item.size}ml`
      return `${label} x${item.qty} = ${(item.price * item.qty).toFixed(2).replace('.', ',')} €`
    }).join('\n')

    return `¡Hola! Me gustaría hacer el siguiente pedido en AnotherLevelDecants 🌿\n\n${lines}\n\n*Total: ${total.toFixed(2).replace('.', ',')} €*\n\n¿Me indicas los datos para el Bizum? ¡Gracias! 😊`
  }
}
