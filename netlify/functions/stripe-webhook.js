import Stripe from 'stripe'

function formatOrderSummary(session) {
  // Extraemos la metadata que guardamos en la primera función
  const summary = session.metadata?.order_summary || 'Sin detalle de productos'
  const itemsCount = session.metadata?.items_count || '0'
  const subtotal = session.metadata?.subtotal_eur || '0.00'
  const shipping = session.metadata?.shipping_eur || '0.00'
  const total = session.amount_total ? (session.amount_total / 100).toFixed(2) : subtotal

  // Extraemos los datos de envío y contacto capturados por Stripe
  const customerName = session.shipping_details?.name || 'No disponible'
  const phone = session.customer_details?.phone || 'No disponible'
  const email = session.customer_details?.email || 'No disponible'
  
  // Construimos una dirección postal limpia y legible
  const address = session.shipping_details?.address
  const fullAddress = address 
    ? `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.postal_code}, ${address.city} (${address.state || ''})`
    : 'No disponible'

  // Mensaje final formateado para WhatsApp
  return `🎁 *¡NUEVO PEDIDO RECIBIDO!*\n\n` +
         `👤 *Cliente:* ${customerName}\n` +
         `📞 *Teléfono:* ${phone}\n` +
         `📧 *Email:* ${email}\n` +
         `📍 *Dirección de Envío:* ${fullAddress}\n\n` +
         `💰 *Total pagado:* *${total}€* (Envío: ${shipping}€)\n` +
         `📦 *Total Productos:* ${itemsCount}\n\n` +
         `📝 *Detalle del pedido:*\n${summary}`
}

async function sendWhatsappNotification(message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromPhone = process.env.TWILIO_PHONE_NUMBER
  const toPhone = process.env.NOTIFY_TO_WHATSAPP

  if (!accountSid || !authToken || !fromPhone || !toPhone) {
    throw new Error('Faltan TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER o NOTIFY_TO_WHATSAPP')
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `From=${encodeURIComponent(fromPhone)}&To=${encodeURIComponent(toPhone)}&Body=${encodeURIComponent(message)}`,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Twilio error: ${response.status} ${errorText}`)
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature']

    if (!signature) {
      return { statusCode: 400, body: 'Missing Stripe signature' }
    }

    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    if (stripeEvent.type !== 'checkout.session.completed') {
      return { statusCode: 200, body: JSON.stringify({ received: true }) }
    }

    const session = stripeEvent.data.object
    const message = formatOrderSummary(session)

    await sendWhatsappNotification(message)

    return { statusCode: 200, body: JSON.stringify({ received: true }) }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}