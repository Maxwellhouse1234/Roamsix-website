import { sameOrigin, sessionFromRequest } from "../lib/member-auth.js";
import { memberDashboard, recordMemberAction, updateMemberProfile } from "../lib/member-data.js";

export default async function handler(req, res) {
  const session = sessionFromRequest(req);
  if (!session) return res.status(401).json({ error: "Sign in is required." });
  try {
    if (req.method === "GET") {
      const dashboard = await memberDashboard(session.email);
      if (!dashboard.membership.eligible) return res.status(403).json({ error: "An active membership was not found." });
      return res.status(200).json(dashboard);
    }
    if (req.method !== "PATCH" && req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
    if (!sameOrigin(req)) return res.status(403).json({ error: "Request origin was not accepted." });
    if (req.method === "PATCH") return res.status(200).json(await updateMemberProfile(session.email, req.body || {}));
    const action = String(req.body?.action || "");
    if (!["booking", "topic"].includes(action)) return res.status(400).json({ error: "Unknown member request." });
    await recordMemberAction(session.email, { action, eventName: req.body?.eventName, message: req.body?.message });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Member dashboard request failed:", error.message);
    return res.status(500).json({ error: "The member area could not be updated right now." });
  }
}
