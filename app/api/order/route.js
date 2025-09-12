import { sendOrderConfirmation } from "@/app/lib/mailer";

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `TY-${ts}-${rand}`;
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { items, delivery, customer } = data || {};

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "Warenkorb ist leer" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    if (!customer || !customer.name || !customer.phone || !customer.email) {
      return new Response(JSON.stringify({ ok: false, error: "Kundendaten unvollständig" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    if (delivery?.enabled && !delivery.address) {
      return new Response(JSON.stringify({ ok: false, error: "Adresse für Lieferung erforderlich" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const DELIVERY_FEE_PER_ITEM = 5; // CHF pro Gericht

    const subtotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0);
    const deliveryFee = delivery?.enabled ? (items.reduce((sum, it) => sum + (it.quantity || 0), 0) * DELIVERY_FEE_PER_ITEM) : 0;
    const total = subtotal + deliveryFee;

    const orderId = generateOrderId();

    // In echter App: persistieren (DB/Email)
    console.log("Order received", { orderId, items, delivery, customer, subtotal, deliveryFee, total });

    // Try sending confirmation email
    try {
      await sendOrderConfirmation({
        to: customer.email,
        orderId,
        items,
        subtotal,
        deliveryFee,
        total,
        delivery,
        customer,
      });
    } catch (mailErr) {
      console.error("Mail send failed", mailErr);
      // Do not fail the order if email fails
    }

    return new Response(JSON.stringify({ ok: true, orderId, subtotal, deliveryFee, total }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Ungültige Anfrage" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
