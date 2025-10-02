import { Geist, Geist_Mono } from "next/font/google";
import Header from "./components/Header";
import AuthProvider from "./components/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TamilYouth Food",
  description: "Frisches Essen vorbestellen – schnell und einfach.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <Header />
          <main className="container main-content">{children}</main>
          <footer className="site-footer">
            <div className="container">
              <div className="footer-content">
                <div className="footer-logo">
                  <img 
                    src="/logo.jpg" 
                    alt="FC Tamil Youth St. Gallen 1991 Logo" 
                    width={80} 
                    height={80}
                    style={{ borderRadius: "50%", boxShadow: "0 0 20px rgba(0,255,65,0.3)" }}
                  />
                  <div className="footer-text">
                    <h3>FC Tamil Youth St. Gallen</h3>
                    <p>Gegründet 1991 • 35 Jahre Tradition</p>
                    <p style={{ color: "#00ff41", fontWeight: "700" }}>ONE TEAM. ONE SPIRIT.</p>
                  </div>
                </div>
                
                <div className="footer-sections">
                  <div className="footer-section">
                    <h4>🏆 Verein</h4>
                    <p>Tamilischer Fußballverein</p>
                    <p>Seit 1991 in St. Gallen</p>
                    <p>35-jähriges Jubiläum 2025</p>
                  </div>
                  
                  <div className="footer-section">
                    <h4>🍽️ Essen</h4>
                    <p>Authentisches Kotthurotti</p>
                    <p>Vegi & Fleisch Optionen</p>
                    <p>Frische Getränke</p>
                  </div>
                  
                  <div className="footer-section">
                    <h4>📍 Kontakt</h4>
                    <p>Athletikzentrum SG</p>
                    <p>Parkstrasse 2</p>
                    <p>9000 St. Gallen</p>
                  </div>
                  
                  <div className="footer-section">
                    <h4>📱 Social Media</h4>
                    <p>Instagram: @TYSG1991</p>
                    <p>Folge uns für Updates</p>
                    <p>Turnier-Termine</p>
                  </div>
                </div>
              </div>
              
              <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} FC Tamil Youth St. Gallen 1991. Alle Rechte vorbehalten.</p>
                <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "8px" }}>
                  Unterstütze uns durch Kotthurotti-Bestellungen für unser Jubiläums-Turnier! 🏆
                </p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
