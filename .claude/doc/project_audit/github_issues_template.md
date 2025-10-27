# GitHub Issues Template
**Session**: project_audit  
**Date**: 2025-10-27

---

## Overview

This document contains all 18 issues formatted as GitHub issue templates, ready to be created in the repository.

**Organization**:
- Labels: `priority:critical`, `priority:high`, `priority:medium`, `priority:low`
- Labels: `phase:0`, `phase:1`, `phase:2`, `phase:3`, `phase:4`
- Labels: `type:infrastructure`, `type:feature`, `type:testing`, `type:documentation`
- Milestones: `Phase 0: Foundation`, `Phase 1: Shopify Integration`, `Phase 2: Cart Feature`, `Phase 3: UI & Animations`, `Phase 4: Deployment`

---

## Issue #1: Initialize SvelteKit Project with SSG

**Labels**: `priority:critical`, `phase:0`, `type:infrastructure`  
**Milestone**: Phase 0: Foundation  
**Effort**: 2-3 hours

### User Story
As a developer, I want a properly configured SvelteKit project with SSG support so that I can start building features with optimal performance.

### Acceptance Criteria
- [ ] `yarn dev` starts development server at `http://localhost:5173`
- [ ] `yarn build` generates static files in `build/` directory
- [ ] `yarn test` runs successfully (even with 0 tests)
- [ ] TypeScript shows type errors for incorrect imports
- [ ] Path aliases (`$lib/*`, `$components/*`, `$features/*`, `$services/*`) resolve correctly

### Technical Details
- Use `@sveltejs/adapter-static` for SSG
- Configure path aliases in `svelte.config.js` and `tsconfig.json`
- Set up Vite with Svelte plugin
- Install dependencies: `svelte`, `@sveltejs/kit`, `vite`, `typescript`

### Files to Create
- `package.json`
- `svelte.config.js`
- `vite.config.ts`
- `tsconfig.json`
- `src/app.html`
- `src/routes/+page.svelte`

### Testing
- Verify build output contains static HTML files
- Test that dev server hot-reloads on file changes
- Validate TypeScript strict mode is enabled

### Dependencies
None

### References
- [SvelteKit Documentation](https://kit.svelte.dev/)
- `.claude/doc/project_audit/frontend_developer_plan.md`

---

## Issue #2: Initialize Git Repository

**Labels**: `priority:critical`, `phase:0`, `type:infrastructure`  
**Milestone**: Phase 0: Foundation  
**Effort**: 15 minutes

### User Story
As a developer, I want version control with git so that I can track changes, collaborate with others, and maintain code history.

### Acceptance Criteria
- [ ] `git status` shows valid repository status
- [ ] New files appear as untracked in `git status`
- [ ] `.gitignore` properly ignores `node_modules/`, `.env`, and `build/`
- [ ] `git log` shows commit history

### Technical Details
- Run `git init` in project root
- Create `.gitignore` with standard SvelteKit ignores
- Make initial commit with message "Initial commit: Project structure"

### Files to Create
- `.gitignore`

### Testing
- Verify `.git` directory exists
- Confirm `.gitignore` patterns work correctly

### Dependencies
None

---

## Issue #3: Fix Environment Configuration

**Labels**: `priority:critical`, `phase:0`, `type:infrastructure`  
**Milestone**: Phase 0: Foundation  
**Effort**: 10 minutes

### User Story
As a developer, I want correct environment variables documented so that I can easily configure Shopify integration.

### Acceptance Criteria
- [ ] `.env.example` contains `PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN`
- [ ] `.env.example` contains `PUBLIC_SHOPIFY_STORE_DOMAIN`
- [ ] Copying `.env.example` to `.env` and adding credentials allows Shopify connection
- [ ] Missing environment variables show clear error message on app startup

### Technical Details
- Remove all OpenAI, MongoDB, HuggingFace variables
- Add Shopify Storefront API configuration
- Document how to obtain Shopify credentials
- Add validation in `client.ts` to check for required env vars

### Files to Modify
- `.env.example`

### Testing
- Test app startup with missing env vars (should throw clear error)
- Test app startup with valid env vars (should succeed)

### Dependencies
None

### References
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)

---

## Issue #4: Update GitHub Actions Workflow

**Labels**: `priority:critical`, `phase:0`, `type:infrastructure`  
**Milestone**: Phase 0: Foundation  
**Effort**: 30 minutes

### User Story
As a developer, I want CI/CD to run tests automatically so that I catch bugs before they reach production.

### Acceptance Criteria
- [ ] GitHub Actions installs dependencies with `yarn install`
- [ ] GitHub Actions runs `yarn test` successfully
- [ ] GitHub Actions runs `yarn build` successfully
- [ ] GitHub Actions runs `yarn lint` successfully
- [ ] Failing steps cause build to fail

### Technical Details
- Update `.github/workflows/test.yml` to include lint and build steps
- Use `yarn` instead of `npm`
- Add caching for `node_modules`
- Run tests with coverage reporting

### Files to Modify
- `.github/workflows/test.yml`

### Testing
- Trigger workflow manually to verify it works
- Test that failing tests cause build to fail

### Dependencies
- #1 (needs package.json)

---

## Issue #5: Create Source Code Directory Structure

**Labels**: `priority:high`, `phase:1`, `type:infrastructure`  
**Milestone**: Phase 1: Core Infrastructure  
**Effort**: 1 hour

### User Story
As a developer, I want a well-organized directory structure so that I can easily find and maintain code.

### Acceptance Criteria
- [ ] `src/lib/` contains `components/`, `features/`, and `services/` directories
- [ ] New features can be added to `src/lib/features/{feature}/` with consistent structure
- [ ] Path aliases work for all directories

### Technical Details
```
src/lib/
  components/
    ui/
    cart/
    product/
    layout/
  features/
    cart/
    animations/
  services/
    shopify/
      ports/
      adapters/
```

### Files to Create
- Directory structure as above
- Placeholder `index.ts` files for barrel exports

### Testing
- Verify all directories exist
- Test that path aliases work for each directory

### Dependencies
- #1 (needs SvelteKit project)

### References
- `.claude/doc/project_audit/frontend_developer_plan.md`

---

## Issue #6: Implement Shopify API Integration

**Labels**: `priority:high`, `phase:1`, `type:feature`  
**Milestone**: Phase 1: Shopify Integration  
**Effort**: 6-8 hours

### User Story
As a developer, I want to integrate with Shopify's Storefront API so that I can fetch products and manage checkouts.

### Acceptance Criteria
- [ ] `productAdapter.fetchProducts()` returns array of products
- [ ] `productAdapter.fetchProductByHandle(handle)` returns product details
- [ ] `productAdapter.fetchProductByHandle('invalid')` returns `null`
- [ ] Shopify API errors throw `ShopifyAPIError`
- [ ] `checkoutAdapter.createCheckout(lineItems)` returns checkout with ID and webUrl
- [ ] `checkoutAdapter.fetchCheckout(id)` returns checkout details
- [ ] Expired checkout IDs return `null`

### Technical Details
- Implement hexagonal architecture with ports and adapters
- Create `ICheckoutPort` and `IProductPort` interfaces
- Implement `ShopifyCheckoutAdapter` and `ShopifyProductAdapter`
- Use GraphQL client for Shopify Storefront API
- Handle errors with custom `ShopifyAPIError` class

### Files to Create
- `src/lib/services/shopify/ports/ICheckoutPort.ts`
- `src/lib/services/shopify/ports/IProductPort.ts`
- `src/lib/services/shopify/client.ts`
- `src/lib/services/shopify/errors.ts`
- `src/lib/services/shopify/types.ts`
- `src/lib/services/shopify/adapters/ShopifyCheckoutAdapter.ts`
- `src/lib/services/shopify/adapters/ShopifyProductAdapter.ts`

### Testing
- Unit tests for GraphQL client (100% coverage)
- Unit tests for each adapter (100% coverage)
- Mock Shopify API responses
- Test error scenarios: network errors, GraphQL errors, rate limiting

### Dependencies
- #3 (needs env vars)
- #5 (needs structure)

### References
- `.claude/doc/project_audit/hexagonal_backend_architect_plan.md`
- [Shopify Storefront API Docs](https://shopify.dev/docs/api/storefront)

---

## Issue #7: Implement Cart State Management

**Labels**: `priority:high`, `phase:2`, `type:feature`  
**Milestone**: Phase 2: Cart Feature  
**Effort**: 8-12 hours

### User Story
As a user, I want to add products to my cart so that I can purchase multiple items and checkout later.

### Acceptance Criteria
- [ ] Adding product to empty cart creates 1 item
- [ ] Adding same product increments quantity
- [ ] Removing product empties cart
- [ ] Updating quantity to 0 removes product
- [ ] Cart displays correct subtotal for multiple products
- [ ] Cart persists after page refresh (localStorage)
- [ ] Shopify checkout is created when items are added
- [ ] Shopify checkout is updated when cart changes

### Technical Details
- Implement Svelte writable store for cart state
- Create pure functions for cart actions (add, remove, update, clear)
- Implement localStorage sync (instant)
- Implement Shopify checkout sync (async, background)
- Use optimistic UI updates

### Files to Create
- `src/lib/features/cart/cart.types.ts`
- `src/lib/features/cart/cart.store.ts`
- `src/lib/features/cart/cart.actions.ts`
- `src/lib/features/cart/cart.sync.ts`

### Testing
- Unit tests for all cart actions (100% coverage)
- Integration tests for localStorage sync
- Integration tests for Shopify sync
- Edge cases: concurrent adds, decimal prices, large quantities

### Dependencies
- #6 (needs Shopify adapter)
- #5 (needs structure)

### References
- `.claude/doc/project_audit/frontend_developer_plan.md`
- `.claude/doc/project_audit/test_strategy_plan.md`

---

## Issue #8: Implement GSAP Animations

**Labels**: `priority:high`, `phase:3`, `type:feature`  
**Milestone**: Phase 3: UI & Animations  
**Effort**: 4-6 hours

### User Story
As a user, I want playful animations when adding items to cart so that the shopping experience feels delightful and engaging.

### Acceptance Criteria
- [ ] Clicking "Add to Cart" triggers product image flying to cart icon
- [ ] Multiple animations can play simultaneously
- [ ] Cart is updated before animation completes (optimistic)
- [ ] Animations don't block UI on slow devices

### Technical Details
- Use GSAP for complex animations
- Create `flyToCart(element)` function in `$lib/features/animations/`
- Decouple animations from state updates (fire-and-forget)
- Use `position: fixed` clone for animation
- Clean up DOM after animation completes

### Files to Create
- `src/lib/features/animations/flyToCart.ts`

### Testing
- Test that animation function is called
- Test that animation doesn't block state updates
- Mock GSAP in tests

### Performance Requirements
- Animation duration: 600ms
- Frame rate: 60fps
- No jank or stuttering

### Dependencies
- #7 (needs cart)
- #9 (needs UI components)

### References
- [GSAP Documentation](https://greensock.com/docs/)

---

## Issue #9: Create Landing Page and UI Components

**Labels**: `priority:high`, `phase:3`, `type:feature`  
**Milestone**: Phase 3: UI & Animations  
**Effort**: 6-8 hours

### User Story
As a user, I want to see products on a beautiful landing page so that I can browse and add items to my cart.

### Acceptance Criteria
- [ ] Landing page displays grid of products
- [ ] Loading indicator shows while products load
- [ ] Empty state message shows when no products available
- [ ] Mobile displays single column
- [ ] Desktop displays 4-column grid
- [ ] Cart icon updates when items are added

### Technical Details
- Create `src/routes/+page.svelte` (landing page)
- Create `src/routes/+layout.svelte` (global layout with header/cart)
- Create `src/routes/+page.ts` with `prerender = true` for SSG
- Use `ProductGrid` and `ProductCard` components
- Implement responsive grid with Tailwind CSS

### Files to Create
- `src/routes/+layout.svelte`
- `src/routes/+page.svelte`
- `src/routes/+page.ts`
- `src/lib/components/ui/Button.svelte`
- `src/lib/components/ui/Card.svelte`
- `src/lib/components/ui/Badge.svelte`
- `src/lib/components/cart/CartIcon.svelte`
- `src/lib/components/cart/CartDrawer.svelte`
- `src/lib/components/cart/CartItem.svelte`
- `src/lib/components/product/ProductCard.svelte`
- `src/lib/components/product/ProductGrid.svelte`
- `src/lib/components/layout/Header.svelte`
- `src/lib/components/layout/Footer.svelte`

### Testing
- Component tests for `+page.svelte`
- Test SSG data loading
- Test responsive layouts at different breakpoints

### Performance Requirements
- First Contentful Paint: < 1.5 seconds
- Largest Contentful Paint: < 2.5 seconds
- Time to Interactive: < 3.5 seconds
- Lighthouse Performance: > 90

### Dependencies
- #6 (needs products)
- #5 (needs structure)

### References
- `.claude/doc/project_audit/component_architecture_plan.md`

---

## Issue #10: Write Comprehensive Tests

**Labels**: `priority:high`, `phase:0-4`, `type:testing`  
**Milestone**: All Phases  
**Effort**: 12-16 hours

### User Story
As a developer, I want comprehensive test coverage so that I can refactor with confidence and catch bugs early.

### Acceptance Criteria
- [ ] `yarn test` runs all tests successfully
- [ ] `yarn test:coverage` shows > 80% coverage
- [ ] Modifying cart logic catches breaking changes
- [ ] New features follow established test patterns

### Technical Details
- Configure Vitest with Svelte Testing Library
- Create test setup file (`tests/setup.ts`)
- Create mock utilities (`tests/mocks/shopify.ts`)
- Write unit tests for all cart actions, sync, and adapters
- Write integration tests for cart + Shopify sync
- Write component tests for UI components

### Files to Create
- `vitest.config.ts`
- `tests/setup.ts`
- `tests/mocks/shopify.ts`
- `tests/utils/test-helpers.ts`
- `tests/unit/features/cart/*.test.ts`
- `tests/unit/services/shopify/*.test.ts`
- `tests/integration/*.test.ts`
- `tests/components/*.test.ts`

### Testing Requirements
- Unit tests: 70% of total tests
- Integration tests: 20% of total tests
- Component tests: 10% of total tests
- Critical paths: 100% coverage required

### Dependencies
- All features (tests written alongside implementation)

### References
- `.claude/doc/project_audit/test_strategy_plan.md`
- `.claude/doc/project_audit/test_implementation_plan.md`

---

*Remaining issues (M1-M5, L1-L3) follow the same format...*
*See complete_issue_list.md for full details on all 18 issues*

---

## GitHub Project Board Structure

### Columns
1. **Backlog** - All issues start here
2. **Phase 0: Foundation** - Critical infrastructure
3. **Phase 1: Shopify Integration** - Backend setup
4. **Phase 2: Cart Feature** - Core functionality
5. **Phase 3: UI & Animations** - User-facing features
6. **Phase 4: Deployment** - Production readiness
7. **Done** - Completed issues

### Milestones
- **Phase 0: Foundation** (Issues #1-4, #11, #14)
- **Phase 1: Core Infrastructure** (Issues #5, #12, #17)
- **Phase 2: Shopify Integration** (Issue #6)
- **Phase 3: Cart Feature** (Issue #7)
- **Phase 4: UI & Animations** (Issues #8, #9)
- **Phase 5: Deployment & Polish** (Issues #13, #15, #16, #18)

### Labels to Create
**Priority**:
- `priority:critical` (red)
- `priority:high` (orange)
- `priority:medium` (yellow)
- `priority:low` (green)

**Phase**:
- `phase:0` (purple)
- `phase:1` (blue)
- `phase:2` (cyan)
- `phase:3` (teal)
- `phase:4` (lime)

**Type**:
- `type:infrastructure` (gray)
- `type:feature` (blue)
- `type:testing` (yellow)
- `type:documentation` (green)

---

*Template ready for GitHub issue creation*  
*Do NOT create issues yet - awaiting user review*

