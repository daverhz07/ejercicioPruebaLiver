/**
 * Extrae productos de la UI y respuestas de API
 */
import { Page } from '@playwright/test';
import { Product, ApiProduct } from './Types';

export class ProductExtractor {
  /**
   * Extrae los primeros 5 productos del UI
   */
  static async extractFirstFiveFromUI(page: Page): Promise<Product[]> {
    const productAnchorSelector = 'a[href*="/tienda/pdp/"]';
    await page.waitForSelector(productAnchorSelector, { timeout: 30000 });

    const productAnchors = page.locator(productAnchorSelector);
    const count = await productAnchors.count();
    const products: Product[] = [];

    for (let i = 0; i < Math.min(count, 5); i++) {
      const anchor = productAnchors.nth(i);
      const rawText = (await anchor.innerText()).replace(/\s+/g, ' ').trim();

      // Capturamos todos los bloques que tengan formato de precio (ej: $38900 o $389.00)
      const priceMatches = [...rawText.matchAll(/\$[\d,.]+/g)].map((m) => m[0]);

      // Limpiamos el nombre removiendo los precios y espacios duplicados
      const nameText = rawText
        .replace(/\$[\d,.]+/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

      let priceText = priceMatches.length ? priceMatches[priceMatches.length - 1] : '';

      // CORRECCIÓN DE FORMATO: Si el precio viene pegado sin punto decimal (ej: $38900 -> $389.00)
      if (priceText && !priceText.includes('.') && priceText.length > 3) {
        priceText = priceText.slice(0, -2) + '.' + priceText.slice(-2);
      }

      products.push({
        name: nameText || `Producto ${i + 1}`,
        price: priceText,
        selector: productAnchorSelector,
      });
    }

    if (products.length === 0) {
      await page.waitForSelector('.m-plp-card-container, .m-plp-product-card, .m-plp-card', { timeout: 30000 });
    }

    return products;
  }

  /**
   * Extrae productos de la respuesta de API interceptada (Tráfico de Red)
   */
  static extractFromApiResponse(response: any): ApiProduct[] {
    if (!response) {
      console.warn('⚠️ API Response is null or undefined');
      return [];
    }

    // Buscamos la lista de registros en las distintas estructuras dinámicas de Liverpool
    const rawRecords =
      response.plpResults?.records ||
      response.contents?.[0]?.mainContent?.[0]?.contents?.[0]?.records ||
      response.records ||
      response.data?.mainContent?.records ||
      response.products ||
      response.items ||
      [];

    if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
      return [];
    }

    // Mapeamos al formato estandarizado ApiProduct usando las propiedades reales de Liverpool
    return rawRecords.map((rec: any) => ({
      name: rec.productDisplayName || 'Sin nombre',
      price: rec.promoPrice?.toString() || rec.listPrice?.toString() || '0',
      id: rec.productId || ''
    })).slice(0, 5); // Consistencia: Solo tomamos los primeros 5 para comparar
  }

  /**
   * Extrae datos del estado de la página usando el objeto global __NEXT_DATA__
   */
  static async extractFromPageData(page: Page): Promise<ApiProduct[]> {
    const rawRecords = await page.evaluate(() => {
      const data = (window as any).__NEXT_DATA__;
      if (!data) return [];

      // Buscamos en las diferentes ramas de hidratación de Next.js de Liverpool
      let records =
        data.props?.pageProps?.initialState?.products?.plpResults?.records ||
        data.props?.pageProps?.payload?.plpResults?.records ||
        data.props?.pageProps?.plpResults?.records;

      // 2. Si NextData no se ha actualizado, buscamos en la caché del enrutador de Next.js (_next/data)
      if (!records || records.length === 0) {
        const nextRouter = (window as any).__NEXT_ROOT__?._reactRoot?.current?.memoizedState?.element?.props?.store?.getState();
        if (nextRouter?.products?.plpResults?.records) {
          records = nextRouter.products.plpResults.records;
        }
      }

      return records || [];
    });

    if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
      return [];
    }

    // Mapeamos con la misma estructura para que la validación UI vs API sea equivalente
    return rawRecords.map((rec: any) => ({
      name: rec.productDisplayName || 'Sin nombre',
      price: rec.promoPrice?.toString() || rec.listPrice?.toString() || '0',
      id: rec.productId || ''
    })).slice(0, 5);
  }
}