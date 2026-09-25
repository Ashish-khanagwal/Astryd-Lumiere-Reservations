# Demo Logins

Dummy credentials for every login surface in the app. All mock-only (MSW), backed by `src/mocks/seed.ts` — nothing here is a real account. If a login stops working, it's almost always because the mock DB got reset/reseeded; just re-check this file against `src/mocks/seed.ts` rather than assuming credentials changed.

Demo password for every account below: **`password123`**

---

## 1. Organization admin login — `/admin/login`

Three fields: **Org ID**, **Email**, **Password**.

**Org ID:** `LUMIERE`

| Role | Email | Password | Site access |
|---|---|---|---|
| Owner | `owner@lumiere.com` | `password123` | All Sites in the Org |
| Staff | `staff@lumiere.com` | `password123` | Lumière (Mayfair) only — not Lumière – Notting Hill |

Logging in as the Owner lands on the Dashboard with the full sidebar, the Site switcher (top-left, since this Org has 2 Sites — Lumière / Lumière – Notting Hill), and access to Settings → Users → Invite (Staff-only, per the account-creation hierarchy) and Settings → Pages.

## 2. Super Admin login — `/admin/superadmin/login`

Two fields only: **Email**, **Password**. No Org ID — Super Admin isn't scoped to any single Organization.

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@platform.com` | `password123` |

Logging in here lands on **Platform → All Sites** (`/admin/superadmin/sites`), listing every Site across every Organization with the "Powered by Astryd" footer-badge toggle. There's a link back to the regular Org login ("Not platform team? Sign in to your Organization"), and the regular login page links forward to this one ("Platform team? Sign in here").

---

## Notes

- These two login forms are intentionally separate pages, not a mode toggle on one form (see `Multi-Vertical Platform Plan.md` §4.1).
- An Org Owner can only ever invite **Staff** — there is no UI path to create another Owner or a new Organization; only a Super Admin creates Organizations (and their one Owner account), per plan §5.1.
- To reset all mock data back to this exact seed state, clear the `lumiere-cms-mock-db-v3` key from the browser's `localStorage` (or open in a fresh/incognito profile) and reload.
