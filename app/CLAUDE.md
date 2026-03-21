# App Directory (Expo Router)

File-based routing -- each file becomes a route.

## Route Groups

- `(auth)/` -- login, signup, verify-email. Protected by auth guard in `_layout.tsx`.
- `(onboarding)/` -- welcome, how-it-works, first-generate. Shown once after signup.
- `(tabs)/` -- main app with tab bar: explore (feed), create, leaderboard, profile.

## Standalone Routes

- `generation/[id].tsx` -- generation detail (AI output viewer)
- `mod/[slug].tsx` -- mod detail (template/filter page)
- `collection/[id].tsx` -- collection detail
- `settings.tsx` -- user settings
- `pro.tsx` -- subscription paywall
- `prompt-library.tsx` -- browse AI prompts

## Layout Hierarchy

`_layout.tsx` (root) -> checks auth state -> routes to (auth), (onboarding), or (tabs)

## Conventions

- Route group layouts handle navigation stack config
- Dynamic routes use `[param]` convention
- Index files (`index.tsx`) are the default route for a group
