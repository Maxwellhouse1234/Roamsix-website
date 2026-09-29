import { DR_SAL_EVENT, drSalAvailability } from "../lib/dr-sal-event.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (String(req.query?.eventId || "") !== DR_SAL_EVENT.id) return res.status(404).json({ error: "Event not found" });
  res.setHeader("Cache-Control", "no-store");
  try {
    return res.status(200).json(await drSalAvailability());
  } catch (error) {
    console.error("Event availability failed:", error.message);
    return res.status(503).json({ error: "Seat availability could not be confirmed." });
  }
}
