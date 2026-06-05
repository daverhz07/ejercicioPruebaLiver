# 🎓 Ejemplos de Cómo Agregar Nuevas Pruebas

Este documento muestra ejemplos prácticos de cómo extender el proyecto con nuevas pruebas y funcionalidades.

## 📌 Ejemplo 1: Agregar una prueba simple

### Objetivo: Validar que se puede agregar un producto al carrito

```typescript
// tests/add-to-cart.spec.ts
import { test, expect } from '@playwright/test';
import { LiverpoolPage } from '../src/pages/LiverpoolPage';

test.describe('Agregar al Carrito', () => {
  test('Agregar PlayStation 5 al carrito', async ({ page }) => {
    const liverpool = new LiverpoolPage(page);
    
    // PASO 1: Navegar y buscar
    await liverpool.navigate();
    await liverpool.searchProduct('PlayStation 5');
    
    // PASO 2: Obtener productos
    const products = await liverpool.getFirstFiveProducts();
    expect(products.length).toBeGreaterThan(0);
    
    // PASO 3: Hacer click en el primer producto
    await liverpool.clickFirstProduct();
    
    // PASO 4: Validar que estamos en la página del producto
    await expect(page).toHaveURL(/\/tienda\/pdp\//);
  });
});
```

### ¿Pero `clickFirstProduct()` no existe! ¿Qué hacer?

**Solución:** Agrégalo al Page Object

```typescript
// src/pages/LiverpoolPage.ts
export class LiverpoolPage {
  // ... métodos existentes ...

  /**
   * Hace click en el primer producto
   */
  async clickFirstProduct(): Promise<void> {
    console.log('🖱️ Haciendo click en el primer producto');
    const firstProduct = this.page.locator('a[href*="/tienda/pdp/"]').first();
    await firstProduct.click();
  }
}
```

**¡LISTO!** Ahora todos los tests pueden usarlo.

---

## 📌 Ejemplo 2: Agregar un nuevo Page Object

### Objetivo: Crear un Page Object para la página de detalle del producto

```typescript
// src/pages/ProductDetailPage.ts
import { Page } from '@playwright/test';

export class ProductDetailPage {
  constructor(private page: Page) {}

  /**
   * Obtiene el nombre del producto
   */
  async getProductName(): Promise<string> {
    const title = await this.page.locator('h1[class*="product"]').first().textContent();
    return title?.trim() || '';
  }

  /**
   * Obtiene el precio del producto
   */
  async getProductPrice(): Promise<string> {
    const price = await this.page.locator('[class*="price"]').first().textContent();
    return price?.trim() || '';
  }

  /**
   * Agrega el producto al carrito
   */
  async addToCart(): Promise<void> {
    console.log('🛒 Agregando al carrito');
    const addButton = this.page.locator('button:has-text("Agregar al carrito")');
    await addButton.click();
  }
}
```

### Usar el nuevo Page Object en un test

```typescript
// tests/product-detail.spec.ts
import { test, expect } from '@playwright/test';
import { LiverpoolPage } from '../src/pages/LiverpoolPage';
import { ProductDetailPage } from '../src/pages/ProductDetailPage';

test('Ver detalles del producto', async ({ page }) => {
  const liverpool = new LiverpoolPage(page);
  
  // Navegar y buscar
  await liverpool.navigate();
  await liverpool.searchProduct('PlayStation 5');
  await liverpool.clickFirstProduct();
  
  // Usar el nuevo Page Object
  const productDetail = new ProductDetailPage(page);
  const name = await productDetail.getProductName();
  const price = await productDetail.getProductPrice();
  
  expect(name).toContain('PlayStation');
  expect(price).toBeTruthy();
});
```

---

## 📌 Ejemplo 3: Crear un validador personalizado

### Objetivo: Validar que los precios están dentro de un rango

```typescript
// src/utils/PriceValidator.ts
export class PriceValidator {
  /**
   * Valida que el precio esté dentro de un rango
   */
  static validatePriceRange(
    price: number,
    minPrice: number,
    maxPrice: number
  ): boolean {
    return price >= minPrice && price <= maxPrice;
  }

  /**
   * Valida que todos los productos tengan precio válido
   */
  static validateAllPricesHaveValue(products: any[]): boolean {
    return products.every(p => p.price && parseFloat(p.price.replace(/[^\d.-]/g, '')) > 0);
  }

  /**
   * Obtiene el producto más barato
   */
  static getCheapestProduct(products: any[]) {
    return products.reduce((cheapest, current) => {
      const currentPrice = parseFloat(current.price.replace(/[^\d.-]/g, ''));
      const cheapestPrice = parseFloat(cheapest.price.replace(/[^\d.-]/g, ''));
      return currentPrice < cheapestPrice ? current : cheapest;
    });
  }
}
```

### Usar el validador en un test

```typescript
// tests/price-validation.spec.ts
import { test, expect } from '@playwright/test';
import { LiverpoolPage } from '../src/pages/LiverpoolPage';
import { PriceValidator } from '../src/utils/PriceValidator';

test('Validar precios de productos', async ({ page }) => {
  const liverpool = new LiverpoolPage(page);
  
  await liverpool.navigate();
  await liverpool.searchProduct('PlayStation 5');
  
  const products = await liverpool.getFirstFiveProducts();
  
  // Validar que todos tienen precio
  expect(PriceValidator.validateAllPricesHaveValue(products)).toBe(true);
  
  // Obtener el más barato
  const cheapest = PriceValidator.getCheapestProduct(products);
  console.log(`Producto más barato: ${cheapest.name} - ${cheapest.price}`);
});
```

---

## 📌 Ejemplo 4: Test con múltiples datos (Data-Driven Testing)

### Objetivo: Buscar múltiples productos y validarlos

```typescript
// tests/search-multiple-products.spec.ts
import { test, expect } from '@playwright/test';
import { LiverpoolPage } from '../src/pages/LiverpoolPage';

const searchTerms = [
  'PlayStation 5',
  'Xbox Series X',
  'Nintendo Switch'
];

test.describe('Búsqueda de múltiples productos', () => {
  searchTerms.forEach(term => {
    test(`Buscar "${term}"`, async ({ page }) => {
      const liverpool = new LiverpoolPage(page);
      
      await liverpool.navigate();
      await liverpool.searchProduct(term);
      
      const products = await liverpool.getFirstFiveProducts();
      expect(products.length).toBeGreaterThan(0);
      
      console.log(`✅ Encontrados ${products.length} productos para "${term}"`);
    });
  });
});
```

**Resultado:** Crea 3 tests automáticamente, uno para cada término de búsqueda.

---

## 📌 Ejemplo 5: Agregar un Helper personalizado

### Objetivo: Validar que un producto tiene descuento

```typescript
// src/helpers/ProductHelpers.ts
export class ProductHelpers {
  /**
   * Extrae el descuento de un producto
   */
  static extractDiscount(product: any): number | null {
    const discountPattern = /(-?\d+)%/;
    const match = product.name.match(discountPattern);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Valida que un producto tiene descuento
   */
  static hasDiscount(product: any): boolean {
    return this.extractDiscount(product) !== null;
  }

  /**
   * Obtiene productos con descuento
   */
  static getDiscountedProducts(products: any[]) {
    return products.filter(p => this.hasDiscount(p));
  }
}
```

### Usar el helper

```typescript
// En un test
const discountedProducts = ProductHelpers.getDiscountedProducts(products);
expect(discountedProducts.length).toBeGreaterThan(0);
```

---

## 📌 Ejemplo 6: Test avanzado con esperas personalizadas

```typescript
// tests/advanced-search.spec.ts
import { test, expect } from '@playwright/test';
import { LiverpoolPage } from '../src/pages/LiverpoolPage';

test('Búsqueda con filtros avanzados', async ({ page }) => {
  const liverpool = new LiverpoolPage(page);
  
  // Navegar
  await liverpool.navigate();
  
  // Buscar
  await liverpool.searchProduct('PlayStation 5');
  
  // Aplicar múltiples filtros
  const colorOk = await liverpool.filterByColor('Blanco');
  const sortOk = await liverpool.sortByPrice();
  
  // Esperar a que carguen los productos
  await page.waitForLoadState('networkidle');
  
  // Extraer y validar
  const products = await liverpool.getFirstFiveProducts();
  
  expect(products.length).toBeGreaterThan(0);
  expect(colorOk || sortOk).toBe(true); // Al menos uno debe funcionar
  
  console.log(`✅ Test completado con ${products.length} productos`);
});
```

---

## 🎯 Checklist para Extender el Proyecto

- ✅ **¿Necesitas interactuar con la UI?** → Agrega método en `LiverpoolPage.ts`
- ✅ **¿Es lógica reutilizable?** → Crea un validador o helper
- ✅ **¿Es compleja la página?** → Crea un nuevo Page Object
- ✅ **¿Necesitas datos test?** → Usa data-driven testing
- ✅ **¿El test es legible?** → Usa comentarios "// PASO X"

---

## 🚀 Workflow Recomendado

1. **Escribe el test primero** (TDD)
2. **Identifica qué métodos necesitas en Page Objects**
3. **Agrégalos al Page Object**
4. **Ejecuta el test y verifica**
5. **Refactoriza si es necesario**

---

## 📚 Patrón Recomendado para Nuevos Tests

```typescript
test('Descripción clara del test', async ({ page }) => {
  // PREPARACIÓN: Crear Page Objects
  const liverpool = new LiverpoolPage(page);
  
  // PASO 1: Acción inicial
  await liverpool.navigate();
  
  // PASO 2: Acción principal
  await liverpool.searchProduct('...');
  
  // PASO 3: Validación
  const products = await liverpool.getFirstFiveProducts();
  expect(products.length).toBeGreaterThan(0);
  
  // PASO 4: Resultado
  console.log('✅ Test completado');
});
```

**Ventajas:**
- 📖 Fácil de leer
- 🔧 Fácil de mantener
- 👨‍🎓 Fácil de entender para QA Jr
