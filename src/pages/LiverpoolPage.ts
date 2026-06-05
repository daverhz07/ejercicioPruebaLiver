import { Page } from '@playwright/test';
import { Product, ApiProduct } from '../utils/Types';
import { ProductExtractor } from '../utils/ProductExtractor';

export class LiverpoolPage {
  constructor(private page: Page) { }

  /**
   * Navega a la página principal de Liverpool
   */
  async navigate(): Promise<void> {
    console.log('📍 Navegando a liverpool.com.mx');
    await this.page.goto('https://www.liverpool.com.mx', { waitUntil: 'domcontentloaded' });
  }

  /**
   * Busca un producto
   */
  async searchProduct(productName: string): Promise<void> {
    console.log(`🔍 Buscando: ${productName}`);

    await this.page.waitForLoadState('domcontentloaded');

    const searchInput = this.page.getByTestId(
      'blt26617d4f2e17657d-header-search-input'
    ).filter({ visible: true });

    await searchInput.waitFor({ state: 'visible', timeout: 30000 });
    await this.page.waitForTimeout(2000);
    await searchInput.click();
    await searchInput.fill(productName);
    await searchInput.press('Enter');

    // Espera a que cargue la página de resultados
    const searchNavigation = this.page.waitForURL(/\/tienda.*s=|search/i, { timeout: 30000 }).catch(() => null);
    const productAnchorWait = this.page.waitForSelector('a[href*="/tienda/pdp/"]', { timeout: 30000 }).catch(() => null);
    await Promise.all([searchNavigation, productAnchorWait]);
  }

  /**
   * Aplica filtro de color
   */
  async filterByColor(colorName: string): Promise<boolean> {
    try {
      console.log(`🎨 Aplicando filtro de color: ${colorName}`);

      const filterButton = this.page.locator(
        'div.newPlpChip:has-text("Blanco")'
      ).first();

      if (!(await filterButton.isVisible({ timeout: 10000 }).catch(() => false))) {
        console.warn('❌ Botón de filtro no encontrado');
        return false;
      }

      await filterButton.click();
      await this.page.waitForSelector(`text=/${colorName}/i`, { state: 'visible', timeout: 7000 }).catch(() => null);

      const colorOption = this.page.locator(`text=/${colorName}/i`).first();
      if (!(await colorOption.isVisible({ timeout: 3000 }).catch(() => false))) {
        console.warn(`❌ Opción de color "${colorName}" no encontrada`);
        return false;
      }

      await colorOption.click();
      await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => null);
      console.log(`✅ Filtro de color "${colorName}" aplicado`);
      return true;
    } catch (error: any) {
      console.warn('❌ Error al aplicar filtro de color', error.message);
      return false;
    }
  }

  /**
   * Ordena productos por precio (menor a mayor)
   */
  async sortByPrice(): Promise<boolean> {
    try {
      console.log('💰 Ordenando por precio (menor a mayor)');

      const sortButton = this.page.locator('#sortby').filter({ visible: true });

      await sortButton.waitFor({ state: 'visible', timeout: 10000 });

      if (!(await sortButton.isVisible({ timeout: 10000 }).catch(() => false))) {
        console.warn('❌ Botón de ordenamiento no encontrado');
        return false;
      }

      await sortButton.click();

      await this.page.waitForTimeout(1000); // Pequeña espera para que el menú se abra
      //Validar si el botón de ordenamiento está visible antes de hacer clic

      const priceOption = this.page.locator('button[datahref="/tienda/sortPrice|0"]').filter({ visible: true });

      if (!(await priceOption.isVisible({ timeout: 10000 }).catch(() => false))) {
        console.warn('❌ Opción de precio no encontrada');
        return false;
      }

      //Click en la opción de ordenar por precio   
      await priceOption.click({ force: true });

      await this.page.waitForLoadState('networkidle', { timeout: 4000 }).catch(() => null);

      console.log('✅ Ordenamiento por precio aplicado');
      return true;
    } catch (error: any) {
      console.warn('❌ Error al aplicar ordenamiento', error.message);
      return false;
    }
  }

  /**
   * Obtiene los primeros 5 productos de la UI
   */
  async getFirstFiveProducts(): Promise<Product[]> {
    console.log('📦 Extrayendo primeros 5 productos del UI');
    const products = await ProductExtractor.extractFirstFiveFromUI(this.page);
    console.log(`✅ ${products.length} productos encontrados`);
    return products;
  }

  /**
   * Obtiene productos de la respuesta de API interceptada
   */
  getApiProductsFromResponse(response: any): ApiProduct[] {
    return ProductExtractor.extractFromApiResponse(response);
  }

  /**
   * Obtiene productos de los datos de página (__NEXT_DATA__)
   */
  async getApiProductsFromPageData(): Promise<ApiProduct[]> {
    // El control de la API pasó al interceptor de red del spec
  return [];
}

  /**
   * Configura interceptor de respuestas de red
   */
  onNetworkResponse(callback: (response: any) => void): void {
    this.page.on('response', async (response) => {
      const url = response.url();
      if (
        url.includes('/search') ||
        url.includes('/products') ||
        url.includes('/api') ||
        url.includes('.json') ||
        url.includes('/tienda')
      ) {
        try {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('application/json')) {
            const data = await response.json();
            callback(data);
          }
        } catch (e) {
          // Response might not be JSON
        }
      }
    });
  }
}
