import { escapeHtml, formatPrice, smoothScroll } from '../utils/helpers.js'
import { CONFIG } from '../config.js'

export class UIManager {
  constructor(productManager, cartManager, customPackManager = null) {
    this.productManager = productManager
    this.cartManager = cartManager
    this.customPackManager = customPackManager
    this.currentPage = 1
  }

  renderFilters() {
    const container = document.getElementById('filters')
    const genders = this.productManager.getAvailableGenders()
    
    container.innerHTML = genders.map(gender => {
      const isActive = gender === this.productManager.currentFilter
      const label = gender.charAt(0).toUpperCase() + gender.slice(1)
      return `<button class="filter-btn ${isActive ? 'active' : ''}" 
              data-filter="${gender}" 
              aria-label="Filtrar por ${label}">${label}</button>`
    }).join('')
  }

  renderSeasonFilters() {
    const container = document.getElementById('season-filters')
    const seasons = this.productManager.getAvailableSeasons()
    
    const seasonLabels = {
      'todos': 'Todas',
      'primavera': 'Primavera',
      'verano': 'Verano',
      'otoño': 'Otoño',
      'invierno': 'Invierno'
    }

    container.innerHTML = seasons.map(season => {
      const isActive = season === this.productManager.currentSeasonFilter
      const label = seasonLabels[season] || season.charAt(0).toUpperCase() + season.slice(1)
      return `<button class="filter-btn ${isActive ? 'active' : ''}" 
              data-season="${season}" 
              aria-label="Filtrar por estación ${label}">${label}</button>`
    }).join('')
  }

  renderFamilyFilters() {
    const container = document.getElementById('family-filters')
    const families = this.productManager.getAvailableFamilies()
    
    container.innerHTML = families.map(family => {
      const isActive = family === this.productManager.currentFamilyFilter
      const label = family.charAt(0).toUpperCase() + family.slice(1)
      return `<button class="filter-btn ${isActive ? 'active' : ''}" 
              data-family="${family}" 
              aria-label="Filtrar por familia ${label}">${label}</button>`
    }).join('')
  }

  renderPriceFilters() {
    const container = document.getElementById('price-filters')
    const ranges = this.productManager.getAvailablePriceRanges()
    
    const priceLabels = {
      'todos': 'Todos',
      'bajo': 'Menos de 5€',
      'medio': '5€ - 8€',
      'alto': 'Más de 8€'
    }

    container.innerHTML = ranges.map(range => {
      const isActive = range === this.productManager.currentPriceFilter
      const label = priceLabels[range]
      return `<button class="filter-btn ${isActive ? 'active' : ''}" 
              data-price="${range}" 
              aria-label="Filtrar por precio ${label}">${label}</button>`
    }).join('')
  }

  renderCatalog(page = 1) {
    const container = document.getElementById('catalog-grid')
    const { items, total, totalPages } = this.productManager.getPaginatedPerfumes(page, CONFIG.ITEMS_PER_PAGE)

    this.currentPage = page

    if (items.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--muted);">
        No se encontraron perfumes disponibles.
      </div>`
    } else {
      container.innerHTML = items.map((p, i) => {
        // Extraer primeras 2-3 notas del desc
        const descNotes = p.desc.split(',').slice(0, 3).map(note => note.trim()).join(' · ')
        const minPrice = formatPrice(p.price5)
        
        return `
        <div class="card card-simple" data-perf-id="${p.id}" style="animation-delay:${i * 0.05}s; cursor: pointer;">
          <div class="card-visual">
            <img src="${p.image || '/images/placeholder.jpg'}" alt="${escapeHtml(p.name)}" class="card-image" onerror="this.style.display='none'" />
            <span class="card-badge badge-${escapeHtml(p.gender)}">${escapeHtml(p.gender.charAt(0).toUpperCase() + p.gender.slice(1))}</span>
          </div>
          <div class="card-body card-body-simple">
            <p class="card-brand">${escapeHtml(p.brand)}</p>
            <h3 class="card-name">${escapeHtml(p.name)}</h3>
            <p class="card-notes">${escapeHtml(descNotes)}</p>
            <p class="card-price-from">Desde ${minPrice}</p>
            <button class="info-btn" id="info-${p.id}" data-perf-id="${p.id}">Ver Precios</button>
          </div>
        </div>`
      }).join('')
    }

    this.renderPagination(page, totalPages)
    this.updateSearchResults(total)
  }

  renderPagination(currentPage, totalPages) {
    const container = document.getElementById('pagination')
    
    if (totalPages <= 1) {
      container.innerHTML = ''
      return
    }

    let html = `<button class="pagination-btn" data-page="1" ${currentPage === 1 ? 'disabled' : ''}>«</button>`
    html += `<button class="pagination-btn" data-page="${Math.max(1, currentPage - 1)}" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`

    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, currentPage + 2)

    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`
    }

    html += `<button class="pagination-btn" data-page="${Math.min(totalPages, currentPage + 1)}" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`
    html += `<button class="pagination-btn" data-page="${totalPages}" ${currentPage === totalPages ? 'disabled' : ''}>»</button>`
    html += `<span class="pagination-info">Página ${currentPage} de ${totalPages}</span>`

    container.innerHTML = html
  }

  renderPacks() {
    const container = document.getElementById('packs-grid')
    
    const allPacks = [
      ...this.productManager.packs.filter(p => p.inStock),
      ...(this.customPackManager ? this.customPackManager.getAllPacks() : [])
    ]

    let html = allPacks.map((pack, i) => {
      const { full, discounted } = this.productManager.getPackPrice(pack)
      const saved = (full - discounted).toFixed(2).replace('.', ',')

      const itemsHtml = pack.items.map(item => {
        const p = this.productManager.getPerfumeById(item.perfId)
        if (!p) return ''
        return `<div class="pack-item">
          <span class="pack-item-dot">◆</span>
          <span class="pack-item-name">${escapeHtml(p.name)} <span style="color:var(--muted);font-size:.7rem">(${escapeHtml(p.brand)})</span></span>
          <span class="pack-item-size">${item.size}ml</span>
        </div>`
      }).join('')

      const key = `pack-${pack.id}`
      const isCustom = pack.id.startsWith('custom-')
      const customActions = isCustom ? `
        <div class="custom-pack-actions">
          <button class="edit-pack-btn" id="edit-${pack.id}" data-pack-id="${pack.id}" title="Editar">✎</button>
          <button class="delete-pack-btn" id="delete-${pack.id}" data-pack-id="${pack.id}" title="Eliminar">✕</button>
        </div>
      ` : ''

      return `
      <div class="pack-card ${isCustom ? 'custom-pack-card' : ''}" style="animation-delay:${i * 0.06}s">
        <div class="pack-header">
          <span class="pack-tag">${escapeHtml(pack.icon)} ${escapeHtml(pack.tag)}</span>
          <h3 class="pack-name">${escapeHtml(pack.name)}</h3>
          <p class="pack-desc">${escapeHtml(pack.desc)}</p>
          ${customActions}
        </div>
        <div class="pack-items">${itemsHtml}</div>
        <div class="pack-footer">
          <div>
            <div class="pack-price"><span class="pack-original">${formatPrice(full)}</span>${formatPrice(discounted)}</div>
            <span class="pack-saving">✓ Ahorras ${saved} € con este pack</span>
          </div>
          <button class="add-btn" id="pbtn-${pack.id}" data-pack-id="${pack.id}">
            + Añadir
          </button>
        </div>
      </div>`
    }).join('')

    // Botón para crear nuevo pack personalizado - solo si no existe uno
    if (this.customPackManager) {
      const hasCustomPack = this.customPackManager.getAllPacks().length > 0
      if (!hasCustomPack) {
        html += `
        <div class="pack-card create-pack-card">
          <button class="create-pack-btn" id="create-custom-pack">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">+</div>
            <h3>Crea tu Pack</h3>
            <p>Personalizado</p>
            <p style="font-size: 0.75rem; color: var(--muted); margin-top: 0.5rem;">Elige los perfumes que quieras</p>
          </button>
        </div>
        `
      }
    }

    container.innerHTML = html
  }

  renderCart() {
    const container = document.getElementById('cart-items')
    const items = this.cartManager.getAllItems()
    const subtotal = this.cartManager.getTotal()
    const count = this.cartManager.getCount()
    
    // Calcular envío: gratis si >= 25, sino €3.95
    const freeShippingThreshold = 25
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : CONFIG.SHIPPING_COST
    const total = items.length === 0 ? 0 : subtotal + shippingCost
    const remaining = Math.max(0, freeShippingThreshold - subtotal)
    const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100)

    document.getElementById('cart-count').textContent = count
    document.getElementById('cart-subtotal').textContent = formatPrice(subtotal)
    
    // Mostrar/ocultar fila de envío según si hay items
    const shippingRow = document.getElementById('shipping-row')
    if (items.length === 0) {
      shippingRow.style.display = 'none'
      document.getElementById('cart-shipping').textContent = '0,00 €'
      document.getElementById('cart-shipping-label').textContent = 'Envío'
    } else {
      shippingRow.style.display = 'flex'
      document.getElementById('cart-shipping').textContent = shippingCost === 0 ? '¡Gratis!' : formatPrice(shippingCost)
      document.getElementById('cart-shipping-label').textContent = shippingCost === 0 ? '✓ Envío' : 'Envío'
    }
    
    document.getElementById('cart-total').textContent = formatPrice(total)

    // Generar barra de progreso de envío gratis
    let freeShippingBar = ''
    if (subtotal < freeShippingThreshold && items.length > 0) {
      freeShippingBar = `
        <div class="free-shipping-bar" style="margin-top: 1rem; padding: 1rem; background: var(--bg); border-radius: 6px;">
          <p style="font-size: 0.8rem; color: var(--muted); margin-bottom: 0.5rem;">
            Te faltan ${formatPrice(remaining)} para conseguir envío gratis
          </p>
          <div style="width: 100%; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden;">
            <div style="height: 100%; width: ${progressPercent}%; background: var(--accent); transition: width 0.3s ease;"></div>
          </div>
        </div>
      `
    } else if (subtotal >= freeShippingThreshold && items.length > 0) {
      freeShippingBar = `
        <div class="free-shipping-bar" style="margin-top: 1rem; padding: 1rem; background: #e8f5e9; border-radius: 6px; text-align: center;">
          <p style="font-size: 0.9rem; color: #2e7d32; font-weight: 500;">✓ ¡Envío gratis conseguido!</p>
        </div>
      `
    }

    if (items.length === 0) {
      container.innerHTML = `<div class="cart-empty">
        <div class="cart-empty-icon">◈</div>
        Tu cesta está vacía.<br>Añade algún decant para comenzar.
      </div>`
    } else {
      container.innerHTML = items.map(item => `
        <div class="cart-item">
          <div class="cart-item-info">
            <p class="cart-item-brand">${escapeHtml(item.brand)}</p>
            <p class="cart-item-name">${escapeHtml(item.name)}</p>
            <p class="cart-item-meta">${item.isPack ? 'Pack' : item.size + ' ml'} · ${formatPrice(item.price)} / ud.</p>
            ${item.packDetails ? `<p class="cart-item-details" style="font-size: 0.85rem; color: var(--muted); margin: 0.5rem 0 0.5rem 0; line-height: 1.4;">${escapeHtml(item.packDetails)}</p>` : ''}
            <div class="cart-item-controls">
              <button class="qty-btn" data-key="${item.key}" data-action="minus">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" data-key="${item.key}" data-action="plus">+</button>
              <button class="remove-btn" data-key="${item.key}">Eliminar</button>
            </div>
          </div>
          <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
        </div>`
      ).join('')
      container.innerHTML += freeShippingBar
    }
  }

  updateSearchResults(count) {
    const el = document.getElementById('search-results')
    if (this.productManager.currentSearchTerm) {
      el.textContent = `${count} resultado${count !== 1 ? 's' : ''}`
    } else {
      el.textContent = ''
    }
  }

  updateCartButtonState() {
    const items = this.cartManager.getAllItems()
    items.forEach(item => {
      if (item.isPack) {
        const btn = document.getElementById(`pbtn-${item.id}`)
        if (btn) {
          btn.classList.add('added')
          btn.textContent = '✓ Añadido'
        }
      } else {
        const btn = document.getElementById(`btn-${item.id}`)
        if (btn) {
          btn.classList.add('added')
          btn.textContent = '✓ Añadido'
        }
      }
    })
  }

  toggleCart() {
    const panel = document.getElementById('cart-panel')
    const overlay = document.getElementById('cart-overlay')
    panel.classList.toggle('open')
    overlay.classList.toggle('open')
  }

  renderBenefits(benefitsManager) {
    const container = document.getElementById('benefits-container')
    const benefits = benefitsManager.getBenefits()

    container.innerHTML = benefits.map(benefit => `
      <div class="benefit-card">
        <div class="benefit-icon">${benefit.icon}</div>
        <h3 class="benefit-title">${escapeHtml(benefit.title)}</h3>
        <p class="benefit-desc">${escapeHtml(benefit.description)}</p>
      </div>
    `).join('')
  }

  renderSocials() {
    const container = document.getElementById('footer-socials')
    if (!container) return

    const instagramUrl = 'https://www.instagram.com/anotherleveldecants?igsh=NnE5dW1wYWZzaDZp&utm_source=ig_contact_invite'
    const tiktokUrl = 'https://www.tiktok.com/@anotherleveldecants?_r=1&_t=ZN-9649KGfx2v8'
    const youtubeUrl = 'https://www.youtube.com/@anotherleveldecants?si=kRbl6exjxzkK7fqh'
    const facebookUrl = 'https://www.facebook.com/profile.php?id=61589278741557'
    const whatsappUrl = 'https://whatsapp.com/channel/0029Vb7n5uOEgGfVvQeuYo21'

    container.innerHTML = `
      <div class="social-links">
        <a href="${escapeHtml(instagramUrl)}" target="_blank" rel="noopener noreferrer" title="Instagram" class="social-link social-instagram">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
          </svg>
        </a>
        <a href="${escapeHtml(tiktokUrl)}" target="_blank" rel="noopener noreferrer" title="TikTok" class="social-link social-tiktok">
          <img src="/images/logo/logo-tiktok.webp" alt="TikTok" width="24" height="24" />
        </a>
        <a href="${escapeHtml(youtubeUrl)}" target="_blank" rel="noopener noreferrer" title="YouTube" class="social-link social-youtube">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>
        <a href="${escapeHtml(facebookUrl)}" target="_blank" rel="noopener noreferrer" title="Facebook" class="social-link social-facebook">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        <a href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noopener noreferrer" title="WhatsApp" class="social-link social-whatsapp">
          <img src="/images/logo/logo-whatsapp.webp" alt="WhatsApp" width="24" height="24" />
        </a>
      </div>
    `
  }

  renderCustomPackModal(editPackId = null) {
    const editPack = editPackId ? this.customPackManager.getPack(editPackId) : null
    const allPerfumes = this.productManager.perfumes.filter(p => p.inStock)

    const perfumeOptions = allPerfumes.map(p => `
      <option value="${p.id}" data-brand="${escapeHtml(p.brand)}" data-name="${escapeHtml(p.name)}">
        ${escapeHtml(p.brand)} - ${escapeHtml(p.name)}
      </option>
    `).join('')

    const modal = document.createElement('div')
    modal.id = 'custom-pack-modal'
    modal.className = 'modal-overlay-custom'
    modal.innerHTML = `
      <div class="modal-custom-content">
        <div class="modal-custom-header">
          <h2>${editPack ? 'Editar Pack Personalizado' : 'Crear Pack Personalizado'}</h2>
          <button class="modal-custom-close" id="close-custom-pack-modal">✕</button>
        </div>

        <div class="modal-custom-body">
          <p class="modal-custom-info">Selecciona los perfumes que deseas incluir en tu pack (mínimo 25 ml)</p>

          <div id="selected-items" class="selected-items-list">
            ${editPack ? editPack.items.map((item, i) => {
              const perf = this.productManager.getPerfumeById(item.perfId)
              return perf ? `
                <div class="selected-item" data-index="${i}">
                  <span>${escapeHtml(perf.brand)} - ${escapeHtml(perf.name)} · ${item.size}ml</span>
                  <button type="button" class="remove-item-btn" data-index="${i}">✕</button>
                </div>
              ` : ''
            }).join('') : ''}
          </div>

          <div class="add-perfume-section">
            <label>Agregar perfume:</label>
            <select id="perfume-select">
              <option value="">Elige un perfume...</option>
              ${perfumeOptions}
            </select>

            <div class="size-selector">
              <label>Tamaño:</label>
              <div class="size-buttons">
                <button type="button" class="size-btn" data-size="5">5 ml</button>
                <button type="button" class="size-btn" data-size="10">10 ml</button>
              </div>
            </div>

            <button type="button" id="add-perfume-btn" class="add-perfume-btn">+ Agregar perfume</button>
          </div>

          <div class="ml-counter">
            <strong>Total: <span id="total-ml">0</span> ml</strong>
            <span id="ml-warning" style="color: var(--muted); font-size: 0.8rem; display: none;">Mínimo 25 ml requerido</span>
          </div>

          <div id="price-display" style="padding: 1rem; background: var(--bg); border-radius: 6px; text-align: right; border: 1px solid var(--border);">
            <div style="font-size: 0.8rem; color: var(--muted);">Precio total del pack:</div>
            <div style="font-size: 1rem; color: var(--muted); margin-top: 0.3rem;">---</div>
          </div>
        </div>

        <div class="modal-custom-footer">
          <button type="button" class="btn-cancel" id="cancel-custom-pack">Cancelar</button>
          <button type="button" class="btn-create" id="save-custom-pack">${editPack ? 'Actualizar Pack' : 'Crear Pack'}</button>
        </div>
      </div>
    `

    document.body.appendChild(modal)
    return modal
  }
}

