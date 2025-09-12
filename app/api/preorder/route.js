export async function POST(request) {
  try {
    const data = await request.json();

    const { name, phone, product, quantity, note } = data || {};
    if (!name || !phone) {
      return new Response(JSON.stringify({ ok: false, error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // In a real app, save to DB or send email here.
    console.log("Preorder received:", { name, phone, product, quantity, note });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
