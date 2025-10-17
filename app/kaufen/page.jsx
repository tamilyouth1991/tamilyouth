"use client";

import { useEffect, useMemo, useState, useRef, Suspense } from "react";
import { useAuth } from "../components/AuthProvider";
import { getFirebaseDb } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { IconCart, IconTruck, IconMapPin, IconUser, IconPhone, IconMail } from "../components/Icons";
import Breadcrumbs from "../components/Breadcrumbs";
import "./kaufen.css";

const CATALOG = [
  { 
    id: "kotthurotti", 
    name: "Kotthurotti", 
    price: 12, 
    desc: "Klassisches Kotthurotti mit Fleisch.",
    category: "Beliebt"
  },
  { 
    id: "cola-dose", 
    name: "Cola Dose", 
    price: 3.5, 
    desc: "Erfrischende Cola Dose.",
    category: "Getränk"
  },
  { 
    id: "eistee-dose", 
    name: "Eistee Dose", 
    price: 3.5, 
    desc: "Süßer Eistee zum Essen.",
    category: "Getränk"
  },
];

function KaufenPageContent() {
  const { user } = useAuth();
  const params = useSearchParams();
  const preselect = params.get("produkt");
  const router = useRouter();

  const [cart, setCart] = useState([]);
  const [deliveryOption, setDeliveryOption] = useState(null); // null, "pickup", or "delivery"
  const [address, setAddress] = useState({
    street: "",
    houseNumber: "",
    city: "",
    postalCode: ""
  });
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // Restore persisted state
    /*
    Ein veggi kotthu kostet 10fr und wenn man es bestellt kostet es 4fr plus. ein normaler kotthu kostet 12fr un dwenn man es bestellt kostet es 4franken mehr. wenn man 2 gerichte also veggi kotthu oder normaler kotthu bestellt dann kostet es 20fr und wenn man es bestellt dan 25 fr. Jede weitere gericht kostet wenn 10fr und wenn man liefern auswählt kostet jede weitere gericht 12fr.
    */
    try {
      const saved = JSON.parse(localStorage.getItem("ty_cart_state") || "null");
      if (saved) {
        setCart(saved.cart || []);
        setDeliveryOption(saved.deliveryOption || null);
        setAddress(saved.address || {
          street: "",
          houseNumber: "",
          city: "",
          postalCode: ""
        });
        setCustomer(saved.customer || { name: "", phone: "", email: "" });
      }
    } catch {}
    
    if (preselect) {
      const found = CATALOG.find((c) => c.name.toLowerCase() === preselect.toLowerCase());
      if (found) addToCart(found);
    }
  }, [preselect]);

  useEffect(() => {
    // Persist minimal state
    const data = { cart, deliveryOption, address, customer };
    try { localStorage.setItem("ty_cart_state", JSON.stringify(data)); } catch {}
  }, [cart, deliveryOption, address, customer]);

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
        setCustomer((p) => ({ 
          ...p, 
          name: prof.name || p.name, 
          phone: prof.phone || p.phone, 
          email: user.email || p.email 
        }));
      } else {
        setCustomer((p) => ({ 
          ...p, 
          name: user.displayName || p.name, 
          email: user.email || p.email 
        }));
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

  // Complex pricing logic based on new policy
  const subtotal = useMemo(() => {
    const kotthuItems = cart.filter(p => p.id === "kotthurotti");
    const drinkItems = cart.filter(p => p.id === "cola-dose" || p.id === "eistee-dose");
    
    let total = 0;
    
    // Count total kotthu items
    const totalKotthuCount = kotthuItems.reduce((sum, p) => sum + p.quantity, 0);
    
    if (totalKotthuCount === 1) {
      // Single kotthu: 12 CHF
      total += totalKotthuCount * 12;
    } else if (totalKotthuCount === 2) {
      // Two kotthu items: 20 CHF total
      total += 20;
    } else if (totalKotthuCount > 2) {
      // First two kotthu: 20 CHF, each additional: 10 CHF
      total += 20 + (totalKotthuCount - 2) * 10;
    }
    
    // Add drinks at their regular price
    total += drinkItems.reduce((sum, p) => sum + p.price * p.quantity, 0);
    
    return total;
  }, [cart]);
  
  const itemsCount = useMemo(() => cart.reduce((sum, p) => sum + p.quantity, 0), [cart]);
  
  // Delivery fee: +4 CHF for single kotthu, +5 CHF for two kotthu, +2 CHF for each additional kotthu
  const deliveryFee = useMemo(() => {
    if (deliveryOption !== "delivery") return 0;
    
    const kotthuItems = cart.filter(p => p.id === "kotthurotti");
    const totalKotthuCount = kotthuItems.reduce((sum, p) => sum + p.quantity, 0);
    
    if (totalKotthuCount === 1) {
      return 4; // +4 CHF for single kotthu
    } else if (totalKotthuCount === 2) {
      return 5; // +5 CHF for two kotthu
    } else if (totalKotthuCount > 2) {
      return 5 + (totalKotthuCount - 2) * 2; // +5 CHF for first two, +2 CHF for each additional
    }
    
    return 0;
  }, [cart, deliveryOption]);
  
  const total = subtotal + deliveryFee;

  function updateCustomer(field, value) {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  }

  function updateAddress(field, value) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  function closeStatusMessage() {
    setStatus({ state: "idle", message: "" });
  }

  async function checkout(e) {
    e?.preventDefault?.();
    
    if (cart.length === 0) {
      setStatus({ state: "error", message: "Bitte füge mindestens ein Gericht hinzu." });
      return;
    }
    
    if (!customer.name || !customer.phone || !customer.email) {
      setStatus({ state: "error", message: "Name, Telefon und E-Mail sind erforderlich." });
      return;
    }
    
    if (!deliveryOption) {
      setStatus({ state: "error", message: "Bitte wähle Abholung oder Lieferung aus." });
      return;
    }
    
    if (deliveryOption === "delivery") {
      if (!address.street || !address.houseNumber || !address.city || !address.postalCode) {
        setStatus({ state: "error", message: "Bitte fülle alle Adressfelder aus." });
        return;
      }
      
      // Postleitzahl validieren (Schweiz: 4 Ziffern)
      if (!/^\d{4}$/.test(address.postalCode)) {
        setStatus({ state: "error", message: "Bitte gib eine gültige Postleitzahl ein (4 Ziffern)." });
        return;
      }
    }

    // Basic validation
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

    setStatus({ state: "loading", message: "Bestellung wird gesendet..." });
    
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          delivery: { 
            enabled: deliveryOption === "delivery", 
            address: deliveryOption === "delivery" 
              ? `${address.street} ${address.houseNumber}, ${address.postalCode} ${address.city}`
              : ""
          },
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
      setTimeout(() => { router.push("/"); }, 2000);
    } catch (err) {
      setStatus({ state: "error", message: err.message || "Etwas ist schiefgelaufen." });
    }
  }

  return (
    <div className="order-page">
      <Breadcrumbs items={[{ label: "Kotthurotti bestellen" }]} />
      
      {/* Header Section */}
      <div className="order-header">
        <div className="order-header-content">
          <h1 className="order-title">Bestelle jetzt</h1>
          <p className="order-subtitle">Unterstütze unser Jubiläums-Hallenturnier mit authentischem Sri Lanka Essen</p>
          
          <div className="order-stats">
            <div className="stat-item">
              <span className="stat-number">{itemsCount}</span>
              <span className="stat-label">Artikel im Warenkorb</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{formatChf(total)}</span>
              <span className="stat-label">Gesamtbetrag</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">35</span>
              <span className="stat-label">Jahre Tradition</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="order-container">
        <div className="order-layout">
          {/* Products Section */}
          <div className="products-section">
            <div className="section-header">
              <h2 className="section-title">
                <IconCart size={24} />
                Unsere Gerichte
              </h2>
              <p className="section-subtitle">Frisch zubereitet für unser Jubiläums-Hallenturnier</p>
            </div>
            
            <div className="products-grid">
              {CATALOG.map((item) => {
                const inCart = cart.find((p) => p.id === item.id);
                return (
                  <div key={item.id} className="product-card">
                    <div className="product-header">
                      <div>
                        <h3 className="product-name">{item.name}</h3>
                        <span className="product-category">{item.category}</span>
                      </div>
                      <div className="product-price">{formatChf(item.price)}</div>
                    </div>
                    
                    <p className="product-description">{item.desc}</p>
                    
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
                          <IconCart size={16} />
                          Hinzufügen
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Section */}
          <div className="cart-section">
            <div className="cart-header">
              <h2 className="section-title">
                <IconCart size={24} />
                Warenkorb & Checkout
              </h2>
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
                    <div key={p.id} className="cart-item">
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
                      
                      <div className="item-price-info">
                        <span className="item-unit-price">{formatChf(p.price)} pro Stück</span>
                        <span className="item-total-price">{formatChf(p.price * p.quantity)}</span>
                      </div>
                      
                      <div className="item-quantity-controls">
                        <div className="quantity-controls">
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
                  <h3 className="section-subtitle">Versandoption wählen</h3>
                  
                  <div className="delivery-options">
                    <div className="delivery-option">
                      <input 
                        id="pickup" 
                        type="radio" 
                        name="deliveryOption"
                        value="pickup"
                        checked={deliveryOption === "pickup"} 
                        onChange={(e) => setDeliveryOption(e.target.value)}
                        className="delivery-radio"
                      />
                      <label htmlFor="pickup" className="delivery-label">
                        <div className="option-icon">
                          <IconMapPin size={24} />
                        </div>
                        <div className="option-content">
                          <div className="option-title">Abholung</div>
                          <div className="option-subtitle">Kostenlos • Athletikzentrum SG</div>
                        </div>
                      </label>
                    </div>
                    
                    <div className="delivery-option">
                      <input 
                        id="delivery" 
                        type="radio" 
                        name="deliveryOption"
                        value="delivery"
                        checked={deliveryOption === "delivery"} 
                        onChange={(e) => setDeliveryOption(e.target.value)}
                        className="delivery-radio"
                      />
                      <label htmlFor="delivery" className="delivery-label">
                        <div className="option-icon">
                          <IconTruck size={24} />
                        </div>
                        <div className="option-content">
                          <div className="option-title">Lieferung</div>
                          <div className="option-subtitle">Siehe Preisübersicht</div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {deliveryOption === "delivery" && (
                    <div className="address-form">
                      <h4 className="address-form-title">Lieferadresse</h4>
                      <div className="address-fields">
                        <div className="address-field-group">
                          <div className="address-field">
                            <label htmlFor="street" className="address-label">Straße</label>
                            <input 
                              id="street"
                              className="address-input" 
                              placeholder="z.B. Musterstraße" 
                              value={address.street} 
                              onChange={(e) => updateAddress("street", e.target.value)}
                            />
                          </div>
                          <div className="address-field">
                            <label htmlFor="houseNumber" className="address-label">Hausnummer</label>
                            <input 
                              id="houseNumber"
                              className="address-input" 
                              placeholder="z.B. 123" 
                              value={address.houseNumber} 
                              onChange={(e) => updateAddress("houseNumber", e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="address-field-group">
                          <div className="address-field">
                            <label htmlFor="postalCode" className="address-label">Postleitzahl</label>
                            <input 
                              id="postalCode"
                              className="address-input" 
                              placeholder="z.B. 9000" 
                              value={address.postalCode} 
                              onChange={(e) => updateAddress("postalCode", e.target.value)}
                              maxLength="4"
                            />
                          </div>
                          <div className="address-field">
                            <label htmlFor="city" className="address-label">Ort</label>
                            <input 
                              id="city"
                              className="address-input" 
                              placeholder="z.B. St. Gallen" 
                              value={address.city} 
                              onChange={(e) => updateAddress("city", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Info */}
                <div className="customer-section">
                  <h3 className="section-subtitle">Kontaktdaten</h3>
                  <div className="customer-form">
                    <div style={{ position: 'relative' }}>
                      <IconUser size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#666' }} />
                      <input 
                        className="input" 
                        placeholder="Vollständiger Name" 
                        value={customer.name} 
                        onChange={(e) => updateCustomer("name", e.target.value)}
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <IconPhone size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#666' }} />
                      <input 
                        className="input" 
                        placeholder="Telefonnummer" 
                        value={customer.phone} 
                        onChange={(e) => updateCustomer("phone", e.target.value)}
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <IconMail size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#666' }} />
                      <input 
                        className="input" 
                        type="email" 
                        placeholder="E-Mail-Adresse" 
                        value={customer.email} 
                        onChange={(e) => updateCustomer("email", e.target.value)}
                        style={{ paddingLeft: '44px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Zwischensumme</span>
                    <span>{formatChf(subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>{deliveryOption === "delivery" ? "Lieferung" : deliveryOption === "pickup" ? "Abholung" : "Versand"}</span>
                    <span>{deliveryOption === "delivery" ? formatChf(deliveryFee) : deliveryOption === "pickup" ? "Gratis" : "-"}</span>
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
                    <>
                      <IconCart size={20} />
                      Bestellen für {formatChf(total)}
                    </>
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

      {/* Status Toast */}
      {status.state !== "idle" && (
        <div className="status-toast-container">
          <div className={`status-toast ${status.state}`}>
            <div className="status-content">
              <div className="status-icon">
                {status.state === "loading" && <div className="loading-spinner" />}
                {status.state === "error" && <span className="error-icon">!</span>}
                {status.state === "success" && <span className="success-icon">✓</span>}
              </div>
              <span className="status-message">{status.message}</span>
            </div>
            <button 
              className="status-close-btn" 
              onClick={closeStatusMessage}
              aria-label="Nachricht schließen"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KaufenPage() {
  return (
    <Suspense fallback={
      <div className="order-page">
        <div className="order-header">
          <div className="order-header-content">
            <h1 className="order-title">Bestellen</h1>
            <p className="order-subtitle">Lade...</p>
          </div>
        </div>
      </div>
    }>
      <KaufenPageContent />
    </Suspense>
  );
}