import { dinnerAvailability, joinDinnerWaitlist } from "../lib/dinner-operations.js";

function clean(value, max = 320) { return String(value || "").trim().slice(0, max); }

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const firstName = clean(req.body?.firstName, 100);
  const lastName = clean(req.body?.lastName, 100);
  const email = clean(req.body?.email, 320).toLowerCase();
  const mobile = clean(req.body?.mobile, 50);
  const partySize = Math.min(2, Math.max(1, Number(req.body?.partySize || 1)));
  const website = clean(req.body?.website, 200);
  if (website) return res.status(200).json({ success: true });
  if (!firstName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Please provide your first name and a valid email." });
  try {
    const availability = await dinnerAvailability();
    if (!availability.soldOut) return res.status(409).json({ error: "Seats are currently available. Please reserve directly from the dinner page." });
    await joinDinnerWaitlist({ firstName, lastName, email, mobile, partySize });
    return res.status(200).json({ success: true, message: "You are on the prioritized waitlist. We will contact you if space becomes available." });
  } catch (error) {
    console.error("Dinner waitlist failed:", error.message);
    return res.status(500).json({ error: "We couldn’t add you to the waitlist. Please email info@roamsix.com." });
  }
}
