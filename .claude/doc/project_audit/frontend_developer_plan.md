# Frontend Development Plan (SvelteKit)
**Agent**: frontend-developer  
**Session**: project_audit  
**Date**: 2025-10-27

---

## Context

Reviewed `.claude/sessions/context_session_project_audit.md` and `MASTER_IMPLEMENTATION_PLAN.md`.

**Framework**: SvelteKit (not React)  
**State Management**: Svelte Stores (native)  
**Focus**: Cart state management, SSG configuration, and feature architecture

---

## SvelteKit Architecture Patterns

### Adapting React Patterns to Svelte

| React Pattern | Svelte Equivalent |
|---------------|-------------------|
| React Query | Native stores + async/await |
| Context API | Svelte Context or Stores |
| Custom Hooks | Derived stores + utility functions |
| useState | writable() store |
| useEffect | $: reactive statements |

---

## Cart Feature Architecture

### Directory Structure

```
src/lib/features/cart/
├── cart.store.ts           # Svelte writable store (state)
├── cart.actions.ts         # Pure functions (business logic)
├── cart.sync.ts            # localStorage + Shopify sync
├── cart.types.ts           # TypeScript interfaces
└── __tests__/
    ├── cart.store.test.ts
    ├── cart.actions.test.ts
    └── cart.sync.test.ts
```

---

## Detailed Implementation Plan

### File 1: `src/lib/features/cart/cart.types.ts`

```typescript
// ABOUTME: TypeScript interfaces for cart feature
// ABOUTME: Defines all cart-related types used across the feature

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: {
    url: string;
    altText?: string;
  };
}

export interface CartState {
  items: CartItem[];
  checkoutId: string | null;
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

export const INITIAL_CART_STATE: CartState = {
  items: [],
  checkoutId: null,
  subtotal: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
};
```

---

### File 2: `src/lib/features/cart/cart.store.ts`

```typescript
// ABOUTME: Svelte writable store for cart state (single source of truth)
// ABOUTME: Provides reactive cart state accessible throughout the app

import { writable, derived, get } from 'svelte/store';
import type { CartState, CartItem } from './cart.types';
import { INITIAL_CART_STATE } from './cart.types';

// Private writable store (only modified through actions)
const cartStore = writable<CartState>(INITIAL_CART_STATE);

// Derived stores for computed values
export const cartItems = derived(cartStore, $cart => $cart.items);
export const cartSubtotal = derived(cartStore, $cart => $cart.subtotal);
export const cartItemCount = derived(cartStore, $cart => $cart.itemCount);
export const cartCheckoutId = derived(cartStore, $cart => $cart.checkoutId);
export const cartIsLoading = derived(cartStore, $cart => $cart.isLoading);
export const cartError = derived(cartStore, $cart => $cart.error);

// Export the main store (read-only for components)
export const cart = {
  subscribe: cartStore.subscribe,
  // Internal update function (used by actions only)
  _update: cartStore.update,
  _set: cartStore.set,
};

// Helper to get current cart state (for actions)
export function getCartState(): CartState {
  return get(cartStore);
}
```

---

### File 3: `src/lib/features/cart/cart.actions.ts`

```typescript
// ABOUTME: Pure functions for cart operations (business logic)
// ABOUTME: All cart mutations go through these actions

import { cart, getCartState } from './cart.store';
import type { CartItem, CartState } from './cart.types';
import { syncCartToStorage, syncCartToShopify } from './cart.sync';

/**
 * Add item to cart (optimistic update)
 */
export function addToCart(item: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
  cart._update(state => {
    const existingItem = state.items.find(i => i.variantId === item.variantId);

    let newItems: CartItem[];
    if (existingItem) {
      // Update quantity of existing item
      newItems = state.items.map(i =>
        i.variantId === item.variantId
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      // Add new item
      newItems = [...state.items, { ...item, quantity }];
    }

    const newState = calculateCartTotals({ ...state, items: newItems });
    
    // Trigger async sync (fire-and-forget)
    syncCartToStorage(newState);
    syncCartToShopify(newState);

    return newState;
  });
}

/**
 * Remove item from cart
 */
export function removeFromCart(variantId: string): void {
  cart._update(state => {
    const newItems = state.items.filter(i => i.variantId !== variantId);
    const newState = calculateCartTotals({ ...state, items: newItems });
    
    syncCartToStorage(newState);
    syncCartToShopify(newState);

    return newState;
  });
}

/**
 * Update item quantity
 */
export function updateQuantity(variantId: string, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(variantId);
    return;
  }

  cart._update(state => {
    const newItems = state.items.map(i =>
      i.variantId === variantId ? { ...i, quantity } : i
    );
    const newState = calculateCartTotals({ ...state, items: newItems });
    
    syncCartToStorage(newState);
    syncCartToShopify(newState);

    return newState;
  });
}

/**
 * Clear entire cart
 */
export function clearCart(): void {
  cart._update(state => {
    const newState = {
      ...state,
      items: [],
      subtotal: 0,
      itemCount: 0,
    };
    
    syncCartToStorage(newState);
    syncCartToShopify(newState);

    return newState;
  });
}

/**
 * Set loading state
 */
export function setCartLoading(isLoading: boolean): void {
  cart._update(state => ({ ...state, isLoading }));
}

/**
 * Set error state
 */
export function setCartError(error: string | null): void {
  cart._update(state => ({ ...state, error }));
}

/**
 * Set checkout ID
 */
export function setCheckoutId(checkoutId: string | null): void {
  cart._update(state => ({ ...state, checkoutId }));
  if (checkoutId) {
    localStorage.setItem('shopify_checkout_id', checkoutId);
  } else {
    localStorage.removeItem('shopify_checkout_id');
  }
}

/**
 * Calculate cart totals (pure function)
 */
function calculateCartTotals(state: CartState): CartState {
  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  
  return {
    ...state,
    subtotal,
    itemCount,
  };
}
```

---

### File 4: `src/lib/features/cart/cart.sync.ts`

```typescript
// ABOUTME: Handles cart persistence (localStorage + Shopify)
// ABOUTME: Async operations that don't block UI updates

import type { CartState } from './cart.types';
import { checkoutAdapter } from '$lib/services/shopify/adapters/ShopifyCheckoutAdapter';
import { setCheckoutId, setCartError, setCartLoading } from './cart.actions';

const STORAGE_KEY = 'cart_state';

/**
 * Sync cart to localStorage (instant)
 */
export function syncCartToStorage(state: CartState): void {
  try {
    const dataToStore = {
      items: state.items,
      checkoutId: state.checkoutId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Failed to sync cart to localStorage:', error);
  }
}

/**
 * Load cart from localStorage (on app init)
 */
export function loadCartFromStorage(): Partial<CartState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return null;
  }
}

/**
 * Sync cart to Shopify (async, fire-and-forget)
 */
export async function syncCartToShopify(state: CartState): Promise<void> {
  if (state.items.length === 0) {
    // Empty cart, no need to sync
    return;
  }

  try {
    const lineItems = state.items.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    if (state.checkoutId) {
      // Update existing checkout
      await checkoutAdapter.updateCheckout(state.checkoutId, lineItems);
    } else {
      // Create new checkout
      const checkout = await checkoutAdapter.createCheckout(lineItems);
      setCheckoutId(checkout.id);
    }
  } catch (error) {
    console.error('Failed to sync cart to Shopify:', error);
    setCartError(error instanceof Error ? error.message : 'Failed to sync cart');
  }
}

/**
 * Hydrate cart from Shopify on app load
 */
export async function hydrateCartFromShopify(): Promise<void> {
  setCartLoading(true);

  try {
    const checkoutId = localStorage.getItem('shopify_checkout_id');
    if (!checkoutId) {
      // No checkout ID, try loading from localStorage
      const stored = loadCartFromStorage();
      if (stored) {
        // Restore from localStorage and create new checkout
        // (Implementation depends on cart.actions)
      }
      return;
    }

    // Fetch checkout from Shopify
    const checkout = await checkoutAdapter.fetchCheckout(checkoutId);
    
    if (!checkout) {
      // Checkout expired or invalid, clear it
      setCheckoutId(null);
      return;
    }

    // Hydrate cart state from Shopify checkout
    // (Implementation depends on product data)
    
  } catch (error) {
    console.error('Failed to hydrate cart from Shopify:', error);
    setCartError(error instanceof Error ? error.message : 'Failed to load cart');
  } finally {
    setCartLoading(false);
  }
}
```

---

## SSG Configuration

### File: `svelte.config.js`

```javascript
// ABOUTME: SvelteKit configuration for SSG (Static Site Generation)
// ABOUTME: Configures adapter-static for Vercel deployment

import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: true
    }),
    
    alias: {
      $lib: './src/lib',
      $components: './src/lib/components',
      $features: './src/lib/features',
      $services: './src/lib/services',
    },
  }
};

export default config;
```

---

### File: `src/routes/+page.ts`

```typescript
// ABOUTME: SSG data loading for landing page
// ABOUTME: Fetches products at build time for static generation

import type { PageLoad } from './$types';
import { productAdapter } from '$lib/services/shopify/adapters/ShopifyProductAdapter';

export const prerender = true; // Enable SSG

export const load: PageLoad = async () => {
  try {
    const products = await productAdapter.fetchProducts(10);
    
    return {
      products,
    };
  } catch (error) {
    console.error('Failed to load products:', error);
    return {
      products: [],
      error: 'Failed to load products',
    };
  }
};
```

---

## Component Usage Patterns

### Using Cart Store in Components

```svelte
<!-- Example: CartIcon.svelte -->
<script lang="ts">
  import { cartItemCount } from '$lib/features/cart/cart.store';
</script>

<button class="cart-icon">
  🛒
  {#if $cartItemCount > 0}
    <span class="badge">{$cartItemCount}</span>
  {/if}
</button>
```

### Using Cart Actions in Components

```svelte
<!-- Example: ProductCard.svelte -->
<script lang="ts">
  import { addToCart } from '$lib/features/cart/cart.actions';
  import { flyToCart } from '$lib/features/animations/flyToCart';
  
  export let product;
  
  function handleAddToCart(event: MouseEvent) {
    const button = event.currentTarget as HTMLElement;
    const image = button.closest('.product-card')?.querySelector('img');
    
    // State update (instant)
    addToCart({
      variantId: product.variants[0].id,
      productId: product.id,
      title: product.title,
      price: product.variants[0].price,
      image: product.images[0],
    });
    
    // Animation (visual only, decoupled)
    if (image) {
      flyToCart(image);
    }
  }
</script>

<div class="product-card">
  <img src={product.images[0].url} alt={product.title} />
  <h3>{product.title}</h3>
  <p>${product.variants[0].price}</p>
  <button on:click={handleAddToCart}>Add to Cart</button>
</div>
```

---

## Files to Create

### Cart Feature
1. `src/lib/features/cart/cart.types.ts`
2. `src/lib/features/cart/cart.store.ts`
3. `src/lib/features/cart/cart.actions.ts`
4. `src/lib/features/cart/cart.sync.ts`

### Routes (SSG)
5. `src/routes/+layout.svelte`
6. `src/routes/+page.svelte`
7. `src/routes/+page.ts`

### Configuration
8. `svelte.config.js`
9. `vite.config.ts`
10. `tsconfig.json`

---

## Important Notes

### ⚠️ Svelte Stores vs React State
- Stores are **reactive** - use `$` prefix to auto-subscribe in components
- No need for `useEffect` - use `$:` reactive statements
- Stores persist across component unmounts (unlike useState)

### ⚠️ SSG Limitations
- Data fetched in `+page.ts` with `prerender = true` is fetched at **build time**
- For dynamic data, use client-side fetching in `onMount`
- Cart state is always client-side (uses localStorage)

### ⚠️ State-Animation Decoupling
- Cart actions update state **immediately**
- Animations are triggered **separately** (fire-and-forget)
- Never wait for animations to complete before updating state

---

*Plan created by frontend-developer agent (adapted for SvelteKit)*  
*Ready for implementation in Phase 2 of project*

