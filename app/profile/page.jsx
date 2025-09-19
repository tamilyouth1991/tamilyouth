"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/components/AuthProvider";
import { getFirebaseAuth, getFirebaseDb } from "@/app/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  function logout() { signOut(getFirebaseAuth()); }

  return (
    <div className="section">
      <h1 className="hero-title">Profil</h1>
      {loading ? (
        <div className="tile" style={{ marginTop: 12 }}>Laden...</div>
      ) : !user ? (
        <div className="tile" style={{ marginTop: 12 }}>Nicht eingeloggt. Bitte Login oder Registrieren.</div>
      ) : (
        <div className="soft" style={{ marginTop: 8 }}>
          <ProfileForm user={user} onLogout={logout} />
        </div>
      )}
    </div>
  );
}

function ProfileForm({ user, onLogout }) {
  const initial = {
    name: user.displayName || "",
    email: user.email || "",
    phone: "",
    address: "",
  };
  const [values, setValues] = React.useState(initial);
  function update(field, value) { setValues((p) => ({ ...p, [field]: value })); }
  async function save() {
    const db = getFirebaseDb();
    await setDoc(doc(db, "profiles", user.uid), { name: values.name, email: user.email, phone: values.phone, address: values.address }, { merge: true });
  }

  // If AuthProvider already has live profile, hydrate initial values once on mount
  const { profile } = useAuth();
  useEffect(() => {
    if (profile) {
      setValues({
        name: profile.name || initial.name,
        email: user.email,
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16, display: "grid", gap: 10 }}>
      <div className="product-title">Willkommen, {user.displayName || user.email}</div>
      <div className="form">
        <div>
          <label className="label">Name</label>
          <input className="input" value={values.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Telefon</label>
          <input className="input" value={values.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
        <div>
          <label className="label">Adresse</label>
          <input className="input" value={values.address} onChange={(e) => update("address", e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="button" type="button" onClick={save}>Speichern</button>
          <button className="button secondary" type="button" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}


