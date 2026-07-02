# Backend Issues & Vulnerabilities

This document tracks identified bugs, race conditions, and missing features across the backend (Auth, Services, and Controllers).

## 1. Workspace Quota Bypass (Race Condition)
- **Location:** `server/src/controllers/analyses.controller.ts` (`createAnalysis`)
- **Description:** The quota logic checks the current count of workspaces and then inserts a new one. Because this isn't executed inside a locked transaction (like an Advisory Lock or `SERIALIZABLE` isolation level), a malicious user sending multiple simultaneous `POST` requests can trigger a Time-of-Check to Time-of-Use (TOCTOU) race condition. All concurrent requests will read the count as being under the limit, allowing the user to bypass the 5 workspace limit.
- **Remediation:** Implement Postgres advisory locks for the `userId` during workspace creation, or enforce a table-level trigger for the quota.

## 2. GitHub Token Expiration (No Refresh Logic)
- **Location:** `server/src/services/github.ts` (`getUserGithubToken`)
- **Description:** The method retrieves the `accessToken` directly from the `account` table but does not check the `accessTokenExpiresAt` column. GitHub tokens expire. If the user's token expires, all GitHub API requests for that user will permanently fail with a `401 Unauthorized` until the user manually logs out and logs back in. 
- **Remediation:** Implement logic to check if the token is expired (or close to expiring). If it is, use the `refreshToken` stored in the database to request a new access token from GitHub, update the `account` table, and then proceed with the fetch.

## 3. Unbounded `fetch` Calls (Denial of Service)
- **Location:** `server/src/services/github.ts` (`runGraphql` and `fetchTree`)
- **Description:** The standard Node.js `fetch` API is used to call GitHub's REST and GraphQL APIs without an `AbortSignal` timeout. If the GitHub API hangs or stalls, these connections will stay open indefinitely, potentially exhausting server memory and connection pools, causing a Denial of Service.
- **Remediation:** Attach an `AbortSignal.timeout(10000)` (e.g., 10 seconds) to all `fetch` requests to ensure they fail gracefully if the external API stalls.
