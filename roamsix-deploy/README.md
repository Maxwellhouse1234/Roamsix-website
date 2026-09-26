# Roamsix Website - Deployment Guide

## Membership billing configuration

The V10 founding membership checkout and member area require these Vercel environment variables:

- `STRIPE_MEMBERSHIP_CORE_PRICE_ID` (annual recurring price: $900)
- `STRIPE_MEMBERSHIP_FIELD_PRICE_ID` (annual recurring price: $2,200)
- `STRIPE_MEMBERSHIP_JOURNEY_PRICE_ID` (annual recurring price: $4,500)
- `STRIPE_MEMBERSHIP_PRIVATE_PRICE_ID` (optional; Private remains invitation-based)
- `ACTIVE_MEMBERSHIP_COHORT_ID` (set to `founding` for the first cohort)
- `ACTIVE_MEMBERSHIP_COHORT_LABEL` (set to `Founding Cohort` for the first cohort)
- `MEMBERSHIP_COHORT_CAPACITY` (set to `25`)
- `STRIPE_CUSTOMER_PORTAL_URL`
- `VITE_STRIPE_CUSTOMER_PORTAL_URL`
- `MEMBER_AUTH_SECRET` (at least 32 random bytes; used only to sign short-lived login links and HTTP-only sessions)
- `MEMBERSHIP_INVITE_SECRET` (at least 32 random bytes; signs expiring Field and Journey invitation links; use a different value from `MEMBER_AUTH_SECRET`)
- `MEMBERSHIP_APPROVAL_SECRET` (at least 32 random bytes; authorizes the manual approval-to-invitation endpoint)
- `PUBLIC_SITE_URL` (optional for invitation generation; defaults to `https://roamsix.com`)
- `RESEND_WEBHOOK_SECRET`, `CRON_SECRET`, and `STRIPE_CUSTOMER_PORTAL_URL`
- Optional: `ROAMSIX_CRM_EMAIL_TABLE_ID`, `ROAMSIX_CRM_APPROVALS_TABLE_ID`, `ROAMSIX_CRM_MEMBERSHIP_TABLE_ID`, and `TRANSACTIONAL_EMAIL_MAX_RETRIES`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `AIRTABLE_TOKEN`, and `RESEND_API_KEY`
- `VITE_HOLLY_PUBLIC_PROFILE_APPROVED=true` (Holly Beck's approved profile and title are cleared for publication)

Create one annual recurring Stripe Price for each tier. Core is publicly purchasable. Field and Journey require a signed, expiring invitation tied to the approved email, tier, and active cohort. Run `npm run email:provision` once to create or update the Airtable operations tables, then use `npm run membership:approve -- <approval-id> <field|journey> <approved-email> <approved-by> [name] [hours]` after human approval. The member area verifies membership against Stripe, stores nonclinical member preferences in the existing Airtable CRM, and uses Resend for 15-minute magic sign-in links. The daily compliance cron sends annual renewal-term reminders and retries failed transactional messages. Membership is organized in small cohorts of up to 25; duplicate paid Checkout sessions for the same email or Stripe customer count once. When the configured operating guideline is reached, enrollment moves to an interest-list state until ROAMSIX intentionally activates the next cohort. See `MEMBERSHIP_COHORT_OPERATIONS.md` and `EMAIL_OPERATIONS.md`.

## 🚀 Deploy to Vercel (Easiest - 5 Minutes)

### Step 1: Create a GitHub Account (if you don't have one)
1. Go to https://github.com
2. Click "Sign up"
3. Follow the steps to create your account

### Step 2: Upload This Code to GitHub
1. Go to https://github.com/new
2. Name your repository: `roamsix-website`
3. Keep it **Private** (recommended)
4. Click "Create repository"
5. You'll see a page with instructions - **ignore them for now**

#### Upload Files:
1. Click "uploading an existing file"
2. Drag ALL files from this `roamsix-deploy` folder into the upload area
3. Add a commit message: "Initial Roamsix website"
4. Click "Commit changes"

### Step 3: Deploy to Vercel
1. Go to https://vercel.com
2. Click "Sign Up" → Choose "Continue with GitHub"
3. Authorize Vercel to access GitHub
4. Click "Import Project"
5. Find your `roamsix-website` repository
6. Click "Import"
7. **Framework Preset:** Vercel will auto-detect "Vite" ✓
8. Click "Deploy"
9. Wait 1-2 minutes for deployment to finish
10. You'll get a live URL like: `roamsix-website.vercel.app`

### Step 4: Connect Your Squarespace Domain

#### In Vercel:
1. Go to your project settings
2. Click "Domains"
3. Type your domain: `yourdomain.com`
4. Vercel will give you DNS records to add

#### In Squarespace:
1. Log into Squarespace
2. Go to Settings → Domains
3. Click on your domain
4. Go to "DNS Settings"
5. Add the DNS records Vercel provided:
   - Usually an A record and/or CNAME record
6. Save changes

**DNS changes take 24-48 hours to fully propagate**, but often work within 1-2 hours.

---

## 🔄 Alternative: Deploy to Netlify

If Vercel doesn't work, try Netlify (very similar):

1. Go to https://netlify.com
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub → Select your repository
5. Build settings will auto-detect
6. Click "Deploy"
7. Follow same domain connection steps

---

## ✅ Testing Before Going Live

Before connecting your domain, test your deployment:
1. Use the Vercel/Netlify preview URL
2. Test the full flow:
   - Enter invitation code (try: INDIVIDUAL, CORPORATE, ATHLETICS, FAMILY)
   - Submit email
   - Choose pathway
   - Fill out form
   - Check "Under Review" page
   - Click Terms & Conditions to ensure modals work

---

## 📝 Important Notes

- **Demo codes are hardcoded**: INDIVIDUAL, CORPORATE, ATHLETICS, FAMILY
- **Forms don't save data yet**: You'll need to connect to a backend (Airtable, Google Sheets, or a form service)
- **Email sending**: Currently just displays - you'll need to integrate an email service

---

## 🆘 Troubleshooting

**"Build failed":**
- Check that all files uploaded correctly
- Ensure `package.json` is in the root folder

**"Site shows blank page":**
- Check browser console for errors (F12 → Console tab)
- Make sure you uploaded ALL files including the `src` folder

**"Domain not connecting":**
- DNS changes take time (up to 48 hours)
- Double-check DNS records match exactly what Vercel provided
- Try accessing via www.yourdomain.com vs yourdomain.com

---

## 📞 Need Help?

If you get stuck:
1. Check Vercel's deployment logs for error messages
2. Share the error with me and I'll help debug
3. Vercel has excellent documentation: https://vercel.com/docs

---

## 🎯 Next Steps After Launch

1. **Form backend**: Connect to Airtable or Google Sheets to capture submissions
2. **Email notifications**: Set up automated emails when forms are submitted
3. **Analytics**: Add Google Analytics or Plausible
4. **Custom invitation codes**: Move from hardcoded to database-driven codes
5. **Payment integration**: Add Stripe for accepting payments after founder calls
