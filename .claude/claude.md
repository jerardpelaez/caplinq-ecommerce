# Krayden Ecommerce — Project Intelligence

## Project Overview
B2B ecommerce platform for specialty chemicals and electronic materials, built with Astro + Svelte + Tailwind CSS. Modeled after www.caplinq.com.

## Tech Stack
- **Framework**: Astro 5.x (SSG-first, with SSR for dynamic routes if needed)
- **UI Components**: Svelte 5 (using Runes) for interactive islands
- **Styling**: Tailwind CSS v4 (CSS-first config, `@import "tailwindcss"`)
- **State Management**: Nanostores + @nanostores/persistent for cart
- **Search**: Fuse.js for client-side fuzzy search
- **Content**: Astro Content Collections with Zod schemas
- **Type Safety**: TypeScript strict mode throughout

## Architecture Principles
1. **Islands Architecture**: Use Astro components for static content. Only use Svelte (`client:*` directives) for genuinely interactive elements (search, cart, filters, forms).
2. **Content-First**: Products, categories, and blog posts are Content Collections — type-safe, validated, and statically generated.
3. **Performance Budget**: Target 95+ Lighthouse score. No unnecessary JS. Use `client:visible` or `client:idle` over `client:load` wherever possible.
4. **B2B Focus**: This is NOT a typical consumer ecommerce. Key flows are: browse catalog → request quote → contact sales. NOT add-to-cart → checkout → pay.
5. **SEO-Driven**: Every product and category page must have proper meta tags, JSON-LD structured data, Open Graph tags, and canonical URLs.

## Key Conventions

### File Naming
- Astro components: `PascalCase.astro`
- Svelte components: `PascalCase.svelte`
- Utilities/stores: `camelCase.ts`
- Content files: `kebab-case.md` or `kebab-case.yaml`
- Types: `PascalCase` for interfaces, `camelCase` for type aliases

### Component Decision Tree
- Is it static content with no user interaction? → `.astro` component
- Does it need click handlers, form state, or dynamic updates? → `.svelte` component with appropriate `client:*` directive
- Is it a layout wrapper? → `.astro` layout
- Does it need to share state across components? → Use nanostores

### Svelte 5 Patterns
- ALWAYS use Runes syntax (`$state`, `$derived`, `$effect`, `$props`)
- NO legacy `let` reactivity or `$:` reactive statements
- Use `{#snippet}` for render props, NOT slots where possible
- Prefer `$derived` over `$effect` for computed values

### Content Collections
- Define schemas in `src/content.config.ts` using `defineCollection` + Zod
- Query with `getCollection('products')` in `.astro` files only
- Filter and sort at build time for zero runtime cost
- Use `reference()` for cross-collection relationships
- Every product MUST have: name, slug, category, shortDescription, specifications (key-value), images, and at least one document (TDS/SDS)
- Categories are hierarchical: parentCategory → subcategory → product

### Styling Rules
- Use Tailwind utility classes as the primary styling method
- Tailwind v4: use `@import "tailwindcss"` in global.css (NOT `@tailwind base/components/utilities`)
- Extract repeated patterns into `@apply` components ONLY for truly reusable patterns
- Use CSS custom properties for brand colors and typography scale
- Mobile-first responsive design: base → `sm:` → `md:` → `lg:` → `xl:`

### State Management
- Cart/quote state: `nanostores` with `persistent` (localStorage)
- UI state (modals, drawers): local Svelte `$state`
- Search state: dedicated nanostore
- NEVER use Svelte stores (`writable`, `readable`) — use nanostores for cross-framework compatibility with Astro

### API Routes (if SSR is enabled)
- Place in `src/pages/api/`
- Use for: contact form submission, quote requests, newsletter signup
- Validate all inputs with Zod
- Return proper HTTP status codes and JSON responses

### Testing Strategy
- Component tests: Vitest + @testing-library/svelte
- E2E tests: Playwright for critical user flows
- Lighthouse CI for performance regression

## Agent Team

When working on this project, delegate tasks to specialized sub-agents:

### Architect Agent (`/.claude/agents/architect.md`)
Handles: System design decisions, data flow, integration points, performance architecture, build configuration.

### Frontend Lead Agent (`/.claude/agents/frontend-lead.md`)
Handles: Component implementation, responsive design, animations, accessibility, design system.

### Content Engineer Agent (`/.claude/agents/content-engineer.md`)
Handles: Content collection schemas, product data modeling, markdown processing, SEO content structure.

### SEO Specialist Agent (`/.claude/agents/seo-specialist.md`)
Handles: Meta tags, JSON-LD, sitemap, robots.txt, URL structure, Core Web Vitals optimization.

### QA Agent (`/.claude/agents/qa-agent.md`)
Handles: Writing tests, accessibility audits, cross-browser testing, performance benchmarks.

## Current Sprint Focus
Phase 1: Project setup, design system, base components, content schemas, and homepage.

## Legacy Codebase
We have access to the existing Krayden codebase at `/home/jerardpelaez/frontend-dev-workspace/website` for reference. It is being FULLY REPLACED.
- USE IT FOR: understanding data models, business rules, product taxonomy, feature requirements, content structure
- NEVER: copy code, port patterns, reuse components, or follow its architecture
- Treat it as a "requirements doc written in bad code" — extract knowledge, discard implementation
- All extracted knowledge lives in `docs/legacy-codebase-analysis.md`
- When in doubt about a business rule, check the legacy code before inventing something new

## Known Gotchas
- Svelte components in Astro MUST use `client:*` directives to hydrate
- Nanostores work across Astro and Svelte but need `@nanostores/persistent` for cart persistence
- Content Collections `getCollection()` is async and only works in `.astro` files, NOT in Svelte
- Image optimization via `astro:assets` only works in `.astro` files — pass optimized image URLs as props to Svelte components
- Tailwind v4 uses `@import "tailwindcss"` not `@tailwind base/components/utilities`
- View Transitions: use `<ViewTransitions />` in base layout, handle `astro:page-load` for re-init
- Svelte 5: NO `$:` reactive declarations, NO `export let` for props — use `$props()` rune
- Nanostores in Svelte: import `useStore` from `@nanostores/svelte`, NOT Svelte native stores
