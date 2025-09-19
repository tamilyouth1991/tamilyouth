"use client";

import { useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";

export default function AdminSetupPage() {
  const { user, loading, isAdmin } = useAuth();
  const [status, setStatus] = useState({ state: "idle", message: "" });

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
          <div className="product-meta">
            {isOwner ? "✅ Owner-E-Mail erkannt - Admin-Zugriff aktiv" : ""}
            {isAdmin ? "✅ Admin-Berechtigung aktiv" : ""}
          </div>
          <div className="product-meta">
            Um Admin-Zugriff zu bekommen, setze in der .env.local:
            <br />
            NEXT_PUBLIC_OWNER_EMAIL={user.email}
          </div>
          {status.state !== "idle" && (
            <p style={{ color: status.state === "error" ? "#b91c1c" : "#000080" }}>{status.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}


