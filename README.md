# Bullerbyn Pig ID

The app now supports shared visitor notes backed by Firebase Auth + Firestore.

## Firebase Wiring

Create a separate Firebase project for this app, then enable:

1. `Authentication -> Sign-in method -> Anonymous`
2. `Authentication -> Sign-in method -> Email/Password`
3. `Firestore Database`

Copy `.env.example` to `.env.local` and fill in the values from your Firebase web app config.

```bash
cp .env.example .env.local
```

Set `VITE_FIREBASE_ADMIN_EMAIL` to the dedicated moderator email used for Firestore approval actions. The UI will then ask only for that account's password inside the admin notes tab.

## Firestore Structure

Notes are stored under:

```text
notes/{animalKey}/entries/{noteId}
```

Admin accounts are granted moderation rights by creating a document here:

```text
admins/{firebaseAuthUid}
```

The document can be empty. Its existence is the permission check.

## Moderation Flow

1. Visitors are signed in anonymously.
2. New notes are created with `status: "approved"` and appear immediately.
3. Admins open the hidden admin panel and can delete notes when needed.

## Security Rules

Deploy [`firestore.rules`](/home/franasa/bullerbyn-schweine/pig-id-vue/firestore.rules) and [`firestore.indexes.json`](/home/franasa/bullerbyn-schweine/pig-id-vue/firestore.indexes.json) to Firebase. The rules enforce:

- anonymous-auth-backed writes
- note length and field validation
- note length and author limits are enforced
- admins can delete notes when needed
- moderation requires an `admins/{uid}` document

With the Firebase CLI configured for this repo, deployment is:

```bash
firebase login
firebase use tiere-von-bullerbyn
firebase deploy --only firestore:rules,firestore:indexes
```

## Rate Limit

The UI limits notes to 3 per device per day. This is enforced client-side by Firebase UID plus a local fallback counter.

If you need hard server-side rate limiting later, add a Cloud Function or a write-counter document transaction. Firestore rules alone are not a strong quota mechanism for this case.
