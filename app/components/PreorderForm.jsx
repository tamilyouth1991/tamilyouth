"use client";

import { useState } from "react";

export default function PreorderForm({ productName = "", compact = false }) {
  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    product: productName || "",
    quantity: 1,
    note: "",
  });
  const [status, setStatus] = useState({ state: "idle", message: "" });

  function updateField(field, value) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ state: "loading", message: "Senden..." });

    if (!formValues.name || !formValues.phone || !formValues.product) {
      setStatus({ state: "error", message: "Bitte Name, Telefon und Produkt angeben." });
      return;
    }

    try {
      const res = await fetch("/api/preorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      if (!res.ok) throw new Error("Fehler beim Senden");
      setStatus({ state: "success", message: "Danke! Wir melden uns in Kürze." });
      setFormValues({ name: "", phone: "", product: productName || "", quantity: 1, note: "" });
    } catch (err) {
      setStatus({ state: "error", message: "Etwas ist schiefgelaufen. Bitte später erneut versuchen." });
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div>
        <label className="label" htmlFor="name">Name</label>
        <input id="name" className="input" type="text" placeholder="Dein Name" value={formValues.name} onChange={(e) => updateField("name", e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="phone">Telefon</label>
        <input id="phone" className="input" type="tel" placeholder="z.B. 0176 ..." value={formValues.phone} onChange={(e) => updateField("phone", e.target.value)} />
      </div>
      {!compact && (
        <div>
          <label className="label" htmlFor="product">Produkt</label>
          <input id="product" className="input" type="text" placeholder="z.B. Chicken Biryani" value={formValues.product} onChange={(e) => updateField("product", e.target.value)} />
        </div>
      )}
      <div>
        <label className="label" htmlFor="quantity">Anzahl</label>
        <input id="quantity" className="input" type="number" min="1" value={formValues.quantity} onChange={(e) => updateField("quantity", Number(e.target.value))} />
      </div>
      <div>
        <label className="label" htmlFor="note">Notiz (optional)</label>
        <textarea id="note" className="textarea" rows={3} placeholder="Allergien, Abholzeit, etc." value={formValues.note} onChange={(e) => updateField("note", e.target.value)} />
      </div>
      <button className="button" type="submit" disabled={status.state === "loading"}>
        {status.state === "loading" ? "Senden..." : "Jetzt vorbestellen"}
      </button>
      {status.state !== "idle" && (
        <p style={{ color: status.state === "error" ? "#b91c1c" : "#065f46" }}>
          {status.message}
        </p>
      )}
    </form>
  );
}
