export class CartManager {
  constructor() {
    this.items = new Map()
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
  }

  removeItem(key) {
    this.items.delete(key)
  }

  changeQuantity(key, delta) {
    if (this.items.has(key)) {
      const item = this.items.get(key)
      item.qty += delta
      if (item.qty <= 0) {
        this.items.delete(key)
      }
    }
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
