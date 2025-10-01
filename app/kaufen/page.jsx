"use client";

import { useEffect, useMemo, useState, useRef, Suspense } from "react";
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

function KaufenPageContent() {
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
    <div className="kaufen-container">
      {/* Mobile Header */}
      <div className="kaufen-header">
        <h1 className="kaufen-title">Bestellen</h1>
        <p className="kaufen-subtitle">Wähle Gerichte aus und schließe deine Bestellung ab</p>
        
        {/* Mobile Cart Summary */}
        {cart.length > 0 && (
          <div className="mobile-cart-summary">
            <div className="cart-items-count">
              <IconCart size={20} />
              <span>{itemsCount} Artikel</span>
            </div>
            <div className="cart-total">
              {formatChf(total)}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Status Toast */}
      {status.state !== "idle" && (
        <div className="mobile-status-toast">
          <div className={`status-toast ${status.state}`}>
            <div className="status-icon">
              {status.state === "loading" && <div className="loading-spinner" />}
              {status.state === "error" && "⚠️"}
              {status.state === "success" && "✅"}
            </div>
            <span className="status-message">{status.message}</span>
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      <div className="kaufen-layout">
        {/* Products Section */}
        <div className="products-section">
          <div className="products-header">
            <h2 className="section-title">
              <IconCart size={24} />
              Gerichte
            </h2>
          </div>
          
          <div className="products-grid">
            {CATALOG.map((item) => {
              const inCart = cart.find((p) => p.id === item.id);
              return (
                <div key={item.id} className="product-card-mobile">
                  <div className="product-info">
                    <h3 className="product-name">{item.name}</h3>
                    <p className="product-description">{item.desc}</p>
                    <div className="product-price">{formatChf(item.price)}</div>
                  </div>
                  
                  <div className="product-actions">
                    {inCart ? (
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn minus" 
                          onClick={() => setQuantity(item.id, Math.max(1, (inCart.quantity || 1) - 1))}
                          aria-label="Menge reduzieren"
                        >
                          −
                        </button>
                        <span className="quantity-display">{inCart.quantity}</span>
                        <button 
                          className="quantity-btn plus" 
                          onClick={() => addToCart(item)}
                          aria-label="Menge erhöhen"
                        >
                          +
                        </button>
                        <button 
                          className="remove-btn" 
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Entfernen"
                        >
                          🗑️
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="add-to-cart-btn" 
                        onClick={() => addToCart(item)}
                      >
                        Hinzufügen
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart & Checkout Section */}
        <div className="cart-section">
          <div className="cart-header">
            <h2 className="section-title">Warenkorb & Checkout</h2>
            {cart.length > 0 && (
              <div className="cart-summary">
                <span className="items-count">{itemsCount} Artikel</span>
                <span className="total-price">{formatChf(total)}</span>
              </div>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <IconCart size={48} />
              <h3>Warenkorb ist leer</h3>
              <p>Füge leckere Gerichte hinzu!</p>
            </div>
          ) : (
            <div className="cart-content">
              {/* Cart Items */}
              <div className="cart-items">
                {cart.map((p) => (
                  <div key={p.id} className="cart-item-mobile">
                    <div className="item-header">
                      <span className="item-name">{p.name}</span>
                      <button 
                        className="remove-btn" 
                        onClick={() => removeFromCart(p.id)}
                        aria-label="Artikel entfernen"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="item-details">
                      <div className="item-price-info">
                        <span className="item-unit-price">{formatChf(p.price)} pro Stück</span>
                        <span className="item-total-price">{formatChf(p.price * p.quantity)}</span>
                      </div>
                      
                      <div className="item-quantity-controls">
                        <button 
                          className="quantity-btn minus" 
                          onClick={() => setQuantity(p.id, Math.max(1, p.quantity - 1))}
                          aria-label="Menge reduzieren"
                        >
                          −
                        </button>
                        <span className="quantity-display">{p.quantity}</span>
                        <button 
                          className="quantity-btn plus" 
                          onClick={() => addToCart(CATALOG.find(item => item.id === p.id))}
                          aria-label="Menge erhöhen"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Options */}
              <div className="delivery-section">
                <div className="delivery-toggle">
                  <input 
                    id="delivery" 
                    type="checkbox" 
                    checked={deliveryEnabled} 
                    onChange={(e) => setDeliveryEnabled(e.target.checked)}
                    className="delivery-checkbox"
                  />
                  <label htmlFor="delivery" className="delivery-label">
                    <IconTruck size={20} />
                    <span>Lieferung (+CHF 5 pro Gericht)</span>
                  </label>
                </div>
                
                {deliveryEnabled && (
                  <div className="address-input">
                    <input 
                      className="input" 
                      placeholder="Lieferadresse eingeben" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="customer-section">
                <h3 className="section-subtitle">Kontaktdaten</h3>
                <div className="customer-form">
                  <input 
                    className="input" 
                    placeholder="Vollständiger Name" 
                    value={customer.name} 
                    onChange={(e) => updateCustomer("name", e.target.value)}
                  />
                  <input 
                    className="input" 
                    placeholder="Telefonnummer" 
                    value={customer.phone} 
                    onChange={(e) => updateCustomer("phone", e.target.value)}
                  />
                  <input 
                    className="input" 
                    type="email" 
                    placeholder="E-Mail-Adresse" 
                    value={customer.email} 
                    onChange={(e) => updateCustomer("email", e.target.value)}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="order-summary">
                <div className="summary-row">
                  <span>Zwischensumme</span>
                  <span>{formatChf(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Lieferung</span>
                  <span>{deliveryEnabled ? formatChf(deliveryFee) : "Gratis"}</span>
                </div>
                <div className="summary-row total">
                  <span>Gesamt</span>
                  <span>{formatChf(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button 
                className="checkout-btn" 
                onClick={checkout} 
                disabled={status.state === "loading" || cart.length === 0}
              >
                {status.state === "loading" ? (
                  <>
                    <div className="loading-spinner" />
                    Bestellung wird gesendet...
                  </>
                ) : (
                  `Bestellen für ${formatChf(total)}`
                )}
              </button>

              {/* Order Confirmation */}
              {orderId && (
                <div className="order-confirmation">
                  <div className="confirmation-icon">✅</div>
                  <h3>Bestellung erfolgreich!</h3>
                  <p>Bestellnummer: <strong>{orderId}</strong></p>
                  <p>Du erhältst eine Bestätigung per E-Mail.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KaufenPage() {
  return (
    <Suspense fallback={<div className="section"><h1 className="hero-title">Bestellen</h1><p className="hero-subtitle">Lade...</p></div>}>
      <KaufenPageContent />
    </Suspense>
  );
}
