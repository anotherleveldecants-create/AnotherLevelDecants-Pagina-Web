import { ProductManager } from './modules/products.js'
import { CartManager } from './modules/cart.js'
import { UIManager } from './modules/ui.js'
import { CONFIG } from './config.js'
import { smoothScroll } from './utils/helpers.js'

// Inicializar managers
const productManager = new ProductManager()
const cartManager = new CartManager()
const uiManager = new UIManager(productManager, cartManager)

// Inicializar cuando carga el DOM
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar datos
  await productManager.loadData()

  // Renderizar UI
  uiManager.renderFilters()
  uiManager.renderCatalog(1)
  uiManager.renderPacks()
  uiManager.renderCart()

  // Event listeners
  setupEventListeners()
})

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

  // Filtros
  document.getElementById('filters').addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      const filter = e.target.dataset.filter
      productManager.setFilter(filter)
      uiManager.renderFilters()
      uiManager.renderCatalog(1)
      smoothScroll('catalog-grid')
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

  // Tamaños de productos
  document.getElementById('catalog-grid').addEventListener('click', (e) => {
    if (e.target.classList.contains('size-opt')) {
      const perfId = parseInt(e.target.dataset.perfId)
      const size = parseInt(e.target.dataset.size)
      
      productManager.setSelectedSize(perfId, size)
      
      // Actualizar UI del tamaño
      const selector = e.target.closest('.size-selector')
      selector.querySelectorAll('.size-opt').forEach(btn => btn.classList.remove('selected'))
      e.target.classList.add('selected')
      
      // Actualizar precio y ml
      const perfume = productManager.getPerfumeById(perfId)
      const price = size === 5 ? perfume.price5 : perfume.price10
      document.getElementById(`price-${perfId}`).textContent = price.toFixed(2).replace('.', ',') + ' €'
      document.getElementById(`ml-${perfId}`).textContent = size + ' ml · decant'
    }
  })

  // Añadir productos al carrito
  document.getElementById('catalog-grid').addEventListener('click', (e) => {
    if (e.target.classList.contains('add-btn')) {
      const perfId = parseInt(e.target.dataset.perfId)
      const perfume = productManager.getPerfumeById(perfId)
      const size = productManager.getSelectedSize(perfId)
      
      cartManager.addItem(perfume, size)
      uiManager.renderCart()
      
      // Feedback visual
      e.target.classList.add('added')
      e.target.textContent = '✓ Añadido'
      
      // Opcional: mostrar notificación
      showNotification(`${perfume.name} añadido a la cesta`)
    }
  })

  // Añadir packs al carrito
  document.getElementById('packs-grid').addEventListener('click', (e) => {
    if (e.target.classList.contains('pack-add-btn')) {
      const packId = e.target.dataset.packId
      const pack = productManager.getPackById(packId)
      const { discounted } = productManager.getPackPrice(pack)
      
      cartManager.addPack(pack, discounted)
      uiManager.renderCart()
      
      // Feedback visual
      e.target.classList.add('added')
      e.target.textContent = '✓ Añadido'
      
      // Mostrar carrito y notificación
      uiManager.toggleCart()
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
