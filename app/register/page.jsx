"use client";

import { useState } from "react";
import { getFirebaseAuth } from "@/app/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function RegisterPage() {
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  function update(field, value) { setValues((p) => ({ ...p, [field]: value })); }

  async function onSubmit(e) {
    e.preventDefault();
    if (!values.name || !values.email || !values.password) {
      setStatus({ state: "error", message: "Bitte alle Felder ausfüllen." });
      return;
    }
    setStatus({ state: "loading", message: "Registrieren..." });
    try {
      const auth = getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(cred.user, { displayName: values.name });
      setStatus({ state: "success", message: "Registriert und angemeldet." });
    } catch (err) {
      setStatus({ state: "error", message: err.message || "Registrierung fehlgeschlagen" });
    }
  }

  return (
    <div className="section">
      <h1 className="hero-title">Registrieren</h1>
      <div className="soft" style={{ marginTop: 8 }}>
        <form className="form" style={{ padding: 16 }} onSubmit={onSubmit}>
          <div>
            <label className="label" htmlFor="reg-name">Name</label>
            <input id="reg-name" className="input" value={values.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="reg-email">E‑Mail</label>
            <input id="reg-email" className="input" type="email" value={values.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="reg-password">Passwort</label>
            <input id="reg-password" className="input" type="password" value={values.password} onChange={(e) => update("password", e.target.value)} />
          </div>
          <button className="button" type="submit" disabled={status.state === "loading"}>{status.state === "loading" ? "Bitte warten..." : "Registrieren"}</button>
          {status.state !== "idle" && (
            <p style={{ color: status.state === "error" ? "#b91c1c" : "#000080" }}>{status.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}


