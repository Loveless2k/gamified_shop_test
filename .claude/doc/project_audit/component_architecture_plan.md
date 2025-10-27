# Component Architecture Plan (Svelte)
**Agent**: shadcn-ui-architect (adapted for Svelte)  
**Session**: project_audit  
**Date**: 2025-10-27

---

## Context

Reviewed `.claude/sessions/context_session_project_audit.md` and `MASTER_IMPLEMENTATION_PLAN.md`.

**Framework**: Svelte (not React/shadcn)  
**UI Library**: Custom Svelte components (no shadcn - it's React-only)  
**Styling**: Tailwind CSS  
**Focus**: Component architecture for gamified cart experience

---

## Svelte Component Architecture

### Component Hierarchy

```
src/lib/components/
├── ui/                      # Reusable UI primitives
│   ├── Button.svelte
│   ├── Card.svelte
│   ├── Badge.svelte
│   └── Modal.svelte
├── cart/                    # Cart-specific components
│   ├── CartIcon.svelte
│   ├── CartDrawer.svelte
│   ├── CartItem.svelte
│   └── CartSummary.svelte
├── product/                 # Product display components
│   ├── ProductCard.svelte
│   ├── ProductGrid.svelte
│   └── ProductImage.svelte
└── layout/                  # Layout components
    ├── Header.svelte
    └── Footer.svelte
```

---

## Detailed Component Specifications

### 1. UI Primitives

#### `src/lib/components/ui/Button.svelte`

```svelte
<!-- ABOUTME: Reusable button component with variants -->
<!-- ABOUTME: Supports primary, secondary, and ghost styles -->

<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
    secondary: 'bg-gray-200 text-black hover:bg-gray-300 focus:ring-gray-400',
    ghost: 'bg-transparent text-black hover:bg-gray-100 focus:ring-gray-300',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  $: classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
</script>

<button
  {type}
  {disabled}
  class={classes}
  on:click
  on:mouseenter
  on:mouseleave
>
  <slot />
</button>
```

---

#### `src/lib/components/ui/Card.svelte`

```svelte
<!-- ABOUTME: Card container component for content grouping -->
<!-- ABOUTME: Provides consistent spacing and shadow -->

<script lang="ts">
  export let padding: 'sm' | 'md' | 'lg' = 'md';
  export let hover = false;
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  $: classes = `bg-white rounded-xl shadow-sm ${paddingClasses[padding]} ${hover ? 'transition-shadow hover:shadow-md' : ''}`;
</script>

<div class={classes}>
  <slot />
</div>
```

---

### 2. Cart Components

#### `src/lib/components/cart/CartIcon.svelte`

```svelte
<!-- ABOUTME: Cart icon with item count badge -->
<!-- ABOUTME: Reactive to cart state changes -->

<script lang="ts">
  import { cartItemCount } from '$lib/features/cart/cart.store';
  import Badge from '../ui/Badge.svelte';
  
  export let onClick: (() => void) | undefined = undefined;
</script>

<button
  class="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
  on:click={onClick}
  aria-label="Shopping cart"
>
  <!-- Cart SVG Icon -->
  <svg
    class="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
  
  <!-- Item count badge -->
  {#if $cartItemCount > 0}
    <Badge
      class="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center"
    >
      {$cartItemCount}
    </Badge>
  {/if}
</button>
```

---

#### `src/lib/components/cart/CartDrawer.svelte`

```svelte
<!-- ABOUTME: Slide-out cart drawer component -->
<!-- ABOUTME: Shows cart items and checkout button -->

<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { cartItems, cartSubtotal } from '$lib/features/cart/cart.store';
  import { removeFromCart, updateQuantity } from '$lib/features/cart/cart.actions';
  import CartItem from './CartItem.svelte';
  import CartSummary from './CartSummary.svelte';
  import Button from '../ui/Button.svelte';
  
  export let isOpen = false;
  export let onClose: () => void;
  
  function handleCheckout() {
    // Navigate to Shopify checkout
    const checkoutId = localStorage.getItem('shopify_checkout_id');
    if (checkoutId) {
      // Redirect to Shopify checkout URL
      // (Implementation depends on checkout adapter)
    }
  }
</script>

<!-- Backdrop -->
{#if isOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-40"
    on:click={onClose}
    transition:fade={{ duration: 200 }}
  />
{/if}

<!-- Drawer -->
{#if isOpen}
  <div
    class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
    transition:fly={{ x: 400, duration: 300 }}
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b">
      <h2 class="text-2xl font-bold">Your Cart</h2>
      <button
        on:click={onClose}
        class="p-2 hover:bg-gray-100 rounded-full"
        aria-label="Close cart"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- Cart Items -->
    <div class="flex-1 overflow-y-auto p-6">
      {#if $cartItems.length === 0}
        <p class="text-center text-gray-500 mt-8">Your cart is empty</p>
      {:else}
        <div class="space-y-4">
          {#each $cartItems as item (item.variantId)}
            <CartItem
              {item}
              onRemove={() => removeFromCart(item.variantId)}
              onUpdateQuantity={(qty) => updateQuantity(item.variantId, qty)}
            />
          {/each}
        </div>
      {/if}
    </div>
    
    <!-- Footer with Summary and Checkout -->
    {#if $cartItems.length > 0}
      <div class="border-t p-6 space-y-4">
        <CartSummary subtotal={$cartSubtotal} />
        <Button
          variant="primary"
          size="lg"
          class="w-full"
          on:click={handleCheckout}
        >
          Checkout · ${$cartSubtotal.toFixed(2)}
        </Button>
      </div>
    {/if}
  </div>
{/if}
```

---

### 3. Product Components

#### `src/lib/components/product/ProductCard.svelte`

```svelte
<!-- ABOUTME: Product card with add to cart functionality -->
<!-- ABOUTME: Triggers flyToCart animation on add -->

<script lang="ts">
  import { addToCart } from '$lib/features/cart/cart.actions';
  import { flyToCart } from '$lib/features/animations/flyToCart';
  import Card from '../ui/Card.svelte';
  import Button from '../ui/Button.svelte';
  
  export let product: {
    id: string;
    title: string;
    images: Array<{ url: string; altText?: string }>;
    variants: Array<{ id: string; price: number }>;
  };
  
  let imageElement: HTMLImageElement;
  
  function handleAddToCart() {
    // Update state (instant)
    addToCart({
      variantId: product.variants[0].id,
      productId: product.id,
      title: product.title,
      price: product.variants[0].price,
      image: product.images[0],
    });
    
    // Trigger animation (visual only)
    if (imageElement) {
      flyToCart(imageElement);
    }
  }
</script>

<Card hover padding="md">
  <div class="space-y-4">
    <!-- Product Image -->
    <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
      <img
        bind:this={imageElement}
        src={product.images[0]?.url}
        alt={product.images[0]?.altText || product.title}
        class="w-full h-full object-cover transition-transform hover:scale-105"
      />
    </div>
    
    <!-- Product Info -->
    <div>
      <h3 class="font-semibold text-lg">{product.title}</h3>
      <p class="text-gray-600 mt-1">
        ${product.variants[0].price.toFixed(2)}
      </p>
    </div>
    
    <!-- Add to Cart Button -->
    <Button
      variant="primary"
      size="md"
      class="w-full"
      on:click={handleAddToCart}
    >
      Add to Cart
    </Button>
  </div>
</Card>
```

---

#### `src/lib/components/product/ProductGrid.svelte`

```svelte
<!-- ABOUTME: Responsive grid layout for product cards -->
<!-- ABOUTME: Handles loading and empty states -->

<script lang="ts">
  import ProductCard from './ProductCard.svelte';
  
  export let products: any[] = [];
  export let isLoading = false;
</script>

<div class="container mx-auto px-4 py-8">
  {#if isLoading}
    <div class="text-center py-12">
      <p class="text-gray-500">Loading products...</p>
    </div>
  {:else if products.length === 0}
    <div class="text-center py-12">
      <p class="text-gray-500">No products available</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {#each products as product (product.id)}
        <ProductCard {product} />
      {/each}
    </div>
  {/if}
</div>
```

---

## Layout Components

### `src/routes/+layout.svelte`

```svelte
<!-- ABOUTME: Global layout with header and cart drawer -->
<!-- ABOUTME: Wraps all pages in the application -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { hydrateCartFromShopify } from '$lib/features/cart/cart.sync';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import CartDrawer from '$lib/components/cart/CartDrawer.svelte';
  
  let isCartOpen = false;
  
  onMount(() => {
    // Hydrate cart from Shopify on app load
    hydrateCartFromShopify();
  });
  
  function openCart() {
    isCartOpen = true;
  }
  
  function closeCart() {
    isCartOpen = false;
  }
</script>

<div class="min-h-screen flex flex-col">
  <Header onCartClick={openCart} />
  
  <main class="flex-1">
    <slot />
  </main>
  
  <Footer />
  
  <CartDrawer {isCartOpen} onClose={closeCart} />
</div>

<style global>
  @import '../app.css';
</style>
```

---

## Design System

### Tailwind Configuration

**File**: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          hover: '#1a1a1a',
        },
        secondary: {
          DEFAULT: '#f3f4f6',
          hover: '#e5e7eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fly-to-cart': 'flyToCart 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
```

---

## Files to Create

### UI Primitives
1. `src/lib/components/ui/Button.svelte`
2. `src/lib/components/ui/Card.svelte`
3. `src/lib/components/ui/Badge.svelte`
4. `src/lib/components/ui/Modal.svelte`

### Cart Components
5. `src/lib/components/cart/CartIcon.svelte`
6. `src/lib/components/cart/CartDrawer.svelte`
7. `src/lib/components/cart/CartItem.svelte`
8. `src/lib/components/cart/CartSummary.svelte`

### Product Components
9. `src/lib/components/product/ProductCard.svelte`
10. `src/lib/components/product/ProductGrid.svelte`
11. `src/lib/components/product/ProductImage.svelte`

### Layout
12. `src/lib/components/layout/Header.svelte`
13. `src/lib/components/layout/Footer.svelte`
14. `src/routes/+layout.svelte`

### Styling
15. `tailwind.config.js`
16. `src/app.css`

---

## Important Notes

### ⚠️ Svelte vs React Components
- No JSX - use Svelte's template syntax
- Props use `export let` instead of function parameters
- Events use `on:click` instead of `onClick`
- Reactivity is automatic with `$:` and `$store`

### ⚠️ No shadcn for Svelte
- shadcn/ui is React-only
- Build custom components with Tailwind CSS
- Consider Svelte UI libraries: Skeleton UI, Flowbite Svelte, or Melt UI

### ⚠️ Accessibility
- Use semantic HTML (`<button>`, `<nav>`, etc.)
- Add ARIA labels for icon-only buttons
- Ensure keyboard navigation works
- Test with screen readers

### ⚠️ Performance
- Svelte compiles to vanilla JS (no virtual DOM)
- Components are highly optimized by default
- Use `{#key}` blocks to force re-renders when needed
- Lazy load heavy components with dynamic imports

---

*Plan created by shadcn-ui-architect agent (adapted for Svelte)*  
*Ready for implementation in Phase 3 of project*

