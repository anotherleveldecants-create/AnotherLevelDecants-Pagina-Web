const Stripe = require('stripe')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const { items } = JSON.parse(event.body)

    const orderSummary = items
      .map(item => item.isPack
        ? `Pack: ${item.name} x${item.qty}`
        : `${item.name} (${item.brand}) ${item.size}ml x${item.qty}`)
      .join(' | ')

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
      metadata: {
        order_summary: orderSummary,
        items_count: String(items.reduce((sum, item) => sum + item.qty, 0)),
        subtotal_eur: subtotal.toFixed(2),
        shipping_eur: (shipping / 100).toFixed(2),
      },
      payment_intent_data: {
        metadata: {
          order_summary: orderSummary,
          items_count: String(items.reduce((sum, item) => sum + item.qty, 0)),
          subtotal_eur: subtotal.toFixed(2),
          shipping_eur: (shipping / 100).toFixed(2),
        },
      },
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
