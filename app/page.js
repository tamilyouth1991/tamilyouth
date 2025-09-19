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

          {/* Features */}
          <div className="grid section" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            <div className="tile" style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <IconCart />
              <div>
                <div className="product-title">Vorbestellen</div>
                <div className="product-meta">Bestelle in Sekunden ohne Warten</div>
              </div>
            </div>
            <div className="tile" style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <IconTruck />
              <div>
                <div className="product-title">Lieferung</div>
                <div className="product-meta">Optional, +CHF 5 je Gericht</div>
              </div>
            </div>
            <div className="tile" style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <IconMapPin />
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

      <section className="section" style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "1.6rem", marginBottom: 12 }}>Beliebte Gerichte</h2>
        <div className="grid">
          {products.map((p) => (
            <div key={p.name} className="tile">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className="product-title">{p.name}</span>
                <span style={{ fontWeight: 700 }}>{p.price}</span>
              </div>
              <p className="product-meta">{p.desc}</p>
              <div className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#000080", fontWeight: 700 }}>{p.tag}</span>
                <Link href={{ pathname: "/kaufen", query: { produkt: p.name } }} className="button" style={{ padding: "10px 12px" }}>Vorbestellen</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "1.6rem", marginBottom: 12 }}>So funktioniert’s</h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          <div className="tile">
            <div className="product-title" style={{ marginBottom: 6 }}>1. Wähle Gerichte</div>
            <p className="product-meta">Kottu, Biryani, Curry und mehr in den Warenkorb legen.</p>
          </div>
          <div className="tile">
            <div className="product-title" style={{ marginBottom: 6 }}>2. Lieferung oder Abholung</div>
            <p className="product-meta">Lieferung wählen (+CHF 5/ Gericht) oder bequem abholen.</p>
          </div>
          <div className="tile">
            <div className="product-title" style={{ marginBottom: 6 }}>3. Daten & Bestätigung</div>
            <p className="product-meta">Name, Telefon, E‑Mail – Bestellnummer kommt per E‑Mail.</p>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="section" style={{ marginTop: 32 }}>
        <div className="soft elevated" style={{ overflow: "hidden" }}>
          <div style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div className="product-title">Heute noch Hunger?</div>
              <div className="product-meta">Bestelle jetzt – heiß und frisch für dich zubereitet.</div>
            </div>
            <Link href="/kaufen" className="button"><IconCart />Jetzt bestellen</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
