# ArenaFlow Frontend — build notes

## Running it

Backend (from `ArenaFlow_Backend/`):
```
mvn spring-boot:run
```
Runs on `http://localhost:1545`. Needs a Postgres DB named `footballtour` (see `application.properties`).

Frontend (from this folder):
```
npm install
npm run dev
```
Runs on `http://localhost:1546` — this port is already whitelisted in the backend's `WebConfig` CORS rule, so the two just work together out of the box.

## What's wired up (Phase 1 — core flow)

- **Teams** — full CRUD (`/teams`)
- **Players** — full CRUD, filterable by team, assignable to a team (`/players`)
- **Venues** — full CRUD (`/venues`)
- **Tournaments** — create a competition template, then add yearly **editions** to it, register teams into an edition, view standings and group tables, start/complete an edition (`/tournaments`, `/tournaments/:id`, `/editions/:seasonId`)
- **Matches** — schedule fixtures between two teams, record results, push results into standings (`/matches`)

Dashboard at `/` shows live counts and upcoming fixtures.

## Two bugs fixed in the existing code

1. `App.jsx` imported `./AppRouter`, but the router lives at `src/routes/AppRouter.jsx` — fixed to `./routes/AppRouter`.
2. `AppRouter.jsx` imported pages from `./pages/...`, but since the router itself lives in `src/routes/`, that resolved to a non-existent `src/routes/pages/` folder — fixed to `../pages/...`.
3. `react-router-dom` was used but missing from `package.json` — added.
4. Bootstrap was linked via a raw `node_modules` path in `index.html`, which breaks in a production build — moved to a proper `import` in `main.jsx`.

## API shape notes (from reading the actual controllers)

- `POST /api/team/create`, `/api/player/create`, `/api/venue/create` save the request body **directly via the repository with no server-side ID generation** — the frontend generates a UUID client-side (`crypto.randomUUID()`) and includes it in the payload. Updates (`PUT .../update/{id}`) also need the id inside the JSON body, since the service just re-saves whatever entity you send.
- `POST /api/tournaments/create`, `/api/seasons/create`, and `POST /api/matches/schedule` **do** generate their own IDs server-side — the frontend just sends the plain fields.
- `PlayerController` has no `GET /api/player/{id}`. The edit-player page works around this by loading the full list and finding the match — fine for the size of data this app deals with, but worth adding a real endpoint if the player list grows large.
- `POST /api/matches/{id}/complete` takes `homeScore`/`awayScore` as **query params**, not a JSON body — handled in `matchService.js`.
- Two different "standings" exist: `TournamentTeam` (points/group/qualification status, from `/api/tournaments/editions/{seasonId}/*`) and `Standing` (full W/D/L/goals table, from `/api/seasons/{seasonId}/standings`). The edition page shows both.
- Matches aren't explicitly linked to a season/edition at schedule time (`MatchScheduleRequest` has no `seasonId` field) — so `GET /api/matches/season/{seasonId}` will only show matches if the backend associates them some other way. Worth checking with the backend team if fixtures should be tied to an edition on creation.

## Phase 2 — Budgets & Financials, Transfers & Transfer Windows

**Owners** (`/owners`) — CRUD for club owners: name, nationality, ownership type, strategy, net worth, available funds, investment budget, reputation. Assign an owner to a team from the **Teams** edit page (added a dropdown there) — budgets and financials both require a team to have an owner first, since the backend validates `team.getOwner().getOwnerId() == request.getOwnerId()`.

**Budgets** (`/budgets`) — create a team's annual budget (backend splits the total into transfer/wage/operating/youth-academy/infrastructure pots), then spend against each pot, freeze/unfreeze. Progress bars show spent vs allocated per category.

**Financials** (`/financials`) — create a team's annual financial record, record profit/loss, add debt, apply a relegation penalty, and check computed financial health (Excellent → Insolvent, from the backend's `FinancialHealth` enum). Dashboard section surfaces clubs currently flagged as takeover candidates or requiring intervention, pulled live from `/api/financials/takeovers` and `/api/financials/intervention`.

**Objectives** (`/objectives`) — set owner objectives (win the league, avoid relegation, develop academy players, etc. — the full 15-value `ObjectiveType` enum), either club-wide or tied to a specific team, with a priority slider and a progress slider that posts on release.

**Transfer Windows** (`/transfer-windows`) — create summer/winter windows with open/close dates; the list flags which are open right now.

**Transfers** (`/transfers`, `/transfers/:id`) — create a transfer (player, selling/buying team, type, fee, window), then walk it through the backend's reliability-tier state machine (`RUMOURED → IN_TALKS → AGREEMENT_REACHED → HERE_WE_GO → MEDICAL_SCHEDULED → OFFICIAL`, or collapse at any point) one tier at a time — the UI only offers the single next legal tier, matching the backend's `canAdvanceTo` rule. From there, **finalize** the transfer (checks the window is open, spends from the buying team's budget, swaps the player's squad, assigns a new kit number) — this needs the buying team to already have a budget, so budgets are a prerequisite in the natural flow.

### New bugs/gaps found in Phase 2

- `Owner.ownedTeams` is `@JsonIgnore`'d server-side (to stop `Team → Owner → ownedTeams → Team` recursion), so it never reaches the frontend. The Owners list derives "owned teams" by cross-referencing the Teams list instead (`team.owner.ownerId === owner.ownerId`).
- `PUT /api/owner/update` takes **no path parameter** — it just re-saves whatever `ownerId` is in the request body. `ownerService.updateOwner()` reflects that (no `id` argument).
- `GET /api/objectives/{objectiveId}` is a backend placeholder that always returns `null` — avoided entirely; the Objectives page works only from the list endpoint.
- `PUT /api/objectives/{id}/progress` and `/achieve` are `PUT` with query params and no body — don't send a JSON body to these.
- Budget/Financial creation both require the target team to already have an `owner` set (backend throws `IllegalArgumentException` otherwise) — the create forms warn inline if the selected team has no owner.

## Phase 3 — Injuries & Suspensions, Lineups, Match Events, Officials

**Injuries & Suspensions** (`/discipline`) — pick a player, see their active injuries/suspensions plus full history, and report a new injury or issue a suspension. Note the backend has no "list all injuries/suspensions" endpoint — everything is scoped per-player, so this page is deliberately player-first rather than a global table. Suspension games-banned defaults to the offence's standard ban length if left blank; you can override it (mirrors the backend's optional committee override).

**Match Detail now has four tabs:**
- **Overview** — unchanged: record result, push to standings.
- **Lineups** — per-team (toggle home/away), name a player into the starting XI or bench with shirt number and match position, sub a starter off with a minute. Player options are limited to that team's actual squad.
- **Events** — chronological match timeline; record goals (with assist + goal type), cards (with offence), substitutions, corners, free kicks, and in-match injuries. "Finalize match from events" calls the backend's event-driven finalize, which is separate from the plain score-based "Complete match" on the Overview tab — the two are independent paths the backend supports, not sequential steps.
- **Officials** — assign or edit referee, both assistants, fourth official, and match commissioner (free-text names — there's no separate Officials-as-people entity in this backend).

### New bugs/gaps found in Phase 3

- `GET /api/officials/match/{matchId}` throws (via `orElseThrow`) rather than returning an empty/404 result when no officials are assigned yet — `OfficialsPanel` treats any error from this call as "not assigned yet," which is correct for that case but would also swallow a genuine server error. Worth the backend returning a proper 404 instead.
- Neither `PlayerInjuryController` nor `PlayerSuspensionController` expose a "get all" or "get by team" endpoint — only per-player lookups. Fine for the current UI, but a league-wide "who's out this weekend" view isn't possible without either a new backend endpoint or an N-calls-per-player workaround (not implemented, to avoid hammering the API on every roster).
- `finalizeMatch` (event-driven) and `completeMatch` (Overview tab, score-only) are two independent ways to close out a match in this backend — nothing stops both being called, or in either order. Not a bug exactly, but worth knowing before you rely on either one implying the other happened.

## Everything from the original controller list is now covered

Teams, Players, Venues, Tournaments/Editions, Matches, Owners, Budgets, Financials, Objectives, Transfers, Transfer Windows, Injuries, Suspensions, Lineups, Match Events, and Officials all have working, backend-verified frontend pages.


