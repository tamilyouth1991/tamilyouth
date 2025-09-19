"use client";

import { useState } from "react";
import { getFirebaseAuth } from "@/app/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  function update(field, value) { setValues((p) => ({ ...p, [field]: value })); }

  async function onSubmit(e) {
    e.preventDefault();
    if (!values.email || !values.password) {
      setStatus({ state: "error", message: "Bitte E-Mail und Passwort eingeben." });
      return;
    }
    setStatus({ state: "loading", message: "Anmelden..." });
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), values.email, values.password);
      setStatus({ state: "success", message: "Angemeldet." });
    } catch (err) {
      setStatus({ state: "error", message: err.message || "Login fehlgeschlagen" });
    }
  }

  return (
    <div className="section">
      <h1 className="hero-title">Login</h1>
      <div className="soft" style={{ marginTop: 8 }}>
        <form className="form" style={{ padding: 16 }} onSubmit={onSubmit}>
          <div>
            <label className="label" htmlFor="login-email">E‑Mail</label>
            <input id="login-email" className="input" type="email" value={values.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="login-password">Passwort</label>
            <input id="login-password" className="input" type="password" value={values.password} onChange={(e) => update("password", e.target.value)} />
          </div>
          <button className="button" type="submit" disabled={status.state === "loading"}>{status.state === "loading" ? "Bitte warten..." : "Anmelden"}</button>
          {status.state !== "idle" && (
            <p style={{ color: status.state === "error" ? "#b91c1c" : "#000080" }}>{status.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}


