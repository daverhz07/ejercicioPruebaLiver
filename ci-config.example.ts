/**
 * Configuración de Playwright optimizada para CI/CD
 * Nota: Este archivo es una guía. En producción, podría crearse
 * un playwright-ci.config.ts separado y usarse en GitHub Actions
 * pasando el parámetro --config=playwright-ci.config.ts
 */

import { defineConfig } from '@playwright/test';

// Variables de entorno para CI
const CI_CONFIG = {
  // Reducir timeouts en CI para detectar cuellos de botella más rápido
  timeout: 45000,
  expect: { timeout: 4000 },

  // Retries en CI para flakiness
  retries: 1,

  // Un solo worker en CI para evitar contención en Liverpool
  workers: 1,

  // Más agresivo con traces en CI para debugging
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Reporter detallado para CI
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // Metadata para trazabilidad
  metadata: {
    environment: 'ci',
    branch: process.env.GITHUB_REF || 'unknown',
    runId: process.env.GITHUB_RUN_ID || 'unknown',
  },
};

export default CI_CONFIG;
