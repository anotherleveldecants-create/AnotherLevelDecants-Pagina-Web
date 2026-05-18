export class CustomPackManager {
  constructor() {
    this.packs = []
    this.loadFromStorage()
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('customPacks')
      if (saved) {
        this.packs = JSON.parse(saved)
      }
    } catch (e) {
      console.error('Error loading custom packs:', e)
      this.packs = []
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('customPacks', JSON.stringify(this.packs))
    } catch (e) {
      console.error('Error saving custom packs:', e)
    }
  }

  createPack(items) {
    // items: array de { perfumeId, size (5 o 10), brand, name }
    const totalMl = items.reduce((sum, item) => sum + item.size, 0)
    
    if (totalMl < 25) {
      throw new Error('El pack debe tener mínimo 25 ml')
    }

    // Solo permitir 1 pack personalizado a la vez - eliminar el anterior
    this.packs = []

    const pack = {
      id: `custom-${Date.now()}`,
      name: 'Pack Personalizado',
      desc: `${items.length} perfume${items.length !== 1 ? 's' : ''} seleccionado${items.length !== 1 ? 's' : ''}`,
      icon: '🎨',
      tag: 'Personalizado',
      discount: 0.10,
      items: items.map(item => ({
        perfId: item.perfId,
        size: item.size
      })),
      inStock: true,
      createdAt: new Date().toISOString()
    }

    this.packs.push(pack)
    this.saveToStorage()
    return pack
  }

  updatePack(packId, items) {
    const totalMl = items.reduce((sum, item) => sum + item.size, 0)
    
    if (totalMl < 25) {
      throw new Error('El pack debe tener mínimo 25 ml')
    }

    const pack = this.packs.find(p => p.id === packId)
    if (!pack) {
      throw new Error('Pack no encontrado')
    }

    pack.items = items.map(item => ({
      perfId: item.perfId,
      size: item.size
    }))
    pack.desc = `${items.length} perfume${items.length !== 1 ? 's' : ''} seleccionado${items.length !== 1 ? 's' : ''}`
    
    this.saveToStorage()
    return pack
  }

  deletePack(packId) {
    this.packs = this.packs.filter(p => p.id !== packId)
    this.saveToStorage()
  }

  getPack(packId) {
    return this.packs.find(p => p.id === packId)
  }

  getAllPacks() {
    return this.packs
  }
}
