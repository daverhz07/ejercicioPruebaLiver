/**
 * Tipos compartidos para la prueba de automatización
 */

export interface Product {
  name: string;
  price: string;
  selector?: string;
}

export interface ApiProduct {
  name?: string;
  title?: string;
  price?: number;
  precio?: number;
  [key: string]: any;
}

export interface ProductMatch {
  uiProduct: Product;
  apiProduct: ApiProduct;
}

export interface TestResult {
  productsFound: number;
  matchingProducts: number;
  discrepancies: string[];
  isValid: boolean;
}
