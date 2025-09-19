"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { getFirebaseDb } from "@/app/lib/firebase";
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const ownerEmail = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "").toLowerCase();
  const isOwner = ((user?.email || "").toLowerCase() === ownerEmail) && ownerEmail.length > 0;

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) return;
    loadUsers({ initial: true });
  }, [user, loading, isAdmin]);

  async function loadUsers({ initial = false } = {}) {
    try {
      if (initial) {
        setLoadingUsers(true);
      } else {
        setRefreshing(true);
      }
      const db = getFirebaseDb();
      const ref = collection(db, "profiles");
      const q = query(ref, orderBy("email"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);
      setStatus({ state: "idle", message: "" });
    } catch (e) {
      setStatus({ state: "error", message: e.message || "Fehler beim Laden der Benutzer" });
    } finally {
      if (initial) setLoadingUsers(false);
      setRefreshing(false);
    }
  }

  async function updateUserRole(userId, newRole) {
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, "profiles", userId), { role: newRole });
      setStatus({ state: "success", message: "Rolle erfolgreich aktualisiert" });
      // Optimistic update, then refresh list
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      loadUsers();
    } catch (e) {
      setStatus({ state: "error", message: e.message || "Fehler beim Aktualisieren der Rolle" });
    }
  }

  async function deleteUser(userId) {
    if (!confirm("Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?")) return;
    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, "profiles", userId));
      setStatus({ state: "success", message: "Benutzer erfolgreich gelöscht" });
      // Optimistic remove, then refresh list
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      loadUsers();
    } catch (e) {
      setStatus({ state: "error", message: e.message || "Fehler beim Löschen des Benutzers" });
    }
  }

  const filteredUsers = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return users;
    return users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      const role = (u.role || "").toLowerCase();
      return name.includes(f) || email.includes(f) || phone.includes(f) || role.includes(f);
    });
  }, [users, filter]);

  if (loading) return <div className="section"><div className="tile">Laden...</div></div>;
  if (!user) return <div className="section"><div className="tile">Bitte zuerst einloggen.</div></div>;
  if (!isAdmin) return <div className="section"><div className="tile">Kein Zugriff - Nur für Administratoren</div></div>;

  return (
    <div className="section" style={{ position: "relative" }}>
      <h1 className="hero-title">Admin Panel</h1>
      <p className="product-meta">Benutzerverwaltung und Rollenzuweisung</p>

      {status.state !== "idle" && (
        <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 50 }}>
          <div className="tile" style={{ 
            borderColor: status.state === "error" ? "#ef4444" : "#10b981", 
            background: status.state === "error" ? "#fff7ed" : "#f0fdf4", 
            color: status.state === "error" ? "#7c2d12" : "#14532d",
            minWidth: 260
          }}>
            {status.message}
          </div>
        </div>
      )}

      <div className="section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <h2>Benutzerverwaltung</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {refreshing && <span className="product-meta">Aktualisiere…</span>}
            <button className="button" onClick={() => loadUsers()}>Aktualisieren</button>
          </div>
        </div>
        <div className="tile" style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Suchen nach Name, E‑Mail, Telefon oder Rolle…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }}
          />
        </div>
        {loadingUsers ? (
          <div className="tile">Laden...</div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
            <div style={{ maxHeight: "70vh", overflowY: "auto", display: "grid", gap: 12, paddingRight: 4 }}>
            {filteredUsers.map((u) => (
              <UserCard 
                key={u.id} 
                user={u} 
                onUpdateRole={updateUserRole}
                onDeleteUser={deleteUser}
                currentUserId={user.uid}
                allowSelfChange={isOwner}
              />
            ))}
            {filteredUsers.length === 0 && (
              <div className="tile">Keine Benutzer gefunden.</div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({ user, onUpdateRole, onDeleteUser, currentUserId, allowSelfChange }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async (newRole) => {
    setIsUpdating(true);
    await onUpdateRole(user.id, newRole);
    setIsUpdating(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "#dc2626";
      case "management": return "#2563eb";
      case "user": return "#059669";
      default: return "#6b7280";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin": return "Administrator";
      case "management": return "Management";
      case "user": return "Benutzer";
      default: return "Unbekannt";
    }
  };

  return (
    <div className="tile" style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{user.name || "Kein Name"}</div>
          <div className="product-meta">{user.email}</div>
          {user.phone && <div className="product-meta">Tel: {user.phone}</div>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span 
            style={{ 
              padding: "4px 8px", 
              borderRadius: "4px", 
              fontSize: "0.8rem", 
              fontWeight: 600,
              color: "white",
              backgroundColor: getRoleColor(user.role || "user")
            }}
          >
            {getRoleLabel(user.role || "user")}
          </span>
        </div>
      </div>

      <div className="divider" />

      <div style={{ display: "grid", gap: 8 }}>
        <div className="product-title" style={{ marginBottom: 4 }}>Rolle ändern:</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["user", "management", "admin"].map((role) => (
            <button
              key={role}
              className="button"
              disabled={isUpdating || (user.id === currentUserId && !allowSelfChange)}
              style={{
                opacity: (user.role || "user") === role ? 1 : 0.6,
                backgroundColor: (user.role || "user") === role ? getRoleColor(role) : "#f3f4f6",
                color: (user.role || "user") === role ? "white" : "#374151",
                fontSize: "0.8rem",
                padding: "4px 8px"
              }}
              onClick={() => handleRoleChange(role)}
            >
              {getRoleLabel(role)}
            </button>
          ))}
        </div>
      </div>

      {(user.id !== currentUserId) && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="button"
            disabled={isUpdating}
            style={{ 
              backgroundColor: "#dc2626", 
              color: "white", 
              fontSize: "0.8rem",
              padding: "4px 8px"
            }}
            onClick={() => onDeleteUser(user.id)}
          >
            Löschen
          </button>
        </div>
      )}

      {user.id === currentUserId && !allowSelfChange && (
        <div className="product-meta" style={{ textAlign: "center", fontStyle: "italic" }}>
          (Sie können Ihre eigene Rolle nicht ändern)
        </div>
      )}
    </div>
  );
}


