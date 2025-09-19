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
            <div className="container footer-inner">
              <p>© {new Date().getFullYear()} TamilYouth. Alle Rechte vorbehalten.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
