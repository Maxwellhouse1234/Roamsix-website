import { dinnerAvailability } from "../lib/dinner-operations.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    res.setHeader("Cache-Control", "no-store");
    const { soldOut } = await dinnerAvailability();
    return res.status(200).json({ soldOut });
  } catch (error) {
    console.error("Dinner availability failed:", error.message);
    return res.status(503).json({ error: "Availability is temporarily unavailable." });
  }
}
