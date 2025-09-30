"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getFirebaseAuth, getFirebaseDb } from "@/app/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext({ user: null, loading: true, profile: null, isAdmin: false, isManagement: false });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManagement, setIsManagement] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    let unsubProfile = null;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAdmin(false);
      setIsManagement(false);
      setProfile(null);
      if (unsubProfile) { unsubProfile(); unsubProfile = null; }
      if (u) {
        const profileRef = doc(db, "profiles", u.uid);
        unsubProfile = onSnapshot(profileRef, async (snap) => {
          const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
          const adminByEmail = adminEmails.includes((u.email || "").toLowerCase());
          const ownerEmail = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "").toLowerCase();
          const ownerByEmail = ownerEmail && (u.email || "").toLowerCase() === ownerEmail;

          if (!snap.exists()) {
            // Don't create profile automatically to avoid permission issues
            setProfile({ name: u.displayName || "", email: u.email || "", phone: "", address: "", role: "user" });
            setIsAdmin(ownerByEmail || adminByEmail);
            setIsManagement(false);
            return;
          }
          const data = snap.data();
          setProfile(data);
          
          // Determine user role with email-based promotion
          let userRole = data.role || "user";
          if (ownerByEmail || adminByEmail) {
            userRole = "admin";
          }
          
          setIsAdmin(userRole === "admin");
          setIsManagement(userRole === "management" || userRole === "admin");
        });
      }
      setLoading(false);
    });
    return () => { unsub(); if (unsubProfile) unsubProfile(); };
  }, []);

  const value = { user, loading, profile, isAdmin, isManagement, signOut: () => signOut(getFirebaseAuth()) };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


