# Lita's Jalapeño Poppers — Website

A 4-page site (Home, Menu, About Us, Contact) with a shopping cart that sends
orders straight to WhatsApp *and* logs them to a database, item option
dropdowns, and a language picker (English/Spanish) that translates the
whole site. No server for you to run — the site itself is plain HTML/CSS/JS,
and order logging uses a free hosted database (Supabase) rather than a
server you'd have to maintain.

## Files
- `index.html` — Home
- `menu.html` — Menu, with cart, option dropdowns + WhatsApp checkout
- `about.html` — About Us
- `contact.html` — Contact, hours, map, contact form
- `style.css` — all styling (colors, fonts, layout)
- `script.js` — menu structure, prices, option groups, cart logic
- `i18n.js` — **all site text**, in English and Spanish, plus the language
  switcher logic
- `db.js` — order logging to a Supabase database (see section below)
- `supabase-setup.sql` — run once in Supabase to create the database
- `assets/` — logo and favicon images
- `favicon.ico` — browser tab icon

## 0. Order logging to a database
Every time a customer completes an order, the site now also saves it to a
database — every item, its price and quantity, the customer's name,
pickup/delivery choice, notes, and a timestamp — in addition to sending
the WhatsApp message exactly as before. This uses Supabase (a free hosted
Postgres database with no server for you to run or maintain).

**Setup (about 10 minutes, do this once):**
1. Create a free account at supabase.com and a new project — ideally under
   an email the owner will keep long-term, since this account owns the
   data after handover.
2. In the SQL Editor, run everything in `supabase-setup.sql`. This creates
   two tables, `orders` and `order_items`, and locks them down with Row
   Level Security so the public website can only *add* new rows — it can
   never read, edit, or delete anything. Browsing the data requires being
   logged into the Supabase dashboard.
3. Go to Project Settings → API, copy the **Project URL** and the **anon
   public** key (never the `service_role` key — that one is secret).
4. Paste both into `db.js`, replacing the two placeholder values near the
   top.
5. Test: place an order on the live site, then check Table Editor →
   `orders` / `order_items` in Supabase to confirm it logged.

To view past orders: log into Supabase → Table Editor. You mentioned you'd
rather check the database directly than have an admin page on the site
itself — if that changes later, a simple order-history page reading from
these same tables is a small addition.

Until you complete the steps above, `db.js` quietly does nothing — orders
still go out via WhatsApp exactly as they do now, nothing breaks. And even
after it's configured, if the database write ever fails for any reason
(no connection to Supabase, a typo in the keys, etc.), the WhatsApp order
still goes through — the two are intentionally independent, so a database
hiccup can never cost the business an order.

**Handing over the project:** either give the owner the Supabase login, or
use Project Settings → "Transfer project" to move it fully into an account
they control.

## 1. The WhatsApp numbers — please confirm these
The site uses **604-7398** (`5016047398`) for the cart's "Send order on
WhatsApp" button and the contact form — that's the number printed as
"Available on WhatsApp" on Lita's own menu flyers. The wholesale catalog
lists a different number, **634-8678**, used on the Contact page as a
separate "WhatsApp (wholesale)" link.

Please confirm 604-7398 is the right number to receive online orders. If
wholesale customers should check out through the same cart, or you'd rather
split retail/wholesale into two separate carts, let me know and I'll wire
that up. To change either number: `WHATSAPP_ORDER_NUMBER` near the top of
`script.js` (cart + contact form), and the two `wa.me/...` links in
`contact.html`.

## 2. A pricing conflict worth double-checking
The frozen popper packs appear with different numbers in two of your
documents:
- The **Popper Menu** flyer lists flat prices with no pack size stated:
  Chicken $23, Spinach $23, Shrimp/Bacon/Lemon/Buffalo $25.
- The **wholesale catalog booklet** breaks it down by size: Chicken &
  Spinach at $18 / $36 / $90 for 10 / 20 / 50 packs; Shrimp, Bacon, Buffalo,
  Italian Sausage and Lemon Chicken at $20 / $40 / $100.

The site currently uses the **catalog booklet's** numbers, since it's the
more detailed, dedicated wholesale price list — worth confirming which one
is actually current before this goes live. Prices live in `ITEM_PRICES` in
`script.js`.

## 3. The language picker
First-time visitors see a small popup asking English or Español. Their
choice is remembered (so it won't ask again), and an EN / ES switcher in
the nav bar lets them change it anytime — on any page, including mid-order.
Everything switches: nav, headings, menu item names, the cart, and even the
WhatsApp order message itself, in whichever language the visitor picked.
The logo image is the only thing that doesn't change, as requested.

**All site text lives in one file, `i18n.js`.** To fix a typo or reword
something, search for it there — English text is in the `en: { ... }`
block, Spanish in `es: { ... }`, matched by the same key (e.g.
`hero_h1: "..."` appears once per language). To add a third language,
duplicate the `en` block, translate every line, and add a matching button
in each HTML file (search for `data-lang-option`).

## 4. Logo & favicon
The badge logo is in `assets/logo.png` (transparent background, sized for
the nav) and is also the browser tab icon (`favicon.ico` + the PNGs in
`assets/`). To swap in a sharper version later: export it the same way
(transparent background, roughly square crop) and drop it in over the
existing files — no HTML changes needed.

## 5. Photos and the map are live now
- **Photos** — real photos are now in place on the Home and About pages, in
  `assets/photos/`. Since there wasn't a shake photo or a portrait of Lita
  available yet, I used the closest fitting shots instead (the burger and
  the "Enjoy! Comeback Soon" welcome shot) and adjusted their captions to
  match — easy to swap for the real thing later: replace the file in
  `assets/photos/` and keep the same filename, or update the `src` in
  `index.html` / `about.html` to a new filename. The frames crop
  automatically to fit (`object-fit: cover`), so any photo size works
  without breaking the layout.
- **Google Map** — now pinned to Lita's actual location from the link you
  sent (16.5314743, -88.4142091), in `contact.html`.
- **Exact street address** — still just says "Independence Village,
  Belize" in the text on the Contact page and footer, since I only have
  coordinates, not a written address. Send the address text whenever you
  have it and I'll drop it in — the map itself is already accurate.
- **Hours** — already set from your list in an earlier round.

## 6. How the cart → WhatsApp order works
No backend is required. When a customer adds items and taps "Send order on
WhatsApp," the site builds a plain text message (items, quantities, total,
name, pickup/delivery, notes — all in the customer's chosen language) and
opens `https://wa.me/<number>?text=...`, handing off to WhatsApp with that
message pre-filled. The customer taps Send in WhatsApp themselves. The cart
itself lives only in the visitor's own browser (`localStorage`), so nothing
about their order is stored anywhere else — same for their language choice.

## 7. Security notes
This is a static site with no logins, no server, and no database, so most
"website security" concerns (SQL injection, server breaches, session
hijacking) don't apply. What still matters:
- **Serve it over HTTPS.** Any hosting option below gives you free HTTPS
  automatically.
- **No payment info is collected here.** Payment still happens in person or
  however Lita's already handles it — this site never asks for a card
  number. Taking payments on the site itself would be a separate project
  (a real backend + a payment processor).
- The Google Map embed and Google Fonts load from Google's own servers over
  HTTPS; no user data is sent to them beyond a normal page view.

## 8. Putting it online
Any static hosting service works, since these are just plain files:
- **Netlify** — drag the whole `lita-site` folder onto app.netlify.com/drop
  for an instant HTTPS link.
- **GitHub Pages** — push these files to a GitHub repo, then enable Pages
  in the repo settings.

If uploading to an existing host, keep all files (including the `assets`
folder) in the same directory — they reference each other by relative path.

## 9. Testing before you launch
- Open `index.html` directly in a browser to preview locally.
- Try both languages, on every page, including with items in the cart.
- Add a few items on the Menu page, open the cart, and confirm the
  WhatsApp message looks right before sharing the site with anyone.
- Check the mobile view — most customers will likely visit from a phone.
