export const CRM_BASE_ID = process.env.ROAMSIX_CRM_BASE_ID || "appdIBqCMPWJxODG2";

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

export function formulaValue(value) {
  return clean(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export async function airtable(path, options = {}) {
  if (!process.env.AIRTABLE_TOKEN) throw new Error("AIRTABLE_TOKEN is not configured");
  const response = await fetch(`https://api.airtable.com/v0/${CRM_BASE_ID}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`Airtable ${response.status}: ${(await response.text()).slice(0, 400)}`);
  return response.status === 204 ? null : response.json();
}

export async function listAll(tableId, params = {}) {
  const records = [];
  let offset = "";
  do {
    const query = new URLSearchParams({ pageSize: "100", ...params });
    if (offset) query.set("offset", offset);
    const data = await airtable(`${tableId}?${query}`);
    records.push(...(data.records || []));
    offset = data.offset || "";
  } while (offset);
  return records;
}

export async function findOne(tableId, formula) {
  const records = await listAll(tableId, { filterByFormula: formula, maxRecords: "1" });
  return records[0] || null;
}
