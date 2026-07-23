import Stripe from 'stripe'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const { items, coupon } = JSON.parse(event.body)

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.isPack
            ? `Pack: ${item.name}`
            : `${item.name} (${item.brand}) ${item.size}ml`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }))

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
    const shipping = subtotal >= 25 ? 0 : 395

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Envío a toda España' },
          unit_amount: shipping,
        },
        quantity: 1,
      })
    }

    // Generamos el texto detallado de los productos para enviarlo a la metadata
    const orderSummary = items.map(i => `${i.qty}x ${i.name} (${i.size}ml)`).join('\n')

    const sessionConfig = {
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.SITE_URL}/confirmacion.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/#catalogo`,
      locale: 'es',
      allow_promotion_codes: true,
      
      // 🚚 Obliga a Stripe a pedir la dirección de envío (Configurado para España)
      shipping_address_collection: {
        allowed_countries: ['ES'], 
      },
      
      // 📞 Obliga a Stripe a pedir el teléfono de contacto
      phone_number_collection: {
        enabled: true,
      },

      // 📋 Guardamos los datos clave en metadata para que los lea el Webhook
      metadata: {
        order_summary: orderSummary,
        items_count: items.reduce((sum, i) => sum + i.qty, 0).toString(),
        subtotal_eur: subtotal.toFixed(2),
        shipping_eur: (shipping / 100).toFixed(2)
      }
    }

    if (coupon) {
      sessionConfig.discounts = [{ coupon }]
      delete sessionConfig.allow_promotion_codes
      sessionConfig.metadata.coupon_used = coupon
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    }
  }
}