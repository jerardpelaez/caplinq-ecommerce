# Developer Documentation — Design Doc

**Date:** 2026-02-24
**Status:** Approved

## Goal
Single HTML file (`docs/index.html`) serving as both a presentation slide deck and a scrollable reference doc for onboarding developers to the Krayden B2B ecommerce project.

## Format
- **Presentation Mode**: ~18 fullscreen slides, keyboard nav (arrows), progress bar
- **Reference Mode**: Scrollable long-form doc with sticky sidebar
- Toggle via button, no external dependencies, vanilla HTML/CSS/JS

## Slide Outline
1. Title
2. Why We Moved (Joomla/PHP pain points)
3. The New Stack (Astro 5 + Svelte 5 + Tailwind v4)
4. Pros & Cons (honest comparison table)
5. Architecture Overview (islands, static-first)
6. Project Structure (key folders)
7. Astro Basics (.astro files, frontmatter)
8. Content Collections (Zod schemas, markdown)
9. Routing (file-based, dynamic routes)
10. Svelte 5 Basics (runes, $state/$derived/$effect/$props)
11. Components (Astro vs Svelte decision tree)
12. Islands Architecture (hydration directives)
13. Styling (Tailwind v4, @theme, @utility, brand)
14. State Management (nanostores, useStore, quote flow)
15. B2B Quote Flow (browse -> quote -> request)
16. Content Pipeline (API sync, transform)
17. Key Patterns & Gotchas
18. Resources & Next Steps

## Audience
Mixed: PHP/Joomla devs, some React/Vue experience, general web devs

## Tone
Direct — honest pros/cons, no sugarcoating either stack

## Visual Style
Krayden brand colors (slate blue, navy, accent blue), monospace code blocks, minimal design
