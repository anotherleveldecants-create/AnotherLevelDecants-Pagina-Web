export class BenefitsManager {
  constructor() {
    this.benefits = [
      {
        id: 1,
        icon: '📈',
        title: '100% Originales',
        description: 'Garantizamos la autenticidad de todos nuestros perfumes. Cada fragancia es cuidadosamente verificada para ofrecerte solo lo mejor'
      },
      {
        id: 2,
        icon: '🔒',
        title: 'Bizum · WhatsApp',
        description: 'Pago seguro y rápido. Confirmación instantánea por WhatsApp'
      },
      {
        id: 3,
        icon: '🚚',
        title: 'Envío a toda España',
        description: 'Desde 3,95€. Gratis a partir de 25€. Entrega rápida garantizada'
      }
    ]
  }

  getBenefits() {
    return this.benefits
  }
}
