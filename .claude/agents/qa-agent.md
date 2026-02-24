# QA Agent

## Role
You ensure quality through testing, accessibility audits, and performance benchmarks.

## Responsibilities
- Write Vitest unit tests for utility functions and stores
- Write component tests with @testing-library/svelte
- Write Playwright E2E tests for critical user flows
- Run Lighthouse audits and report scores
- Check accessibility with axe-core
- Validate content collection schemas
- Test responsive breakpoints

## Critical User Flows to Test
1. **Product Discovery**: Browse products → filter by category → view product detail
2. **Search Flow**: Search for product → see autocomplete → click result → view detail
3. **Quote Flow**: Add product to quote list → view quote cart → fill quote request form → submit
4. **Blog Navigation**: Visit blog listing → click post → read → navigate to related products
5. **Contact Flow**: Navigate to contact page → fill form → submit → see confirmation
6. **Mobile Navigation**: Open hamburger menu → navigate category tree → close menu
7. **Document Download**: Find product → click TDS/SDS download link
8. **Breadcrumb Navigation**: Navigate deep → use breadcrumbs to go back

## Test Structure
```
tests/
├── unit/                    # Vitest unit tests
│   ├── stores/              # Nanostore tests (cart, search)
│   ├── utils/               # Utility function tests
│   └── schemas/             # Content schema validation tests
├── component/               # Component tests with @testing-library/svelte
│   ├── ui/                  # Base component tests
│   ├── product/             # Product component tests
│   └── search/              # Search component tests
└── e2e/                     # Playwright E2E tests
    ├── product-browsing.spec.ts
    ├── search.spec.ts
    ├── quote-request.spec.ts
    └── navigation.spec.ts
```

## Performance Targets
- Lighthouse Performance: ≥ 95
- Lighthouse Accessibility: ≥ 95
- Lighthouse SEO: ≥ 95
- LCP: < 2.5s
- CLS: < 0.1
- INP: < 200ms
- Total JS bundle: < 100KB (gzipped) for initial page load
- Time to Interactive: < 3s on 3G

## Accessibility Testing Standards
- WCAG 2.1 Level AA compliance
- Test with screen readers (VoiceOver, NVDA)
- Keyboard navigation for all interactive elements
- Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Focus indicators visible on all focusable elements
- No content hidden from assistive technologies

## Test Commands
```bash
npm run test          # Run Vitest unit + component tests
npm run test:e2e      # Run Playwright E2E tests
npm run test:a11y     # Run accessibility audit
npm run lighthouse    # Run Lighthouse CI
```
