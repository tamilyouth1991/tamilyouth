import Link from "next/link";
import Image from "next/image";
import { IconCart, IconTruck, IconPhone, IconMapPin } from "./components/Icons";
import ScrollAnimation from "./components/ScrollAnimation";
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
      {/* Hero Section im Flyer-Stil */}
      <section className="hero-section">
        <div className="smoke-background">
          <div className="smoke-layer smoke-1"></div>
          <div className="smoke-layer smoke-2"></div>
          <div className="smoke-layer smoke-3"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-top">
            <div className="date-info">
              <span className="date-day">NOV 2</span>
              <span className="date-day-name">SUNDAY</span>
            </div>
            <div className="start-info">
              <span className="start-label">START</span>
              <span className="start-time">8AM</span>
            </div>
          </div>

          <div className="hero-center">
            <div className="celebration-text">
              <span className="celebrating">CELEBRATING</span>
              <span className="years">35 YEARS</span>
              <span className="club-name">TYSG 1991</span>
              <span className="motto">ONE TEAM. ONE SPIRIT.</span>
            </div>

            <div className="game-day-text">GAME DAY</div>
            
            <div className="logo-container">
              <Image 
                src="/logo.jpg" 
                alt="FC Tamil Youth St. Gallen 1991 Logo" 
                width={200} 
                height={200}
                className="club-logo"
                priority
              />
            </div>

            <div className="register-section">
              <div className="register-text">
                <span className="register-label">REGISTER</span>
                <span className="register-now">NOW!</span>
              </div>
              <div className="location-info">
                <span className="venue">ATHLETIKZENTRUM SG</span>
                <span className="address">PARKSTRASSE 2, 9000 ST. GALLEN</span>
              </div>
            </div>
          </div>

          <div className="hero-bottom">
            <div className="prize-info">
              <span className="prize-label">PRIZEMONEY: CHF 1000.-</span>
            </div>
            <div className="team-format">
              <span className="format">4+1</span>
            </div>
          </div>
        </div>
      </section>

      {/* Kotthurotti Bestell-Sektion */}
      <ScrollAnimation className="kotthurotti-section scroll-animate">
        <div className="section-container">
          <ScrollAnimation className="section-header scroll-animate scroll-animate-delay-1">
            <h2 className="section-title">Unterstütze unser Jubiläums-Turnier! 🏆</h2>
            <p className="section-subtitle">
              Bestelle jetzt Kotthurotti und unterstütze damit unser 35-jähriges Jubiläums-Hallenturnier am 2. November 2025
            </p>
          </ScrollAnimation>
          
          <ScrollAnimation className="support-info scroll-animate scroll-animate-delay-2">
            <div className="support-card">
              <div className="support-icon">🏆</div>
              <div className="support-text">
                <h3>Jubiläums-Turnier</h3>
                <p>35 Jahre FC Tamil Youth St. Gallen</p>
              </div>
            </div>
            <div className="support-card">
              <div className="support-icon">📍</div>
              <div className="support-text">
                <h3>Athletikzentrum SG</h3>
                <p>Parkstrasse 2, 9000 St. Gallen</p>
              </div>
            </div>
            <div className="support-card">
              <div className="support-icon">💰</div>
              <div className="support-text">
                <h3>Preisgeld</h3>
                <p>CHF 1000.- zu gewinnen</p>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation className="cta-button-container scroll-animate scroll-animate-delay-3">
            <Link href="/kaufen" className="order-button">
              <IconCart />
              Jetzt Kotthurotti bestellen
            </Link>
          </ScrollAnimation>
        </div>
      </ScrollAnimation>

      {/* Bestellanleitung mit Mengenrabatt */}
      <ScrollAnimation className="ordering-guide-section scroll-animate">
        <div className="section-container">
          <ScrollAnimation className="section-title scroll-animate scroll-animate-delay-1">
            <h2>So einfach bestellst du 📱</h2>
          </ScrollAnimation>
          
          <ScrollAnimation className="steps-container scroll-animate scroll-animate-delay-2">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Wähle deine Gerichte</h3>
                <p>Vegi oder normales Kotthurotti, Getränke nach Wahl</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Mehr bestellen = weniger zahlen</h3>
                <p>Je mehr du bestellst, desto günstiger wird es pro Portion</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Abholung oder Lieferung</h3>
                <p>Bequem abholen oder liefern lassen (+CHF 5 pro Gericht)</p>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation className="pricing-info scroll-animate scroll-animate-delay-3">
            <h3>Mengenrabatt-System 💰</h3>
            <div className="pricing-grid">
              <div className="pricing-card">
                <div className="quantity">1-2 Portionen</div>
                <div className="price">Normalpreis</div>
              </div>
              <div className="pricing-card">
                <div className="quantity">3-5 Portionen</div>
                <div className="price">-10% Rabatt</div>
              </div>
              <div className="pricing-card">
                <div className="quantity">6+ Portionen</div>
                <div className="price">-15% Rabatt</div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </ScrollAnimation>

      {/* Produktübersicht */}
      <ScrollAnimation className="products-section scroll-animate">
        <div className="section-container">
          <ScrollAnimation className="section-title scroll-animate scroll-animate-delay-1">
            <h2>Unsere Produkte 🍽️</h2>
          </ScrollAnimation>
          <ScrollAnimation className="products-grid scroll-animate scroll-animate-delay-2">
            {products.map((product) => (
              <div key={product.name} className="product-card">
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
          </ScrollAnimation>
        </div>
      </ScrollAnimation>
    </div>
  );
}
