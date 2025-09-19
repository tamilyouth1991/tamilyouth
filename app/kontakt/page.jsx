"use client";

import { useState } from "react";
import { IconMail, IconMapPin, IconPhone } from "../components/Icons";

export default function KontaktPage() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  function update(field, value) { setValues((p) => ({ ...p, [field]: value })); }

  async function onSubmit(e) {
    e.preventDefault();
    if (!values.name || !values.email || !values.message) {
      setStatus({ state: "error", message: "Bitte alle Felder ausfüllen." });
      return;
    }
    setStatus({ state: "loading", message: "Wird gesendet..." });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Fehler");
      setStatus({ state: "success", message: "Danke! Wir melden uns bald." });
      setValues({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({ state: "error", message: err.message || "Etwas ist schiefgelaufen." });
    }
  }

  return (
    <div className="section">
      <section className="hero">
        <div>
          <h1 className="hero-title">Kontakt</h1>
          <p className="hero-subtitle">Wir sind für dich da – per Formular, E‑Mail oder Telefon.</p>
          <div className="hero-cta">
            <a href="mailto:hello@tamilyouth.ch" className="button"><IconMail />E‑Mail</a>
            <a href="tel:+41761234567" className="button secondary"><IconPhone />Anrufen</a>
          </div>
        </div>
        <div className="soft">
          <div style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><IconMapPin /> Öffnungszeiten & Standort</h3>
            <p className="product-meta">Mo–Sa: 11:00–21:00 • So: 12:00–20:00</p>
            <p className="product-meta">Musterstraße 1, 8000 Zürich</p>
            <div style={{ marginTop: 12 }}>
              <a className="button secondary" href="https://maps.google.com" target="_blank" rel="noreferrer">Route planen</a>
            </div>
          </div>
        </div>
      </section>

      {status.state !== "idle" && (
        <div className="tile" style={{ marginTop: 16, borderColor: status.state === "error" ? "#ef4444" : "#000080", background: "#fff" }}>
          {status.message}
        </div>
      )}

      <section className="grid section">
        <div className="soft">
          <div style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 10 }}>Schreib uns</h3>
            <form className="form" onSubmit={onSubmit}>
              <div>
                <label className="label" htmlFor="k-name">Name</label>
                <input id="k-name" className="input" value={values.name} onChange={(e) => update("name", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="k-email">E‑Mail</label>
                <input id="k-email" type="email" className="input" value={values.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="k-message">Nachricht</label>
                <textarea id="k-message" className="textarea" rows={6} value={values.message} onChange={(e) => update("message", e.target.value)} />
              </div>
              <button className="button" type="submit" disabled={status.state === "loading"}>
                {status.state === "loading" ? "Senden..." : "Nachricht senden"}
              </button>
            </form>
          </div>
        </div>
        <div className="soft">
          <div style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 10 }}>Folge uns</h3>
            <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <a className="tile" href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
              <a className="tile" href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
              <a className="tile" href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
              <a className="tile" href="https://whatsapp.com" target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
            <div className="section">
              <h3 style={{ marginBottom: 8 }}>Karte</h3>
              <div className="elevated" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", background: "#ecfeff", height: 220, display: "grid", placeItems: "center", color: "#334155" }}>
                Karte/Map-Embed Platzhalter
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
