# Hexagonal Backend Architecture Plan
**Agent**: hexagonal-backend-architect  
**Session**: project_audit  
**Date**: 2025-10-27

---

## Context

Reviewed `.claude/sessions/context_session_project_audit.md` and `MASTER_IMPLEMENTATION_PLAN.md`.

**Project**: SvelteKit + Shopify Headless Commerce  
**Backend Scope**: Shopify Storefront API adapter (GraphQL)  
**Architecture**: Headless commerce with clean separation of concerns

---

## Architectural Analysis

### Current State
- No backend implementation exists
- Need to integrate with Shopify Storefront API (GraphQL)
- SvelteKit is frontend-focused, so "backend" here means API adapters and services

### Hexagonal Architecture Adaptation for SvelteKit

While traditional hexagonal architecture is designed for backend services, we'll adapt it for the **client-side service layer** that communicates with Shopify:

```
src/lib/services/shopify/     # Infrastructure Layer (Adapters)
  ├── ports/                  # Interface definitions
  │   ├── ICheckoutPort.ts
  │   ├── IProductPort.ts
  │   └── ICartPort.ts
  ├── adapters/               # Shopify-specific implementations
  │   ├── ShopifyCheckoutAdapter.ts
  │   ├── ShopifyProductAdapter.ts
  │   └── ShopifyCartAdapter.ts
  ├── client.ts               # GraphQL client configuration
  ├── types.ts                # Shopify entity types
  └── errors.ts               # Custom error classes
```

---

## Detailed Implementation Plan

### Phase 1: Define Ports (Interfaces)

**File**: `src/lib/services/shopify/ports/ICheckoutPort.ts`
```typescript
// ABOUTME: Port interface for checkout operations
// ABOUTME: Defines contract for checkout management independent of Shopify

export interface CheckoutLineItem {
  variantId: string;
  quantity: number;
}

export interface Checkout {
  id: string;
  webUrl: string;
  lineItems: CheckoutLineItem[];
  subtotalPrice: number;
  totalPrice: number;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICheckoutPort {
  createCheckout(lineItems: CheckoutLineItem[]): Promise<Checkout>;
  updateCheckout(checkoutId: string, lineItems: CheckoutLineItem[]): Promise<Checkout>;
  fetchCheckout(checkoutId: string): Promise<Checkout | null>;
  addLineItems(checkoutId: string, lineItems: CheckoutLineItem[]): Promise<Checkout>;
  removeLineItems(checkoutId: string, lineItemIds: string[]): Promise<Checkout>;
}
```

**File**: `src/lib/services/shopify/ports/IProductPort.ts`
```typescript
// ABOUTME: Port interface for product operations
// ABOUTME: Defines contract for product fetching independent of Shopify

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  availableForSale: boolean;
  image?: {
    url: string;
    altText?: string;
  };
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  images: Array<{
    url: string;
    altText?: string;
  }>;
  variants: ProductVariant[];
  priceRange: {
    minVariantPrice: number;
    maxVariantPrice: number;
  };
}

export interface IProductPort {
  fetchProducts(limit?: number): Promise<Product[]>;
  fetchProductByHandle(handle: string): Promise<Product | null>;
  fetchProductById(id: string): Promise<Product | null>;
}
```

---

### Phase 2: Implement GraphQL Client

**File**: `src/lib/services/shopify/client.ts`
```typescript
// ABOUTME: Shopify Storefront API GraphQL client configuration
// ABOUTME: Handles authentication, request formatting, and error handling

import { PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN, PUBLIC_SHOPIFY_STORE_DOMAIN } from '$env/static/public';

export class ShopifyAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public graphQLErrors?: any[]
  ) {
    super(message);
    this.name = 'ShopifyAPIError';
  }
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: any[];
    path?: string[];
  }>;
}

export class ShopifyGraphQLClient {
  private readonly endpoint: string;
  private readonly headers: HeadersInit;

  constructor() {
    if (!PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN || !PUBLIC_SHOPIFY_STORE_DOMAIN) {
      throw new Error('Shopify configuration missing. Check environment variables.');
    }

    this.endpoint = `https://${PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': PUBLIC_SHOPIFY_STOREFRONT_API_TOKEN,
    };
  }

  async query<T>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new ShopifyAPIError(
          `HTTP error: ${response.statusText}`,
          response.status
        );
      }

      const json: GraphQLResponse<T> = await response.json();

      if (json.errors && json.errors.length > 0) {
        throw new ShopifyAPIError(
          `GraphQL errors: ${json.errors.map(e => e.message).join(', ')}`,
          undefined,
          json.errors
        );
      }

      if (!json.data) {
        throw new ShopifyAPIError('No data returned from Shopify API');
      }

      return json.data;
    } catch (error) {
      if (error instanceof ShopifyAPIError) {
        throw error;
      }
      throw new ShopifyAPIError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Singleton instance
export const shopifyClient = new ShopifyGraphQLClient();
```

---

### Phase 3: Implement Adapters

**File**: `src/lib/services/shopify/adapters/ShopifyCheckoutAdapter.ts`
```typescript
// ABOUTME: Shopify-specific implementation of checkout operations
// ABOUTME: Translates between Shopify GraphQL API and our domain interfaces

import { shopifyClient, ShopifyAPIError } from '../client';
import type { ICheckoutPort, Checkout, CheckoutLineItem } from '../ports/ICheckoutPort';

export class ShopifyCheckoutAdapter implements ICheckoutPort {
  async createCheckout(lineItems: CheckoutLineItem[]): Promise<Checkout> {
    const mutation = `
      mutation checkoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
            subtotalPriceV2 { amount currencyCode }
            totalPriceV2 { amount currencyCode }
            lineItems(first: 250) {
              edges {
                node {
                  id
                  variant { id }
                  quantity
                }
              }
            }
            createdAt
            updatedAt
          }
          checkoutUserErrors {
            message
            field
          }
        }
      }
    `;

    const variables = {
      input: {
        lineItems: lineItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      },
    };

    const response = await shopifyClient.query<any>(mutation, variables);

    if (response.checkoutCreate.checkoutUserErrors.length > 0) {
      throw new ShopifyAPIError(
        `Checkout creation failed: ${response.checkoutCreate.checkoutUserErrors.map((e: any) => e.message).join(', ')}`
      );
    }

    return this.mapCheckout(response.checkoutCreate.checkout);
  }

  async fetchCheckout(checkoutId: string): Promise<Checkout | null> {
    const query = `
      query getCheckout($id: ID!) {
        node(id: $id) {
          ... on Checkout {
            id
            webUrl
            subtotalPriceV2 { amount currencyCode }
            totalPriceV2 { amount currencyCode }
            lineItems(first: 250) {
              edges {
                node {
                  id
                  variant { id }
                  quantity
                }
              }
            }
            createdAt
            updatedAt
          }
        }
      }
    `;

    const response = await shopifyClient.query<any>(query, { id: checkoutId });

    if (!response.node) {
      return null;
    }

    return this.mapCheckout(response.node);
  }

  // Additional methods: updateCheckout, addLineItems, removeLineItems...
  // (Implementation follows same pattern)

  private mapCheckout(shopifyCheckout: any): Checkout {
    return {
      id: shopifyCheckout.id,
      webUrl: shopifyCheckout.webUrl,
      lineItems: shopifyCheckout.lineItems.edges.map((edge: any) => ({
        variantId: edge.node.variant.id,
        quantity: edge.node.quantity,
      })),
      subtotalPrice: parseFloat(shopifyCheckout.subtotalPriceV2.amount),
      totalPrice: parseFloat(shopifyCheckout.totalPriceV2.amount),
      currencyCode: shopifyCheckout.totalPriceV2.currencyCode,
      createdAt: shopifyCheckout.createdAt,
      updatedAt: shopifyCheckout.updatedAt,
    };
  }
}

// Export singleton instance
export const checkoutAdapter = new ShopifyCheckoutAdapter();
```

---

## Architecture Benefits

### 1. **Testability**
- Ports (interfaces) allow easy mocking in tests
- Adapters can be tested independently
- Domain logic (cart store) doesn't depend on Shopify

### 2. **Flexibility**
- Can swap Shopify for another provider by implementing new adapters
- Business logic in cart store remains unchanged
- Easy to add caching layer or offline support

### 3. **Separation of Concerns**
- GraphQL queries isolated in adapters
- Type mapping happens at adapter boundary
- Client configuration centralized

### 4. **Error Handling**
- Custom error classes for better error handling
- GraphQL errors vs network errors distinguished
- Errors can be caught and handled at appropriate layers

---

## Integration with Cart Feature

The cart store (`$lib/features/cart/cart.store.ts`) will depend on **ports**, not adapters:

```typescript
import type { ICheckoutPort } from '$lib/services/shopify/ports/ICheckoutPort';
import { checkoutAdapter } from '$lib/services/shopify/adapters/ShopifyCheckoutAdapter';

// Dependency injection (can be mocked in tests)
export function createCartStore(checkoutPort: ICheckoutPort = checkoutAdapter) {
  // Cart logic uses checkoutPort interface, not Shopify-specific code
}
```

---

## Files to Create

### Phase 1: Ports (Interfaces)
1. `src/lib/services/shopify/ports/ICheckoutPort.ts`
2. `src/lib/services/shopify/ports/IProductPort.ts`

### Phase 2: Client
3. `src/lib/services/shopify/client.ts`
4. `src/lib/services/shopify/errors.ts`
5. `src/lib/services/shopify/types.ts`

### Phase 3: Adapters
6. `src/lib/services/shopify/adapters/ShopifyCheckoutAdapter.ts`
7. `src/lib/services/shopify/adapters/ShopifyProductAdapter.ts`

### Phase 4: Tests
8. `tests/unit/services/shopify/client.test.ts`
9. `tests/unit/services/shopify/adapters/ShopifyCheckoutAdapter.test.ts`
10. `tests/unit/services/shopify/adapters/ShopifyProductAdapter.test.ts`

---

## Important Notes

### ⚠️ Shopify API Version
- Using Storefront API version `2024-01` (latest stable)
- Update version in `client.ts` as new versions release
- Check Shopify changelog for breaking changes

### ⚠️ Rate Limiting
- Shopify Storefront API has rate limits (bucket-based)
- Implement exponential backoff for retries
- Consider caching frequently accessed data

### ⚠️ GraphQL Complexity
- Shopify limits query complexity (cost-based)
- Keep queries focused and avoid deep nesting
- Use pagination for large result sets

### ⚠️ Environment Variables
- Must be prefixed with `PUBLIC_` for client-side access in SvelteKit
- Never expose Admin API token (use Storefront API only)

---

## Next Steps

1. Create port interfaces first (defines contracts)
2. Implement GraphQL client with error handling
3. Implement adapters one at a time
4. Write comprehensive unit tests for each adapter
5. Integrate with cart store using dependency injection

---

*Plan created by hexagonal-backend-architect agent*  
*Ready for implementation in Phase 1 of project*

