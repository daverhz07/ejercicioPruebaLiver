# TEST_STRATEGY.md

## Estrategia de Automatización - Liverpool PlayStation 5 Search

### 1. ¿Qué NO se automatizaría y por qué?

**Compra efectiva del producto**: No se automatiza porque:
- Requiere datos sensibles (tarjeta de crédito, dirección)
- Genera transacciones reales con costos
- Dificulta mantenibilidad y auditoría
- Existen pruebas manuales de humo para esto

**Experiencia de usuario visual (UX)**: No se verifica:
- Diseño responsivo en múltiples resoluciones (requiere infraestructura de screenshots visual)
- Accesibilidad WCAG completa (necesita herramientas especializadas como Axe)
- Animaciones y transiciones (frágil, no crítico para negocio)

**Validación de imágenes de productos**: Se excluye porque:
- Requiere análisis de visión computacional
- Bajo ROI comparado con validación de datos
- Cambios frecuentes en UI rompen pruebas

---

### 2. Si Liverpool agregara verificación de autenticidad (CAPTCHA/MFA)

**Enfoque pragmático Mid-level**:
- **Mantener pruebas sin autenticación**: Automatizar búsqueda sin login inicialmente (80% del valor)
- **CAPTCHA**: 
  - Saltarlo con credenciales de test sin verificación (si es posible negociar con el equipo)
  - Usar servicio externo de resolución (última opción, frágil)
  - Fallback: pruebas manuales para esos escenarios
- **MFA**: 
  - Solicitar token de prueba mock al backend
  - Usar fixture con sesión persistente autenticada
  - Implementar helper que simule el flujo de login previo

**Pragmatismo**: No se complica excesivamente; se escalona según criticidad del escenario.

---

### 3. Riesgos de inexactitud y mitigaciones implementadas

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Selectores dinámicos rompen | Falla masiva de pruebas | Múltiples selectores fallback; validación de elementos visibles |
| API response structure cambia | Validación incompleta | Extracción flexible con propiedades opcionales (name \| title) |
| Network latency variable | Timeouts falsos | `waitForLoadState('networkidle')` en lugar de sleep; timeout genérico de 60s |
| Precios fluctúan | Discrepancias falsas | Comparación de nombres (clave primaria); precio como validación secundaria |
| Elemento no visible al extraer | NullPointerException | `.catch(() => 'N/A')` en todas las lecturas; validación de longitud |

---

### 4. Cambios para integración con 50+ test suites en CI

**Optimizaciones necesarias**:

1. **Paralelización**: Separar por navegador/región
   - Worksher actual = 1 (secuencial). Aumentar a 4-8 si infraestructura lo permite
   - Riesgo: Contención en servidor Liverpool → Implementar backoff exponencial

2. **Duración**: Test actual ~45-60s es ALTO para CI compartido
   - Dividir en 2 suites: "quick-search" (15s) + "full-validation" (ejecutar nightly)
   - Goal: máximo 20s para feedback rápido

3. **Configuración compartida**:
   - Crear `.playwright-env.json` centralizado con timeouts/retries globales
   - Implementar ci-helper que gestione recursos compartidos

4. **Monitoreo y alertas**:
   - Agregar SLO: 95% de éxito en CI, no en local
   - Dashboard de fallos por tipo (selector, network, assertion)
   - Alertar si habitualmente fallan 3+ suites simultáneamente

5. **Aislamiento**:
   - Limpiar cookies/localStorage entre tests
   - Usar data-testid exclusivamente (reducir fragilidad)
   - Implementar retry lógico a nivel de suite, no individual

**Recomendación práctica**: Crear archivo `playwright-ci.config.ts` separado para CI vs local, evitando compromiso de velocidad en desarrollo.
