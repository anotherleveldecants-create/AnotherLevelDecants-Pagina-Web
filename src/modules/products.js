import { fetchData } from '../utils/helpers.js'

export class ProductManager {
  constructor() {
    this.perfumes = []
    this.packs = []
    this.filteredPerfumes = []
    this.currentFilter = 'todos'
    this.currentSearchTerm = ''
    this.selectedSizes = new Map()
    this.qty5mlClicks = new Map() // Contador de clicks en 5ml
  }

  async loadData() {
    this.perfumes = await fetchData('/data/perfumes.json')
    this.packs = await fetchData('/data/packs.json')
    
    // Inicializar tamaños seleccionados y contadores
    this.perfumes.forEach(p => {
      this.selectedSizes.set(p.id, 5)
      this.qty5mlClicks.set(p.id, 0)
    })
    
    this.updateFilteredList()
    return { perfumes: this.perfumes, packs: this.packs }
  }

  updateFilteredList() {
    let result = this.perfumes.filter(p => p.inStock)

    if (this.currentFilter !== 'todos') {
      result = result.filter(p => p.gender === this.currentFilter)
    }

    if (this.currentSearchTerm) {
      const term = this.currentSearchTerm.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term)
      )
    }

    this.filteredPerfumes = result
    return result
  }

  setFilter(filter) {
    this.currentFilter = filter
    this.updateFilteredList()
  }

  setSearch(term) {
    this.currentSearchTerm = term.trim()
    this.updateFilteredList()
  }

  setSelectedSize(perfumeId, size) {
    this.selectedSizes.set(perfumeId, size)
  }

  getSelectedSize(perfumeId) {
    return this.selectedSizes.get(perfumeId) || 5
  }

  getPerfumeById(id) {
    return this.perfumes.find(p => p.id === id)
  }

  getPackById(id) {
    return this.packs.find(p => p.id === id)
  }

  getPackPrice(pack) {
    if (!pack || !pack.items) return { full: 0, discounted: 0 }

    const full = pack.items.reduce((sum, item) => {
      const perfume = this.getPerfumeById(item.perfId)
      if (!perfume) return sum
      const price = item.size === 5 ? perfume.price5 : perfume.price10
      return sum + price
    }, 0)

    const discounted = Math.round(full * (1 - pack.discount) * 100) / 100
    return {
      full: Math.round(full * 100) / 100,
      discounted
    }
  }

  getPaginatedPerfumes(page, itemsPerPage) {
    const start = (page - 1) * itemsPerPage
    const end = start + itemsPerPage
    return {
      items: this.filteredPerfumes.slice(start, end),
      total: this.filteredPerfumes.length,
      totalPages: Math.ceil(this.filteredPerfumes.length / itemsPerPage)
    }
  }

  getAvailableGenders() {
    const genders = new Set(this.perfumes.filter(p => p.inStock).map(p => p.gender))
    return ['todos', ...Array.from(genders).sort()]
  }
}
