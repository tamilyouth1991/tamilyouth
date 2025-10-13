import Link from "next/link";
import Image from "next/image";
import { IconCart, IconTruck, IconPhone, IconMapPin } from "./components/Icons";
import ScrollAnimations from "./components/ScrollAnimations";
import "./homepage.css";

export default function Home() {
  const products = [
    { name: "Vegi Kotthurotti", price: "CHF 12.00", desc: "Fein gehacktes Roti mit frischem Gemüse.", tag: "Vegan" },
    { name: "Kotthurotti", price: "CHF 15.00", desc: "Klassisches Kotthurotti mit Fleisch.", tag: "Beliebt" },
    { name: "Cola Dose", price: "CHF 3.50", desc: "Erfrischende Cola Dose.", tag: "Getränk" },
    { name: "Eistee Dose", price: "CHF 3.50", desc: "Süßer Eistee zum Essen.", tag: "Getränk" },
  ];

  return (
    <div className="homepage">
      <ScrollAnimations />
      {/* Hero Section im Flyer-Stil */}
      <section className="hero-section">
        <div className="smoke-background">
          <div className="smoke-layer smoke-1"></div>
          <div className="smoke-layer smoke-2"></div>
          <div className="smoke-layer smoke-3"></div>
        </div>
        
        <div className="hero-content">
          {/* Header Section */}
          <div className="hero-header">
            <div className="event-date">
              <div className="date-main">NOV 2</div>
              <div className="date-sub">SUNDAY</div>
            </div>
            <div className="event-time">
              <div className="time-label">START</div>
              <div className="time-main">8AM</div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="hero-main">
            {/* Celebration Section */}
            <div className="celebration-section">
              <div className="celebration-label">CELEBRATING</div>
              <div className="celebration-years">35 YEARS</div>
              <div className="club-title">TYSG 1991</div>
              <div className="club-motto">ONE TEAM. ONE SPIRIT.</div>
            </div>

            {/* Game Day Banner */}
            <div className="game-day-banner">
              <div className="game-day-text">GAME DAY</div>
            </div>
            
            {/* Logo Section */}
            <div className="logo-section">
              <Image 
                src="/logo.jpg" 
                alt="FC Tamil Youth St. Gallen 1991 Logo - Tamilischer Fußballverein seit 1991" 
                width={180} 
                height={180}
                className="club-logo"
                priority
                title="FC Tamil Youth St. Gallen 1991 - 35 Jahre Tradition"
              />
            </div>

            {/* Registration Section */}
            <div className="registration-section">
              <div className="register-call">
                <div className="register-label">REGISTER</div>
                <div className="register-action">NOW!</div>
              </div>
              <div className="venue-info">
                <div className="venue-name">ATHLETIKZENTRUM SG</div>
                <div className="venue-address">PARKSTRASSE 2, 9000 ST. GALLEN</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kotthurotti Bestell-Sektion */}
      <section className="kotthurotti-section">
        <div className="section-container">
          <div className="section-header scroll-fade-in">
            <h2 className="section-title">Unterstütze unser Jubiläums-Turnier!</h2>
            <p className="section-subtitle">
              Bestelle jetzt Kotthurotti und unterstütze damit unser 35-jähriges Jubiläums-Hallenturnier am 2. November 2025
            </p>
          </div>
          
          <div className="support-info">
            <div className="support-card scroll-slide-left scroll-delay-1">
              <div className="support-icon">
                <IconTruck />
              </div>
              <div className="support-text">
                <h3>Jubiläums-Turnier</h3>
                <p>35 Jahre FC Tamil Youth St. Gallen</p>
              </div>
            </div>
            <div className="support-card scroll-fade-in scroll-delay-2">
              <div className="support-icon">
                <IconMapPin />
              </div>
              <div className="support-text">
                <h3>Athletikzentrum SG</h3>
                <p>Parkstrasse 2, 9000 St. Gallen</p>
              </div>
            </div>
            <div className="support-card scroll-slide-right scroll-delay-3">
              <div className="support-icon">
                <IconCart />
              </div>
              <div className="support-text">
                <h3>Preisgeld</h3>
                <p>CHF 1000.- zu gewinnen</p>
              </div>
            </div>
          </div>

          <div className="cta-button-container scroll-scale-in scroll-delay-4">
            <Link href="/kaufen" className="order-button">
              <IconCart />
              Jetzt Kotthurotti bestellen
            </Link>
          </div>
        </div>
      </section>

      {/* Bestellanleitung mit Mengenrabatt */}
      <section className="ordering-guide-section">
        <div className="section-container">
          <div className="section-title scroll-fade-in">
            <h2>So einfach bestellst du</h2>
          </div>
          
          <div className="steps-container">
            <div className="step scroll-slide-left scroll-delay-1">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Wähle deine Gerichte</h3>
                <p>Vegi oder normales Kotthurotti, Getränke nach Wahl</p>
              </div>
            </div>
            <div className="step scroll-fade-in scroll-delay-2">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Mehr bestellen = weniger zahlen</h3>
                <p>Je mehr du bestellst, desto günstiger wird es pro Portion</p>
              </div>
            </div>
            <div className="step scroll-slide-right scroll-delay-3">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Abholung oder Lieferung</h3>
                <p>Bequem abholen oder liefern lassen (+CHF 5 pro Gericht)</p>
              </div>
            </div>
          </div>

          <div className="pricing-info scroll-fade-in scroll-delay-4">
            <h3>Mengenrabatt-System</h3>
            <div className="pricing-grid">
              <div className="pricing-card scroll-scale-in scroll-delay-1">
                <div className="quantity">1-2 Portionen</div>
                <div className="price">Normalpreis</div>
              </div>
              <div className="pricing-card scroll-scale-in scroll-delay-2">
                <div className="quantity">3-5 Portionen</div>
                <div className="price">-10% Rabatt</div>
              </div>
              <div className="pricing-card scroll-scale-in scroll-delay-3">
                <div className="quantity">6+ Portionen</div>
                <div className="price">-15% Rabatt</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produktübersicht */}
      <section className="products-section">
        <div className="section-container">
          <div className="section-title scroll-fade-in">
            <h2>Unsere Produkte</h2>
          </div>
          <div className="products-grid">
            {products.map((product, index) => (
              <div key={product.name} className={`product-card scroll-fade-in scroll-delay-${index + 1}`}>
                <div className="product-header">
                  <h3 className="product-name">{product.name}</h3>
                  <span className="product-tag">{product.tag}</span>
                </div>
                <p className="product-description">{product.desc}</p>
                <div className="product-footer">
                  <span className="product-price">{product.price}</span>
                  <Link href="/kaufen" className="add-to-cart-btn">
                    <IconCart />
                    Bestellen
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
