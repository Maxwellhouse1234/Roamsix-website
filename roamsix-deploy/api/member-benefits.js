import { publicMemberBenefits } from "../lib/member-benefits.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  try {
    const benefits = await publicMemberBenefits();
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ benefits });
  } catch (error) {
    console.error("Public member benefits failed:", error.message);
    return res.status(500).json({ error: "Member benefits are temporarily unavailable." });
  }
}
