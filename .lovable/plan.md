

## Plan: Session-based History for Guest Users

### Problem
Currently, guest (unauthenticated) users see a "Sign in to view history" message. The request is to show history for guests during their session, but clear it on page refresh.

### Approach
Use **`sessionStorage`** (not cookies) to store guest pronunciation results. `sessionStorage` is automatically cleared when the tab/browser closes or on refresh — exactly the desired behavior.

### Changes

**1. `src/hooks/usePronunciationResults.ts`** — Add session-based fallback for guests

- Add a `sessionResults` state that reads from `sessionStorage`
- New `saveSessionResult()` function that stores results in `sessionStorage` as JSON
- When `user` is null, return `sessionResults` instead of an empty array
- `saveResult` will write to `sessionStorage` when no authenticated user exists, and to the database when authenticated
- `deleteResult` will also work against `sessionStorage` for guests

**2. `src/pages/EchoSpeechPage.tsx`** — Remove auth gate on history section

- Remove the `!isAuthenticated` conditional that shows "Sign in to view history"
- Always show the history list (from DB for logged-in users, from sessionStorage for guests)
- Keep the empty state message for when there are no results regardless of auth status

### How sessionStorage works here

```
Guest flow:
1. User analyses pronunciation → result saved to sessionStorage
2. History list renders from sessionStorage data
3. User refreshes page → sessionStorage cleared → history gone

Authenticated flow:
1. Unchanged — results saved to DB, fetched from DB
```

### Technical Details
- Session results stored under key `echo_speech_session_results` as a JSON array
- Each session result gets a generated UUID via `crypto.randomUUID()`
- The hook merges logic: authenticated users hit DB, guests use sessionStorage
- Navigation to results page from session history will pass the result data directly in location state (since there's no DB record to fetch by ID)

