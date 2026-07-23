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

    const sessionConfig = {
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.SITE_URL}/confirmacion.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/#catalogo`,
      locale: 'es',
      allow_promotion_codes: true,
    }

    if (coupon) {
      sessionConfig.discounts = [{ coupon }]
      delete sessionConfig.allow_promotion_codes
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