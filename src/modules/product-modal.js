import { escapeHtml, formatPrice } from '../utils/helpers.js'

export class ProductModalManager {
  constructor(cartManager, uiManager) {
    this.cartManager = cartManager
    this.uiManager = uiManager
    this.selectedSize = 5
    this.selectedProductId = null
  }

  openModal(perfume) {
    this.selectedProductId = perfume.id
    
    // Buscar si hay cantidad en el carrito y usar esa talla
    let selectedSize = 5
    let hasQuantityInCarry = false
    
    const key5 = `${perfume.id}-5`
    const key10 = `${perfume.id}-10`
    const item5 = this.cartManager.items.get(key5)
    const item10 = this.cartManager.items.get(key10)
    
    if (item5 && item5.qty > 0) {
      selectedSize = 5
      hasQuantityInCarry = true
    } else if (item10 && item10.qty > 0) {
      selectedSize = 10
      hasQuantityInCarry = true
    }
    
    this.selectedSize = selectedSize
    const modal = document.getElementById('product-modal')
    
    const saving = ((perfume.price5 * 2) - perfume.price10).toFixed(2).replace('.', ',')
    const currentPrice = this.selectedSize === 5 ? perfume.price5 : perfume.price10

    modal.innerHTML = `
      <div class="modal-overlay" id="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close" id="modal-close-btn">✕</button>
        
        <div class="modal-body">
          <div class="modal-image">
            <img src="${escapeHtml(perfume.image || '/images/placeholder.jpg')}" 
                 alt="${escapeHtml(perfume.name)}" 
                 onerror="this.style.display='none'" />
          </div>
          
          <div class="modal-info">
            <span class="modal-badge modal-badge-${escapeHtml(perfume.gender)}">${escapeHtml(perfume.gender.charAt(0).toUpperCase() + perfume.gender.slice(1))}</span>
            <p class="modal-brand">${escapeHtml(perfume.brand)}</p>
            <h2 class="modal-name">${escapeHtml(perfume.name)}</h2>
            
            <div class="modal-notes">
              <p class="modal-notes-title">Notas olfativas:</p>
              <p>${escapeHtml(perfume.desc)}</p>
              <em>${escapeHtml(perfume.highlight)}</em>
            </div>
            
            ${perfume.family ? `<p class="modal-family">Familia: <strong>${escapeHtml(perfume.family)}</strong></p>` : ''}
            
            <div class="modal-size-selector">
              <div class="size-option ${this.selectedSize === 5 ? 'selected' : ''}" data-size="5">
                <span class="size-label">5 ml</span>
                <span class="size-price">${formatPrice(perfume.price5)}</span>
              </div>
              <div class="size-option ${this.selectedSize === 10 ? 'selected' : ''}" data-size="10">
                <span class="size-label">10 ml</span>
                <span class="size-price">${formatPrice(perfume.price10)}</span>
                <span class="size-save">Ahorras ${saving}€</span>
              </div>
            </div>
            
            <div class="modal-current-price">
              <span class="label">Precio:</span>
              <span class="price" id="modal-current-price">${formatPrice(currentPrice)}</span>
            </div>
            
            <button class="modal-add-btn" id="modal-add-to-cart">
              + Añadir a la cesta
            </button>
          </div>
        </div>
      </div>
    `

    modal.style.display = 'flex'
    this.attachEventListeners(perfume)
    
    // Si hay cantidad en carrito, mostrar controles inmediatamente
    if (hasQuantityInCarry) {
      const addBtn = document.getElementById('modal-add-to-cart')
      this.transformButtonToQuantityControls(perfume, addBtn)
    }
    
    // Escuchar cambios en el carrito para actualizar el modal
    this.updateModalOnCartChange = () => {
      const addBtn = document.getElementById('modal-add-to-cart')
      if (addBtn) {
        const key = `${perfume.id}-${this.selectedSize}`
        const item = this.cartManager.items.get(key)
        
        if (item && item.qty > 0) {
          // Si hay cantidad, mostrar controles
          if (!addBtn.classList.contains('qty-controls')) {
            this.transformButtonToQuantityControls(perfume, addBtn)
          } else {
            // Actualizar display si ya hay controles
            addBtn.querySelector('.qty-display').textContent = item.qty
          }
        } else {
          // Si no hay, mostrar botón de agregar
          if (addBtn.classList.contains('qty-controls')) {
            this.revertToAddButton(addBtn, perfume)
          }
        }
      }
    }
    
    window.addEventListener('cartUpdated', this.updateModalOnCartChange)
  }

  closeModal() {
    // Remover listener de cartUpdated
    if (this.updateModalOnCartChange) {
      window.removeEventListener('cartUpdated', this.updateModalOnCartChange)
      this.updateModalOnCartChange = null
    }
    
    const modal = document.getElementById('product-modal')
    modal.style.display = 'none'
    modal.innerHTML = ''
  }

  attachEventListeners(perfume) {
    const closeBtn = document.getElementById('modal-close-btn')
    const modalOverlay = document.getElementById('modal-overlay')
    const sizeOptions = document.querySelectorAll('.size-option')
    const addBtn = document.getElementById('modal-add-to-cart')

    closeBtn.addEventListener('click', () => this.closeModal())
    modalOverlay.addEventListener('click', () => this.closeModal())

    sizeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const size = parseInt(option.dataset.size)
        this.selectedSize = size
        
        sizeOptions.forEach(opt => opt.classList.remove('selected'))
        option.classList.add('selected')
        
        const price = size === 5 ? perfume.price5 : perfume.price10
        document.getElementById('modal-current-price').textContent = formatPrice(price)
        
        // Actualizar el botón según si hay cantidad de esta talla
        const addBtn = document.getElementById('modal-add-to-cart')
        const key = `${perfume.id}-${this.selectedSize}`
        const item = this.cartManager.items.get(key)
        
        if (item && item.qty > 0) {
          // Si hay cantidad, mostrar controles
          this.transformButtonToQuantityControls(perfume, addBtn)
        } else {
          // Si no hay, mostrar botón de agregar
          this.revertToAddButton(addBtn, perfume)
        }
      })
    })

    // Usar event delegation en el botón
    addBtn.addEventListener('click', (e) => {
      // Si es un botón de controles de cantidad
      if (e.target.closest('.qty-btn')) {
        const button = e.target.closest('.qty-btn')
        const key = `${perfume.id}-${this.selectedSize}`
        const display = addBtn.querySelector('.qty-display')
        
        if (button.classList.contains('qty-minus')) {
          this.cartManager.changeQuantity(key, -1)
          const item = this.cartManager.items.get(key)
          if (item && item.qty > 0) {
            display.textContent = item.qty
          } else {
            this.revertToAddButton(addBtn, perfume)
          }
        } else if (button.classList.contains('qty-plus')) {
          this.cartManager.changeQuantity(key, 1)
          const item = this.cartManager.items.get(key)
          display.textContent = item.qty
        }
        return
      }
      
      // Si es el botón de agregar
      this.cartManager.addItem(perfume, this.selectedSize)
      this.transformButtonToQuantityControls(perfume, addBtn)
    })
  }

  transformButtonToQuantityControls(perfume, addBtn) {
    const key = `${perfume.id}-${this.selectedSize}`
    const item = this.cartManager.items.get(key)
    const qty = item ? item.qty : 1
    
    addBtn.innerHTML = `
      <button class="qty-btn qty-minus" data-action="minus">−</button>
      <span class="qty-display">${qty}</span>
      <button class="qty-btn qty-plus" data-action="plus">+</button>
    `
    addBtn.classList.add('qty-controls')
  }

  revertToAddButton(addBtn, perfume) {
    addBtn.innerHTML = '+ Añadir a la cesta'
    addBtn.classList.remove('qty-controls')
  }
  }
