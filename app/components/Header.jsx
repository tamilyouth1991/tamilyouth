"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const { user, isAdmin, isManagement } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector("a, button, [tabindex]")?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auth state is provided by AuthProvider

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <div className="container header-inner">
        <Link href="/" className="brand" style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <img 
            src="/logo.jpg" 
            alt="FC Tamil Youth St. Gallen 1991 Logo" 
            width={32} 
            height={32} 
            style={{ 
              borderRadius: "50%", 
              objectFit: "cover",
              boxShadow: "0 0 15px rgba(0,255,65,0.3)",
              border: "2px solid rgba(0,255,65,0.2)"
            }} 
          />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fffff", lineHeight: 1 }}>TYSG 1991</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#ccc", lineHeight: 1 }}>ONE TEAM. ONE SPIRIT.</span>
          </div>
        </Link>

        <nav className="nav desktop-nav">
          <Link href="/" className={pathname === "/" ? "active" : ""}>🏠 Home</Link>
          <Link href="/kaufen" className={pathname === "/kaufen" ? "active" : ""}>🍽️ Kotthurotti</Link>
          <Link href="/kontakt" className={pathname === "/kontakt" ? "active" : ""}>📞 Kontakt</Link>
          {user && (isAdmin || isManagement) && (
            <Link href="/bestellungen" className={pathname === "/bestellungen" ? "active" : ""}>Bestellungen</Link>
          )}
          {user && isAdmin && (
            <Link href="/admin" className={pathname === "/admin" ? "active" : ""}>Admin</Link>
          )}
          {user ? (
            <Link href="/profile" className={pathname === "/profile" ? "active" : ""}>Profil</Link>
          ) : (
            <>
              <Link href="/login" className={pathname === "/login" ? "active" : ""}>Login</Link>
              <Link href="/register" className={pathname === "/register" ? "active" : ""}>Register</Link>
            </>
          )}
        </nav>

        <button
          ref={buttonRef}
          className="hamburger"
          aria-label="Menü öffnen"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
        </button>
      </div>

      {open && (
        <div className="mobile-nav-panel" ref={panelRef}>
          <nav className="mobile-nav">
            <Link href="/" onClick={() => setOpen(false)}>🏠 Home</Link>
            <Link href="/kaufen" onClick={() => setOpen(false)}>🍽️ Kotthurotti</Link>
            <Link href="/kontakt" onClick={() => setOpen(false)}>📞 Kontakt</Link>
            {user && (isAdmin || isManagement) && (
              <Link href="/bestellungen" onClick={() => setOpen(false)}>Bestellungen</Link>
            )}
            {user && isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)}>Admin</Link>
            )}
            {user ? (
              <Link href="/profile" onClick={() => setOpen(false)}>Profil</Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                <Link href="/register" onClick={() => setOpen(false)}>Register</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
