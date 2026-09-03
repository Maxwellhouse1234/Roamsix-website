import { airtable, findOne, formulaValue, listAll } from "../../lib/airtable-api.js";
import { DINNER, TABLES, dinnerAvailability, paidDinnerRegistrations, seatsForRegistration } from "../../lib/dinner-operations.js";
import { finalDetailsEmail, reservationReminderEmail, waitlistInvitationEmail } from "../../lib/dinner-email-templates.js";

const REMINDER_CAMPAIGN = "Olive Grove Dinner | September 4 Reservation Reminder";
const DETAILS_CAMPAIGN = "Olive Grove Dinner | September 14 Final Details";

function localDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function emailOkay(email) {
  const value = String(email || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value !== "max@reciprofy.com" && !value.endsWith("@roamsix.com");
}

async function sendEmail({ to, subject, html, key }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify({ from: "ROAMSIX <info@roamsix.com>", reply_to: "info@roamsix.com", to: [to], subject, html }),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json();
}

async function campaignRecord(name) {
  return findOne(TABLES.campaigns, `{Campaign Name}='${formulaValue(name)}'`);
}

async function finishCampaign(record, ids, count) {
  if (!record) return;
  await airtable(`${TABLES.campaigns}/${record.id}`, { method: "PATCH", body: JSON.stringify({ fields: { Status: "Sent", "Recipient Count": count, "Resend Broadcast ID": ids[0] || "", "Last Error": "" }, typecast: true }) });
}

async function failCampaign(record, error) {
  if (!record) return;
  await airtable(`${TABLES.campaigns}/${record.id}`, { method: "PATCH", body: JSON.stringify({ fields: { "Last Error": error.message.slice(0, 2000) } }) });
}

async function sendReservationReminders({ dryRun = false } = {}) {
  const campaign = await campaignRecord(REMINDER_CAMPAIGN);
  if (!campaign || campaign.fields?.Status === "Sent") return { skipped: true };
  try {
    const [contacts, registrations, referrals] = await Promise.all([
      listAll(TABLES.contacts),
      paidDinnerRegistrations(),
      listAll(TABLES.engagements, { filterByFormula: `AND({Event Name}='${formulaValue(DINNER.name)}',{Engagement Type}='Referred')` }),
    ]);
    const purchased = new Set(registrations.map((record) => String(record.fields?.["Contact Email"] || "").toLowerCase()));
    const referralByEmail = new Map(referrals.map((record) => [String(record.fields?.["Contact Email"] || "").toLowerCase(), record.fields?.["Referrer Code"] || ""]));
    const recipients = contacts.filter((contact) => {
      const email = String(contact.fields?.Email || "").toLowerCase();
      return emailOkay(email) && !purchased.has(email) && contact.fields?.["Email Permission"] !== "Unsubscribed" && contact.fields?.["Email Preference Token"] && (contact.fields?.["Founder Friend Code"] || referralByEmail.has(email));
    });
    if (dryRun) return { recipientCount: recipients.length, founderCount: recipients.filter((contact) => contact.fields?.["Founder Friend Code"]).length, referralCount: recipients.filter((contact) => !contact.fields?.["Founder Friend Code"]).length };
    const ids = [];
    for (const contact of recipients) {
      const email = String(contact.fields.Email).toLowerCase();
      const isFounder = Boolean(contact.fields?.["Founder Friend Code"]);
      const code = isFounder ? "FOUNDER15" : referralByEmail.get(email);
      const message = reservationReminderEmail({ firstName: contact.fields?.["First Name"] || "Hello", isFounder, code, preferenceToken: contact.fields["Email Preference Token"] });
      const sent = await sendEmail({ to: email, ...message, key: `olive-reminder-2026-09-04-${contact.id}` });
      ids.push(sent.id);
    }
    await finishCampaign(campaign, ids, recipients.length);
    return { sent: recipients.length };
  } catch (error) { await failCampaign(campaign, error); throw error; }
}

async function sendFinalDetails({ dryRun = false } = {}) {
  const campaign = await campaignRecord(DETAILS_CAMPAIGN);
  if (!campaign || campaign.fields?.Status === "Sent") return { skipped: true };
  try {
    const [contacts, registrations] = await Promise.all([listAll(TABLES.contacts), paidDinnerRegistrations()]);
    const contactByEmail = new Map(contacts.map((contact) => [String(contact.fields?.Email || "").toLowerCase(), contact]));
    const emails = [...new Set(registrations.map((record) => String(record.fields?.["Contact Email"] || "").toLowerCase()).filter(emailOkay))];
    if (dryRun) return { recipientCount: emails.length };
    const ids = [];
    for (const email of emails) {
      const contact = contactByEmail.get(email);
      const message = finalDetailsEmail({ firstName: contact?.fields?.["First Name"] || "Hello" });
      const sent = await sendEmail({ to: email, ...message, key: `olive-final-details-2026-09-14-${contact?.id || email}` });
      ids.push(sent.id);
    }
    await finishCampaign(campaign, ids, emails.length);
    return { sent: emails.length };
  } catch (error) { await failCampaign(campaign, error); throw error; }
}

async function processWaitlist(now = new Date(), { dryRun = false } = {}) {
  const records = await listAll(TABLES.waitlist, { filterByFormula: `{Event Slug}='${DINNER.slug}'` });
  const nowMs = now.getTime();
  for (const record of records.filter((item) => item.fields?.Status === "Invited" && item.fields?.["Invite Expires At"] && new Date(item.fields["Invite Expires At"]).getTime() <= nowMs)) {
    if (dryRun) { record.fields.Status = "Expired"; continue; }
    await airtable(`${TABLES.waitlist}/${record.id}`, { method: "PATCH", body: JSON.stringify({ fields: { Status: "Expired", "Invitation Notes": "Invitation window expired without a matching purchase." }, typecast: true }) });
    record.fields.Status = "Expired";
  }
  const availability = await dinnerAvailability();
  const activeInvitedSeats = records.filter((item) => item.fields?.Status === "Invited").reduce((sum, item) => sum + Number(item.fields?.["Party Size"] || 1), 0);
  let openSeats = Math.max(0, availability.remainingSeats - activeInvitedSeats);
  const waiting = records.filter((item) => item.fields?.Status === "Waiting").sort((a, b) => Number(a.fields?.Priority || 999999) - Number(b.fields?.Priority || 999999) || new Date(a.fields?.["Joined At"] || 0) - new Date(b.fields?.["Joined At"] || 0));
  if (dryRun) return { waitingCount: waiting.length, availableForWaitlist: openSeats };
  let invited = 0;
  for (const record of waiting) {
    const partySize = Math.min(2, Math.max(1, Number(record.fields?.["Party Size"] || 1)));
    if (partySize > openSeats || !emailOkay(record.fields?.Email)) continue;
    const expires = new Date(nowMs + 24 * 60 * 60 * 1000);
    const expiresText = expires.toLocaleString("en-US", { timeZone: "America/Los_Angeles", weekday: "long", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
    const message = waitlistInvitationEmail({ firstName: record.fields?.["First Name"] || "Hello", partySize, expiresAt: expiresText });
    await sendEmail({ to: record.fields.Email, ...message, key: `olive-waitlist-${record.id}-${now.toISOString().slice(0, 10)}` });
    await airtable(`${TABLES.waitlist}/${record.id}`, { method: "PATCH", body: JSON.stringify({ fields: { Status: "Invited", "Invited At": now.toISOString(), "Invite Expires At": expires.toISOString(), "Invitation Notes": `Invited automatically for ${partySize} seat${partySize === 1 ? "" : "s"}.` }, typecast: true }) });
    openSeats -= partySize;
    invited += 1;
    if (openSeats <= 0) break;
  }
  return { invited, openSeats };
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: "Unauthorized" });
  if (!process.env.RESEND_API_KEY || !process.env.AIRTABLE_TOKEN) return res.status(503).json({ error: "Email automation is not configured" });
  const dryRun = req.query?.dry_run === "1";
  const today = dryRun && /^2026-\d{2}-\d{2}$/.test(String(req.query?.date || "")) ? String(req.query.date) : localDate();
  try {
    const result = { today };
    if (today === "2026-09-04") result.reminder = await sendReservationReminders({ dryRun });
    if (today === "2026-09-14") result.details = await sendFinalDetails({ dryRun });
    if (today >= "2026-09-14" && today <= "2026-09-18") result.waitlist = await processWaitlist(new Date(), { dryRun });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Dinner campaign cron failed:", error.message);
    return res.status(500).json({ error: "Dinner campaign automation failed" });
  }
}
