import { ProductManager } from './modules/products.js'
import { CartManager } from './modules/cart.js'
import { UIManager } from './modules/ui.js'
import { CONFIG } from './config.js'
import { smoothScroll, formatPrice } from './utils/helpers.js'

// Inicializar managers
const productManager = new ProductManager()
const cartManager = new CartManager()
const uiManager = new UIManager(productManager, cartManager)

// Inicializar cuando carga el DOM
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar datos
  await productManager.loadData()

  // Sincronizar qty5mlClicks con los items del carrito
  // Para cada producto, si tiene 5ml en carrito, establecer qty5mlClicks basado en eso
  for (const [key, item] of cartManager.items) {
    const [perfId, size] = key.split('-')
    const perfIdNum = parseInt(perfId)
    if (size === '5') {
      productManager.qty5mlClicks.set(perfIdNum, item.qty)
    }
  }

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

  // Tamaños de productos - clickear en cualquier parte para cambiar
  document.getElementById('catalog-grid').addEventListener('click', (e) => {
    const sizeOpt = e.target.closest('.size-opt')
    if (sizeOpt) {
      const perfId = parseInt(sizeOpt.dataset.perfId)
      const size = parseInt(sizeOpt.dataset.size)
      
      productManager.setSelectedSize(perfId, size)
      
      // Si cambias A 5ml: resetear contador
      // Si cambias A 10ml: no necesita resetear
      if (size === 5) {
        productManager.qty5mlClicks.set(perfId, 0)
      }
      
      // Actualizar UI del tamaño
      const selector = sizeOpt.closest('.size-selector')
      selector.querySelectorAll('.size-opt').forEach(btn => btn.classList.remove('selected'))
      sizeOpt.classList.add('selected')
      
      // Actualizar precio y ml
      const perfume = productManager.getPerfumeById(perfId)
      const price = size === 5 ? perfume.price5 : perfume.price10
      document.getElementById(`price-${perfId}`).textContent = formatPrice(price)
      document.getElementById(`ml-${perfId}`).textContent = size + ' ml · decant'
      
      updateProductCard(perfId)
    }
  })

  // Actualizar solo una tarjeta sin re-renderizar todo
  function updateProductCard(perfId) {
    const perfume = productManager.getPerfumeById(perfId)
    const sz = productManager.getSelectedSize(perfId)
    
    // Contar TOTAL en el carrito (10ml + 5ml)
    const key5 = `${perfId}-5`
    const key10 = `${perfId}-10`
    
    let totalCount = 0
    if (cartManager.items.has(key5)) {
      totalCount += cartManager.items.get(key5).qty
    }
    if (cartManager.items.has(key10)) {
      totalCount += cartManager.items.get(key10).qty
    }
    
    // Buscar la tarjeta por el selector de tamaño que tiene data-perf-id
    const sizeSelector = document.querySelector(`.size-selector[data-perf-id="${perfId}"]`)
    if (!sizeSelector) return
    
    const card = sizeSelector.closest('.card')
    const footer = card.querySelector('.card-footer')
    
    if (totalCount === 0) {
      // Mostrar botón "Añadir"
      footer.innerHTML = `
        <div>
          <span class="card-price" id="price-${perfId}">${formatPrice(perfume[sz === 5 ? 'price5' : 'price10'])}</span>
          <span class="card-ml" id="ml-${perfId}">${sz} ml · decant</span>
        </div>
        <button class="add-btn" id="btn-${perfId}" data-perf-id="${perfId}">
          + Añadir
        </button>
      `
    } else {
      // Mostrar controles de cantidad
      footer.innerHTML = `
        <div>
          <span class="card-price" id="price-${perfId}">${formatPrice(perfume[sz === 5 ? 'price5' : 'price10'])}</span>
          <span class="card-ml" id="ml-${perfId}">${sz} ml · decant</span>
        </div>
        <div class="qty-controls">
          <button class="qty-btn qty-minus" id="minus-${perfId}" data-perf-id="${perfId}">−</button>
          <span class="qty-display">${totalCount}</span>
          <button class="qty-btn qty-plus" id="plus-${perfId}" data-perf-id="${perfId}">+</button>
        </div>
      `
    }
  }

  // Añadir productos al carrito
  document.getElementById('catalog-grid').addEventListener('click', (e) => {
    if (e.target.classList.contains('add-btn')) {
      const perfId = parseInt(e.target.dataset.perfId)
      const perfume = productManager.getPerfumeById(perfId)
      const size = productManager.getSelectedSize(perfId)
      
      cartManager.addItem(perfume, size)
      updateProductCard(perfId)
      uiManager.renderCart()
      
      // Mostrar notificación
      showNotification(`${perfume.name} añadido a la cesta`)
    }

    // Botones de + cantidad
    if (e.target.classList.contains('qty-plus')) {
      const perfId = parseInt(e.target.dataset.perfId)
      const perfume = productManager.getPerfumeById(perfId)
      const size = parseInt(productManager.getSelectedSize(perfId)) // Asegurar que es número
      
      // SOLO SI ES 5ML: Convertir inteligentemente
      if (size === 5) {
        const currentClicks = productManager.qty5mlClicks.get(perfId) || 0
        productManager.qty5mlClicks.set(perfId, currentClicks + 1)
        
        const totalClicks = productManager.qty5mlClicks.get(perfId)
        const qty10ml = Math.floor(totalClicks / 2)
        const qty5ml = totalClicks % 2
        
        // Limpiar carrito de este producto
        const key5 = `${perfId}-5`
        const key10 = `${perfId}-10`
        if (cartManager.items.has(key5)) cartManager.removeItem(key5)
        if (cartManager.items.has(key10)) cartManager.removeItem(key10)
        
        // Añadir la conversión
        if (qty10ml > 0) {
          cartManager.addItem(perfume, 10, qty10ml)
        }
        if (qty5ml > 0) {
          cartManager.addItem(perfume, 5, qty5ml)
        }
      } else {
        // Si es 10ml, sumar normalmente
        cartManager.addItem(perfume, size)
      }
      
      updateProductCard(perfId)
      uiManager.renderCart()
    }

    // Botones de - cantidad
    if (e.target.classList.contains('qty-minus')) {
      const perfId = parseInt(e.target.dataset.perfId)
      const perfume = productManager.getPerfumeById(perfId)
      const size = productManager.getSelectedSize(perfId)
      const key = `${perfId}-${size}`
      
      // SOLO SI ES 5ML: Decrementar contador de clicks
      if (size === 5) {
        const currentClicks = productManager.qty5mlClicks.get(perfId) || 0
        if (currentClicks > 0) {
          productManager.qty5mlClicks.set(perfId, currentClicks - 1)
          
          const totalClicks = productManager.qty5mlClicks.get(perfId)
          const qty10ml = Math.floor(totalClicks / 2)
          const qty5ml = totalClicks % 2
          
          // Limpiar carrito para este producto
          const key5 = `${perfId}-5`
          const key10 = `${perfId}-10`
          if (cartManager.items.has(key5)) cartManager.removeItem(key5)
          if (cartManager.items.has(key10)) cartManager.removeItem(key10)
          
          // Añadir la conversión calculada
          if (qty10ml > 0) {
            cartManager.addItem(perfume, 10, qty10ml)
          }
          if (qty5ml > 0) {
            cartManager.addItem(perfume, 5, qty5ml)
          }
        }
      } else {
        // Si es 10ml, restar normalmente
        cartManager.changeQuantity(key, -1)
      }
      
      updateProductCard(perfId)
      uiManager.renderCart()
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
      
      // Extraer perfId del key (formato: "perfId-size" o "pack-packId")
      if (key.startsWith('pack-')) {
        // Es un pack, no hacer nada especial
      } else {
        const perfId = parseInt(key.split('-')[0])
        // Resetear contador de clicks para este producto
        productManager.qty5mlClicks.set(perfId, 0)
        // Actualizar la tarjeta
        updateProductCard(perfId)
      }
      
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
