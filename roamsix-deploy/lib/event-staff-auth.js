import { timingSafeEqual } from "node:crypto";

function bearer(req) {
  const header = String(req.headers.authorization || "");
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

export function isAuthorizedEventStaff(req) {
  const configured = String(process.env.ROAMSIX_STAFF_ACCESS_TOKEN || "");
  const supplied = bearer(req);
  if (configured.length < 24 || supplied.length !== configured.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(configured));
}
