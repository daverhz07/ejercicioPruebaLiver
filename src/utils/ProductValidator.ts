/**
 * Valida y compara productos entre UI y API
 */
import { Product, ApiProduct, ProductMatch } from './Types';
import { normalizeProductName, calculateSimilarity } from '../helpers/StringHelpers';

export class ProductValidator {
  private static readonly SIMILARITY_THRESHOLD = 0.5;
  private static readonly PRICE_DIFFERENCE_THRESHOLD = 1;

  /**
   * Valida productos del UI contra la respuesta de API
   */
  static validateUIAgainstAPI(
    uiProducts: Product[],
    apiProducts: ApiProduct[]
  ): ProductMatch[] {
    const matches: ProductMatch[] = [];

    uiProducts.forEach((uiProduct) => {
      const uiName = normalizeProductName(uiProduct.name);
      const matchedApi = this.findMatchingApiProduct(uiName, apiProducts);

      if (matchedApi) {
        matches.push({
          uiProduct,
          apiProduct: matchedApi,
        });
      }
    });

    return matches;
  }

  /**
   * Encuentra el producto de API que coincide con el nombre del UI
   */
  private static findMatchingApiProduct(
    uiName: string,
    apiProducts: ApiProduct[]
  ): ApiProduct | undefined {
    return apiProducts.find((apiProduct) => {
      const apiName = normalizeProductName(this.extractApiProductName(apiProduct));
      if (!apiName || !uiName) return false;

      // Coincidencia exacta o parcial
      if (uiName.includes(apiName) || apiName.includes(uiName)) {
        return true;
      }

      // Similitud con threshold
      const similarity = calculateSimilarity(uiName, apiName);
      return similarity >= this.SIMILARITY_THRESHOLD;
    });
  }

  /**
   * Extrae el nombre del producto de la respuesta de API priorizando el campo mapeado
   */
  private static extractApiProductName(apiProduct: ApiProduct): string {
    return (
      apiProduct.name || // Prioridad 1: Campo estandarizado en el extractor
      apiProduct.allMeta?.title ||
      apiProduct.title ||
      apiProduct._t ||
      ''
    ).toString();
  }

  /**
   * Reporta discrepancias entre UI y API unificando los formatos de precios numéricos
   */
  static reportDiscrepancies(
    uiProducts: Product[],
    apiProducts: ApiProduct[]
  ): string[] {
    const discrepancies: string[] = [];

    uiProducts.forEach((uiProduct, index) => {
      const matchingApi = apiProducts.find((api) => {
        const apiName = this.extractApiProductName(api).toLowerCase();
        const similarity = calculateSimilarity(uiProduct.name.toLowerCase(), apiName);
        return similarity > 0.5; // Alineado al threshold de similitud general
      });

      if (!matchingApi) {
        discrepancies.push(
          `Producto #${index + 1}: "${uiProduct.name}" encontrado en UI pero NO en respuesta de API`
        );
      } else {
        // Obtenemos el precio de la API manejando la propiedad estándar
        const apiPriceRaw = matchingApi.price || '0';
        
        // Limpieza absoluta de strings para evitar fallos por caracteres especiales ($ , o centavos pegados)
        const cleanUiPrice = parseFloat(uiProduct.price.replace(/[^\d.]/g, '')) || 0;
        const cleanApiPrice = parseFloat(apiPriceRaw.toString().replace(/[^\d.]/g, '')) || 0;

        // CORRECCIÓN DE UNIDADES: Si un precio viene con centavos truncados (ej: 389 vs 389.00)
        // Normalizamos quitando los decimales para comparar el valor entero real
        const finalUiPrice = Math.floor(cleanUiPrice);
        const finalApiPrice = Math.floor(cleanApiPrice);

        if (Math.abs(finalUiPrice - finalApiPrice) > this.PRICE_DIFFERENCE_THRESHOLD) {
          discrepancies.push(
            `Discrepancia en precio para "${uiProduct.name}": UI=${uiProduct.price} (Normalizado: ${finalUiPrice}), API=${apiPriceRaw} (Normalizado: ${finalApiPrice})`
          );
        }
      }
    });

    return discrepancies;
  }
}