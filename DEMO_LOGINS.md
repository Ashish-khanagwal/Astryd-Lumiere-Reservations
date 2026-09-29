# Demo Logins

Dummy credentials for every login surface in the app, for all 6 demo tenants (one per Vertical). Nothing here is a real account.

- **Mock mode** (`VITE_USE_MOCKS=true`): all-frontend, backed by `src/mocks/seed.ts` (MSW). If a login stops working, it's almost always because the mock DB got reset/reseeded — re-check this file against `src/mocks/seed.ts` rather than assuming credentials changed. Mock DB storage key: `lumiere-cms-mock-db-v14` — clear that `localStorage` key (or use a fresh/incognito profile) to reset every tenant back to this exact seed state.
- **Real backend** (`VITE_USE_MOCKS=false`, the default outside mock mode): backed by MongoDB, seeded via `python scripts/seed_multitenant.py --apply` in `astryd-platform` (`scripts/demo_data.json`). Every seeded owner's email swaps `owner@` → `admin@`, and **every** account's password becomes `admin123` (not `password123`) — this happens for every non-super-admin user, including Staff.

The Login page (`/login`) itself shows the right demo password hint for whichever mode is active, but no longer lists the accounts below — keep this file as the source of truth.

---

## 1. Organization admin login — `/login`

Three fields: **Org ID**, **Email**, **Password**.

| Vertical | Org ID | Site (slug) | Owner email (mock) | Owner email (real backend) |
|---|---|---|---|---|
| Restaurant | `LUMIERE` | Lumière · Mayfair (`lumiere-mayfair`) | `owner@lumiere.com` | `admin@lumiere.com` |
| Gym / Fitness | `PULSEFIT` | PulseFit Studios (`pulsefit-downtown`) | `owner@pulsefit.com` | `admin@pulsefit.com` |
| Retail | `NOVAGOODS` | Nova Goods (`nova-goods`) | `owner@novagoods.com` | `admin@novagoods.com` |
| Salon / Beauty | `SLOANECO` | Sloane & Co. Salon (`sloane-and-co`) | `owner@sloaneandco.com` | `admin@sloaneandco.com` |
| Coffee Shop | `FERNWOOD` | Fernwood Coffee Co. (`fernwood-coffee`) | `owner@fernwoodcoffee.com` | `admin@fernwoodcoffee.com` |
| Laundry / Dry Cleaning | `BRIGHTSIDE` | Brightside Laundry Co. (`brightside-laundry`) | `owner@brightsidelaundry.com` | `admin@brightsidelaundry.com` |

Password for every row above: **`password123`** in mock mode, **`admin123`** against the real backend.

### Extra accounts

| Org ID | Email | Password | Notes |
|---|---|---|---|
| `LUMIERE` | `staff@lumiere.com` | `password123` (mock) / `admin123` (real) | **Staff** role — Lumière (Mayfair) only, not Lumière – Notting Hill. Can't invite users or reach Settings → Pages. |

**Lumière has a second Site** in the same Org — Lumière – Notting Hill (`lumiere-notting-hill`) — reachable via the Site switcher (top-left) after logging in as the Lumière owner. In mock mode it stays under the `LUMIERE` org; the real-backend seed script instead gives it its own Org (`LUMIERENH`, owner `admin@lumierenottinghill.com`) so there are two Orgs to test with. Notting Hill's Membership module is off by default; Mayfair's is on.

### What each tenant ships with (Items → Catalog → Booking → Membership)

| Vertical | Items | Catalog | Booking | Membership | Membership plans |
|---|---|---|---|---|---|
| Restaurant (Lumière) | Menu | Online Order | Reservations | **On** for Mayfair, off for Notting Hill | Gold Table Club, Annual |
| Gym (PulseFit) | Programs | Shop (**off**) | Classes | On | Monthly Unlimited, Annual, 10-Class Pack |
| Retail (Nova Goods) | Products | Online Order | Appointments (**off**) | On | Loyalty (free), VIP |
| Salon (Sloane & Co.) | Services | Shop (**off**) | Book Now | On | Blowout Club, Glow Membership, Sloane VIP |
| Coffee (Fernwood) | Menu | Order Ahead | Reserve a Table (**off**) | On | Fernwood Rewards (free), Coffee Subscriber |
| Laundry (Brightside) | Services | Order Online | Schedule Pickup | On | Brightside Basic (free), Unlimited Wash & Fold |

A module being off just hides its nav link/page — it's still fully configured underneath and can be switched on any time from Settings → Pages. Each module also has its own **Layout** tab (Classic / Editorial / Minimal), and the homepage's 7 sections plus the Header and Footer each have the same 3-layout picker under Website → Site Editor.

Logging in as any Owner lands on the Dashboard with the full sidebar and access to Settings → Users → Invite (Staff-only) and Settings → Pages. A Site switcher only appears for an Org with more than one Site (currently only `LUMIERE`).

## 2. Super Admin login — `/super-admin`

Two fields only: **Email**, **Password**. No Org ID — Super Admin isn't scoped to any single Organization.

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@platform.com` | `password123` (mock) / `admin123` (real) |

Logging in here lands on **Platform → All Sites** (`/admin/superadmin/sites`), listing every Site across every Organization (7 Sites across 6 Orgs, or 7 across 7 on the real backend counting Notting Hill's separate Org) with the "Powered by Astryd" footer-badge toggle. There's a link back to the regular Org login ("Not platform team? Sign in to your Organization"), and the regular login page links forward to this one ("Platform team? Sign in here").

## 3. Self-serve signup — `/signup`

No pre-seeded credentials — this is the public wizard that creates a brand-new Organization + Owner + Site on the spot (any of the 6 Verticals, your own name/slug/branding and theme) and signs you straight in. Use this to spin up additional demo tenants beyond the six above.

---

## Notes

- The Org-login and Super-Admin-login forms are intentionally separate pages, not a mode toggle on one form.
- An Org Owner can only ever invite **Staff** — there is no UI path to create another Owner or a new Organization from inside the admin; only a Super Admin creates Organizations that way, or an owner can go through the self-serve `/signup` wizard for a brand-new one.
- Every tenant's public site is reachable at `?preview=true&site=<siteId>` from inside the admin, or via its own hostname pattern (`<slug>.<platform-domain>`) once custom domains are configured (Settings → Domains).
- To reset mock data back to this exact seed state, clear the `lumiere-cms-mock-db-v14` key from the browser's `localStorage` (or open in a fresh/incognito profile) and reload.
