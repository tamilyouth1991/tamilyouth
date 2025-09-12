import { sendOrderConfirmation } from "@/app/lib/mailer";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, message } = data || {};

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ ok: false, error: "Bitte Name, E-Mail und Nachricht angeben" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      return new Response(JSON.stringify({ ok: false, error: "SMTP nicht konfiguriert" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    const to = process.env.CONTACT_TO || process.env.SMTP_USER;

    await transporter.sendMail({
      from,
      to,
      subject: `Kontaktanfrage von ${name}`,
      replyTo: email,
      html: `<p><strong>Von:</strong> ${name} (${email})</p><p>${message.replace(/\n/g, "<br/>")}</p>`,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Ungültige Anfrage" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
