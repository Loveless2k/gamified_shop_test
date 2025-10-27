# Test Implementation Plan
**Agent**: frontend-test-engineer  
**Session**: project_audit  
**Date**: 2025-10-27

---

## Context

Reviewed `.claude/sessions/context_session_project_audit.md`, `MASTER_IMPLEMENTATION_PLAN.md`, and `test_strategy_plan.md`.

**Testing Stack**:
- Vitest (test runner)
- Svelte Testing Library (component testing)
- @testing-library/user-event (user interactions)
- vi (mocking)

---

## Test Setup

### File: `tests/setup.ts`

```typescript
// ABOUTME: Global test setup and configuration
// ABOUTME: Runs before all tests

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/svelte';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});

// Mock environment variables
vi.mock('$env/static/public', () => ({
  PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN: 'test-token',
  PUBLIC_SHOPIFY_STORE_DOMAIN: 'test-store.myshopify.com',
}));

// Mock window.matchMedia (for responsive tests)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

---

### File: `tests/mocks/shopify.ts`

```typescript
// ABOUTME: Mock Shopify API responses for testing
// ABOUTME: Provides realistic test data

export const mockProduct = {
  id: 'gid://shopify/Product/1',
  handle: 'test-product',
  title: 'Test Product',
  description: 'A test product description',
  images: [
    {
      url: 'https://example.com/image.jpg',
      altText: 'Test product image',
    },
  ],
  variants: [
    {
      id: 'gid://shopify/ProductVariant/1',
      title: 'Default',
      price: 29.99,
      availableForSale: true,
    },
  ],
  priceRange: {
    minVariantPrice: 29.99,
    maxVariantPrice: 29.99,
  },
};

export const mockCheckout = {
  id: 'gid://shopify/Checkout/1',
  webUrl: 'https://test-store.myshopify.com/checkout/1',
  lineItems: [
    {
      variantId: 'gid://shopify/ProductVariant/1',
      quantity: 2,
    },
  ],
  subtotalPrice: 59.98,
  totalPrice: 59.98,
  currencyCode: 'USD',
  createdAt: '2025-10-27T00:00:00Z',
  updatedAt: '2025-10-27T00:00:00Z',
};

export const mockGraphQLResponse = <T>(data: T) => ({
  data,
  errors: undefined,
});

export const mockGraphQLError = (message: string) => ({
  data: undefined,
  errors: [{ message }],
});
```

---

### File: `tests/utils/test-helpers.ts`

```typescript
// ABOUTME: Reusable test utilities and helpers
// ABOUTME: Reduces boilerplate in test files

import { render, type RenderResult } from '@testing-library/svelte';
import type { ComponentType, SvelteComponent } from 'svelte';

/**
 * Render Svelte component with common setup
 */
export function renderComponent<T extends SvelteComponent>(
  component: ComponentType<T>,
  props?: Record<string, any>
): RenderResult<T> {
  return render(component, { props });
}

/**
 * Wait for async operations to complete
 */
export function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock fetch with custom response
 */
export function mockFetch(response: any, ok: boolean = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => response,
  });
}

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
}
```

---

## Component Test Examples

### File: `tests/components/ProductCard.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ProductCard from '$lib/components/product/ProductCard.svelte';
import { mockProduct } from '../mocks/shopify';
import * as cartActions from '$lib/features/cart/cart.actions';
import * as animations from '$lib/features/animations/flyToCart';

// Mock cart actions
vi.mock('$lib/features/cart/cart.actions', () => ({
  addToCart: vi.fn(),
}));

// Mock animations
vi.mock('$lib/features/animations/flyToCart', () => ({
  flyToCart: vi.fn(),
}));

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render product information', () => {
    render(ProductCard, { props: { product: mockProduct } });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByAltText('Test product image')).toBeInTheDocument();
  });

  it('should call addToCart when button is clicked', async () => {
    const user = userEvent.setup();
    render(ProductCard, { props: { product: mockProduct } });

    const button = screen.getByRole('button', { name: /add to cart/i });
    await user.click(button);

    expect(cartActions.addToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        variantId: mockProduct.variants[0].id,
        productId: mockProduct.id,
        title: mockProduct.title,
        price: mockProduct.variants[0].price,
      }),
      1
    );
  });

  it('should trigger flyToCart animation on add', async () => {
    const user = userEvent.setup();
    render(ProductCard, { props: { product: mockProduct } });

    const button = screen.getByRole('button', { name: /add to cart/i });
    await user.click(button);

    expect(animations.flyToCart).toHaveBeenCalled();
  });

  it('should handle missing product image gracefully', () => {
    const productWithoutImage = {
      ...mockProduct,
      images: [],
    };

    render(ProductCard, { props: { product: productWithoutImage } });

    // Should not crash, image should have fallback
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should format price with two decimal places', () => {
    const productWithDecimalPrice = {
      ...mockProduct,
      variants: [{ ...mockProduct.variants[0], price: 19.9 }],
    };

    render(ProductCard, { props: { product: productWithDecimalPrice } });

    expect(screen.getByText('$19.90')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(ProductCard, { props: { product: mockProduct } });

    const button = screen.getByRole('button', { name: /add to cart/i });
    expect(button).toBeInTheDocument();

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt');
  });
});
```

---

### File: `tests/components/CartDrawer.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import CartDrawer from '$lib/components/cart/CartDrawer.svelte';
import { cart } from '$lib/features/cart/cart.store';
import { addToCart, clearCart } from '$lib/features/cart/cart.actions';

describe('CartDrawer', () => {
  beforeEach(() => {
    clearCart();
  });

  it('should not render when isOpen is false', () => {
    render(CartDrawer, { props: { isOpen: false, onClose: vi.fn() } });

    expect(screen.queryByText('Your Cart')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(CartDrawer, { props: { isOpen: true, onClose: vi.fn() } });

    expect(screen.getByText('Your Cart')).toBeInTheDocument();
  });

  it('should show empty state when cart is empty', () => {
    render(CartDrawer, { props: { isOpen: true, onClose: vi.fn() } });

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('should display cart items', () => {
    addToCart({
      variantId: 'variant-1',
      productId: 'product-1',
      title: 'Test Product',
      price: 29.99,
    }, 1);

    render(CartDrawer, { props: { isOpen: true, onClose: vi.fn() } });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(CartDrawer, { props: { isOpen: true, onClose } });

    const closeButton = screen.getByLabelText('Close cart');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(CartDrawer, { props: { isOpen: true, onClose } });

    const backdrop = screen.getByRole('button', { hidden: true });
    await user.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });

  it('should show checkout button when cart has items', () => {
    addToCart({
      variantId: 'variant-1',
      productId: 'product-1',
      title: 'Test Product',
      price: 29.99,
    }, 1);

    render(CartDrawer, { props: { isOpen: true, onClose: vi.fn() } });

    expect(screen.getByRole('button', { name: /checkout/i })).toBeInTheDocument();
  });

  it('should display correct subtotal', () => {
    addToCart({
      variantId: 'variant-1',
      productId: 'product-1',
      title: 'Product 1',
      price: 10.00,
    }, 2);

    addToCart({
      variantId: 'variant-2',
      productId: 'product-2',
      title: 'Product 2',
      price: 15.00,
    }, 1);

    render(CartDrawer, { props: { isOpen: true, onClose: vi.fn() } });

    expect(screen.getByText(/\$35\.00/)).toBeInTheDocument();
  });
});
```

---

## Mocking Strategies

### Mocking Shopify API

```typescript
// Mock the entire client module
vi.mock('$lib/services/shopify/client', () => ({
  shopifyClient: {
    query: vi.fn(),
  },
  ShopifyAPIError: class extends Error {},
}));

// In test
import { shopifyClient } from '$lib/services/shopify/client';

it('should handle API success', async () => {
  vi.mocked(shopifyClient.query).mockResolvedValue(mockGraphQLResponse(mockProduct));
  
  // Test code
});

it('should handle API error', async () => {
  vi.mocked(shopifyClient.query).mockRejectedValue(new Error('Network error'));
  
  // Test code
});
```

---

### Mocking Svelte Stores

```typescript
import { writable } from 'svelte/store';

// Mock the cart store
vi.mock('$lib/features/cart/cart.store', () => {
  const mockCart = writable({
    items: [],
    subtotal: 0,
    itemCount: 0,
    checkoutId: null,
    isLoading: false,
    error: null,
  });

  return {
    cart: mockCart,
    cartItems: { subscribe: mockCart.subscribe },
    cartSubtotal: { subscribe: mockCart.subscribe },
    // ... other derived stores
  };
});
```

---

### Mocking GSAP Animations

```typescript
vi.mock('$lib/features/animations/flyToCart', () => ({
  flyToCart: vi.fn(),
}));

// In test
import { flyToCart } from '$lib/features/animations/flyToCart';

it('should trigger animation', () => {
  // Trigger action
  
  expect(flyToCart).toHaveBeenCalled();
});
```

---

## Coverage Requirements

### Minimum Coverage Thresholds

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
  },
}
```

### Critical Paths (100% Coverage Required)

1. Cart actions (add, remove, update, clear)
2. Cart sync (localStorage, Shopify)
3. Shopify API client
4. Checkout adapter
5. Product adapter

---

## Files to Create

### Test Setup
1. `tests/setup.ts`
2. `tests/mocks/shopify.ts`
3. `tests/utils/test-helpers.ts`

### Component Tests
4. `tests/components/ProductCard.test.ts`
5. `tests/components/ProductGrid.test.ts`
6. `tests/components/CartDrawer.test.ts`
7. `tests/components/CartIcon.test.ts`
8. `tests/components/CartItem.test.ts`

### Unit Tests (see test_strategy_plan.md for full list)

---

*Plan created by frontend-test-engineer agent*  
*Ready for implementation alongside feature development*

