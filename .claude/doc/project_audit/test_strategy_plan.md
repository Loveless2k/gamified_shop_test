# Testing Strategy Plan
**Agent**: typescript-test-explorer  
**Session**: project_audit  
**Date**: 2025-10-27

---

## Context

Reviewed `.claude/sessions/context_session_project_audit.md` and `MASTER_IMPLEMENTATION_PLAN.md`.

**Testing Framework**: Vitest  
**Component Testing**: Svelte Testing Library  
**Coverage Goal**: 80%+ with focus on critical paths  
**NO EXCEPTIONS POLICY**: All code must have tests

---

## Testing Pyramid

```
        /\
       /  \      E2E Tests (Playwright)
      /____\     - Critical user flows
     /      \    - Cross-browser validation
    /        \   
   /__________\  Integration Tests (Vitest)
  /            \ - Cart sync with Shopify
 /              \- localStorage persistence
/________________\ Unit Tests (Vitest)
                   - Pure functions
                   - Store logic
                   - Adapters
```

---

## Test Categories

### 1. Unit Tests (70% of tests)

**Scope**: Pure functions, business logic, adapters

**Files to Test**:
- `src/lib/features/cart/cart.actions.ts`
- `src/lib/features/cart/cart.sync.ts`
- `src/lib/services/shopify/client.ts`
- `src/lib/services/shopify/adapters/*.ts`
- `src/lib/features/animations/*.ts`

**Test Location**: `tests/unit/`

---

### 2. Integration Tests (20% of tests)

**Scope**: Feature interactions, API integration, state management

**Scenarios**:
- Cart state + localStorage sync
- Cart state + Shopify API sync
- Product fetching + SSG data loading
- Error handling across layers

**Test Location**: `tests/integration/`

---

### 3. Component Tests (10% of tests)

**Scope**: Svelte component behavior, user interactions

**Files to Test**:
- `src/lib/components/cart/*.svelte`
- `src/lib/components/product/*.svelte`
- `src/routes/+page.svelte`

**Test Location**: `tests/components/`

---

## Detailed Test Cases

### Unit Tests: Cart Actions

**File**: `tests/unit/features/cart/cart.actions.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { cart } from '$lib/features/cart/cart.store';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from '$lib/features/cart/cart.actions';

describe('Cart Actions', () => {
  beforeEach(() => {
    // Reset cart state before each test
    clearCart();
    vi.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add new item to empty cart', () => {
      const item = {
        variantId: 'variant-1',
        productId: 'product-1',
        title: 'Test Product',
        price: 29.99,
      };

      addToCart(item, 1);

      const state = get(cart);
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toMatchObject({ ...item, quantity: 1 });
      expect(state.subtotal).toBe(29.99);
      expect(state.itemCount).toBe(1);
    });

    it('should increment quantity if item already exists', () => {
      const item = {
        variantId: 'variant-1',
        productId: 'product-1',
        title: 'Test Product',
        price: 29.99,
      };

      addToCart(item, 1);
      addToCart(item, 2);

      const state = get(cart);
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(3);
      expect(state.subtotal).toBe(89.97);
      expect(state.itemCount).toBe(3);
    });

    it('should handle multiple different items', () => {
      const item1 = {
        variantId: 'variant-1',
        productId: 'product-1',
        title: 'Product 1',
        price: 10.00,
      };
      const item2 = {
        variantId: 'variant-2',
        productId: 'product-2',
        title: 'Product 2',
        price: 20.00,
      };

      addToCart(item1, 1);
      addToCart(item2, 2);

      const state = get(cart);
      expect(state.items).toHaveLength(2);
      expect(state.subtotal).toBe(50.00);
      expect(state.itemCount).toBe(3);
    });

    it('should handle decimal prices correctly', () => {
      const item = {
        variantId: 'variant-1',
        productId: 'product-1',
        title: 'Test Product',
        price: 19.99,
      };

      addToCart(item, 3);

      const state = get(cart);
      expect(state.subtotal).toBeCloseTo(59.97, 2);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', () => {
      const item = {
        variantId: 'variant-1',
        productId: 'product-1',
        title: 'Test Product',
        price: 29.99,
      };

      addToCart(item, 1);
      removeFromCart('variant-1');

      const state = get(cart);
      expect(state.items).toHaveLength(0);
      expect(state.subtotal).toBe(0);
      expect(state.itemCount).toBe(0);
    });

    it('should not affect other items', () => {
      const item1 = {
        variantId: 'variant-1',
        productId: 'product-1',
        title: 'Product 1',
        price: 10.00,
      };
      const item2 = {
        variantId: 'variant-2',
        productId: 'product-2',
        title: 'Product 2',
        price: 20.00,
      };

      addToCart(item1, 1);
      addToCart(item2, 1);
      removeFromCart('variant-1');

      const state = get(cart);
      expect(state.items).toHaveLength(1);
      expect(state.items[0].variantId).toBe('variant-2');
      expect(state.subtotal).toBe(20.00);
    });

    it('should handle removing non-existent item gracefully', () => {
      removeFromCart('non-existent');

      const state = get(cart);
      expect(state.items).toHaveLength(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const item = {
        variantId: 'variant-1',
        productId: 'product-1',
        title: 'Test Product',
        price: 10.00,
      };

      addToCart(item, 1);
      updateQuantity('variant-1', 5);

      const state = get(cart);
      expect(state.items[0].quantity).toBe(5);
      expect(state.subtotal).toBe(50.00);
    });

    it('should remove item if quantity is 0', () => {
      const item = {
        variantId: 'variant-1',
        productId: 'product-1',
        title: 'Test Product',
        price: 10.00,
      };

      addToCart(item, 1);
      updateQuantity('variant-1', 0);

      const state = get(cart);
      expect(state.items).toHaveLength(0);
    });

    it('should remove item if quantity is negative', () => {
      const item = {
        variantId: 'variant-1',
        productId: 'product-1',
        title: 'Test Product',
        price: 10.00,
      };

      addToCart(item, 1);
      updateQuantity('variant-1', -1);

      const state = get(cart);
      expect(state.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const item1 = {
        variantId: 'variant-1',
        productId: 'product-1',
        title: 'Product 1',
        price: 10.00,
      };
      const item2 = {
        variantId: 'variant-2',
        productId: 'product-2',
        title: 'Product 2',
        price: 20.00,
      };

      addToCart(item1, 1);
      addToCart(item2, 1);
      clearCart();

      const state = get(cart);
      expect(state.items).toHaveLength(0);
      expect(state.subtotal).toBe(0);
      expect(state.itemCount).toBe(0);
    });
  });
});
```

---

### Unit Tests: Shopify Client

**File**: `tests/unit/services/shopify/client.test.ts`

**Test Cases**:
1. ✅ Should initialize with correct endpoint and headers
2. ✅ Should throw error if environment variables missing
3. ✅ Should make successful GraphQL query
4. ✅ Should handle HTTP errors (4xx, 5xx)
5. ✅ Should handle GraphQL errors
6. ✅ Should handle network errors
7. ✅ Should parse response data correctly
8. ✅ Should include variables in request

---

### Integration Tests: Cart Sync

**File**: `tests/integration/cart-sync.test.ts`

**Test Cases**:
1. ✅ Should sync cart to localStorage on add
2. ✅ Should restore cart from localStorage on load
3. ✅ Should create Shopify checkout on first add
4. ✅ Should update Shopify checkout on subsequent adds
5. ✅ Should handle Shopify API errors gracefully
6. ✅ Should handle stale checkout IDs
7. ✅ Should clear checkout ID when cart is empty

---

### Component Tests: ProductCard

**File**: `tests/components/ProductCard.test.ts`

**Test Cases**:
1. ✅ Should render product information
2. ✅ Should call addToCart on button click
3. ✅ Should trigger flyToCart animation
4. ✅ Should handle missing product image
5. ✅ Should format price correctly
6. ✅ Should be accessible (ARIA labels)

---

## Edge Cases to Test

### Cart Actions
- Adding item with quantity 0
- Adding item with negative quantity
- Adding item with very large quantity (>999)
- Removing item that doesn't exist
- Updating quantity of non-existent item
- Concurrent add operations
- Decimal price calculations (floating point precision)

### Shopify Integration
- Network timeout
- Rate limiting (429 errors)
- Invalid checkout ID
- Expired checkout
- Out of stock variants
- Invalid GraphQL queries
- Malformed API responses

### localStorage
- localStorage full (quota exceeded)
- localStorage disabled
- Corrupted data in localStorage
- localStorage cleared by user
- Cross-tab synchronization

---

## Test Configuration

### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
      $components: path.resolve('./src/lib/components'),
      $features: path.resolve('./src/lib/features'),
      $services: path.resolve('./src/lib/services'),
    },
  },
});
```

---

## Files to Create

### Test Configuration
1. `vitest.config.ts`
2. `tests/setup.ts`
3. `tests/mocks/shopify.ts`
4. `tests/utils/test-helpers.ts`

### Unit Tests
5. `tests/unit/features/cart/cart.actions.test.ts`
6. `tests/unit/features/cart/cart.sync.test.ts`
7. `tests/unit/services/shopify/client.test.ts`
8. `tests/unit/services/shopify/adapters/ShopifyCheckoutAdapter.test.ts`
9. `tests/unit/services/shopify/adapters/ShopifyProductAdapter.test.ts`

### Integration Tests
10. `tests/integration/cart-sync.test.ts`
11. `tests/integration/product-loading.test.ts`

### Component Tests
12. `tests/components/ProductCard.test.ts`
13. `tests/components/CartDrawer.test.ts`
14. `tests/components/CartIcon.test.ts`

---

*Plan created by typescript-test-explorer agent*  
*Ready for implementation alongside feature development*

