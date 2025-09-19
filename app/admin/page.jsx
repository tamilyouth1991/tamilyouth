"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { getFirebaseDb } from "@/app/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function AdminSetupPage() {
  const { user, loading, isAdmin } = useAuth();
  const [status, setStatus] = useState({ state: "idle", message: "" });

  async function makeMyselfAdmin() {
    try {
      if (!user) return;
      const db = getFirebaseDb();
      const ref = doc(db, "profiles", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { name: user.displayName || "", email: user.email || "", phone: "", address: "", role: "admin" }, { merge: true });
      } else {
        await setDoc(ref, { role: "admin" }, { merge: true });
      }
      setStatus({ state: "success", message: "Rolle gesetzt: admin. Bitte neu laden / neu einloggen." });
    } catch (e) {
      setStatus({ state: "error", message: e.message || "Fehler" });
    }
  }

  if (loading) return <div className="section"><div className="tile">Laden...</div></div>;
  if (!user) return <div className="section"><div className="tile">Bitte zuerst einloggen.</div></div>;

  const owner = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "").toLowerCase();
  const isOwner = (user.email || "").toLowerCase() === owner && owner.length > 0;

  if (!isOwner && !isAdmin) return <div className="section"><div className="tile">Kein Zugriff</div></div>;

  return (
    <div className="section">
      <h1 className="hero-title">Admin Setup</h1>
      <div className="soft" style={{ marginTop: 8 }}>
        <div style={{ padding: 16, display: "grid", gap: 10 }}>
          <div className="product-meta">Angemeldet als: {user.email}</div>
          <button className="button" onClick={makeMyselfAdmin}>Mir Admin‑Rolle geben</button>
          {status.state !== "idle" && (
            <p style={{ color: status.state === "error" ? "#b91c1c" : "#000080" }}>{status.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}


