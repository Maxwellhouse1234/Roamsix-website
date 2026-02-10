# Roamsix Website - Deployment Guide

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
