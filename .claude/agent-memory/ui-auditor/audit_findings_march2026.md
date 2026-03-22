---
name: UI Audit Findings March 2026
description: Concrete per-file bugs, visual inconsistencies, and accessibility issues found in March 2026 audit
type: project
---

Key patterns found:
- bg-black used throughout screens but black token = #1A1A1A, not #000000 -- this is correct per config but screens that use bg-[#F5F5F5] for light mode have no dark: override on the same class (explore.tsx, profile.tsx)
- StreakBadge uses flash icon (lime) when count < 7, same icon and color as CreditPill -- confirmed icon collision
- Emoji in verify-email.tsx (mailbox emoji line 30) -- brand violation
- Hardcoded Turkish strings scattered across generation/[id].tsx, mod/[slug].tsx, profile.tsx -- i18n gaps
- explore.tsx fetchMods error not handled -- data silently set to [] on Supabase error
- Multiple hardcoded hex colors not from design token palette: #F5F5F5, #1C1C1C, #3A3A3A used raw instead of off-white/dark/divider-dark tokens
- welcome.tsx uses arbitrary border-radius values [40px] and [32px] -- not in theme
- Pressable touch targets below 44pt minimum in several places
- Alert.prompt used for collection creation -- iOS only, not cross-platform, non-premium UX
- GenerationGridTile has no accessibilityLabel
- useAuthStore initialize() does not set isLoading: false in the error path -- if supabase.auth.getSession() throws, loading spinner never resolves (feed loading bug root cause candidate)

**Why recorded:** These were confirmed during the March 2026 full-codebase UI audit.
**How to apply:** Cross-check these patterns when reviewing new components or fixing reported bugs.
