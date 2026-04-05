# Admin Panel Proposal

## Current State Review

The app already has three useful building blocks:

- `animals.json` mirrors animal profile data from the Google Sheet.
- `AnimalIdentifier.vue` provides a strong public game flow with gallery, result cards, and comparison mode.
- `AdminMode.vue` and `HelperMode.vue` already support a lightweight media collection workflow.

The main scaling issue is that the actual identification engine is still pig-specific:

- `src/data/pigIdentifier.js` hardcodes animals, traits, questions, and question-selection logic.
- `src/data/pigTraitAnalysis.js` assumes the same pig-specific data structures.
- `useAdminPhotos.js` stores one fixed 3-photo schema for every animal in browser `localStorage`.
- `useAnimalData.js` can load multiple species from the content feed, but there is no generic editor for traits, trees, or games.

## Recommended Admin Panel

The admin panel should become a content system with these modules:

1. Dashboard
   Shows counts, missing data, unpublished changes, and quick links into each editor.
2. Animal Groups
   Create groups like pigs, goats, sheep, or chickens with label, slug, icon, cover image, and active state.
3. Traits Library
   Define reusable traits per group: question text, input type, options, labels, icons, help text, and whether the trait can drive trees, profiles, photos, or quiz games.
4. Animal Profiles
   Manage each animal with profile content, images, trait values, and publication status.
5. Decision Tree Builder
   Build and validate tree nodes from trait definitions instead of hardcoded JS objects.
6. Game Builder
   Configure which game modes are enabled per group, which tree version they use, and how difficulty works.
7. Media Manager
   Attach configurable reference-photo slots per group instead of the fixed `ear`, `tail`, `custom` trio.
8. Publish / Versioning
   Save drafts, compare versions, export JSON bundles, and publish a specific version to the public app.

## Target Data Model

```json
{
  "groups": [],
  "traits": [],
  "animals": [],
  "trees": [],
  "gameModes": [],
  "mediaSlots": []
}
```

Suggested shape:

- `groups`: core metadata for each animal group.
- `traits`: normalized field definitions keyed by `groupId`.
- `animals`: per-animal profile plus trait values.
- `trees`: versioned decision-tree definitions per group.
- `gameModes`: per-group gameplay configuration.
- `mediaSlots`: configurable reference-photo types per group.

## Security Recommendation

The current app is a static Vue frontend. A password gate in the client can prevent casual access, but it is not a secure authentication system.

Short term:

- Protect admin UI with `VITE_ADMIN_PASSWORD`.
- Keep unlocked state only in `sessionStorage`.

Long term:

- Move admin writes behind a backend.
- Use user accounts, roles, audit history, and versioned publishing.

## Implementation Phases

1. Replace pig-specific constants with a generic content registry.
2. Build CRUD screens for groups, traits, and animal profiles.
3. Add decision-tree and game builders on top of the generic model.
4. Introduce backend auth and publishing workflows when multiple editors need access.
