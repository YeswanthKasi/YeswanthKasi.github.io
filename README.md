# Kasireddi Deals - Production Secure Version

This version is upgraded from local-only admin controls to cloud-secure owner management using Firebase Authentication and Firestore.

## Production Security Architecture

- Owner login is validated by Firebase Auth.
- Product and site data are stored in Firestore (cloud, cross-device).
- Write operations are protected by Firestore rules in [firestore.rules](firestore.rules).
- Public users can read listings, but only authenticated owner can create/update/delete.
- Admin UI remains hidden from public entry and is also backend-protected.

## Secret Developer Entry (UI Access)

Admin UI is hidden visually and can be opened via:

1. Press Ctrl + Shift + D
2. Type kasireddi on the page
3. Tap KD logo 5 times quickly
4. Open with hash once: /#dev-kd

Important: UI hiding is only convenience. Actual security is enforced by Firebase Auth + Firestore rules.

## Files

- [index.html](index.html): Public site + hidden secure admin modal
- [styles.css](styles.css): Production UI and responsive design
- [script.js](script.js): Cloud-auth app logic and admin operations
- [firebase-config.js](firebase-config.js): Active config file loaded by the website
- [firebase-config.example.js](firebase-config.example.js): Template to fill with your Firebase values
- [firestore.rules](firestore.rules): Backend access policy

## Firebase Setup (Required)

1. Create Firebase project.
2. Enable Authentication -> Email/Password.
3. Create owner account in Auth using your email.
4. Get owner UID from Firebase Authentication users table.
5. Enable Firestore database in production mode.
6. Deploy rules from [firestore.rules](firestore.rules) after replacing YOUR_OWNER_UID.
7. Copy [firebase-config.example.js](firebase-config.example.js) values into [firebase-config.js](firebase-config.js).

## Firestore Rules Deployment

Use Firebase CLI:

```bash
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

Before deploy, replace YOUR_OWNER_UID in [firestore.rules](firestore.rules).

## Data Model

- Collection products
  - One document per product listing
- Document site/main
  - Site branding, promo banner, and ads settings

## Local Run

Serve with any static server:

```bash
npx http-server . -p 5500 -c-1
```

Then open:

```text
http://127.0.0.1:5500
```

## GitHub Pages Deploy

1. Push repository to GitHub.
2. Open repository Settings -> Pages.
3. Set source to branch/root.
4. Save and wait for deployment.

## AdSense Setup

In secure admin panel -> Ads tab:

1. Set client ID (ca-pub-...)
2. Set slot ID
3. Save settings

## Security Notes

- Never commit real secrets outside what is needed for Firebase public web config.
- Firebase web config is expected to be public; security is in Firestore rules and Auth.
- Keep owner UID locked in rules and require verified email.
- For even stronger enterprise control, add Cloud Functions for server-side validation/audit logging.