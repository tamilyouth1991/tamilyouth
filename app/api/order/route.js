import { sendOrderConfirmation } from "@/app/lib/mailer";
import { saveOrder, getOrders, getOrderStats, getOrderById, updateOrder, deleteOrder, getOrdersByPostalCode, getOrdersGroupedByPostalCode } from "@/app/lib/orders";

function generateOrderId() {
  return Math.floor(10000 + Math.random() * 90000).toString();
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

    // Complex pricing logic based on new policy
    const kotthuItems = items.filter(it => it.id === "vegi-kotthurotti" || it.id === "kotthurotti");
    const drinkItems = items.filter(it => it.id === "cola-dose" || it.id === "eistee-dose");
    
    let subtotal = 0;
    
    // Count total kotthu items
    const totalKotthuCount = kotthuItems.reduce((sum, it) => sum + (it.quantity || 0), 0);
    
    if (totalKotthuCount === 1) {
      // Single kotthu: veggi = 10, normal = 12
      const veggiCount = kotthuItems.find(it => it.id === "vegi-kotthurotti")?.quantity || 0;
      const normalCount = kotthuItems.find(it => it.id === "kotthurotti")?.quantity || 0;
      subtotal += veggiCount * 10 + normalCount * 12;
    } else if (totalKotthuCount === 2) {
      // Two kotthu items: 20 CHF total
      subtotal += 20;
    } else if (totalKotthuCount > 2) {
      // First two kotthu: 20 CHF, each additional: 10 CHF
      subtotal += 20 + (totalKotthuCount - 2) * 10;
    }
    
    // Add drinks at their regular price
    subtotal += drinkItems.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0);

    // Delivery fee: +4 CHF for single kotthu, +5 CHF for two kotthu, +2 CHF for each additional kotthu
    let deliveryFee = 0;
    if (delivery?.enabled) {
      if (totalKotthuCount === 1) {
        deliveryFee = 4; // +4 CHF for single kotthu
      } else if (totalKotthuCount === 2) {
        deliveryFee = 5; // +5 CHF for two kotthu
      } else if (totalKotthuCount > 2) {
        deliveryFee = 5 + (totalKotthuCount - 2) * 2; // +5 CHF for first two, +2 CHF for each additional
      }
    }
    
    const total = subtotal + deliveryFee;

    const orderId = generateOrderId();

    // Persist lightweight
    saveOrder({ orderId, items, delivery, customer, subtotal, deliveryFee, total });

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

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const postalCode = url.searchParams.get('postalCode');
    const grouped = url.searchParams.get('grouped') === 'true';
    
    let list, stats;
    
    if (grouped) {
      list = getOrdersGroupedByPostalCode();
      stats = getOrderStats();
    } else if (postalCode) {
      list = getOrdersByPostalCode(postalCode);
      stats = getOrderStats();
    } else {
      list = getOrders();
      stats = getOrderStats();
    }
    
    return new Response(JSON.stringify({ ok: true, orders: list, stats }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Fehler beim Laden" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { orderId, updates } = data || {};

    if (!orderId) {
      return new Response(JSON.stringify({ ok: false, error: "Bestellnummer erforderlich" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const updatedOrder = updateOrder(orderId, updates);
    if (!updatedOrder) {
      return new Response(JSON.stringify({ ok: false, error: "Bestellung nicht gefunden" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, order: updatedOrder }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Ungültige Anfrage" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');

    if (!orderId) {
      return new Response(JSON.stringify({ ok: false, error: "Bestellnummer erforderlich" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const deletedOrder = deleteOrder(orderId);
    if (!deletedOrder) {
      return new Response(JSON.stringify({ ok: false, error: "Bestellung nicht gefunden" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, message: "Bestellung gelöscht" }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Ungültige Anfrage" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
