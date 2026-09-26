const baseId = process.env.ROAMSIX_CRM_BASE_ID || "appdIBqCMPWJxODG2";
const token = process.env.AIRTABLE_TOKEN;

if (!token) {
  console.error("AIRTABLE_TOKEN is required to provision email operations tables.");
  process.exitCode = 1;
} else {
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const listResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, { headers });
  const list = await listResponse.json().catch(() => ({}));
  if (!listResponse.ok) throw new Error(`Could not list Airtable tables (${listResponse.status})`);

  const dateTimeOptions = { dateFormat: { name: "iso" }, timeFormat: { name: "24hour" }, timeZone: "utc" };
  const definitions = [
    {
      name: "Transactional Emails",
      fields: [
        { name: "Email Key", type: "singleLineText" },
        { name: "Purpose", type: "singleLineText" },
        { name: "Recipient", type: "email" },
        { name: "Stripe Event ID", type: "singleLineText" },
        { name: "Stripe Session ID", type: "singleLineText" },
        { name: "Resend Message ID", type: "singleLineText" },
        { name: "Attempted At", type: "dateTime", options: dateTimeOptions },
        { name: "Status", type: "singleLineText" },
        { name: "Retry Count", type: "number", options: { precision: 0 } },
        { name: "Last Error", type: "multilineText" },
        { name: "Next Retry At", type: "dateTime", options: dateTimeOptions },
        { name: "Delivery Event At", type: "dateTime", options: dateTimeOptions },
        { name: "Needs Attention", type: "checkbox", options: { icon: "check", color: "redBright" } },
        { name: "Payload", type: "multilineText" },
        { name: "Updated At", type: "dateTime", options: dateTimeOptions },
      ],
    },
    {
      name: "Membership Approvals",
      fields: [
        { name: "Approval ID", type: "singleLineText" },
        { name: "Email", type: "email" },
        { name: "Tier", type: "singleLineText" },
        { name: "Cohort ID", type: "singleLineText" },
        { name: "Cohort Label", type: "singleLineText" },
        { name: "Approved By", type: "singleLineText" },
        { name: "Approved At", type: "dateTime", options: dateTimeOptions },
        { name: "Invitation Expires At", type: "dateTime", options: dateTimeOptions },
        { name: "Invitation Token", type: "multilineText" },
        { name: "Email Key", type: "singleLineText" },
        { name: "Send Status", type: "singleLineText" },
        { name: "Resend Message ID", type: "singleLineText" },
        { name: "Last Error", type: "multilineText" },
        { name: "Last Send Attempt At", type: "dateTime", options: dateTimeOptions },
      ],
    },
    {
      name: "Membership Records",
      fields: [
        { name: "Membership", type: "singleLineText" },
        { name: "Member Email", type: "email" },
        { name: "Member Name", type: "singleLineText" },
        { name: "Tier", type: "singleLineText" },
        { name: "Cohort ID", type: "singleLineText" },
        { name: "Cohort Label", type: "singleLineText" },
        { name: "Stripe Session ID", type: "singleLineText" },
        { name: "Stripe Customer ID", type: "singleLineText" },
        { name: "Stripe Subscription ID", type: "singleLineText" },
        { name: "Status", type: "singleLineText" },
        { name: "Joined At", type: "dateTime", options: dateTimeOptions },
      ],
    },
  ];

  for (const definition of definitions) {
    const existing = (list.tables || []).find((table) => table.name === definition.name);
    if (existing) {
      const existingFields = new Set((existing.fields || []).map((field) => field.name));
      for (const field of definition.fields.filter((item) => !existingFields.has(item.name))) {
        const fieldResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables/${existing.id}/fields`, {
          method: "POST",
          headers,
          body: JSON.stringify(field),
        });
        if (!fieldResponse.ok) throw new Error(`${definition.name}.${field.name}: field provisioning failed (${fieldResponse.status})`);
        console.log(`${definition.name}.${field.name}: created`);
      }
      console.log(`${definition.name}: ready`);
      continue;
    }
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      method: "POST",
      headers,
      body: JSON.stringify(definition),
    });
    if (!response.ok) throw new Error(`${definition.name}: provisioning failed (${response.status})`);
    console.log(`${definition.name}: created`);
  }
}
