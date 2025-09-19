"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "../components/AuthProvider";
import { getFirebaseDb } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { IconCart, IconTruck } from "../components/Icons";

const CATALOG = [
  { id: "kottu", name: "Kottu Rotti", price: 14, desc: "Klassischer Street‑Food Favorit" },
  { id: "veggie-kottu", name: "Veggie Kottu Rotti", price: 13, desc: "Vegetarische Variante, frisch und würzig" },
  { id: "rolls", name: "Rolls (2 Stk)", price: 8, desc: "Knusprige Teigröllchen, 2 Stück" },
  { id: "biryani", name: "Chicken Biryani", price: 15, desc: "Aromatischer Reis mit Hühnchen" },
  { id: "mutton-curry", name: "Mutton Curry", price: 17, desc: "Zartes Lamm in würziger Sauce" },
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
  const submitRef = useRef(null);

  useEffect(() => {
    // Restore persisted state
    try {
      const saved = JSON.parse(localStorage.getItem("ty_cart_state") || "null");
      if (saved) {
        setCart(saved.cart || []);
        setDeliveryEnabled(Boolean(saved.deliveryEnabled));
        setAddress(saved.address || "");
        setCustomer(saved.customer || { name: "", phone: "", email: "" });
      }
    } catch {}
    if (preselect) {
      const found = CATALOG.find((c) => c.name.toLowerCase() === preselect.toLowerCase());
      if (found) addToCart(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Persist minimal state
    const data = { cart, deliveryEnabled, address, customer };
    try { localStorage.setItem("ty_cart_state", JSON.stringify(data)); } catch {}
  }, [cart, deliveryEnabled, address, customer]);

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

  function formatChf(value) {
    try {
      return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value);
    } catch {
      return `CHF ${Number(value).toFixed(2)}`;
    }
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
    // basic validation
    const emailOk = /.+@.+\..+/.test(customer.email);
    const phoneOk = /[0-9]{6,}/.test(customer.phone);
    if (!emailOk) {
      setStatus({ state: "error", message: "Bitte eine gültige E‑Mail eingeben." });
      return;
    }
    if (!phoneOk) {
      setStatus({ state: "error", message: "Bitte eine gültige Telefonnummer eingeben." });
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
      // Clear cart but keep contact for next time
      setCart([]);
      try { localStorage.removeItem("ty_cart_state"); } catch {}
      setTimeout(() => { router.push("/"); }, 1500);
    } catch (err) {
      setStatus({ state: "error", message: err.message || "Etwas ist schiefgelaufen." });
    }
  }

  return (
    <div className="section">
      <h1 className="hero-title">Bestellen</h1>
      <p className="hero-subtitle">Wähle Gerichte aus und schliesse deine Bestellung ab</p>

      {status.state !== "idle" && (
        <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 50 }}>
          <div className="tile" style={{ 
            borderColor: status.state === "error" ? "#ef4444" : status.state === 'loading' ? '#94a3b8' : "#10b981", 
            background: status.state === "error" ? "#fff7ed" : status.state === 'loading' ? '#f8fafc' : "#f0fdf4", 
            color: status.state === "error" ? "#7c2d12" : status.state === 'loading' ? '#0f172a' : "#14532d",
            minWidth: 280
          }}>
            {status.message}
          </div>
        </div>
      )}

      <div className="grid" style={{ marginTop: 8, gridTemplateColumns: "1.2fr 0.8fr" }}>
        <div className="soft">
          <div style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}><IconCart /> Gerichte</h3>
            <div className="grid" style={{ gap: 12 }}>
              {CATALOG.map((item) => {
                const inCart = cart.find((p) => p.id === item.id);
                return (
                  <div key={item.id} className="tile" style={{ overflow: "hidden" }}>
                    <div style={{ display: "grid", gap: 10 }}>
                      <div>
                        <div className="product-title" style={{ marginBottom: 4 }}>{item.name}</div>
                        <div className="product-meta" style={{ marginBottom: 6 }}>{item.desc}</div>
                        <div style={{ fontWeight: 800 }}>{formatChf(item.price)}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        {inCart ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <button className="button secondary" onClick={() => setQuantity(item.id, Math.max(1, (inCart.quantity || 1) - 1))} style={{ padding: "6px 10px" }}>−</button>
                            <input className="input" type="number" min="1" value={inCart.quantity} onChange={(e) => setQuantity(item.id, Number(e.target.value) || 1)} onWheel={(e) => e.currentTarget.blur()} style={{ width: 56, textAlign: "center" }} />
                            <button className="button" onClick={() => addToCart(item)} style={{ padding: "6px 10px" }}>+</button>
                            <button className="button secondary" onClick={() => removeFromCart(item.id)} style={{ padding: "6px 10px" }}>Entfernen</button>
                          </div>
                        ) : (
                          <button className="button" onClick={() => addToCart(item)} style={{ padding: "10px 12px" }}>Hinzufügen</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="soft">
          <div style={{ padding: 16, position: "sticky", top: 8 }}>
            <h3 style={{ marginBottom: 10 }}>Warenkorb & Checkout</h3>
            {cart.length === 0 ? (
              <p className="product-meta">Noch keine Artikel. Füge etwas hinzu.</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {cart.map((p) => (
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.2fr auto auto auto", gap: 8, alignItems: "center" }}>
                    <span>{p.name}</span>
                    <input className="input" type="number" min="1" value={p.quantity} onChange={(e) => setQuantity(p.id, Number(e.target.value) || 1)} onWheel={(e) => e.currentTarget.blur()} style={{ width: 72 }} />
                    <span style={{ fontWeight: 700 }}>{formatChf(p.price * p.quantity)}</span>
                    <button className="button secondary" onClick={() => removeFromCart(p.id)} style={{ padding: "8px 10px" }}>Entfernen</button>
                  </div>
                ))}
                <div className="divider" />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="product-meta">Zwischensumme</span>
                  <span>{formatChf(subtotal)}</span>
                </div>
              </div>
            )}

            <div className="divider" />

            <div className="form" style={{ marginTop: 4 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input id="delivery" type="checkbox" checked={deliveryEnabled} onChange={(e) => setDeliveryEnabled(e.target.checked)} />
                <label htmlFor="delivery" className="product-meta">Zustellen (+CHF 5 pro Gericht)</label>
              </div>
              {deliveryEnabled && (
                <input className="input" placeholder="Adresse für Lieferung" value={address} onChange={(e) => setAddress(e.target.value)} />
              )}

              <input className="input" placeholder="Name" value={customer.name} onChange={(e) => updateCustomer("name", e.target.value)} />
              <input className="input" placeholder="Telefon" value={customer.phone} onChange={(e) => updateCustomer("phone", e.target.value)} />
              <input className="input" type="email" placeholder="E-Mail" value={customer.email} onChange={(e) => updateCustomer("email", e.target.value)} />

              <div className="divider" />
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="product-meta">Lieferung</span>
                  <span>{deliveryEnabled ? formatChf(deliveryFee) : "-"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                  <span>Gesamt</span>
                  <span>{formatChf(total)}</span>
                </div>
              </div>

              <div className="wizard-actions">
                <button className="button" onClick={checkout} disabled={status.state === "loading" || cart.length === 0}>
                  {status.state === "loading" ? "Bestellen..." : `Zahlungspflichtig bestellen (${formatChf(total)})`}
                </button>
              </div>
            </div>

            {orderId && (
              <div className="tile" style={{ background: "#ecfeff", borderColor: "#06b6d4", marginTop: 10 }}>
                Bestellnummer: <strong>{orderId}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
