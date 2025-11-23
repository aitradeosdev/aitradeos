# New Device Email Not Working - SOLUTION

## Root Cause
The email service works perfectly locally, but **environment variables are not set in Vercel**.

## Test Results
✅ Email service works: Test script successfully sent email
✅ Code logic is correct: All conditions properly checked
❌ Vercel environment variables: EMAIL_USER and EMAIL_PASS not configured

## Fix Steps

### 1. Go to Vercel Dashboard
- Open: https://vercel.com/dashboard
- Select your project: `huntr-ai` or `aitradeos`

### 2. Add Environment Variables
Go to **Settings** → **Environment Variables** and add:

```
EMAIL_USER=noreply.huntrai@gmail.com
EMAIL_PASS=wyqdgnayeiruapmd
```

### 3. Redeploy
After adding variables, redeploy:
- Go to **Deployments** tab
- Click the 3 dots on latest deployment
- Click **Redeploy**

## Verification
After redeployment, test by:
1. Login from a new device/browser
2. Check email inbox for "New Device Login Alert"
3. Check Vercel logs for "✓ New device email sent successfully"

## Local Testing
To test locally, run:
```bash
cd api
node test-email.js
```

Expected output:
```
=== EMAIL TEST STARTING ===
EMAIL_USER: noreply.huntrai@gmail.com
EMAIL_PASS: ***SET***
Sending test email...
✓ Email sent successfully!
```
