"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { exportOrdersToExcel, exportOrdersByPostalCode, getOrderSummary } from "@/app/lib/excelExport";
import { IconCart, IconTruck, IconMapPin, IconUser, IconPhone, IconMail, IconEdit, IconTrash, IconCheck, IconX, IconDownload, IconFilter } from "@/app/components/Icons";

export default function BestellungenPage() {
  const { user, loading, isAdmin, isManagement } = useAuth();
  const [data, setData] = useState({ orders: [], stats: null, loading: true, error: "" });
  const [viewMode, setViewMode] = useState('all'); // 'all', 'postal', 'filtered'
  const [filters, setFilters] = useState({
    status: '',
    delivery: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [editingOrder, setEditingOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || (!isAdmin && !isManagement)) return;
    let mounted = true;
    async function load() {
      try {
        const url = viewMode === 'postal' ? '/api/order?grouped=true' : '/api/order';
        const res = await fetch(url, { cache: "no-store" });
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
  }, [user, loading, viewMode]);

  const filteredOrders = useMemo(() => {
    if (viewMode === 'postal') return []; // Postal view doesn't use filteredOrders
    
    let orders = Array.isArray(data.orders) ? data.orders : [];
    
    // Apply filters
    if (filters.status) {
      orders = orders.filter(o => o.status === filters.status);
    }
    if (filters.delivery) {
      const isDelivery = filters.delivery === 'delivery';
      orders = orders.filter(o => o.delivery?.enabled === isDelivery);
    }
    if (filters.dateFrom) {
      orders = orders.filter(o => new Date(o.createdAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      orders = orders.filter(o => new Date(o.createdAt) <= new Date(filters.dateTo));
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      orders = orders.filter(o => 
        o.orderId.includes(searchLower) ||
        o.customer?.name?.toLowerCase().includes(searchLower) ||
        o.customer?.phone?.includes(searchLower) ||
        o.customer?.email?.toLowerCase().includes(searchLower) ||
        o.delivery?.address?.toLowerCase().includes(searchLower)
      );
    }
    
    return orders;
  }, [data.orders, filters, viewMode]);

  const groupedByDate = useMemo(() => {
    if (viewMode === 'postal') return [];
    
    const map = new Map();
    for (const o of filteredOrders) {
      const d = new Date(o.createdAt || Date.now());
      const key = d.toLocaleDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(o);
    }
    return Array.from(map.entries());
  }, [filteredOrders, viewMode]);

  const postalGroups = useMemo(() => {
    if (viewMode !== 'postal') return {};
    return data.orders || {};
  }, [data.orders, viewMode]);

  async function updateOrderStatus(orderId, status) {
    try {
      const res = await fetch('/api/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, updates: { status } })
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Fehler");
      
      // Refresh data
      const refreshRes = await fetch('/api/order', { cache: "no-store" });
      const refreshJson = await refreshRes.json();
      if (refreshRes.ok && refreshJson.ok) {
        setData({ orders: refreshJson.orders || [], stats: refreshJson.stats || null, loading: false, error: "" });
      }
    } catch (e) {
      setData((p) => ({ ...p, error: e.message || "Fehler beim Aktualisieren" }));
    }
  }

  async function deleteOrder(orderId) {
    if (!confirm('Bestellung wirklich löschen?')) return;
    
    try {
      const res = await fetch(`/api/order?orderId=${orderId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Fehler");
      
      // Refresh data
      const refreshRes = await fetch('/api/order', { cache: "no-store" });
      const refreshJson = await refreshRes.json();
      if (refreshRes.ok && refreshJson.ok) {
        setData({ orders: refreshJson.orders || [], stats: refreshJson.stats || null, loading: false, error: "" });
      }
    } catch (e) {
      setData((p) => ({ ...p, error: e.message || "Fehler beim Löschen" }));
    }
  }

  function handleExportAll() {
    if (viewMode === 'postal') {
      exportOrdersByPostalCode(postalGroups);
    } else {
      exportOrdersToExcel(filteredOrders, 'alle_bestellungen');
    }
  }

  function handleExportPostalCode(postalCode, orders) {
    exportOrdersToExcel(orders, `bestellungen_plz_${postalCode}`);
  }

  if (loading) return <div className="section"><div className="tile">Laden...</div></div>;
  if (!user || (!isAdmin && !isManagement)) return <div className="section"><div className="tile">Kein Zugriff</div></div>;

  return (
    <div className="section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="hero-title">Bestellungen</h1>
          <p className="product-meta">Alle Bestellungen im Überblick – live aktualisiert</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`button ${viewMode === 'all' ? 'primary' : 'secondary'}`}
            onClick={() => setViewMode('all')}
          >
            Alle Bestellungen
          </button>
          <button 
            className={`button ${viewMode === 'postal' ? 'primary' : 'secondary'}`}
            onClick={() => setViewMode('postal')}
          >
            Nach PLZ
          </button>
          <button 
            className="button secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <IconFilter size={16} />
            Filter
          </button>
          <button 
            className="button secondary"
            onClick={handleExportAll}
          >
            <IconDownload size={16} />
            Export
          </button>
        </div>
      </div>

      {data.error && (
        <div className="tile" style={{ marginTop: 12, borderColor: "#ef4444", background: "#fff7ed", color: "#7c2d12" }}>{data.error}</div>
      )}

      {/* Filters */}
      {showFilters && viewMode !== 'postal' && (
        <div className="soft" style={{ marginBottom: '20px' }}>
          <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '12px' }}>Filter</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label className="label">Status</label>
                <select 
                  className="input" 
                  value={filters.status} 
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">Alle</option>
                  <option value="pending">Ausstehend</option>
                  <option value="completed">Abgeschlossen</option>
                  <option value="cancelled">Storniert</option>
                </select>
              </div>
              <div>
                <label className="label">Lieferung</label>
                <select 
                  className="input" 
                  value={filters.delivery} 
                  onChange={(e) => setFilters(prev => ({ ...prev, delivery: e.target.value }))}
                >
                  <option value="">Alle</option>
                  <option value="delivery">Lieferung</option>
                  <option value="pickup">Abholung</option>
                </select>
              </div>
              <div>
                <label className="label">Von Datum</label>
                <input 
                  type="date" 
                  className="input" 
                  value={filters.dateFrom} 
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Bis Datum</label>
                <input 
                  type="date" 
                  className="input" 
                  value={filters.dateTo} 
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Suche</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Bestellnummer, Name, Telefon..." 
                  value={filters.search} 
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            <button 
              className="button secondary" 
              onClick={() => setFilters({ status: '', delivery: '', dateFrom: '', dateTo: '', search: '' })}
              style={{ marginTop: '12px' }}
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      )}

      {/* Dashboard */}
      <div className="grid section" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        <StatCard label="Bestellungen" value={data.stats?.totalOrders ?? 0} />
        <StatCard label="Umsatz (CHF)" value={(data.stats?.revenue ?? 0).toFixed(2)} />
        <StatCard label="Artikel" value={data.stats?.itemsSold ?? 0} />
        <StatCard label="Lieferungen" value={data.stats?.deliveryOrders ?? 0} />
        <StatCard label="Abholungen" value={data.stats?.pickupOrders ?? 0} />
        <StatCard label="Ausstehend" value={data.stats?.pendingOrders ?? 0} />
        <StatCard label="Abgeschlossen" value={data.stats?.completedOrders ?? 0} />
        <StatCard label="Storniert" value={data.stats?.cancelledOrders ?? 0} />
      </div>

      {/* Orders list */}
      <div className="section" style={{ display: "grid", gap: 12 }}>
        {data.loading && <div className="tile">Laden...</div>}
        {!data.loading && viewMode !== 'postal' && filteredOrders.length === 0 && (
          <div className="tile">Keine Bestellungen gefunden</div>
        )}
        {!data.loading && viewMode === 'postal' && Object.keys(postalGroups).length === 0 && (
          <div className="tile">Keine Lieferbestellungen gefunden</div>
        )}
        
        {viewMode === 'postal' ? (
          // Postal code view
          Object.entries(postalGroups).map(([postalCode, orders]) => (
            <div key={postalCode} className="soft">
              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3>PLZ {postalCode} ({Array.isArray(orders) ? orders.length : 0} Bestellungen)</h3>
                  <button 
                    className="button secondary"
                    onClick={() => handleExportPostalCode(postalCode, orders)}
                  >
                    <IconDownload size={16} />
                    Export PLZ {postalCode}
                  </button>
                </div>
                <div className="grid" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
                  {Array.isArray(orders) && orders.map((o) => (
                    <OrderRow key={o.orderId} order={o} onUpdateStatus={updateOrderStatus} onDelete={deleteOrder} />
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          // Regular view
          groupedByDate.map(([day, orders]) => (
            <div key={day} className="soft">
              <div style={{ padding: 14 }}>
                <h3 style={{ marginBottom: 8 }}>{day}</h3>
                <div className="grid" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
                  {orders.map((o) => (
                    <OrderRow key={o.orderId} order={o} onUpdateStatus={updateOrderStatus} onDelete={deleteOrder} />
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
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

function OrderRow({ order, onUpdateStatus, onDelete }) {
  const created = new Date(order.createdAt || Date.now());
  const time = created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const itemsCount = (order.items || []).reduce((s, it) => s + (it.quantity || 0), 0);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Abgeschlossen';
      case 'cancelled': return 'Storniert';
      case 'pending': return 'Ausstehend';
      default: return 'Unbekannt';
    }
  };

  return (
    <div className="tile" style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontWeight: 800 }}>{order.orderId}</span>
          <span className="product-meta">{time}</span>
          <span 
            className="product-meta" 
            style={{ 
              color: getStatusColor(order.status), 
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: getStatusColor(order.status) + '20'
            }}
          >
            {getStatusText(order.status)}
          </span>
          {order.delivery?.enabled ? (
            <span className="product-meta" style={{ color: "#000080", fontWeight: 700 }}>Lieferung</span>
          ) : (
            <span className="product-meta" style={{ fontWeight: 700 }}>Abholung</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          <span className="product-meta">Artikel: {itemsCount}</span>
          <span style={{ fontWeight: 800 }}>CHF {(order.total || 0).toFixed(2)}</span>
          <div style={{ display: "flex", gap: "4px" }}>
            {order.status === 'pending' && (
              <>
                <button 
                  className="button secondary" 
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                  onClick={() => onUpdateStatus(order.orderId, 'completed')}
                  title="Als abgeschlossen markieren"
                >
                  <IconCheck size={14} />
                </button>
                <button 
                  className="button secondary" 
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                  onClick={() => onUpdateStatus(order.orderId, 'cancelled')}
                  title="Stornieren"
                >
                  <IconX size={14} />
                </button>
              </>
            )}
            {order.status === 'completed' && (
              <button 
                className="button secondary" 
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => onUpdateStatus(order.orderId, 'pending')}
                title="Zurück zu ausstehend"
              >
                <IconEdit size={14} />
              </button>
            )}
            <button 
              className="button secondary" 
              style={{ padding: '4px 8px', fontSize: '12px', color: '#ef4444' }}
              onClick={() => onDelete(order.orderId)}
              title="Bestellung löschen"
            >
              <IconTrash size={14} />
            </button>
          </div>
        </div>
      </div>
      <div className="divider" />
      <div className="grid" style={{ gridTemplateColumns: "1.2fr 0.8fr 1fr" }}>
        <div>
          <div className="product-title" style={{ marginBottom: 6 }}>Artikel Details</div>
          <div style={{ display: "grid", gap: 6 }}>
            {(order.items || []).map((it, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{it.name}</span>
                  <span className="product-meta"> × {it.quantity}</span>
                </div>
                <span>CHF {(it.price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="product-title" style={{ marginBottom: 6 }}>Kunde</div>
          <div className="product-meta" style={{ marginBottom: 4 }}>
            <IconUser size={14} style={{ marginRight: 4 }} />
            {order.customer?.name}
          </div>
          <div className="product-meta" style={{ marginBottom: 4 }}>
            <IconPhone size={14} style={{ marginRight: 4 }} />
            {order.customer?.phone}
          </div>
          <div className="product-meta">
            <IconMail size={14} style={{ marginRight: 4 }} />
            {order.customer?.email}
          </div>
        </div>
        <div>
          <div className="product-title" style={{ marginBottom: 6 }}>Lieferung & Preise</div>
          <div className="product-meta" style={{ marginBottom: 4 }}>
            <IconTruck size={14} style={{ marginRight: 4 }} />
            {order.delivery?.enabled ? "Ja" : "Nein"}
          </div>
          {order.delivery?.enabled && (
            <div className="product-meta" style={{ marginBottom: 4 }}>
              <IconMapPin size={14} style={{ marginRight: 4 }} />
              {order.delivery?.address}
            </div>
          )}
          <div className="product-meta">Zwischensumme: CHF {(order.subtotal || 0).toFixed(2)}</div>
          <div className="product-meta">Lieferung: CHF {(order.deliveryFee || 0).toFixed(2)}</div>
          <div className="product-meta" style={{ fontWeight: 800 }}>Gesamt: CHF {(order.total || 0).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}


