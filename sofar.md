# AfYO Mobile — Progress So Far

A running record of everything that has been built, changed, fixed, and removed in the **AfYO** (African Youth Observatory) Expo / React Native companion app at `C:\Users\USER\ayo-mobile`.

> **Repo:** `github.com/DiviTech01/ayo-mobile` · **Branch:** `main` · **Latest commit:** `2dd3e75`
> **Mobile is a companion to the web platform** at `africanyouthobservatory.org`. It shares the same Supabase project, Render-hosted Nest API, and Cloudflare R2 — it has no backend of its own.

---

## Table of contents

1. [Stack at a glance](#stack-at-a-glance)
2. [Backend & data architecture](#backend--data-architecture)
3. [Phase history](#phase-history)
4. [Current state — file by file](#current-state--file-by-file)
5. [Bugs found and fixed](#bugs-found-and-fixed)
6. [Files deleted along the way](#files-deleted-along-the-way)
7. [Outstanding work (Phase 9 continuation)](#outstanding-work-phase-9-continuation)
8. [Outstanding side-issues](#outstanding-side-issues)
9. [How to run](#how-to-run)

---

## Stack at a glance

| Layer | Choice |
|---|---|
| Framework | Expo SDK 54, React Native 0.81, React 19 |
| Router | Expo Router v6 (file-based) |
| Styling | NativeWind v4 (Tailwind for RN), HSL CSS vars |
| Server state | TanStack Query v5 |
| Animations | Reanimated v4 |
| Storage | AsyncStorage (was MMKV — switched for Expo Go compat) |
| Auth | Supabase JS client (JWT) |
| HTTP | fetch wrapper in `lib/api.ts` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Haptics | `expo-haptics` (wrapped in `lib/haptics.ts`) |
| Path alias | `@/` → repo root |

---

## Backend & data architecture

- **Supabase** project `lfvbwpmpuyfujrpwwgol` handles auth (email/password, OAuth, OTP). Mobile signs in directly to Supabase and uses the access token as a Bearer to the API.
- **Render Nest API** at `https://african-youth-observatory.onrender.com/api` validates Supabase JWTs via JWKS. First-time login auto-provisions a Postgres `User` row.
- **Cloudflare R2** stores documents/reports.
- **Mobile env policy:** only `EXPO_PUBLIC_*` keys reach the device. Service-role keys, JWKS secrets, and Anthropic keys live server-side only.

---

## Phase history

### Phase 1–3 — UI/UX polish, web-style theming

- Brought theme tokens in line with web (HSL CSS vars in `global.css`, `tailwind.config.js` referencing them via `hsl(var(--x) / <alpha-value>)`).
- Preserved static `pan-green / pan-gold / pan-blue / pan-red` 50–900 ramps for accents.
- Added micro-interactions: `tapLight / tapMedium / tapHeavy / tapSelection / notifySuccess|Warn|Error` haptic wrappers in `lib/haptics.ts`.
- Built `useThemeColors()` JS-side hook in `lib/theme-colors.ts` for places where `className` can't reach (chart strokes, `tintColor`, etc.).

### Phase 4 — Real data only

Stripped every synthetic mock and rewired pages to live API:

- Added `getList<T>()` helper in `lib/api.ts` that accepts both flat arrays and `{ data: T[], meta }` envelopes — fixed silent empty states in countries, youth-index rankings, anomalies.
- Rewrote types to match live shapes:
  - `YouthIndexScore` → flat `countryName`, `flagEmoji`, `overallScore`, `populationDimension`, `educationDimension`, etc.
  - `Expert` → nested `country: { id, name, isoCode3, region, flagEmoji }` and `specializations` (plural).
  - `PolicyMonitorEntry` → flat `countryName`, `iso3Code`, `flagEmoji`, `region`, `wpayCompliant` (not `wpayCompliance`).
- Stripped synthetic data out of `data/countryReports.ts` (kept the type definitions only).
- Deleted orphaned files: `components/widgets/DashboardWidgets.tsx`, `lib/dashboard-storage.ts`.

### Phase 5 — Smoke testing

Hit 15 live endpoints with curl. Surfaced and fixed:

- `/youth-index/rankings` returns `{ data, meta }` envelope (was typed as flat array).
- `/countries` returns same envelope — `AfricaMap` and country spotlights were silently empty.
- Default ranking year 2024 returns `[]`; switched `useYouthIndexRankings` default to **2025** (only year with data).
- Experts `country` shape mismatch (string vs object).
- Policy shape mismatch (`wpayCompliance` vs `wpayCompliant`; no `agenda2063Score` or `nationalYouthPolicy` bool).

### Phase 6 — App-feel polish

- Filled-active tab icons in `app/(tabs)/_layout.tsx`: `home/home-outline`, `map/map-outline`, etc.
- Taller tab bar on iOS.
- `Reveal` Reanimated FadeInDown wrapper for staggered entry.
- `Skeleton` shimmer for loading states.

### Phase 7 — Auth UI parity

All four auth screens rebuilt:

- `sign-in.tsx`, `sign-up.tsx`, `forgot-password.tsx`, `verify-otp.tsx`
- New shared primitives: `AuthHeader` (brand chip + wordmark + display title + subtitle), `AuthInput` (icon-leading input with password eye toggle).
- Sign-up has live password-requirements checklist.
- `AmbientBackground` (3 pulsing orbs) on auth screens.

### Phase 8 — Web design system, dark default

- User instruction: "the web version uses a dark theme, gold and grid stuff, use the same UI on the app."
- Set `DEFAULT_PREFERENCE: AppearancePreference = 'dark'` in `lib/theme.tsx`.
- Added gradient orbs and gold-forward accents app-wide.

### Phase 9 — STRICT web parity (current)

User pivot: **"the UI that the app in every page and screen should use is the same as the UI of the website, adapt the same UI, do not create anything new."**

Started fanning out across screens. **Home tab is done.**

Home tab now mirrors web's `Index.tsx` exactly:

- **Hero** — centered "trending up" badge → display title "African Youth Observatory" → muted subtitle → pill search bar → 3 CTAs (filled "Explore Data", outlined "Youth Index", ghost "Compare Countries") → 3-stat row (54 / 500+ / 226M).
- **Key Statistics** — 5 QuickStats-pattern cards. Each has a left `border-l-4` accent stripe, title + big value + description, right-side icon circle in matching tint, trend pill, mini 10-bar deterministic chart at the bottom.
- **Featured Insights** — wrapped in a `-mx-4 bg-muted/40` section. 3 cards each with aspect-video colored hero + centered icon + Download / View Data buttons. "View All Reports" outlined CTA at the bottom.

Deleted mobile-invented patterns:

- `components/HomeHeader.tsx`, `components/DotGrid.tsx`, `components/SectionHeader.tsx`
- `components/widgets/CountrySpotlight.tsx`, `RegionalBreakdown.tsx`, `YouthIndexLeaderboard.tsx`, `ToolsGrid.tsx`
- `AmbientBackground` from home (kept on auth screens — web has it on Landing only).

---

## Current state — file by file

### Routing (Expo Router)

| Path | Purpose | Status |
|---|---|---|
| `app/_layout.tsx` | Root layout with AuthGate + PinGateContext | ✅ done |
| `app/(auth)/sign-in.tsx` | Email/password + Google + OTP entry | ✅ Phase 7 |
| `app/(auth)/sign-up.tsx` | Sign up with live password checklist | ✅ Phase 7 |
| `app/(auth)/forgot-password.tsx` | Send reset email | ✅ Phase 7 |
| `app/(auth)/verify-otp.tsx` | 6-digit OTP entry | ✅ Phase 7 |
| `app/(tabs)/_layout.tsx` | Tab bar with filled-active icons | ✅ Phase 6 |
| `app/(tabs)/index.tsx` | Home | ✅ **Phase 9 — web parity** |
| `app/(tabs)/countries.tsx` | Countries grid | ⏳ Phase 9 pending |
| `app/(tabs)/explore.tsx` | Africa map + filters | ⏳ Phase 9 pending |
| `app/(tabs)/ai.tsx` | Ask AI chat | ⏳ Phase 9 pending |
| `app/(tabs)/profile.tsx` | Settings hub | ⏳ Phase 9 pending |
| `app/country/[slug].tsx` | Country detail | ⏳ Phase 9 pending |
| `app/compare.tsx` | Compare AYEMI dimensions | ⏳ Phase 9 pending |
| `app/themes.tsx` | Themes list (new) | ⏳ Phase 9 pending |
| `app/policy.tsx` | Policy monitor | ⏳ Phase 9 pending |
| `app/experts.tsx` | Experts directory | ⏳ Phase 9 pending |
| `app/reports.tsx` | Reports / documents | ⏳ Phase 9 pending |
| `app/insights.tsx` | Anomalies + correlations (new) | ⏳ Phase 9 pending |
| `app/about.tsx` | About | ⏳ Phase 9 pending |
| `app/edit-profile.tsx` | Edit profile (syncs Supabase + Postgres) | ⏳ Phase 9 pending |
| `app/change-password.tsx` | Change password | ⏳ Phase 9 pending |
| `app/pin-setup.tsx` | First-time PIN setup | ✅ done |
| `app/pin-unlock.tsx` | PIN unlock on relaunch | ✅ done |
| `app/resources/glossary.tsx` | Glossary (new) | ⏳ Phase 9 pending |
| `app/resources/faq.tsx` | FAQ (new) | ⏳ Phase 9 pending |
| `app/resources/methodology.tsx` | Methodology (new) | ⏳ Phase 9 pending |

### Components

| File | Role |
|---|---|
| `components/Hero.tsx` | **(Phase 9)** Web-style hero block used on home. |
| `components/AuthHeader.tsx` | Brand chip + wordmark + title + subtitle for auth screens. |
| `components/AuthInput.tsx` | Icon-leading input with password eye toggle. |
| `components/AmbientBackground.tsx` | 3 pulsing orbs (auth only post-Phase 9). |
| `components/Reveal.tsx` | Reanimated FadeInDown wrapper. |
| `components/Skeleton.tsx` | Reanimated opacity shimmer for loading states. |
| `components/OpenOnWebLink.tsx` | Subtle "open on africanyouthobservatory.org" footer link. |
| `components/AfricaMap.tsx` | SVG map of 54 countries (tap → country detail). |
| `components/GoogleSignInButton.tsx` | OAuth button. |
| `components/PinPad.tsx` | Numeric keypad for PIN unlock/setup. |
| `components/widgets/StatsStrip.tsx` | **(Phase 9)** 5 QuickStats-pattern cards. |
| `components/widgets/FeaturedData.tsx` | **(Phase 9)** 3 feature cards with download / view actions. |
| `components/widgets/WidgetCard.tsx` | Generic card wrapper (may be orphaned now — TBD). |
| `components/charts/{BarChart,LineChart,RadarChart}.tsx` | Chart primitives for indicators. |
| `components/report/{AyemiGauge,IndicatorCard,LegislationTable}.tsx` | Country-report blocks. |

### Library / utilities

| File | Role |
|---|---|
| `lib/api.ts` | Single API hub. `getList<T>()` envelope-aware helper. Surface: `api.{countries, themes, indicators, data, youthIndex, policyMonitor, insights, experts, documents, countryReports, platform, ai, auth}`. |
| `lib/queries.ts` | TanStack Query hooks. `useCountries`, `useCountryDirectory` (joins countries + rankings, derives slug), `useYouthIndexRankings(year=2025)`, `useAnomalies`, `useCorrelations`, `useCountryReportOverlay`, `useReports`, `usePlatformStats`. |
| `lib/auth.ts` | Supabase session helpers, profile sync. |
| `lib/theme.tsx` | Appearance preference (`light` / `dark` / `system`). Default = `dark` since Phase 8. |
| `lib/theme-colors.ts` | `useThemeColors()` returning JS-side palette (primary, secondary, foreground, aydGreen, aydGold, aydBlue, aydRed, etc.). |
| `lib/haptics.ts` | `tapLight / tapMedium / tapHeavy / tapSelection / notifySuccess / notifyWarn / notifyError`. |
| `lib/country-helpers.ts` | `slugify()`, `flagFromIso3()`, `tierColor()`, region groupings. |
| `lib/web-links.ts` | `webLinks.{countries, compare, reports, askAi, insights, themes, explore}` → `https://africanyouthobservatory.org/...`. |

### Styling

- `global.css` — mirrors web's `apps/web/src/index.css`. Light primary `142 71% 35%` (green), secondary `36 100% 50%` (gold). Dark background `224 40% 6%`, primary `142 65% 45%`.
- `tailwind.config.js` — every semantic token references its CSS var via `hsl(var(--x) / <alpha-value>)`; pan-* ramps preserved as static colors.

---

## Bugs found and fixed

| # | Bug | Fix |
|---|---|---|
| 1 | **PIN-gate infinite loop** — `pinPassed` never set after unlock. | Replaced with `pinChecked` + `PinGateContext.markPinPassed()` called from `pin-unlock.tsx`. |
| 2 | **Profile DB sync gap** — `edit-profile.tsx` only updated Supabase user_metadata, Postgres row stayed stale. | Now also calls `api.auth.updateProfile()` after `supabase.auth.updateUser()`. |
| 3 | **`/youth-index/rankings` empty** — typed as flat array, API returns `{ data, meta }`. | Custom async unwrap inside `api.youthIndex.rankings()`. |
| 4 | **`/countries` empty** — same envelope issue. | `getList<T>()` helper handles both shapes. |
| 5 | **2024 rankings empty** — only 2025 has data. | `useYouthIndexRankings` default year → `2025`. |
| 6 | **Experts shape mismatch** — `country: string` and `specialization` (singular). | Updated type to nested `country` object + `specializations` plural; fixed `experts.tsx` mapping. |
| 7 | **Policy shape mismatch** — `wpayCompliance`, fictional `agenda2063Score`/`nationalYouthPolicy`. | Replaced with real fields: flat `countryName`, `iso3Code`, `flagEmoji`, `region`, `wpayCompliant`. |
| 8 | **MMKV crash in Expo Go** — native module not in Expo Go. | Replaced with AsyncStorage. |
| 9 | **Lint noise** — unescaped apostrophes, duplicate imports, `Array<T>` style, missing tabIcon display name. | All fixed. |
| 10 | **Metro LAN connect** — Windows Firewall blocking 8081. | User added `netsh advfirewall firewall add rule name="Expo Metro 8081" ...`. |

---

## Files deleted along the way

Phase 4 cleanup:

- `components/widgets/DashboardWidgets.tsx`
- `lib/dashboard-storage.ts`

Phase 9 cleanup (mobile-invented patterns the web doesn't have):

- `components/HomeHeader.tsx`
- `components/DotGrid.tsx`
- `components/SectionHeader.tsx`
- `components/widgets/CountrySpotlight.tsx`
- `components/widgets/RegionalBreakdown.tsx`
- `components/widgets/YouthIndexLeaderboard.tsx`
- `components/widgets/ToolsGrid.tsx`
- `components/hello-wave.tsx` (Expo template leftover)

---

## Outstanding work (Phase 9 continuation)

Apply the same "mirror the web exactly" treatment to:

- `app/(tabs)/countries.tsx` — match web's `Countries.tsx` grid + filter pattern.
- `app/(tabs)/explore.tsx` — match web's Data Explorer.
- `app/(tabs)/ai.tsx` — match web's Ask AI page.
- `app/(tabs)/profile.tsx` — match web's settings/account layout.
- `app/country/[slug].tsx` — match web's country report.
- `app/compare.tsx`, `app/themes.tsx`, `app/policy.tsx`, `app/experts.tsx`, `app/reports.tsx`, `app/insights.tsx`.
- `app/about.tsx`, `app/edit-profile.tsx`, `app/change-password.tsx`, `app/resources/*`.

Plus housekeeping:

- Decide whether `components/widgets/WidgetCard.tsx` is still used; delete if orphaned.

---

## Outstanding side-issues

**Google OAuth bounces to web instead of returning to mobile.** Root cause is config-side, not code: the Supabase project's redirect URL allowlist is missing `afyo://auth-callback`.

**Fix (user action required):**

1. Supabase dashboard → **Authentication → URL Configuration**.
2. Under **Redirect URLs**, add `afyo://auth-callback`.
3. Save. Retry Google sign-in — it should now return to the app via deep link.

---

## How to run

```powershell
# from C:\Users\USER\ayo-mobile
npm install
npx expo start

# scan the QR code with Expo Go on the phone
# (phone and PC must be on the same Wi-Fi; firewall must allow port 8081)
```

Useful checks:

```powershell
npx tsc --noEmit       # type-check
npx expo lint          # lint
```

---

## Commit history (latest first)

| SHA | Message |
|---|---|
| `2dd3e75` | feat: web UI parity pass — auth, theming, home, and screen scaffolding |
| `16773d3` | feat: web design system + dashboard with widgets |
| `83db8e1` | fix: Expo Go compatibility — replace MMKV with AsyncStorage, harden widgets |
| `fa41098` | feat: Phase G — Settings parity (profile/security/preferences/about) |
| `a518aad` | feat: Phase F — Ask AI chat with per-user conversation history |
| `22374f3` | feat: Phase E — Compare, Policy Monitor, Experts, Reports + Home tools hub |
| `79b0b84` | feat(explore): Africa map with 54 country shapes and tap-to-report |
| `388e896` | feat(countries): port Country list + Country Report Card |
| `3996f4a` | feat(home): real Youth Index dashboard pulling from same Render backend |
| `f60b3b7` | feat(auth): add Google OAuth sign-in |
| `c63c9ba` | feat(auth): replace email-link verification with in-app 6-digit OTP |
| `a3447e1` | Configure AfYO mobile app: bundle ID, NativeWind, Supabase, auth flow, tabs, PIN unlock |
| `52a7c31` | Initial commit |

---

_Last updated: 2026-05-12_
