import nodemailer from "nodemailer";

function getTransport() {
  // Gmail SMTP Konfiguration für tamilyouth1991@gmail.com
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || "tamilyouth1991@gmail.com";
  const pass = process.env.SMTP_PASS;

  if (!pass) {
    throw new Error("SMTP_PASS environment variable is required for Gmail authentication");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export async function sendOrderConfirmation({ to, orderId, items, subtotal, deliveryFee, total, delivery, customer }) {
  const transporter = getTransport();

  // Wunderschöne HTML-E-Mail-Vorlage
  const itemsHtml = items
    .map((it) => `
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; font-size: 16px; color: #1f2937;">
          <div style="font-weight: 600; margin-bottom: 4px;">${it.name}</div>
          <div style="font-size: 14px; color: #6b7280;">Menge: ${it.quantity}</div>
        </td>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 700; color: #000080; font-size: 16px;">
          CHF ${(it.price * it.quantity).toFixed(2)}
        </td>
      </tr>
    `)
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TamilYouth - Bestellbestätigung</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #000080 0%, #1e40af 100%); padding: 32px 24px; text-align: center;">
          <div style="display: inline-flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.2); padding: 12px 20px; border-radius: 16px; backdrop-filter: blur(10px);">
            <div style="width: 32px; height: 32px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">🍛</div>
            <span style="color: white; font-size: 24px; font-weight: 800;">TamilYouth</span>
          </div>
          <h1 style="color: white; font-size: 28px; font-weight: 900; margin: 24px 0 8px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">
            Bestellung bestätigt! ✅
          </h1>
          <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">
            Vielen Dank für deine Bestellung bei TamilYouth
          </p>
        </div>

        <!-- Order Info -->
        <div style="padding: 32px 24px; background: linear-gradient(135deg, rgba(0, 0, 128, 0.05) 0%, rgba(0, 0, 128, 0.02) 100%);">
          <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="background: #000080; color: white; padding: 12px 24px; border-radius: 12px; display: inline-block; font-weight: 800; font-size: 18px;">
                Bestellnummer: ${orderId}
              </div>
            </div>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #1f2937; font-size: 18px; font-weight: 700; margin: 0 0 16px; display: flex; align-items: center; gap: 8px;">
                📋 Bestellübersicht
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
              </table>
            </div>

            <!-- Pricing -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #1f2937; font-size: 18px; font-weight: 700; margin: 0 0 16px;">💰 Preisübersicht</h3>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 16px;">Zwischensumme</span>
                <span style="font-weight: 600; color: #1f2937; font-size: 16px;">CHF ${subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 16px;">Lieferung</span>
                <span style="font-weight: 600; color: #1f2937; font-size: 16px;">${deliveryFee > 0 ? `CHF ${deliveryFee.toFixed(2)}` : 'Gratis'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0 0; border-top: 2px solid #000080; margin-top: 8px;">
                <span style="font-weight: 800; color: #000080; font-size: 20px;">Gesamt</span>
                <span style="font-weight: 800; color: #000080; font-size: 20px;">CHF ${total.toFixed(2)}</span>
              </div>
            </div>

            <!-- Delivery Info -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #1f2937; font-size: 18px; font-weight: 700; margin: 0 0 16px; display: flex; align-items: center; gap: 8px;">
                ${delivery?.enabled ? '🚚' : '🏪'} ${delivery?.enabled ? 'Lieferung' : 'Abholung'}
              </h3>
              <div style="background: white; border-radius: 8px; padding: 16px; border-left: 4px solid #000080;">
                <p style="margin: 0; font-size: 16px; color: #1f2937; font-weight: 600;">
                  ${delivery?.enabled ? `Lieferung an: ${delivery.address}` : 'Abholung im Restaurant'}
                </p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">
                  ${delivery?.enabled ? 'Dein Essen wird frisch zubereitet und geliefert.' : 'Dein Essen wird frisch zubereitet und ist zur Abholung bereit.'}
                </p>
              </div>
            </div>

            <!-- Customer Info -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px;">
              <h3 style="color: #1f2937; font-size: 18px; font-weight: 700; margin: 0 0 16px; display: flex; align-items: center; gap: 8px;">
                👤 Kontaktdaten
              </h3>
              <div style="background: white; border-radius: 8px; padding: 16px;">
                <div style="margin-bottom: 8px;">
                  <span style="font-weight: 600; color: #1f2937;">Name:</span>
                  <span style="color: #6b7280; margin-left: 8px;">${customer.name}</span>
                </div>
                <div style="margin-bottom: 8px;">
                  <span style="font-weight: 600; color: #1f2937;">Telefon:</span>
                  <span style="color: #6b7280; margin-left: 8px;">${customer.phone}</span>
                </div>
                <div>
                  <span style="font-weight: 600; color: #1f2937;">E-Mail:</span>
                  <span style="color: #6b7280; margin-left: 8px;">${customer.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #1f2937; padding: 32px 24px; text-align: center;">
          <div style="color: white; font-size: 18px; font-weight: 700; margin-bottom: 8px;">🍛 TamilYouth</div>
          <p style="color: #9ca3af; font-size: 14px; margin: 0 0 16px;">
            Frisches tamilisches Essen – schnell und lecker
          </p>
          <div style="border-top: 1px solid #374151; padding-top: 16px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} TamilYouth. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const from = process.env.MAIL_FROM || "tamilyouth1991@gmail.com";

  await transporter.sendMail({
    from: `"TamilYouth" <${from}>`,
    to,
    subject: `🍛 TamilYouth - Bestellbestätigung ${orderId}`,
    html,
  });
}
