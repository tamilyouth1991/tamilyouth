"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getFirebaseAuth, getFirebaseDb } from "@/app/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const AuthContext = createContext({ user: null, loading: true, profile: null, isAdmin: false });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    let unsubProfile = null;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAdmin(false);
      setProfile(null);
      if (unsubProfile) { unsubProfile(); unsubProfile = null; }
      if (u) {
        const ref = doc(db, "profiles", u.uid);
        unsubProfile = onSnapshot(ref, async (snap) => {
          const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
          const adminByEmail = adminEmails.includes((u.email || "").toLowerCase());
          const ownerEmail = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "").toLowerCase();
          const ownerByEmail = ownerEmail && (u.email || "").toLowerCase() === ownerEmail;

          if (!snap.exists()) {
            await setDoc(ref, { name: u.displayName || "", email: u.email || "", phone: "", address: "", role: (adminByEmail || ownerByEmail) ? "admin" : "user" }, { merge: true });
            return;
          }
          const data = snap.data();
          // Ensure admin by email gets role promoted in profile for consistency
          if ((adminByEmail || ownerByEmail) && (data.role || "user") !== "admin") {
            await setDoc(ref, { role: "admin" }, { merge: true });
          }
          setProfile(data);
          setIsAdmin(adminByEmail || ownerByEmail || (data.role || "user") === "admin");
        });
      }
      setLoading(false);
    });
    return () => { unsub(); if (unsubProfile) unsubProfile(); };
  }, []);

  const value = { user, loading, profile, isAdmin, signOut: () => signOut(getFirebaseAuth()) };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


