# Gamified Brand Experience

## Project Overview

This project is not a traditional e-commerce store; it is an interactive brand experience that also sells products. The core of the project is a "gamified transactional landing page" designed to solve the technical conflict between the fluidity of a web application and the critical load speed of a landing page. The user experience is the primary product; the SKUs are complementary.

The architecture centers around a single, fast-loading landing page (statically generated) that features a "gamified cart." This cart is a global state, persistent via `localStorage`, and features high-performance, decoupled animations (using GSAP) to create a playful and engaging "add to cart" experience (e.g., an icon flying to the cart). The backend is fully headless, using Shopify's Storefront API to manage inventory, payments, and checkouts, allowing the frontend to focus purely on performance and brand expression.

## Architecture

### Tech Stack

  - **Framework**: **SvelteKit**
      - *Justification*: Chosen over Next.js for its compiler-based approach. This results in smaller JavaScript bundles and superior animation performance, which is critical for the "playful" UI and complex GSAP choreography.
  - **Backend (Headless Commerce)**: **Shopify Headless**
      - *Justification*: Provides a world-class backend for payments, inventory, order management, and PCI compliance via the Storefront API, without coupling us to a monolithic frontend.
  - **Architecture**: **Headless Commerce with Component-Based State**
      - *Justification*: A full Hexagonal/DDD architecture is unnecessary for this application's scope. We will use Svelte Stores for global state, decoupled from UI components, and API adapters for external services (Shopify).
  - **Hosting/Platform**: **Vercel**
      - *Justification*: Native integration with SvelteKit. Provides best-in-class SSG (Static Site Generation) for the landing page, Edge Functions, and automated Image Optimization.
  - **Animation**: **GSAP (GreenSock)** & **Svelte Transitions**
      - *Justification*: GSAP for complex, choreographed animations (e.g., "fly to cart"). Svelte's native transitions for simpler micro-interactions (hovers, fades).
  - **State Management**: **Svelte Stores** (native)
  - **Testing**: **Vitest** with Svelte Testing Library

### Project Architecture Layers

The SvelteKit project structure will enforce a clean separation of concerns.

```
src/
  lib/
    components/         # Reusable Svelte UI components (buttons, etc.)
    features/
      cart/             # Core "gamified cart" logic
        cart.store.ts   # Svelte writable store (the single source of truth)
        cart.actions.ts # Functions (add, remove, update)
        cart.sync.ts    # localStorage & Shopify checkout sync logic
      animations/       # Decoupled GSAP animation functions
        flyToCart.ts    # Example: animates an element to the cart
    services/
      shopify/          # Adapter for Shopify Storefront API
        client.ts       # API client setup (headers, token)
        checkout.ts     # Functions to create/fetch/update checkouts
  routes/               # SvelteKit file-based routing
    +page.svelte        # The main "Transactional Landing Page" (SSG)
    +layout.svelte      # Global layout (holds cart icon, header, footer)
    (phase_2)/
      productos/
        [slug]/
          +page.svelte  # (Phase 2) Dynamic product page
```

### Key Architectural Principles

1.  **State-Animation Decoupling**: The cart's business logic (updating the state in the Svelte Store) is **instant** and **separate** from any visual flair. GSAP animations are "fire-and-forget" visual effects triggered *at the same time* as the state update, not as part of it.
2.  **Performance First (SSG)**: The main landing page (`/routes/+page.svelte`) **must** be statically generated (SSG) at build time for near-instant load speeds.
3.  **Optimistic UI**: Adding an item to the cart updates the local Svelte Store immediately. API calls to Shopify (to create/update a checkout) happen asynchronously in the background.
4.  **Robust Persistence**: The cart state (`cartStore`) is synced to `localStorage` for speed. On app load, the `cart.sync.ts` service attempts to hydrate the store from an existing Shopify `checkoutId` (if one is found in `localStorage`) to recover cross-session carts.
5.  **Asset Optimization**: All images **must** be served through Vercel's Image Optimization service to automatically handle format conversion (`.webp`/`.avif`), resizing, and CDN delivery.

### Path Aliases (tsconfig.json / svelte.config.js)

```typescript
"$lib/*"              → ./src/lib/*
"$components/*"       → ./src/lib/components/*
"$features/*"         → ./src/lib/features/*
"$services/*"         → ./src/lib/services/*
```

## Development Commands

### Running the Application

```bash
yarn dev          # Development server
yarn build        # Production build (SSG)
yarn preview      # Preview production build locally
```

### Testing

```bash
yarn test              # Run Vitest tests
yarn test:ui           # Run tests with UI
yarn test:coverage     # Run tests with coverage
```

### Linting

```bash
yarn lint         # ESLint
```

## Environment Variables

Required in `.env`:

  - `PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN` - Shopify Storefront API Token
  - `PUBLIC_SHOPIFY_STORE_DOMAIN` - The `.myshopify.com` store URL

## API Communication Flow (Gamified Cart)

1.  **On Load**:
    a. `cart.sync.ts` checks `localStorage` for a `checkoutId`.
    b. If found, it calls the Shopify service (`$lib/services/shopify/`) to fetch the checkout.
    c. If checkout is valid, `cart.store.ts` is hydrated with items from Shopify.
    d. If not, `cart.store.ts` hydrates from a local `localStorage` cart backup or starts empty.
2.  **User Clicks "Add to Cart"**:
    a. The UI component *simultaneously* triggers two independent actions:
    b. **State**: `cart.actions.add(item)`. This updates the `cart.store.ts` **instantly**.
    c. **Visual**: `flyToCart(imageElement)`. This (GSAP) clones the product image and runs the visual-only animation.
3.  **On Store Update**:
    a. The `cart.store.ts` has a `.subscribe()` method that calls `cart.sync.ts` to persist the new state to `localStorage` on every change.
4.  **User Clicks "Checkout"**:
    a. The UI calls a `checkout()` action.
    b. This action takes the items from `cart.store.ts` and calls the Shopify service to create/update a checkout.
    c. Shopify returns a `checkoutUrl`. The `checkoutId` is saved to `localStorage`.
    d. The user is redirected to Shopify's secure payment page.

## Key Technical Details

### State (Svelte Stores)

  - **`cartStore`**: A Svelte Writable Store (`writable<Cart>`). This is the global single source of truth for `CartItem[]`, `subtotal`, and `checkoutId: string | null`.

### Services (Adapters)

  - **`ShopifyService` (`$lib/services/shopify/`)**: An adapter module that abstracts all Shopify Storefront API calls (GraphQL). It exposes simple functions like `createCheckout(items)` or `fetchCheckout(id)`.
  - **`CartSyncService` (`$lib/features/cart/cart.sync.ts`)**: Manages the persistence layer, syncing the Svelte store with `localStorage` and the Shopify API.

### Animation

  - **GSAP Functions (`$lib/features/animations/`)**: Standalone, exported functions that take an HTML element as an argument and run an animation. They do not read from or write to the `cartStore`.

## Adding New Features

### Adding a New Product

1.  Add the product/SKU in the Shopify Admin Dashboard.
2.  If the landing page dynamically fetches products, no code change is needed.
3.  If the landing page is pure SSG, a new build/deployment must be triggered (Vercel webhooks can automate this from Shopify) to regenerate the static page.

### Adding a New Animation

1.  Create a new function in `$lib/features/animations/`.
2.  Import and call this function from any `.svelte` component as a visual-only effect.
3.  No changes to state logic are needed.

## Sub-Agent Workflow

## Rules

  - After a plan mode phase you should create a `.claude/sessions/context_session_{feature_name}.md` with the definition of the plan
  - Before you do any work, MUST view files in `.claude/sessions/context_session_{feature_name}.md` file and `.claude/doc/{feature_name}/*` files to get the full context (feature\_name being the id of the session we are operate, if file doesnt exist, then create one)
  - `.claude/sessions/context_session_{feature_name}.md` should contain most of context of what we did, overall plan, and sub agents will continusly add context to the file
  - After you finish the work, MUST update the `.claude/sessions/context_session_{feature_name}.md` file to make sure others can get full context of what you did
  - After you finish the each phase, MUST update the `.claude/sessions/context_session_{feature_name}.md` file to make sure others can get full context of what you did

## Sub-Agent Workflow

This project uses specialized sub-agents for different concerns. Always consult the appropriate agent:

  - **shadcn-ui-architect**: UI building & component architecture (Note: We are using Svelte, not shadcn, but this agent handles UI components)
  - **qa-criteria-validator**: Final UI/UX validation and feedback
  - **ui-ux-analyzer**: UI review, improvements & tweaking
  - **frontend-developer**: Client-side business logic
  - **frontend-test-engineer**: Frontend test case definitions
  - **typescript-test-explorer**: Test case design
  - **hexagonal-backend-architect**: API & backend architecture (for our Shopify adapter)
  - **backend-test-architect**: Backend test definitions

Sub agents will do research about the implementation and report feedback, but you will do the actual implementation;
When passing task to sub agent, make sure you pass the context file, e.g. `.claude/sessions/context_session_{feature_name}.md`.
After each sub agent finish the work, make sure you read the related documentation they created to get full context of the plan before you start executing

## Code Writing Standards

  - **Simplicity First**: Prefer simple, clean, maintainable solutions over clever ones
  - **ABOUTME Comments**: All files must start with 2-line comment with "ABOUTME: " prefix
  - **Minimal Changes**: Make smallest reasonable changes to achieve desired outcome
  - **Style Matching**: Match existing code style/formatting within each file
  - **Preserve Comments**: Never remove comments unless provably false
  - **No Temporal Naming**: Avoid 'new', 'improved', 'enhanced', 'recently' in names/comments
  - **Evergreen Documentation**: Comments describe code as it is, not its history

## Version Control

  - Non-trivial edits must be tracked in git
  - Create WIP branches for new work
  - Commit frequently throughout development
  - Never throw away implementations without explicit permission

## Testing Requirements

**NO EXCEPTIONS POLICY**: All projects MUST have:

  - Unit tests

The only way to skip tests: Daniel EXPLICITLY states "I AUTHORIZE YOU TO SKIP WRITING TESTS THIS TIME."

  - Tests must comprehensively cover all functionality
  - Test output must be pristine to pass
  - Never ignore system/test output - logs contain critical information

## Architecture Compliance

When writing code:

1.  **Isolate Business Logic**: All cart state logic **must** reside in `$lib/features/cart/`. Svelte components (`.svelte` files) should only import and call actions (e.g., `cart.actions.add()`).
2.  **Decouple API Logic**: All Shopify API communication (GraphQL) **must** be abstracted in `$lib/services/shopify/`. Components and stores must not know the API exists; they call the service.
3.  **Decouple Animations**: All complex GSAP animations **must** be in standalone functions (e.g., `$lib/features/animations/`). Components import and trigger them as visual effects, completely separate from state.
4.  **Static First**: Prioritize SSG (`+page.svelte`) for all primary landing/product pages. Use client-side fetching (`onMount`) only for data that is dynamic or user-specific (like the cart).
5.  **Smart State**: Use Svelte Stores for *global* state (the cart). Use component-level props and state for all other UI-specific, ephemeral state.

## Code Writing

  - YOU MUST ALWAYS address me as "Daniel" in all communications.
  - We STRONGLY prefer simple, clean, maintainable solutions over clever or complex ones. Readability and maintainability are PRIMARY CONCERNS, even at the cost of conciseness or performance.
  - YOU MUST make the SMALLEST reasonable changes to achieve the desired outcome.
  - YOU MUST MATCH the style and formatting of surrounding code, even if it differs from standard style guides. Consistency within a file trumps external standards.
  - YOU MUST NEVER make code changes unrelated to your current task. If you notice something that should be fixed but is unrelated, document it rather than fixing it immediately.
  - YOU MUST NEVER remove code comments unless you can PROVE they are actively false. Comments are important documentation and must be preserved.
  - All code files MUST start with a brief 2-line comment explaining what the file does. Each line MUST start with "ABOUTME: " to make them easily greppable.
  - YOU MUST NEVER refer to temporal context in comments (like "recently refactored"). Comments should be evergreen and describe the code as it is.
  - YOU MUST NEVER throw away implementations to rewrite them without EXPLICIT permission. If you're considering this, YOU MUST STOP and ask first.
  - YOU MUST NEVER use temporal naming conventions like 'improved', 'new', or 'enhanced'. All naming should be evergreen.
  - YOU MUST NOT change whitespace unrelated to code you're modifying.

## Version Control

  - For non-trivial edits, all changes MUST be tracked in git.
  - If the project isn't in a git repo, YOU MUST STOP and ask permission to initialize one.
  - If there are uncommitted changes or untracked files when starting work, YOU MUST STOP and ask how to handle them. Suggest committing existing work first.
  - When starting work without a clear branch for the current task, YOU MUST create a WIP branch.
  - YOU MUST commit frequently throughout the development process.

## Getting Help

  - Always ask for clarification rather than making assumptions
  - Stop and ask for help when stuck, especially when human input would be valuable
  - If considering an exception to any rule, stop and get explicit permission from Daniel first

## Testing

  - Tests MUST comprehensively cover ALL implemented functionality.
  - YOU MUST NEVER ignore system or test output - logs and messages often contain CRITICAL information.
  - Test output MUST BE PRISTINE TO PASS.
  - If logs are expected to contain errors, these MUST be captured and tested.
  - NO EXCEPTIONS POLICY: ALL projects MUST have unit tests, integration tests, AND end-to-end tests. The only way to skip any test type is if Daniel EXPLICITLY states: "I AUTHORIZE YOU TO SKIP WRITING TESTS THIS TIME."

## Compliance Check

Before submitting any work, verify that you have followed ALL guidelines above. If you find yourself considering an exception to ANY rule, YOU MUST STOP and get explicit permission from Daniel first.
