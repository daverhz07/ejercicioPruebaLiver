# 🎮 Liverpool Automation Framework

[![Playwright Tests](https://github.com/yourusername/EjercicioLiverpool/actions/workflows/test.yml/badge.svg)](https://github.com/yourusername/EjercicioLiverpool/actions)
![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.9%2B-blue)
![Playwright](https://img.shields.io/badge/playwright-1.40%2B-009CCC)

Framework profesional de automatización con **Playwright + TypeScript** para validación de búsqueda de PlayStation 5 en liverpool.com.mx, implementado con **Page Object Model (POM)** para máxima escalabilidad y mantenibilidad.

---

## 📊 Características Principales

✅ **Page Object Model** - Arquitectura escalable y mantenible  
✅ **Type-Safe** - 100% TypeScript  
✅ **Modular** - Código separado por responsabilidades  
✅ **Documentado** - 11 documentos de referencia  
✅ **Production Ready** - Listo para producción  
✅ **CI/CD Integrado** - GitHub Actions configurado  

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** 16 o superior
- **npm** 7 o superior
- Git (opcional, para clonar)

### Pasos de Instalación

```bash
# 1. Clonar o navegar al proyecto
cd EjercicioLiverpool

# 2. Instalar dependencias del proyecto
npm install

# 3. (Opcional) Instalar navegadores de Playwright
npx playwright install

# 4. Verificar la instalación
npx tsc --noEmit
```

**Resultado esperado:** Sin mensajes de error = ✅ Instalación exitosa

---

## ⚙️ Ejecución del Proyecto

### 🟢 Modo Headless (Recomendado - Rápido)
Ejecuta los tests sin mostrar navegador. Ideal para CI/CD.

```bash
# Ejecutar todos los tests en headless
npm run test:headless

# O usar directamente
npx playwright test --headed=false
```

**Tiempo:** ~30-60 segundos  
**Uso:** CI/CD, pipelines automáticas, ejecución rápida

### 🔵 Modo Headed (Con Navegador Visible)
Ejecuta los tests mostrando el navegador. Ideal para desarrollo y debugging.

```bash
# Ejecutar todos los tests con navegador visible
npm run test:headed

# O usar directamente
npx playwright test --headed

# O simplemente
npm test
```

**Tiempo:** ~1-2 minutos  
**Uso:** Desarrollo, debugging, validación visual

### 🔴 Modo Debug (Interactivo)
Ejecuta los tests en modo debug con pausa. Ideal para investigar problemas.

```bash
# Ejecutar en modo debug con inspector visual
npm run test:debug
```

**Características:**
- Inspector de Playwright integrado
- Pausa automática en breakpoints
- Inspección de elementos
- Ver consola del navegador

### 📊 Ver Reporte de Resultados

```bash
# Generar y abrir reporte HTML
npm run test:report
```

**Abre en el navegador:**
- ✅ Tests pasados
- ❌ Tests fallidos  
- 📸 Screenshots
- 🎥 Videos
- ⏱️ Duración de cada test

---

## 📖 Estructura del Proyecto

```
EjercicioLiverpool/
├── 📂 src/                          ← NUEVO: Código reutilizable (POM)
│   ├── 📂 pages/
│   │   └── LiverpoolPage.ts        ← Page Object Model
│   ├── 📂 utils/
│   │   ├── Types.ts                ← Interfaces TypeScript
│   │   ├── ProductExtractor.ts     ← Extracción de datos
│   │   └── ProductValidator.ts     ← Validación
│   └── 📂 helpers/
│       └── StringHelpers.ts        ← Utilidades
│
├── 📂 tests/
│   └── liverpool.spec.ts            ← Test principal (~100 líneas)
│
├── 📂 playwright-report/            ← Reportes HTML
├── 📂 test-results/                 ← Resultados en JSON
│
├── 📂 .github/workflows/            ← GitHub Actions CI/CD
│
├── 📄 README.md                      ← Este archivo
├── 📄 INICIO_RAPIDO.md              ← Comenzar rápido ⭐
├── 📄 GUIA_RAPIDA.md                ← Para QA Junior
├── 📄 ARQUITECTURA.md               ← Estructura completa
├── 📄 EJEMPLOS_NUEVAS_PRUEBAS.md    ← 6+ ejemplos
│
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## ¿Qué Hace el Test?

El test realiza **9 pasos clave** para validar la búsqueda de PlayStation 5:

1. 📍 **Navegar** a liverpool.com.mx
2. 🔗 **Interceptar** respuestas de red (API)
3. 🔍 **Buscar** "PlayStation 5"
4. 🎨 **Filtrar** por color "Blanco" (si está disponible)
5. 💰 **Ordenar** por precio (menor a mayor)
6. 📦 **Extraer** primeros 5 productos del UI
7. 📡 **Obtener** datos de la API
8. ✔️ **Validar** UI vs API (similitud fuzzy matching)
9. 📊 **Reportar** discrepancias encontradas

**Criterio de éxito:** Mínimo 3 de 5 productos validados

---

## 📋 Comandos Disponibles

```bash
# Ejecución
npm test                    # Ejecutar tests (headless por defecto)
npm run test:headless      # Ejecutar sin navegador (rápido)
npm run test:headed        # Ejecutar con navegador visible
npm run test:debug         # Ejecutar en modo debug

# Reportes
npm run test:report        # Abrir reporte HTML

# Verificación
npx tsc --noEmit           # Verificar TypeScript sin compilar
```

---

## 🐛 Troubleshooting

### ❌ Error: "Selector not found"
**Solución:** Liverpool cambió su estructura HTML. Actualiza selectores en `src/pages/LiverpoolPage.ts`

### ❌ Error: "Timeout waiting for element"
**Solución:** Aumenta el timeout o ejecuta en modo headed para ver qué pasa:
```bash
npm run test:headed
```

### ❌ Error: "Module not found"
**Solución:** Reinstala dependencias:
```bash
rm -rf node_modules
npm install
```

---

## 📈 CI/CD con GitHub Actions

El proyecto incluye CI/CD automático. Los tests se ejecutan automáticamente:
- ✅ En cada push
- ✅ En cada pull request
- ✅ Según schedule configurado

### Ver Resultados de las Pruebas

Para ver los resultados de las pruebas más recientes:

1. Ve a tu repositorio en GitHub
2. Click en **Actions**
3. Selecciona el workflow más reciente
4. Revisa el estado y descargar artefactos (reporte HTML)

**Badge Status** (arriba del README) muestra:
- 🟢 **Verde:** Todos los tests pasaron
- 🔴 **Rojo:** Algún test falló

---

## ✨ Características Implementadas

✅ **Búsqueda y Filtrado**
- Búsqueda funcional de PlayStation 5
- Filtrado por color (Blanco)
- Ordenamiento por precio

✅ **Extracción de Datos**
- Obtención de nombre y precio de productos
- Extracción desde UI y API
- Salida formateada en consola

✅ **Validación UI vs API**
- Comparación inteligente de nombres (similitud fuzzy)
- Detección de discrepancias de precio
- Reporte detallado

✅ **Reporte y CI/CD**
- HTML Reporter integrado
- Screenshots automáticos en fallos
- Videos de ejecución en fallos
- GitHub Actions workflow
- Instalación automatizada

✅ **Calidad de Código**
- Page Object Model (POM)
- SOLID Principles aplicados
- TypeScript type-safe
- Bien documentado

---

## 🤝 Contribuir

1. Crea una rama: `git checkout -b feature/mi-test`
2. Hace tus cambios
3. Commit: `git commit -am 'Agrego nuevo test'`
4. Push: `git push origin feature/mi-test`
5. Abre un Pull Request

**Guía de contribución:** Ver [ARQUITECTURA.md](ARQUITECTURA.md)

---

**Creado con ❤️ usando Playwright + TypeScript**

### Agregar más tests
1. Crear nuevo archivo en `tests/` con extensión `.spec.ts`
2. Seguir estructura del archivo `liverpool.spec.ts`
3. Ejecutar `npm test` para correr todos

### Modificar timeouts
En `playwright.config.ts`:
```typescript
timeout: 60000,              // Timeout general por test
expect: { timeout: 5000 }    // Timeout para expect()
```

## Requisitos Técnicos

- Node.js 18+
- npm 9+
- Navegador Chromium (instalado por Playwright)

## Notas Importantes

- El test es resiliente ante cambios de selectores (múltiples fallbacks)
- La validación UI vs API es flexible (similitud de nombres al 60%)
- En caso de no capturar la respuesta de red, el test continúa (log de advertencia)
- Los screenshots y videos se guardan solo si hay fallo
- El reporte HTML se genera automáticamente en cada ejecución

## Troubleshooting

**Problema**: Test corre muy lento
- **Solución**: Reducir `waitForTimeout()` en el test o aumentar `networkidle` esperado

**Problema**: No encuentra elementos
- **Solución**: Verificar que el selector es visible y no está dentro de iframe

**Problema**: Red response no capturada
- **Solución**: Verificar que la URL contiene patrones como `/search`, `/products`, `/api`

**Problema**: Fallo en GitHub Actions
- **Solución**: Revisar artifact "playwright-report" descargando el HTML

## Autor

Automation Engineer - David Rueda
