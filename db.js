/* =========================================================
   Lita's Jalapeño Poppers — order logging to a database
   ========================================================= */

/* ---------------------------------------------------------
   EDIT ME: paste your Supabase project's URL and anon (public)
   key below. Get them from: Supabase dashboard → Project
   Settings → API.

   The "anon" key is SAFE to leave in this public file — but
   ONLY because the database's Row Level Security policies
   (see README, section on the database) restrict it to
   insert-only, with no read access. Never paste the
   "service_role" secret key here; that one must stay private.

   Until these are filled in, order logging is silently
   skipped and the WhatsApp order still works normally.
--------------------------------------------------------- */
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co"; // <-- replace
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY"; // <-- replace

let _supabaseClient = null;

function getSupabaseClient() {
  const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("YOUR-PROJECT-REF");
  if (!configured) return null;
  if (!_supabaseClient && window.supabase) {
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabaseClient;
}

/* ---------------------------------------------------------
   Saves one order + its line items. Called from
   sendWhatsAppOrder() in script.js WITHOUT being awaited —
   this must never delay or block the WhatsApp handoff, since
   that's what actually gets the order to the kitchen. Any
   failure here (not configured yet, network hiccup, etc.) is
   caught and logged to the console only.

   cartSnapshot: [{ id, name, price, qty }, ...]
   meta: { name, fulfillment, notes, language, total }
--------------------------------------------------------- */
async function logOrderToDatabase(cartSnapshot, meta) {
  const client = getSupabaseClient();
  if (!client) return; // not configured yet

  try {
    const { data: orderRow, error: orderError } = await client
      .from("orders")
      .insert({
        customer_name: meta.name || null,
        fulfillment: meta.fulfillment || null,
        notes: meta.notes || null,
        language: meta.language || null,
        total: meta.total,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const itemRows = cartSnapshot.map((line) => ({
      order_id: orderRow.id,
      item_id: line.id,
      item_name: line.name,
      unit_price: line.price,
      quantity: line.qty,
      line_total: +(line.price * line.qty).toFixed(2),
    }));

    const { error: itemsError } = await client.from("order_items").insert(itemRows);
    if (itemsError) throw itemsError;
  } catch (err) {
    console.error("Order logging failed (the WhatsApp order still went through):", err);
  }
}
