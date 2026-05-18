import { ProductManager } from './modules/products.js'
import { CartManager } from './modules/cart.js'
import { UIManager } from './modules/ui.js'
import { BenefitsManager } from './modules/benefits.js'
import { ProductModalManager } from './modules/product-modal.js'
import { CustomPackManager } from './modules/custom-pack-manager.js'
import { CONFIG } from './config.js'
import { smoothScroll, formatPrice } from './utils/helpers.js'

// Inicializar managers
const productManager = new ProductManager()
const cartManager = new CartManager()
const customPackManager = new CustomPackManager()
const uiManager = new UIManager(productManager, cartManager, customPackManager)
const benefitsManager = new BenefitsManager()
const productModalManager = new ProductModalManager(cartManager, uiManager)

// Inicializar cuando carga el DOM
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar datos
  await productManager.loadData()

  // Renderizar UI
  uiManager.renderFilters()
  uiManager.renderSeasonFilters()
  uiManager.renderBenefits(benefitsManager)
  uiManager.renderSocials()
  uiManager.renderCatalog(1)
  uiManager.renderPacks()
  uiManager.renderCart()

  // Actualizar botones de packs que ya tienen cantidad al cargar
  productManager.packs.forEach(pack => {
    const key = `pack-${pack.id}`
    const item = cartManager.items.get(key)
    const addBtn = document.getElementById(`pbtn-${pack.id}`)
    
    if (addBtn && item && item.qty > 0) {
      transformPackButtonToControls(addBtn, pack)
    }
  })

  // Event listeners
  setupEventListeners()
})

function transformPackButtonToControls(addBtn, pack) {
  const key = `pack-${pack.id}`
  const item = cartManager.items.get(key)
  const qty = item ? item.qty : 1

  addBtn.innerHTML = `
    <button class="qty-btn qty-minus" data-action="minus">−</button>
    <span class="qty-display">${qty}</span>
    <button class="qty-btn qty-plus" data-action="plus">+</button>
  `
  addBtn.classList.add('qty-controls')
}

function transformPackButtonToAdd(addBtn, pack) {
  addBtn.innerHTML = '+ Añadir'
  addBtn.classList.remove('qty-controls')
}

function setupEventListeners() {
  // Cart toggle
  document.getElementById('cart-btn').addEventListener('click', () => {
    uiManager.toggleCart()
  })
  document.getElementById('close-cart-btn').addEventListener('click', () => {
    uiManager.toggleCart()
  })
  document.getElementById('cart-overlay').addEventListener('click', () => {
    uiManager.toggleCart()
  })

  // Modal de filtros
  const filtersModal = document.getElementById('filters-modal')
  const filtersToggle = document.getElementById('filters-toggle')
  const closeFilters = document.getElementById('close-filters')

  filtersToggle.addEventListener('click', () => {
    filtersModal.classList.add('active')
  })

  closeFilters.addEventListener('click', () => {
    filtersModal.classList.remove('active')
  })

  filtersModal.addEventListener('click', (e) => {
    if (e.target === filtersModal) {
      filtersModal.classList.remove('active')
    }
  })

  // Filtros
  document.getElementById('filters').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      const filter = e.target.dataset.filter
      productManager.setFilter(filter)
      uiManager.renderFilters()
      uiManager.renderCatalog(1)
      smoothScroll('catalog-grid')
      filtersModal.classList.remove('active')
    }
  })

  // Filtros de estaciones
  document.getElementById('season-filters').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      const season = e.target.dataset.season
      productManager.setSeasonFilter(season)
      uiManager.renderSeasonFilters()
      uiManager.renderCatalog(1)
      smoothScroll('catalog-grid')
      filtersModal.classList.remove('active')
    }
  })

  // Búsqueda
  document.getElementById('search-input').addEventListener('input', (e) => {
    productManager.setSearch(e.target.value)
    uiManager.renderCatalog(1)
  })

  // Paginación
  document.getElementById('pagination').addEventListener('click', (e) => {
    if (e.target.dataset.page) {
      const page = parseInt(e.target.dataset.page)
      uiManager.renderCatalog(page)
      smoothScroll('catalog-grid')
    }
  })

  // Botón "Info" de productos - abrir modal
  document.getElementById('catalog-grid').addEventListener('click', (e) => {
    const infoBtn = e.target.closest('.info-btn')
    if (infoBtn) {
      const perfId = parseInt(infoBtn.dataset.perfId)
      const perfume = productManager.getPerfumeById(perfId)
      if (perfume) {
        productModalManager.openModal(perfume)
      }
    }
  })

  // Añadir packs al carrito
  document.getElementById('packs-grid').addEventListener('click', (e) => {
    if (e.target.closest('.qty-btn')) {
      // Click en controles de cantidad
      const button = e.target.closest('.qty-btn')
      const addBtn = button.closest('.add-btn')
      const packId = addBtn.dataset.packId
      const pack = productManager.getPackById(packId)
      const key = `pack-${pack.id}`
      const display = addBtn.querySelector('.qty-display')
      
      if (button.classList.contains('qty-minus')) {
        cartManager.changeQuantity(key, -1)
        const item = cartManager.items.get(key)
        if (item && item.qty > 0) {
          display.textContent = item.qty
        } else {
          // Volver al botón de agregar
          transformPackButtonToAdd(addBtn, pack)
        }
      } else if (button.classList.contains('qty-plus')) {
        cartManager.changeQuantity(key, 1)
        const item = cartManager.items.get(key)
        display.textContent = item.qty
      }
      return
    }

    if (e.target.classList.contains('add-btn')) {
      const packId = e.target.dataset.packId
      let pack = productManager.getPackById(packId)
      
      // Si no es un pack estándar, buscar en packs personalizados
      if (!pack && customPackManager) {
        pack = customPackManager.getPack(packId)
      }
      
      if (!pack) {
        showNotification('Pack no encontrado')
        return
      }
      
      const { discounted } = productManager.getPackPrice(pack)
      
      cartManager.addPack(pack, discounted, productManager)
      
      // Transformar botón a controles de cantidad
      const addBtn = e.target
      transformPackButtonToControls(addBtn, pack)
      
      // Mostrar notificación
      showNotification(`${pack.name} añadido a la cesta`)
    }
  })

  // Carrito: cambiar cantidad
  document.getElementById('cart-items').addEventListener('click', (e) => {
    if (e.target.classList.contains('qty-btn')) {
      const key = e.target.dataset.key
      const action = e.target.dataset.action
      const delta = action === 'plus' ? 1 : -1
      
      cartManager.changeQuantity(key, delta)
      uiManager.renderCart()
    }
  })

  // Carrito: eliminar item
  document.getElementById('cart-items').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
      const key = e.target.dataset.key
      cartManager.removeItem(key)
      uiManager.renderCart()
    }
  })

  // Escuchar evento de carrito actualizado
  window.addEventListener('cartUpdated', () => {
    uiManager.renderCart()
    
    // Actualizar estado de botones de packs
    productManager.packs.forEach(pack => {
      const key = `pack-${pack.id}`
      const item = cartManager.items.get(key)
      const addBtn = document.getElementById(`pbtn-${pack.id}`)
      
      if (addBtn) {
        if (item && item.qty > 0) {
          // Si hay cantidad, mostrar controles
          if (!addBtn.classList.contains('qty-controls')) {
            transformPackButtonToControls(addBtn, pack)
          } else {
            // Actualizar cantidad
            addBtn.querySelector('.qty-display').textContent = item.qty
          }
        } else {
          // Si no hay cantidad, mostrar botón de agregar
          if (addBtn.classList.contains('qty-controls')) {
            transformPackButtonToAdd(addBtn, pack)
          }
        }
      }
    })
    
    // Actualizar packs personalizados también
    customPackManager.getAllPacks().forEach(pack => {
      const key = `pack-${pack.id}`
      const item = cartManager.items.get(key)
      const addBtn = document.getElementById(`pbtn-${pack.id}`)
      
      if (addBtn) {
        if (item && item.qty > 0) {
          if (!addBtn.classList.contains('qty-controls')) {
            transformPackButtonToControls(addBtn, pack)
          } else {
            addBtn.querySelector('.qty-display').textContent = item.qty
          }
        } else {
          if (addBtn.classList.contains('qty-controls')) {
            transformPackButtonToAdd(addBtn, pack)
          }
        }
      }
    })
  })

  // Botón para crear pack personalizado
  document.addEventListener('click', (e) => {
    if (e.target.closest('#create-custom-pack')) {
      // Remover modales anteriores
      const existingModal = document.getElementById('custom-pack-modal')
      if (existingModal) existingModal.remove()
      
      const modal = uiManager.renderCustomPackModal()
      setupCustomPackModal(modal, null)
    }
    
    // Editar pack personalizado
    if (e.target.closest('.edit-pack-btn')) {
      // Remover modales anteriores
      const existingModal = document.getElementById('custom-pack-modal')
      if (existingModal) existingModal.remove()
      
      const packId = e.target.closest('.edit-pack-btn').dataset.packId
      const modal = uiManager.renderCustomPackModal(packId)
      setupCustomPackModal(modal, packId)
    }
    
    // Eliminar pack personalizado
    if (e.target.closest('.delete-pack-btn')) {
      const packId = e.target.closest('.delete-pack-btn').dataset.packId
      if (confirm('¿Estás seguro de que quieres eliminar este pack?')) {
        customPackManager.deletePack(packId)
        uiManager.renderPacks()
        showNotification('Pack eliminado')
      }
    }
  })
}

function showNotification(message) {
  // Crear elemento de notificación
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: #4a8a4a;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `
  notification.textContent = message
  
  document.body.appendChild(notification)
  
  // Remover después de 2 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => notification.remove(), 300)
  }, 2000)
}

function setupCustomPackModal(modal, editPackId) {
  let selectedItems = []
  let selectedSize = 5

  const closeBtn = modal.querySelector('#close-custom-pack-modal')
  const cancelBtn = modal.querySelector('#cancel-custom-pack')
  const saveBtn = modal.querySelector('#save-custom-pack')
  const addBtn = modal.querySelector('#add-perfume-btn')
  const perfumeSelect = modal.querySelector('#perfume-select')
  const sizeButtons = modal.querySelectorAll('.size-btn')

  function updateTotalMl() {
    const total = selectedItems.reduce((sum, item) => sum + item.size, 0)
    modal.querySelector('#total-ml').textContent = total
    const warning = modal.querySelector('#ml-warning')
    if (total < 25) {
      warning.style.display = 'inline'
      saveBtn.disabled = true
    } else {
      warning.style.display = 'none'
      saveBtn.disabled = false
    }
  }

  function updatePriceDisplay() {
    let fullPrice = 0
    selectedItems.forEach(item => {
      const perf = productManager.getPerfumeById(item.perfId)
      if (perf) {
        const price = item.size === 5 ? perf.price5 : perf.price10
        fullPrice += price
      }
    })
    const discountRate = 0.10 // 10% de descuento para packs personalizados
    const discountedPrice = Math.round(fullPrice * (1 - discountRate) * 100) / 100
    const priceContainer = modal.querySelector('#price-display')
    
    if (priceContainer) {
      if (selectedItems.length === 0) {
        priceContainer.innerHTML = `
          <div style="font-size: 0.8rem; color: var(--muted);">Precio total del pack:</div>
          <div style="font-size: 1rem; color: var(--muted); margin-top: 0.3rem;">---</div>
        `
      } else {
        priceContainer.innerHTML = `
          <div style="font-size: 0.8rem; color: var(--muted); margin-bottom: 0.5rem;">Precio total:</div>
          <div style="display: flex; gap: 1rem; align-items: center; justify-content: flex-end;">
            <div style="text-decoration: line-through; color: var(--muted); font-size: 0.9rem;">${formatPrice(fullPrice)}</div>
            <div style="font-size: 1.3rem; font-weight: bold; color: var(--accent);">${formatPrice(discountedPrice)}</div>
          </div>
          <div style="font-size: 0.8rem; color: #4a8a4a; margin-top: 0.3rem;">✓ Ahorras ${formatPrice(fullPrice - discountedPrice)}</div>
        `
      }
    }
  }

  function renderSelectedItemsLocal(items) {
    const container = modal.querySelector('#selected-items')
    container.innerHTML = items.map((item, i) => `
      <div class="selected-item" data-index="${i}">
        <span>${item.brand} - ${item.name} · ${item.size}ml</span>
        <button type="button" class="remove-item-btn" data-index="${i}">✕</button>
      </div>
    `).join('')
  }

  // Cargar items si es edición
  if (editPackId) {
    const pack = customPackManager.getPack(editPackId)
    if (pack && pack.items && pack.items.length > 0) {
      selectedItems = pack.items.map(item => {
        const perf = productManager.getPerfumeById(item.perfId)
        if (!perf) {
          return null
        }
        return {
          perfId: item.perfId,
          size: item.size,
          brand: perf.brand,
          name: perf.name
        }
      }).filter(item => item !== null)
      // Renderizar los items cargados
      renderSelectedItemsLocal(selectedItems)
      updateTotalMl()
      updatePriceDisplay()
    }
  }

  // Botones de tamaño
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      sizeButtons.forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
      selectedSize = parseInt(btn.dataset.size)
      updatePriceDisplay()
    })
  })
  if (sizeButtons.length > 0) sizeButtons[0].click()
  
  // Mostrar precio inicial (en blanco si es nuevo pack)
  updatePriceDisplay()

  // Agregar perfume
  addBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const perfumeId = parseInt(perfumeSelect.value, 10)  // Convert to number
    if (!perfumeId) {
      showNotification('Selecciona un perfume')
      return
    }

    const option = perfumeSelect.options[perfumeSelect.selectedIndex]
    const brand = option.dataset.brand
    const name = option.dataset.name

    selectedItems.push({
      perfId: perfumeId,
      size: selectedSize,
      brand,
      name
    })

    renderSelectedItemsLocal(selectedItems)
    updateTotalMl()
    updatePriceDisplay()
    perfumeSelect.value = ''
  })

  // Remover item
  modal.addEventListener('click', (e) => {
    if (e.target.closest('.remove-item-btn')) {
      const index = parseInt(e.target.closest('.remove-item-btn').dataset.index)
      selectedItems.splice(index, 1)
      renderSelectedItemsLocal(selectedItems)
      updateTotalMl()
      updatePriceDisplay()
    }
  })

  // Cerrar modal
  closeBtn.addEventListener('click', () => {
    modal.remove()
  })
  cancelBtn.addEventListener('click', () => {
    modal.remove()
  })

  // Guardar pack
  saveBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const totalMl = selectedItems.reduce((sum, item) => sum + item.size, 0)

    if (totalMl < 25) {
      showNotification('El pack debe tener mínimo 25 ml')
      return
    }

    try {
      if (editPackId) {
        customPackManager.updatePack(editPackId, selectedItems)
        showNotification('Pack actualizado')
      } else {
        customPackManager.createPack(selectedItems)
        showNotification('Pack personalizado creado')
      }
      uiManager.renderPacks()
      modal.remove()
    } catch (error) {
      showNotification(error.message)
    }
  })
}

// Estilos de animación
const style = document.createElement('style')
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)

// Helper para limpiar packs corruptos
window.limpiarPacksCorruptos = function() {
  try {
    const saved = localStorage.getItem('customPacks')
    if (!saved) {
      console.log('No hay packs guardados')
      return
    }
    const packs = JSON.parse(saved)
    const packsFiltrados = packs.filter(p => {
      return p && p.id && p.items && Array.isArray(p.items) && p.items.length > 0
    })
    localStorage.setItem('customPacks', JSON.stringify(packsFiltrados))
    console.log(`Limpiados: ${packs.length - packsFiltrados.length} packs corruptos`)
    console.log('Packs válidos:', packsFiltrados.length)
    location.reload()
  } catch (e) {
    console.error('Error limpiando packs:', e)
  }
}

console.log('Para limpiar packs corruptos, ejecuta: limpiarPacksCorruptos()')
