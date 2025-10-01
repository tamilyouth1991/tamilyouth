import Link from "next/link";
import PreorderForm from "./components/PreorderForm";
import { IconCart, IconTruck, IconPhone, IconMapPin } from "./components/Icons";

export default function Home() {
  const products = [
    { name: "Chicken Biryani", price: "CHF 15.00", desc: "Aromatischer Reis mit zartem Huhn.", tag: "Beliebt" },
    { name: "Veggie Kottu", price: "CHF 13.00", desc: "Fein gehacktes Roti mit Gemüse.", tag: "Vegan" },
    { name: "Mutton Curry", price: "CHF 17.00", desc: "Würziges Lammcurry nach Tamil-Art.", tag: "Neu" },
  ];

  return (
    <div>
      <section className="hero section">
        <div>
          <h1 className="hero-title">Frisches tamilisches Essen – jetzt vorbestellen</h1>
          <p className="hero-subtitle">Schnell, lecker und bequem abholen oder liefern lassen. Spare Zeit – genieße warm.</p>
          <div className="hero-cta">
            <Link href="/kaufen" className="button"><IconCart />Jetzt kaufen</Link>
            <Link href="/kontakt" className="button secondary"><IconPhone />Kontakt</Link>
          </div>

          {/* Mobile-Optimized Features */}
          <div className="grid section">
            <div className="tile feature-tile">
              <IconCart size={24} />
              <div>
                <div className="product-title">Vorbestellen</div>
                <div className="product-meta">Bestelle in Sekunden ohne Warten</div>
              </div>
            </div>
            <div className="tile feature-tile">
              <IconTruck size={24} />
              <div>
                <div className="product-title">Lieferung</div>
                <div className="product-meta">Optional, +CHF 5 je Gericht</div>
              </div>
            </div>
            <div className="tile feature-tile">
              <IconMapPin size={24} />
              <div>
                <div className="product-title">Abholung</div>
                <div className="product-meta">Schnell an der Theke mit Nummer</div>
              </div>
            </div>
          </div>
        </div>
        <div className="soft elevated">
          <div style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 10 }}>Schnell vorbestellen</h3>
            <PreorderForm compact />
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Beliebte Gerichte</h2>
        <div className="grid">
          {products.map((p) => (
            <div key={p.name} className="product-card">
              <div className="product-card-header">
                <span className="product-card-title">{p.name}</span>
                <span className="product-card-price">{p.price}</span>
              </div>
              <p className="product-card-description">{p.desc}</p>
              <div className="product-card-footer">
                <span className="product-card-tag">{p.tag}</span>
                <Link href={{ pathname: "/kaufen", query: { produkt: p.name } }} className="button product-card-button">
                  Vorbestellen
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile-Optimized How it works */}
      <section className="section">
        <h2 className="section-title">So funktioniert&apos;s</h2>
        <div className="grid">
          <div className="tile step-tile">
            <div className="step-number">1</div>
            <div>
              <div className="product-title">Wähle Gerichte</div>
              <p className="product-meta">Kottu, Biryani, Curry und mehr in den Warenkorb legen.</p>
            </div>
          </div>
          <div className="tile step-tile">
            <div className="step-number">2</div>
            <div>
              <div className="product-title">Lieferung oder Abholung</div>
              <p className="product-meta">Lieferung wählen (+CHF 5/ Gericht) oder bequem abholen.</p>
            </div>
          </div>
          <div className="tile step-tile">
            <div className="step-number">3</div>
            <div>
              <div className="product-title">Daten & Bestätigung</div>
              <p className="product-meta">Name, Telefon, E‑Mail – Bestellnummer kommt per E‑Mail.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-Optimized CTA Banner */}
      <section className="section">
        <div className="cta-banner">
          <div className="cta-content">
            <div className="cta-text">
              <div className="cta-title">Heute noch Hunger?</div>
              <div className="cta-subtitle">Bestelle jetzt – heiß und frisch für dich zubereitet.</div>
            </div>
            <Link href="/kaufen" className="button large">
              <IconCart />Jetzt bestellen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
