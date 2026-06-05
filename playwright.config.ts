/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

const isHeaded = process.env.HEADED === 'true' || process.argv.includes('--headed');

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 0 : 0,
  workers: 1,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'https://www.liverpool.com.mx',

    
    viewport: { width: 1366, height: 768 },

    // Engañamos al servidor con un User-Agent idéntico a un humano navegando en Chrome estable
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',

    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled',
        '--start-maximized', // Ayuda a que Chromium maneje mejor el espacio visual interno
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    permissions: ['geolocation'],
    geolocation: { longitude: -98.89, latitude: 19.26 },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: !isHeaded,
        // Forzamos a que el proyecto respete el viewport de escritorio para evitar layouts móviles
        viewport: { width: 1366, height: 768 },
      },
    },
  ],
  webServer: undefined,
  timeout: 60000,
  expect: {
    timeout: 15000
  }
});