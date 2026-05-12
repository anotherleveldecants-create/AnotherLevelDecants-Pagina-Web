import { escapeHtml, formatPrice, smoothScroll } from '../utils/helpers.js'
import { CONFIG } from '../config.js'

export class UIManager {
  constructor(productManager, cartManager) {
    this.productManager = productManager
    this.cartManager = cartManager
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
        const sz = this.productManager.getSelectedSize(p.id)
        const saving = ((p.price5 * 2) - p.price10).toFixed(2).replace('.', ',')
        const cur = sz === 5 ? p.price5 : p.price10
        const key = `${p.id}-${sz}`
        const inCart = this.cartManager.items.has(key)
        const cartItem = this.cartManager.items.get(key)
        const qty = cartItem ? cartItem.qty : 0

        return `
        <div class="card" data-gender="${escapeHtml(p.gender)}" style="animation-delay:${i * 0.05}s">
          <div class="card-visual">
            <img src="${p.image || '/images/placeholder.jpg'}" alt="${escapeHtml(p.name)}" class="card-image" onerror="this.style.display='none'" />
            <span class="card-icon">${escapeHtml(p.icon)}</span>
            <span class="card-badge badge-${escapeHtml(p.gender)}">${escapeHtml(p.gender.charAt(0).toUpperCase() + p.gender.slice(1))}</span>
          </div>
          <div class="card-body">
            <p class="card-brand">${escapeHtml(p.brand)}</p>
            <h3 class="card-name">${escapeHtml(p.name)}</h3>
            <p class="card-desc">${escapeHtml(p.desc)} <em>${escapeHtml(p.highlight)}</em></p>
            <div class="size-selector" data-perf-id="${p.id}">
              <div class="size-opt ${sz === 5 ? 'selected' : ''}" data-perf-id="${p.id}" data-size="5">
                5 ml<span class="size-price">${formatPrice(p.price5)}</span>
              </div>
              <div class="size-opt ${sz === 10 ? 'selected' : ''}" data-perf-id="${p.id}" data-size="10">
                10 ml<span class="size-price">${formatPrice(p.price10)}</span>
                <span class="size-save">Ahorras ${saving} €</span>
              </div>
            </div>
            <div class="card-footer">
              <div>
                <span class="card-price" id="price-${p.id}">${formatPrice(cur)}</span>
                <span class="card-ml" id="ml-${p.id}">${sz} ml · decant</span>
              </div>
              ${!inCart ? `
                <button class="add-btn" id="btn-${p.id}" data-perf-id="${p.id}">
                  + Añadir
                </button>
              ` : `
                <div class="qty-controls">
                  <button class="qty-btn qty-minus" id="minus-${p.id}" data-perf-id="${p.id}">−</button>
                  <span class="qty-display">${qty}</span>
                  <button class="qty-btn qty-plus" id="plus-${p.id}" data-perf-id="${p.id}">+</button>
                </div>
              `}
            </div>
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
    
    container.innerHTML = this.productManager.packs.map((pack, i) => {
      if (!pack.inStock) return ''
      
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
      const inCart = this.cartManager.items.has(key)

      return `
      <div class="pack-card" style="animation-delay:${i * 0.06}s">
        <div class="pack-header">
          <span class="pack-tag">${escapeHtml(pack.icon)} ${escapeHtml(pack.tag)}</span>
          <h3 class="pack-name">${escapeHtml(pack.name)}</h3>
          <p class="pack-desc">${escapeHtml(pack.desc)}</p>
        </div>
        <div class="pack-items">${itemsHtml}</div>
        <div class="pack-footer">
          <div>
            <div class="pack-price"><span class="pack-original">${formatPrice(full)}</span>${formatPrice(discounted)}</div>
            <span class="pack-saving">✓ Ahorras ${saved} € con este pack</span>
          </div>
          <button class="pack-add-btn ${inCart ? 'added' : ''}" id="pbtn-${pack.id}" data-pack-id="${pack.id}">
            ${inCart ? '✓ Añadido' : '+ Añadir'}
          </button>
        </div>
      </div>`
    }).join('')
  }

  renderCart() {
    const container = document.getElementById('cart-items')
    const items = this.cartManager.getAllItems()
    const total = this.cartManager.getTotal()
    const count = this.cartManager.getCount()

    document.getElementById('cart-count').textContent = count
    document.getElementById('cart-total').textContent = formatPrice(total)

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
    }

    this.updateWhatsAppLink()
  }

  updateWhatsAppLink() {
    const btn = document.getElementById('whatsapp-btn')
    if (this.cartManager.isEmpty()) {
      btn.setAttribute('href', '#')
      return
    }

    const msg = this.cartManager.getCheckoutMessage(this.productManager)
    btn.setAttribute('href', `https://wa.me/${CONFIG.WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`)
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
}
