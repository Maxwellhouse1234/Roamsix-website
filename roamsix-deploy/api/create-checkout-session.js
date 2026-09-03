// api/create-checkout-session.js
// Creates a Stripe Checkout session for event registration.
// Accepts: eventId, packageId, customerEmail, customerName, isBundle, quantity
// Returns: { url } for redirect to Stripe hosted checkout

import { FOUNDER_REFERRALS } from "../lib/founder-referrals.js";
import { dinnerAvailability } from "../lib/dinner-operations.js";

const PACKAGE_DATA = {
  "olive-grove-dinner": {
    "olive-grove-dinner": {
      name: "OLIVE GROVE DINNER",
      price: 17500,
      stripePriceId: "price_1U6FdrLgUPmdquZohX9LXddv",
      bundlePrice: 29500,
      bundleStripePriceId: "price_1U6JAgLgUPmdquZotHktWTVR",
      requiresAge21: true,
    },
  },
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

const OLIVE_GROVE_PROMOTIONS = {
  FOUNDERPAIR: {
    promotionId: "promo_1U6PABLgUPmdquZo3cW9b4p2",
    type: "Founder Guest Pair",
    amountOff: 2000,
    appliesTo: "pair",
  },
  FOUNDER15: {
    promotionId: "promo_1U6JBbLgUPmdquZoK40ejc5t",
    type: "Founder Guest",
    percentOff: 15,
    appliesTo: "single",
  },
  ...Object.fromEntries(Object.entries(FOUNDER_REFERRALS).map(([code, referral]) => [code, {
    ...referral,
    type: "Founder Friend Referral",
    percentOff: 10,
  }])),
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    eventId               = "",
    packageId             = "",
    customerEmail         = "",
    customerName          = "",
    guestNames            = [],
    isBundle              = false,
    quantity              = 1,
    phone                 = "",
    emergencyContactName  = "",
    emergencyContactPhone = "",
    medicalNotes          = "",
    guestMedicalNotes     = "",
    eventName             = "",
    eventDate             = "",
    acceptedLegalVersion  = "",
    acceptedAt            = "",
    agreedToTerms         = "",
    ageConfirmed          = "",
    discountCode          = "",
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
  if (pkg.requiresAge21 && ageConfirmed !== "true" && ageConfirmed !== true) {
    return res.status(400).json({ error: "Guests must confirm they are 21 years of age or older." });
  }
  if (agreedToTerms !== "true" && agreedToTerms !== true) {
    return res.status(400).json({ error: "Please accept the event terms before continuing." });
  }

  const useBundle    = Boolean(isBundle) && Boolean(pkg.bundlePrice);
  const normalizedCode = String(discountCode || "").trim().toUpperCase().slice(0, 80);
  const requestedPromotion = eventId === "olive-grove-dinner" && normalizedCode
    ? OLIVE_GROVE_PROMOTIONS[normalizedCode]
    : null;
  if (normalizedCode && !requestedPromotion) {
    return res.status(400).json({ error: "That discount code is not valid for this dinner." });
  }
  if (!useBundle && requestedPromotion?.appliesTo === "pair") {
    return res.status(400).json({ error: "FOUNDERPAIR is reserved for the two-seat option." });
  }
  const isReferral = requestedPromotion?.type === "Founder Friend Referral";
  const founderPairPromotion = OLIVE_GROVE_PROMOTIONS.FOUNDERPAIR;
  const appliedPromotion = useBundle
    ? normalizedCode === "FOUNDERPAIR" || normalizedCode === "FOUNDER15"
      ? founderPairPromotion
      : null
    : requestedPromotion;
  const discountType = useBundle && isReferral
    ? "Founder Friend Referral (Pair Attribution)"
    : appliedPromotion?.type || "None";
  const cleanedGuestNames = Array.isArray(guestNames)
    ? guestNames.map((name) => String(name || "").trim()).filter(Boolean).slice(0, 9)
    : [];
  if (useBundle && cleanedGuestNames.length < 1) {
    return res.status(400).json({ error: "Please provide the name of the second guest." });
  }
  const stripePriceId = useBundle ? (pkg.bundleStripePriceId || "") : (pkg.stripePriceId || "");
  const unitAmount   = useBundle ? pkg.bundlePrice : pkg.price;
  const qty          = useBundle ? 1 : Math.max(1, parseInt(quantity, 10) || 1);
  const attendeeCount = useBundle ? 2 : qty;
  const productName  = `ROAMSIX - ${pkg.name}${useBundle ? " (Two Tickets)" : ""}`;

  if (eventId === "olive-grove-dinner") {
    try {
      const availability = await dinnerAvailability();
      if (availability.remainingSeats < attendeeCount) {
        return res.status(409).json({ error: "This dinner has reached capacity for the number of seats requested. Please join the waitlist." });
      }
    } catch (error) {
      console.error("Capacity check failed:", error.message);
      return res.status(503).json({ error: "We couldn’t confirm the remaining seats. Please try again shortly." });
    }
  }

  // Derive origin from request headers
  const host   = req.headers["x-forwarded-host"] || req.headers.host || "roamsix.com";
  const proto  = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${host}`;

  const successUrl = `${origin}/events/${eventId}/success?pkg=${packageId}&name=${encodeURIComponent(customerName.trim())}${useBundle ? "&bundle=1" : ""}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl  = `${origin}/events/${eventId}`;

  // Build Stripe request using URLSearchParams (bracket notation)
  const params = new URLSearchParams();
  params.set("mode", "payment");
  // Approved codes are validated here. Founder codes reduce the pair to $275;
  // referral codes on the pair preserve attribution without stacking a discount.
  if (appliedPromotion) params.set("discounts[0][promotion_code]", appliedPromotion.promotionId);
  params.set("customer_email", customerEmail.trim());
  params.set("success_url", successUrl);
  params.set("cancel_url", cancelUrl);
  params.set("metadata[eventId]", eventId);
  params.set("metadata[packageId]", packageId);
  params.set("metadata[customerName]", customerName.trim());
  params.set("metadata[guestNames]", cleanedGuestNames.join(" | ").slice(0, 480));
  params.set("metadata[isBundle]", useBundle ? "true" : "false");
  params.set("metadata[quantity]", String(attendeeCount));
  params.set("metadata[phone]", phone.trim().slice(0, 100));
  params.set("metadata[emergencyContactName]", emergencyContactName.trim().slice(0, 200));
  params.set("metadata[emergencyContactPhone]", emergencyContactPhone.trim().slice(0, 100));
  params.set("metadata[medicalNotes]", medicalNotes.trim().slice(0, 490));
  params.set("metadata[guestMedicalNotes]", guestMedicalNotes.trim().slice(0, 490));
  params.set("metadata[eventName]", eventName.trim().slice(0, 200));
  params.set("metadata[eventDate]", eventDate.toString().slice(0, 100));
  params.set("metadata[acceptedLegalVersion]", acceptedLegalVersion.toString().slice(0, 100));
  params.set("metadata[acceptedAt]", acceptedAt.toString().slice(0, 100));
  params.set("metadata[agreedToTerms]", agreedToTerms.toString().slice(0, 10));
  params.set("metadata[ageConfirmed]", ageConfirmed.toString().slice(0, 10));
  const discountAmount = appliedPromotion?.amountOff
    ? appliedPromotion.amountOff / 100
    : appliedPromotion?.percentOff
      ? (pkg.price * appliedPromotion.percentOff) / 10000
      : 0;
  params.set("metadata[discountCode]", requestedPromotion ? normalizedCode : "");
  params.set("metadata[discountType]", discountType);
  params.set("metadata[stripePromotionId]", appliedPromotion?.promotionId || "");
  params.set("metadata[discountAmount]", discountAmount.toFixed(2));
  params.set("metadata[referrerCode]", requestedPromotion?.referrerContactId ? normalizedCode : "");
  params.set("metadata[referrerContactId]", requestedPromotion?.referrerContactId || "");
  params.set("metadata[referrerName]", requestedPromotion?.referrerName || "");
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
