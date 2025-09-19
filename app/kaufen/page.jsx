"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { getFirebaseDb } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { IconCart, IconTruck } from "../components/Icons";

const CATALOG = [
  { id: "kottu", name: "Kottu Rotti", price: 14 },
  { id: "veggie-kottu", name: "Veggie Kottu Rotti", price: 13 },
  { id: "rolls", name: "Rolls (2 Stk)", price: 8 },
  { id: "biryani", name: "Chicken Biryani", price: 15 },
  { id: "mutton-curry", name: "Mutton Curry", price: 17 },
];

export default function KaufenPage() {
  const { user } = useAuth();
  const params = useSearchParams();
  const preselect = params.get("produkt");
  const router = useRouter();

  const [step, setStep] = useState(1); // 1: Produkte, 2: Lieferung, 3: Daten & Prüfen
  const [cart, setCart] = useState([]); // {id, name, price, quantity}
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [address, setAddress] = useState("");
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (preselect) {
      const found = CATALOG.find((c) => c.name.toLowerCase() === preselect.toLowerCase());
      if (found) addToCart(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefill customer from saved profile or Firebase user
  useEffect(() => {
    async function hydrate() {
      if (!user) return;
      const db = getFirebaseDb();
      const ref = doc(db, "profiles", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const prof = snap.data();
        setAddress((prev) => (prev || prof.address || ""));
        setCustomer((p) => ({ ...p, name: prof.name || p.name, phone: prof.phone || p.phone, email: user.email || p.email }));
      } else {
        setCustomer((p) => ({ ...p, name: user.displayName || p.name, email: user.email || p.email }));
      }
    }
    hydrate();
  }, [user]);

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((p) => p.id !== id));
  }

  function setQuantity(id, q) {
    setCart((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, q) } : p)));
  }

  const subtotal = useMemo(() => cart.reduce((sum, p) => sum + p.price * p.quantity, 0), [cart]);
  const itemsCount = useMemo(() => cart.reduce((sum, p) => sum + p.quantity, 0), [cart]);
  const deliveryFee = deliveryEnabled ? itemsCount * 5 : 0; // CHF 5 pro Gericht
  const total = subtotal + deliveryFee;

  function updateCustomer(field, value) {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  }

  function nextStep() {
    if (step === 1) {
      if (cart.length === 0) {
        setStatus({ state: "error", message: "Bitte füge mindestens ein Gericht hinzu." });
        return;
      }
    }
    if (step === 2) {
      if (deliveryEnabled && !address) {
        setStatus({ state: "error", message: "Adresse für Lieferung erforderlich." });
        return;
      }
    }
    setStatus({ state: "idle", message: "" });
    setStep((s) => Math.min(3, s + 1));
  }

  function prevStep() {
    setStatus({ state: "idle", message: "" });
    setStep((s) => Math.max(1, s - 1));
  }

  async function checkout(e) {
    e?.preventDefault?.();
    if (!customer.name || !customer.phone || !customer.email) {
      setStatus({ state: "error", message: "Name, Telefon und E-Mail sind erforderlich." });
      return;
    }
    if (deliveryEnabled && !address) {
      setStatus({ state: "error", message: "Adresse für Lieferung erforderlich." });
      return;
    }

    setStatus({ state: "loading", message: "Bestellung wird gesendet..." });
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          delivery: { enabled: deliveryEnabled, address },
          customer,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Fehler");

      setOrderId(json.orderId);
      setStatus({ state: "success", message: `Bestellung erfolgreich. Nr: ${json.orderId}` });
      setTimeout(() => { router.push("/"); }, 1600);
    } catch (err) {
      setStatus({ state: "error", message: err.message || "Etwas ist schiefgelaufen." });
    }
  }

  return (
    <div className="section">
      <h1 className="hero-title">Jetzt kaufen</h1>
      <p className="hero-subtitle">3 Schritte: Gerichte → Lieferung → Daten & Prüfen</p>

      <div className="stepper">
        <div className={`step ${step === 1 ? "active" : ""}`}><span className="num">1</span><span>Gerichte</span></div>
        <div className={`step ${step === 2 ? "active" : ""}`}><span className="num">2</span><span>Lieferung</span></div>
        <div className={`step ${step === 3 ? "active" : ""}`}><span className="num">3</span><span>Daten & Prüfen</span></div>
      </div>

      {status.state === "error" && (
        <div className="tile" style={{ borderColor: "#ef4444", background: "#fff7ed", color: "#7c2d12", marginBottom: 12 }}>
          {status.message}
        </div>
      )}

      {step === 1 && (
        <div className="grid" style={{ marginTop: 8 }}>
          <div className="soft">
            <div style={{ padding: 16 }}>
              <h3 style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}><IconCart /> Gerichte</h3>
              <div className="grid" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
                {CATALOG.map((item) => (
                  <div key={item.id} className="tile" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="product-title">{item.name}</div>
                      <div className="product-meta">CHF {item.price.toFixed(2)}</div>
                    </div>
                    <button className="button" onClick={() => addToCart(item)} style={{ padding: "10px 12px" }}>Hinzufügen</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="soft">
            <div style={{ padding: 16 }}>
              <h3 style={{ marginBottom: 10 }}>Warenkorb</h3>
              {cart.length === 0 ? (
                <p className="product-meta">Noch keine Artikel. Füge etwas hinzu.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {cart.map((p) => (
                    <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, alignItems: "center" }}>
                      <span>{p.name}</span>
                      <input className="input" type="number" min="1" value={p.quantity} onChange={(e) => setQuantity(p.id, Number(e.target.value))} style={{ width: 72 }} />
                      <span style={{ fontWeight: 700 }}>CHF {(p.price * p.quantity).toFixed(2)}</span>
                      <button className="button secondary" onClick={() => removeFromCart(p.id)} style={{ padding: "8px 10px" }}>Entfernen</button>
                    </div>
                  ))}
                  <div className="divider" />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="product-meta">Zwischensumme</span>
                    <span>CHF {subtotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <div className="wizard-actions">
                <button className="button" onClick={nextStep} disabled={cart.length === 0}>Weiter</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="soft" style={{ marginTop: 8 }}>
          <div style={{ padding: 16 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><IconTruck /> Lieferoption</h3>
            <div className="form" style={{ marginTop: 10 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input id="delivery" type="checkbox" checked={deliveryEnabled} onChange={(e) => setDeliveryEnabled(e.target.checked)} />
                <label htmlFor="delivery" className="product-meta">Zustellen (+CHF 5 pro Gericht)</label>
              </div>
              {deliveryEnabled && (
                <input className="input" placeholder="Adresse für Lieferung" value={address} onChange={(e) => setAddress(e.target.value)} />
              )}
              <div className="wizard-actions">
                <button className="button secondary" onClick={prevStep}>Zurück</button>
                <button className="button" onClick={nextStep}>Weiter</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid" style={{ marginTop: 8 }}>
          <div className="soft">
            <div style={{ padding: 16 }}>
              <h3>Deine Daten</h3>
              <form className="form" onSubmit={checkout}>
                <input className="input" placeholder="Name" value={customer.name} onChange={(e) => updateCustomer("name", e.target.value)} />
                <input className="input" placeholder="Telefon" value={customer.phone} onChange={(e) => updateCustomer("phone", e.target.value)} />
                <input className="input" type="email" placeholder="E-Mail" value={customer.email} onChange={(e) => updateCustomer("email", e.target.value)} />

                <div className="wizard-actions">
                  <button className="button secondary" type="button" onClick={prevStep}>Zurück</button>
                  <button className="button" type="submit" disabled={status.state === "loading"}>
                    {status.state === "loading" ? "Bestellen..." : `Zahlungspflichtig bestellen (CHF ${total.toFixed(2)})`}
                  </button>
                </div>

                {status.state !== "idle" && (
                  <p style={{ color: status.state === "error" ? "#b91c1c" : "#000080" }}>{status.message}</p>
                )}
              </form>
            </div>
          </div>
          <div className="soft">
            <div style={{ padding: 16 }}>
              <h3>Übersicht</h3>
              {cart.length === 0 ? (
                <p className="product-meta">Warenkorb ist leer</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {cart.map((p) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{p.name} × {p.quantity}</span>
                      <span>CHF {(p.price * p.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="divider" />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="product-meta">Zwischensumme</span>
                    <span>CHF {subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="product-meta">Lieferung</span>
                    <span>{deliveryEnabled ? `CHF ${deliveryFee.toFixed(2)}` : "-"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                    <span>Gesamt</span>
                    <span>CHF {total.toFixed(2)}</span>
                  </div>
                  {orderId && (
                    <div className="tile" style={{ background: "#ecfeff", borderColor: "#06b6d4" }}>
                      Bestellnummer: <strong>{orderId}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
