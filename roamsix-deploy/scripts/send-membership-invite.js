const [, , approvalId, tier, email, approvedBy, name = "", rawHours = "168"] = process.argv;
const secret = process.env.MEMBERSHIP_APPROVAL_SECRET;
const siteUrl = String(process.env.PUBLIC_SITE_URL || "https://www.roamsix.com").replace(/\/$/, "");
const ttlHours = Number(rawHours);

if (!approvalId || !["field", "journey"].includes(String(tier || "").toLowerCase()) || !String(email || "").includes("@") || !approvedBy || !secret || !Number.isFinite(ttlHours)) {
  console.error("Usage: MEMBERSHIP_APPROVAL_SECRET=... npm run membership:approve -- <approval-id> <field|journey> <approved-email> <approved-by> [name] [hours]");
  process.exitCode = 1;
} else {
  const response = await fetch(`${siteUrl}/api/send-membership-invite`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ approvalId, tier, email, approvedBy, name, ttlHours }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error(data.error || `Invitation request failed (${response.status})`);
    process.exitCode = 1;
  } else {
    console.log(`Approved ${data.tier} invitation recorded and ${data.sendStatus.toLowerCase()} for ${data.email}; expires ${data.expiresAt}.`);
  }
}
