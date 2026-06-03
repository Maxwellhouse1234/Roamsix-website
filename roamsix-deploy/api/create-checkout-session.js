// api/create-checkout-session.js
// Creates a Stripe Checkout session for event registration.
// Accepts: eventId, packageId, customerEmail, customerName, isBundle, quantity
// Returns: { url } for redirect to Stripe hosted checkout

const PACKAGE_DATA = {
  "high-output-long-game": {
    "field-pass": {
      name: "FIELD PASS",
      price: 9500,
      stripePriceId: "price_1TZcsNLgUPmdquZoDXTSQayy",
    },
    "long-game": {
      name: "THE LONG GAME EXPERIENCE",
      price: 22500,
      stripePriceId: "price_1TZcsLLgUPmdquZorxSlweXQ",
      bundlePrice: 39800,
      bundleStripePriceId: "price_1TZcsNLgUPmdquZok2C0VstS",
    },
    "private-circle": {
      name: "PRIVATE CIRCLE",
      price: 32500,
      stripePriceId: "price_1TZcsOLgUPmdquZo6JOwHcjO",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    eventId               = "",
    packageId             = "",
    customerEmail         = "",
    customerName          = "",
    isBundle              = false,
    quantity              = 1,
    phone                 = "",
    emergencyContactName  = "",
    emergencyContactPhone = "",
    medicalNotes          = "",
    eventName             = "",
    eventDate             = "",
    acceptedLegalVersion  = "",
    acceptedAt            = "",
    agreedToTerms         = "",
  } = req.body || {};

  if (!customerEmail.trim() || !customerName.trim()) {
    return res.status(400).json({ error: "Name and email are required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "Stripe is not configured yet. Please contact info@roamsix.com to register." });
  }

  const eventPackages = PACKAGE_DATA[eventId];
  if (!eventPackages) {
    return res.status(400).json({ error: "Event not found." });
  }
  const pkg = eventPackages[packageId];
  if (!pkg) {
    return res.status(400).json({ error: "Package not found." });
  }

  const useBundle    = Boolean(isBundle) && Boolean(pkg.bundlePrice);
  const stripePriceId = useBundle ? (pkg.bundleStripePriceId || "") : (pkg.stripePriceId || "");
  const unitAmount   = useBundle ? pkg.bundlePrice : pkg.price;
  const qty          = useBundle ? 1 : Math.max(1, parseInt(quantity, 10) || 1);
  const productName  = `ROAMSIX - ${pkg.name}${useBundle ? " (Couples Bundle)" : ""}`;

  // Derive origin from request headers
  const host   = req.headers["x-forwarded-host"] || req.headers.host || "roamsix.com";
  const proto  = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${host}`;

  const successUrl = `${origin}/events/${eventId}/success?pkg=${packageId}&name=${encodeURIComponent(customerName.trim())}${useBundle ? "&bundle=1" : ""}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl  = `${origin}/events/${eventId}`;

  // Build Stripe request using URLSearchParams (bracket notation)
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("allow_promotion_codes", "true");
  params.set("customer_email", customerEmail.trim());
  params.set("success_url", successUrl);
  params.set("cancel_url", cancelUrl);
  params.set("metadata[eventId]", eventId);
  params.set("metadata[packageId]", packageId);
  params.set("metadata[customerName]", customerName.trim());
  params.set("metadata[isBundle]", useBundle ? "true" : "false");
  params.set("metadata[quantity]", String(qty));
  params.set("metadata[phone]", phone.trim().slice(0, 100));
  params.set("metadata[emergencyContactName]", emergencyContactName.trim().slice(0, 200));
  params.set("metadata[emergencyContactPhone]", emergencyContactPhone.trim().slice(0, 100));
  params.set("metadata[medicalNotes]", medicalNotes.trim().slice(0, 490));
  params.set("metadata[eventName]", eventName.trim().slice(0, 200));
  params.set("metadata[eventDate]", eventDate.toString().slice(0, 100));
  params.set("metadata[acceptedLegalVersion]", acceptedLegalVersion.toString().slice(0, 100));
  params.set("metadata[acceptedAt]", acceptedAt.toString().slice(0, 100));
  params.set("metadata[agreedToTerms]", agreedToTerms.toString().slice(0, 10));
  params.set("line_items[0][quantity]", String(qty));

  if (stripePriceId) {
    // Use a pre-created Stripe Price (preferred for production)
    params.set("line_items[0][price]", stripePriceId);
  } else {
    // Use dynamic price_data (works before Stripe prices are created)
    params.set("line_items[0][price_data][currency]", "usd");
    params.set("line_items[0][price_data][unit_amount]", String(unitAmount));
    params.set("line_items[0][price_data][product_data][name]", productName);
  }

  try {
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error("Stripe error:", data);
      return res.status(400).json({ error: data.error?.message || "Failed to create checkout session." });
    }

    return res.status(200).json({ url: data.url });
  } catch (err) {
    console.error("Stripe fetch error:", err);
    return res.status(500).json({ error: "Failed to connect to payment provider." });
  }
}
