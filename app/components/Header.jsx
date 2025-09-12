"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

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

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">TamilYouth</Link>

        <nav className="nav desktop-nav">
          <Link href="/">Home</Link>
          <Link href="/kaufen">Jetzt kaufen</Link>
          <Link href="/kontakt">Kontakt</Link>
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
            <Link href="/" onClick={() => setOpen(false)}>Home</Link>
            <Link href="/kaufen" onClick={() => setOpen(false)}>Jetzt kaufen</Link>
            <Link href="/kontakt" onClick={() => setOpen(false)}>Kontakt</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
