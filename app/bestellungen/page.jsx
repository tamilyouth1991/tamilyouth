"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";

export default function BestellungenPage() {
  const { user, loading, isAdmin, isManagement } = useAuth();
  const [data, setData] = useState({ orders: [], stats: null, loading: true, error: "" });

  useEffect(() => {
    if (loading) return;
    if (!user || (!isAdmin && !isManagement)) return;
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/order", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error || "Fehler");
        if (mounted) setData({ orders: json.orders || [], stats: json.stats || null, loading: false, error: "" });
      } catch (e) {
        if (mounted) setData((p) => ({ ...p, loading: false, error: e.message || "Fehler beim Laden" }));
      }
    }
    load();
    const i = setInterval(load, 5000);
    return () => { mounted = false; clearInterval(i); };
  }, [user, loading]);

  const groupedByDate = useMemo(() => {
    const map = new Map();
    for (const o of data.orders) {
      const d = new Date(o.createdAt || Date.now());
      const key = d.toLocaleDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(o);
    }
    return Array.from(map.entries());
  }, [data.orders]);

  if (loading) return <div className="section"><div className="tile">Laden...</div></div>;
  if (!user || (!isAdmin && !isManagement)) return <div className="section"><div className="tile">Kein Zugriff</div></div>;

  return (
    <div className="section">
      <h1 className="hero-title">Bestellungen</h1>
      <p className="product-meta">Alle Bestellungen im Überblick – live aktualisiert</p>

      {data.error && (
        <div className="tile" style={{ marginTop: 12, borderColor: "#ef4444", background: "#fff7ed", color: "#7c2d12" }}>{data.error}</div>
      )}

      {/* Dashboard */}
      <div className="grid section" style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
        <StatCard label="Bestellungen" value={data.stats?.totalOrders ?? 0} />
        <StatCard label="Umsatz (CHF)" value={(data.stats?.revenue ?? 0).toFixed(2)} />
        <StatCard label="Artikel" value={data.stats?.itemsSold ?? 0} />
        <StatCard label="Lieferungen" value={data.stats?.deliveryOrders ?? 0} />
        <StatCard label="Abholungen" value={data.stats?.pickupOrders ?? 0} />
      </div>

      {/* Orders list */}
      <div className="section" style={{ display: "grid", gap: 12 }}>
        {data.loading && <div className="tile">Laden...</div>}
        {!data.loading && data.orders.length === 0 && (
          <div className="tile">Noch keine Bestellungen</div>
        )}
        {groupedByDate.map(([day, orders]) => (
          <div key={day} className="soft">
            <div style={{ padding: 14 }}>
              <h3 style={{ marginBottom: 8 }}>{day}</h3>
              <div className="grid" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
                {orders.map((o) => (
                  <OrderRow key={o.orderId} order={o} />)
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="tile" style={{ display: "grid", gap: 6 }}>
      <div className="product-meta">{label}</div>
      <div style={{ fontWeight: 900, fontSize: "1.4rem" }}>{value}</div>
    </div>
  );
}

function OrderRow({ order }) {
  const created = new Date(order.createdAt || Date.now());
  const time = created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const itemsCount = (order.items || []).reduce((s, it) => s + (it.quantity || 0), 0);
  return (
    <div className="tile" style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontWeight: 800 }}>{order.orderId}</span>
          <span className="product-meta">{time}</span>
          {order.delivery?.enabled ? (
            <span className="product-meta" style={{ color: "#000080", fontWeight: 700 }}>Lieferung</span>
          ) : (
            <span className="product-meta" style={{ fontWeight: 700 }}>Abholung</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          <span className="product-meta">Artikel: {itemsCount}</span>
          <span style={{ fontWeight: 800 }}>CHF {(order.total || 0).toFixed(2)}</span>
        </div>
      </div>
      <div className="divider" />
      <div className="grid" style={{ gridTemplateColumns: "1.2fr 0.8fr 1fr" }}>
        <div>
          <div className="product-title" style={{ marginBottom: 6 }}>Positionen</div>
          <div style={{ display: "grid", gap: 6 }}>
            {(order.items || []).map((it, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{it.name} × {it.quantity}</span>
                <span>CHF {(it.price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="product-title" style={{ marginBottom: 6 }}>Kunde</div>
          <div className="product-meta">{order.customer?.name}</div>
          <div className="product-meta">{order.customer?.phone}</div>
          <div className="product-meta">{order.customer?.email}</div>
        </div>
        <div>
          <div className="product-title" style={{ marginBottom: 6 }}>Lieferung</div>
          <div className="product-meta">{order.delivery?.enabled ? "Ja" : "Nein"}</div>
          {order.delivery?.enabled && (
            <div className="product-meta">{order.delivery?.address}</div>
          )}
          <div className="product-meta">Zwischensumme: CHF {(order.subtotal || 0).toFixed(2)}</div>
          <div className="product-meta">Lieferung: CHF {(order.deliveryFee || 0).toFixed(2)}</div>
          <div className="product-meta" style={{ fontWeight: 800 }}>Gesamt: CHF {(order.total || 0).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}


