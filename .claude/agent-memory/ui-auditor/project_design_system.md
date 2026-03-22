---
name: Gooflo Design System
description: Official design tokens from tailwind.config.js and brand spec for audit reference
type: project
---

Brand: dark-first app, #1A1A1A true background (mapped to `black` token), #2D2D2D surface (mapped to `dark` token), #BFFF00 lime accent, Nunito font family, Ionicons only (no emoji in UI), no gradients.

**Why:** Premium/modern positioning. Gradients and emoji both read as consumer/cheap.
**How to apply:** Any hardcoded hex, emoji in rendered UI, or non-Ionicon icon is a violation.

## Color tokens (tailwind.config.js)
- black: #1A1A1A (true app bg -- NOT pure black #000000)
- dark: #2D2D2D (card/surface)
- white: #FFFFFF
- off-white: #F2F2F0
- lime DEFAULT: #BFFF00 / lime dark: #9ED600
- coral DEFAULT: #FF5C5C / coral dark: #E04545
- premium: #8B5CF6
- info: #4DA8FF
- warning: #FF9F43
- success: #2DD4A8
- divider-light: #E5E5E3 / divider-dark: #3A3A3A

## Font family classes
- font-sans = Nunito_400Regular
- font-medium = Nunito_500Medium
- font-semibold = Nunito_600SemiBold
- font-bold = Nunito_700Bold
- font-extrabold = Nunito_800ExtraBold
- font-heading = Nunito_900Black

## Border radius tokens
- rounded-sm = 8px
- rounded-md = 12px
- rounded-lg = 16px
- rounded-xl = 24px

Note: rounded-2xl (24px in Tailwind default) and rounded-full are used throughout but 24px maps to rounded-xl per design system. rounded-2xl is not an explicitly defined theme token.
