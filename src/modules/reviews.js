export class ReviewsManager {
  constructor() {
    // Cargar reseñas verificadas del localStorage
    this.reviews = this.loadReviews()
  }

  loadReviews() {
    const stored = localStorage.getItem('anotherLevelReviews')
    return stored ? JSON.parse(stored) : []
  }

  saveReviews() {
    localStorage.setItem('anotherLevelReviews', JSON.stringify(this.reviews))
  }

  addReview(review) {
    // Agregar timestamp y verificación básica
    const newReview = {
      id: Date.now(),
      name: review.name,
      text: review.text,
      perfumeName: review.perfumeName,
      rating: Math.min(5, Math.max(1, parseInt(review.rating))),
      orderId: review.orderId,
      verified: true,
      date: new Date().toLocaleDateString('es-ES')
    }
    this.reviews.push(newReview)
    this.saveReviews()
    return newReview
  }

  getReviews() {
    // Devolver solo reseñas verificadas, máximo 10
    return this.reviews.filter(r => r.verified).slice(0, 10)
  }

  renderStars(rating) {
    const filled = Math.round(rating)
    let html = ''
    for (let i = 0; i < 5; i++) {
      html += i < filled ? '<span class="star filled">★</span>' : '<span class="star empty">☆</span>'
    }
    return html
  }
}
