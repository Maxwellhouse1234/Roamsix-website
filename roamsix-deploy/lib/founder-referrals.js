export const FOUNDER_REFERRALS = {
  "ROAM10-BETTYLOU": { promotionId: "promo_1U6JBfLgUPmdquZodpLFhovY", referrerContactId: "rec4Vwvm6xW7oregG", referrerName: "Bettylou DeYoung" },
  "ROAM10-JONATHAN": { promotionId: "promo_1U6JBkLgUPmdquZofXdV3oHy", referrerContactId: "recKeNj4Q1jhwIBdU", referrerName: "Jonathan Soleymani" },
  "ROAM10-BOMAN": { promotionId: "promo_1U6JBnLgUPmdquZoeIv0IOki", referrerContactId: "recPVgWCbgTNxeLrf", referrerName: "Chris and Jessica Boman" },
  "ROAM10-SAHAR": { promotionId: "promo_1U6JBqLgUPmdquZovoiEnUwh", referrerContactId: "recUuUcspe3YYn5Cm", referrerName: "Sahar Shahidi" },
  "ROAM10-CORY": { promotionId: "promo_1U6JBuLgUPmdquZomUgJrhY8", referrerContactId: "recVhSL1FrZy67VHG", referrerName: "Cory Shallow" },
  "ROAM10-PATRICK": { promotionId: "promo_1U6JByLgUPmdquZodDxOpvC7", referrerContactId: "recqJhsXhpbtUNIXl", referrerName: "Patrick Kissell" },
};

export function getFounderReferral(code) {
  return FOUNDER_REFERRALS[String(code || "").trim().toUpperCase().slice(0, 80)] || null;
}
