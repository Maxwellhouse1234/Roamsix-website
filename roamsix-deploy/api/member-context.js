import { sessionFromRequest } from "../lib/member-auth.js";
import { memberDashboard } from "../lib/member-data.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  const session = sessionFromRequest(req);
  if (!session) return res.status(200).json({ signedIn: false, activeMember: false });
  try {
    const data = await memberDashboard(session.email);
    if (!data.membership.eligible) return res.status(200).json({ signedIn: true, activeMember: false });
    return res.status(200).json({
      signedIn: true,
      activeMember: true,
      tier: data.membership.tier,
      profile: {
        fullName: data.profile.fullName,
        email: data.profile.email,
        mobile: data.profile.mobile,
      },
    });
  } catch (error) {
    console.error("Member context lookup failed:", error.message);
    return res.status(200).json({ signedIn: true, activeMember: false });
  }
}
