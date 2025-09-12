import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendOrderConfirmation({ to, orderId, items, subtotal, deliveryFee, total, delivery, customer }) {
  const transporter = getTransport();

  const itemsHtml = items
    .map((it) => `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${it.name} × ${it.quantity}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right">CHF ${(it.price * it.quantity).toFixed(2)}</td></tr>`)
    .join("");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a">
    <h2>Bestellbestätigung</h2>
    <p>Vielen Dank für Ihre Bestellung. Ihre Bestellnummer lautet <strong>${orderId}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:8px">${itemsHtml}</table>
    <p style="margin-top:8px">Zwischensumme: <strong>CHF ${subtotal.toFixed(2)}</strong><br/>
    Lieferung: <strong>CHF ${deliveryFee.toFixed(2)}</strong><br/>
    Gesamt: <strong>CHF ${total.toFixed(2)}</strong></p>
    <p>Lieferung: <strong>${delivery?.enabled ? `Ja – ${delivery.address}` : "Nein (Abholung)"}</strong></p>
    <p>Kunde: ${customer.name} – ${customer.phone} – ${customer.email}</p>
  </div>`;

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: `TamilYouth – Bestellbestätigung ${orderId}`,
    html,
  });
}
