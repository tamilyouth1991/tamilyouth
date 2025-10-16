import { Geist, Geist_Mono } from "next/font/google";
import Header from "./components/Header";
import AuthProvider from "./components/AuthProvider";
import Image from "next/image";
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
  title: "FC Tamil Youth St. Gallen 1991 - Kotthurotti Bestellung & Hallenturnier",
  description: "Bestelle authentisches Kotthurotti beim FC Tamil Youth St. Gallen 1991. Unterstütze unser 35-jähriges Jubiläums-Hallenturnier am 2. November 2025. Lieferung möglich. Athletikzentrum SG, Parkstrasse 2, St. Gallen.",
  keywords: "Kotthurotti, Tamil Youth, St. Gallen, Hallenturnier, Fußball, Sri Lanka Essen, authentisches Essen, Bestellung, Lieferung, Athletikzentrum SG, Jubiläum, 35 Jahre, FC Tamil Youth",
  authors: [{ name: "FC Tamil Youth St. Gallen 1991" }],
  creator: "FC Tamil Youth St. Gallen 1991",
  publisher: "FC Tamil Youth St. Gallen 1991",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tamilyouth.ch'),
  alternates: {
    canonical: '/',
    languages: {
      'de-CH': '/',
    },
  },
  openGraph: {
    title: "FC Tamil Youth St. Gallen 1991 - Kotthurotti Bestellung",
    description: "Bestelle authentisches Kotthurotti und unterstütze unser 35-jähriges Jubiläums-Hallenturnier. Lieferung möglich.",
    url: 'https://tamilyouth.ch',
    siteName: 'FC Tamil Youth St. Gallen 1991',
    images: [
      {
        url: '/logo.jpg',
        width: 200,
        height: 200,
        alt: 'FC Tamil Youth St. Gallen 1991 Logo',
      },
    ],
    locale: 'de_CH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "FC Tamil Youth St. Gallen 1991 - Kotthurotti Bestellung",
    description: "Bestelle authentisches Kotthurotti und unterstütze unser Jubiläums-Hallenturnier.",
    images: ['/logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual verification code
  },
};

export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "name": "FC Tamil Youth St. Gallen 1991",
    "alternateName": "TYSG 1991",
    "description": "Tamilischer Fußballverein in St. Gallen seit 1991. Organisiert Hallenturniere und verkauft authentisches Kotthurotti.",
    "foundingDate": "1991",
    "location": {
      "@type": "Place",
      "name": "Athletikzentrum SG",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Parkstrasse 2",
        "postalCode": "9000",
        "addressLocality": "St. Gallen",
        "addressCountry": "CH"
      }
    },
    "url": "https://tamilyouth.ch",
    "logo": "https://tamilyouth.ch/logo.jpg",
    "sameAs": [
      "https://instagram.com/TYSG1991"
    ],
    "sport": "Soccer",
    "memberOf": {
      "@type": "SportsOrganization",
      "name": "Tamilische Fußballgemeinschaft St. Gallen"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Kotthurotti Bestellung",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Kotthurotti",
            "description": "Klassisches Kotthurotti mit Fleisch"
          },
          "price": "15.00",
          "priceCurrency": "CHF"
        }
      ]
    },
    "event": {
      "@type": "SportsEvent",
      "name": "35-jähriges Jubiläums-Hallenturnier",
      "startDate": "2025-11-02T08:00:00+01:00",
      "location": {
        "@type": "Place",
        "name": "Athletikzentrum SG",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Parkstrasse 2",
          "postalCode": "9000",
          "addressLocality": "St. Gallen",
          "addressCountry": "CH"
        }
      },
      "offers": {
        "@type": "Offer",
        "price": "1000.00",
        "priceCurrency": "CHF",
        "description": "Preisgeld für das Turnier"
      }
    }
  };

  return (
    <html lang="de">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <meta name="theme-color" content="#00ff41" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <Header />
          <main className="container main-content">{children}</main>
          <footer className="site-footer">
            <div className="container">
              <div className="footer-content">
                <div className="footer-logo">
                  <Image 
                    src="/logo.jpg" 
                    alt="FC Tamil Youth St. Gallen 1991 Logo - Tamilischer Fußballverein seit 1991" 
                    width={80} 
                    height={80}
                    style={{ borderRadius: "50%", boxShadow: "0 0 20px rgba(0,255,65,0.3)" }}
                    title="FC Tamil Youth St. Gallen 1991 - 35 Jahre Tradition"
                  />
                  <div className="footer-text">
                    <h3>FC Tamil Youth St. Gallen</h3>
                    <p>Gegründet 1991 • 35 Jahre Tradition</p>
                    <p style={{ color: "#00ff41", fontWeight: "700" }}>ONE TEAM. ONE SPIRIT.</p>
                  </div>
                </div>
                
                <div className="footer-sections">
                  <div className="footer-section">
                    <h4>Verein</h4>
                    <p>Tamilischer Fußballverein</p>
                    <p>Seit 1991 in St. Gallen</p>
                    <p>35-jähriges Jubiläum 2025</p>
                    <p><strong>FC Tamil Youth St. Gallen 1991</strong></p>
                  </div>
                  
                  <div className="footer-section">
                    <h4>Essen</h4>
                    <p>Authentisches Kotthurotti</p>
                    <p>Frische Getränke</p>
                    <p><strong>Sri Lanka Street Food</strong></p>
                  </div>
                  
                  <div className="footer-section">
                    <h4>Kontakt</h4>
                    <p><strong>Athletikzentrum SG</strong></p>
                    <p>Parkstrasse 2</p>
                    <p>9000 St. Gallen</p>
                    <p>Schweiz</p>
                  </div>
                  
                  <div className="footer-section">
                    <h4>Social Media</h4>
                    <p>Instagram: @TYSG1991</p>
                    <p>Folge uns für Updates</p>
                    <p>Turnier-Termine</p>
                    <p><strong>Hallenturnier 2025</strong></p>
                  </div>
                </div>
              </div>
              
              <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} FC Tamil Youth St. Gallen 1991. Alle Rechte vorbehalten.</p>
                <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "8px" }}>
                  Unterstütze uns durch Kotthurotti-Bestellungen für unser Jubiläums-Turnier!
                </p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
