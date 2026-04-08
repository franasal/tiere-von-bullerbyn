# Bullerbyn Pig ID

The app supports shared visitor notes backed by Firebase Auth, App Check, and Firestore.

## Firebase Wiring

Create a separate Firebase project for this app, then enable:

1. `Authentication -> Sign-in method -> Anonymous`
2. `Authentication -> Sign-in method -> Email/Password`
3. `Firestore Database`
4. `App Check`

Copy `.env.example` to `.env.local` and fill in the values from your Firebase web app config.

```bash
cp .env.example .env.local
```

Set `VITE_FIREBASE_ADMIN_EMAIL` to the dedicated moderator email used for Firestore approval actions. The UI will then ask only for that account's password inside the admin notes tab.
Set `VITE_FIREBASE_RECAPTCHA_SITE_KEY` to your reCAPTCHA v3 site key for App Check.

## Firestore Structure

Notes are stored under:

```text
notes/{animalKey}/entries/{noteId}
```

## Moderation Flow

1. Visitors are signed in anonymously.
2. New notes are created with `status: "approved"` and appear immediately.
3. App Check adds a reCAPTCHA-backed attestation to web requests.
4. Admins open the hidden admin panel and can delete notes when needed.

## Security Rules

Deploy [`firestore.rules`](/home/franasa/bullerbyn-schweine/pig-id-vue/firestore.rules) and [`firestore.indexes.json`](/home/franasa/bullerbyn-schweine/pig-id-vue/firestore.indexes.json) to Firebase. The rules enforce:

- anonymous-auth-backed writes
- note length, author length, and link blocking
- server timestamp enforcement for `createdAt`
- path consistency between `notes/{animalKey}` and payload
- only non-anonymous users can delete notes

With the Firebase CLI configured for this repo, deployment is:

```bash
firebase login
firebase use tiere-von-bullerbyn
firebase deploy --only firestore:rules,firestore:indexes
```

## App Check

Set up reCAPTCHA v3 for App Check in Firebase and add the site key to `VITE_FIREBASE_RECAPTCHA_SITE_KEY`. Then enable App Check enforcement for:

- `Cloud Firestore`
- `Authentication` if you want to reduce scripted anonymous-auth abuse further

Firebase App Check docs:

- https://firebase.google.com/docs/app-check
- https://firebase.google.com/docs/app-check/web/recaptcha-provider

## Rate Limit

The UI limits notes to 3 per device per day. This is enforced client-side by Firebase UID plus a local fallback counter.

If you need hard server-side rate limiting later, add a Cloud Function or another backend-controlled write path. Firestore rules alone are not a strong quota mechanism for this case.
