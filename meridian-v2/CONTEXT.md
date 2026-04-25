# MERIDIAN — Contexto Completo del Proyecto
> Para pasar a otra IA: este archivo describe TODO el sistema sin necesidad de ver el código.
> Última actualización: 2025-04

---

## 1. ¿Qué hace la app?

Meridian es una plataforma de M&A (fusiones y adquisiciones) para PyMEs argentinas.
Conecta dueños de empresas (sellers) con compradores institucionales verificados (buyers).
Cobra 5% del precio de cierre — SOLO si la operación se concreta. Sin costos anticipados.
Ticket promedio de deals: USD 2M–10M.

---

## 2. ¿Para quién está hecha?

- **Sellers**: Dueños de PyMEs rentables que quieren vender su empresa
- **Buyers**: Family offices, fondos de PE, adquirentes estratégicos con capital en USD
- **Admin**: Mateo (operador único), aprueba/rechaza deals, ve métricas globales

---

## 3. Stack técnico

| Capa | Tech |
|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind v4 |
| Auth | Firebase Auth (Google OAuth) |
| DB | Firestore — proyecto `ai-studio-applet-webapp-9c65e` |
| Storage | Firebase Storage (documentos del data room) |
| IA | Anthropic Claude claude-sonnet-4-20250514 — llamado directo desde el cliente |
| Deploy | Vercel → https://meridian-market.vercel.app |
| Repo | github.com/mateobsapia-lang/meridian → `meridian-v2/src/` |

---

## 4. Estructura de archivos

```
meridian-v2/
├── firestore.rules          # Seguridad DB (deploy en Firebase Console)
├── vercel.json              # Security headers CSP + HSTS + CORS
├── CONTEXT.md               # Este archivo
└── src/
    ├── App.tsx              # Rutas + todos los modales registrados globalmente
    ├── AppContext.tsx       # Estado global: auth, modales, notificaciones, toast
    ├── firebase.ts          # Config Firebase (no tocar)
    ├── types.ts             # Todos los tipos TypeScript del sistema
    ├── data.ts              # Deals de ejemplo/fallback (8 deals con datos reales)
    ├── index.css            # Tailwind v4 theme + tipografía fluida con clamp()
    ├── main.tsx             # Entry point
    ├── components/
    │   ├── Header.tsx               # Nav + hamburger mobile + CTA "Listar"
    │   ├── Footer.tsx
    │   ├── Modal.tsx                # Bottom sheet en mobile, popup en desktop
    │   ├── NotificationBell.tsx     # Notificaciones en tiempo real (onSnapshot)
    │   ├── ScrollToTop.tsx
    │   ├── Ticker.tsx               # Ticker de deals (datos reales de Firestore o fallback)
    │   ├── Toast.tsx
    │   ├── ValuationCalculator.tsx  # Calculadora con 3 metodologías: EBITDA + Revenue + DCF
    │   └── FinancialChatWidget.tsx  # Chat IA flotante con anti-injection
    ├── modals/
    │   ├── AIAnalysisModal.tsx      # Score IA de documentos → persiste en Firestore
    │   ├── BuyerWizard.tsx          # 3 pasos: perfil + tesis + KYC/AML → guarda buyerProfile
    │   ├── DiagnosticoModal.tsx     # Lead magnet: 8 preguntas → score vendibilidad IA
    │   ├── ReporteValuacionModal.tsx # Lead magnet: 3 metodologías → reporte con IA
    │   ├── SimuladorOfertaModal.tsx  # Lead magnet buyer: criterios → count deals match
    │   ├── SellerWizard.tsx         # 5 pasos → crea deal → llama AIAnalysisModal
    │   ├── ContactModal.tsx
    │   ├── LeadCaptureModal.tsx
    │   ├── LoginModal.tsx
    │   ├── NDAModal.tsx             # Crea NDA en Firestore + notifica al seller
    │   ├── ProfileModal.tsx
    │   └── WelcomeModal.tsx         # T&C + selector de rol (aparece a los 30s)
    ├── pages/
    │   ├── Home.tsx         # Hero + proceso + lead magnets + deals + pricing + CTA
    │   ├── Dashboard.tsx    # Seller/Buyer/Admin panels
    │   ├── DealView.tsx     # Deal con blind teaser + data room + audit trail
    │   ├── Mercado.tsx      # Lista de deals publicados con filtros
    │   ├── Compradores.tsx
    │   ├── Nosotros.tsx
    │   └── Proceso.tsx
    └── lib/
        ├── firestore.ts     # ÚNICA fuente de operaciones Firestore (nunca llamar Firebase directo)
        └── matching.ts      # Score de match buyer↔deal
```

---

## 5. Colecciones Firestore

| Colección | Campos clave | Acceso |
|---|---|---|
| `users` | `uid, email, role (seller/buyer/admin), buyerProfile?` | Propio o admin |
| `deals` | `status, ownerId, aiScore, aiSummary, revenue, ebitda, askingPrice, ...` | Público si published |
| `ndas` | `dealId, buyerId, status (pending/signed)` | Buyer propio + seller del deal |
| `notifications` | `userId, type, title, read` | Usuario destinatario |
| `auditLogs` | `dealId, userId, action` | Inmutables |
| `documents` | `dealId, storagePath, downloadUrl` | Seller del deal + signed NDA |
| `leads` | `email, createdAt` | Solo admin |
| `leads_diagnostico` | `email, score, factoresCriticos, recomendaciones` | Solo admin |
| `leads_reporte` | `email, industria, revenue, valMin, valMax` | Solo admin |
| `leads_simulador` | `email, industrias, ticketMin, ticketMax, dealsMatch` | Solo admin |
| `leads_buyers` | `email, organizacion, buyerProfile` | Solo admin |

---

## 6. Estados de un deal

```
draft → under_review → published → nda_phase → loi_received → closing → closed
```

**Regla de score IA:**
- `aiScore ≥ 80` → auto-publica (`status: published`)
- `aiScore 50-79` → queda en `under_review` (revisión manual del admin)
- `aiScore < 50` → regresa a `draft` (seller debe subir más docs)

---

## 7. Flujo principal del seller

1. Entra al Home → toca "Listar mi empresa"
2. Si no está logueado → Google OAuth → crea documento en `/users/{uid}`
3. SellerWizard (5 pasos): info empresa → documentos → financiero → legal → confirmar
4. Paso 2 (documentos): sube balance → AIAnalysisModal llama Claude API → score 0-100
5. Si score ≥ 80: deal se publica automáticamente
6. Si 50-79: queda en under_review → admin recibe notificación
7. Si <50: vuelve a draft, pide más documentación
8. Una vez publicado: buyers ven teaser ciego → solicitan NDA → acceden al Data Room

---

## 8. Flujo principal del buyer

1. Entra al Mercado o SimuladorOfertaModal
2. BuyerWizard (3 pasos): tipo adquirente + tesis de inversión (ticket/industrias) + KYC/AML
3. Guarda `buyerProfile` en Firestore → usado por matching score
4. Ve deals publicados → solicita NDA → firma NDA
5. Accede al Data Room → descarga documentos → puede enviar IOI

---

## 9. Lead magnets (Hormozi framework)

Tres herramientas gratuitas en el Home que capturan leads antes de que el usuario se loguee:

| Herramienta | Target | Qué hace | Lead guardado en |
|---|---|---|---|
| Diagnóstico de Vendibilidad | Sellers | 8 preguntas → score IA → factores críticos | `leads_diagnostico` |
| Reporte de Valuación | Sellers | Sliders + 3 metodologías → reporte con IA | `leads_reporte` |
| Simulador de Oportunidades | Buyers | Criterios → count deals activos | `leads_simulador` |

---

## 10. Sistema de IA

**Todas las llamadas son a `claude-sonnet-4-20250514` directo desde el cliente.**

⚠️ PROBLEMA CONOCIDO: La API key de Anthropic está expuesta en el cliente. Necesita moverse a una Vercel Edge Function o API Route.

| Componente | Qué hace la IA |
|---|---|
| `AIAnalysisModal` | Analiza PDF/imagen de balance → score 0-100 + fortalezas + alertas |
| `DiagnosticoModal` | Genera párrafo de diagnóstico personalizado basado en respuestas |
| `ReporteValuacionModal` | Genera análisis de mercado para el reporte |
| `FinancialChatWidget` | Chat conversacional sobre valuación y M&A |

**Anti-injection en 2 capas:**
1. Cliente: 18 regex patterns que detectan bypass antes de llamar a la API
2. System prompt: instrucción explícita inamovible en todos los modales

---

## 11. Calculadora de valuación — 3 metodologías

Misma lógica en `ValuationCalculator.tsx` y `ReporteValuacionModal.tsx`:

```
EBITDA = Revenue × Margen%
Múltiplo ajustado = Múltiplo_sector × (1.2 si recurrente) × (1.1 si crecimiento >20%)

Método 1 — EBITDA: Valor = EBITDA × Múltiplo × [0.85, 1.15]
Método 2 — Revenue: Valor = Revenue × RevMult × [0.80, 1.20]  
Método 3 — DCF 5 años: FCF = EBITDA × 0.75
  Terminal Value = FCF×(1+g) / (WACC-g), g = min(crecimiento, 5%)
  Valor = PV(FCF) + PV(TV)

Consenso = EBITDA×50% + Revenue×25% + DCF×25%
```

---

## 12. Seguridad

**Firestore Rules:**
- Deny-all por defecto
- Rol verificado en DB (no en claims del cliente)
- Campos inmutables: `status, ownerId, aiScore, viewCount`
- Colecciones de leads: escritura pública, lectura solo admin
- `users`: nadie puede auto-asignarse `role: admin`

**vercel.json:**
- CSP con allowlist explícita (Firebase + Anthropic API únicamente)
- HSTS, X-Frame-Options, Permissions-Policy, CORP/COOP

---

## 13. Problemas conocidos y pendientes

### 🔴 Crítico
- [ ] **API key Anthropic expuesta** — mover a Vercel Edge Function
- [ ] **Google Analytics** — `G-XXXXXXXXXX` en index.html nunca fue reemplazado con ID real

### 🟡 Importante
- [ ] **Email transaccional** — no hay notificaciones por email (solo in-app)
- [ ] **Contrato digital** — seller no firma acuerdo de comisión antes de publicar
- [ ] **Matching score** — `matching.ts` existe pero no está conectado al UI del Mercado

### 🟢 Nice to have
- [ ] **Blog/SEO** — rankear "vender empresa argentina"
- [ ] **Página 404 custom**
- [ ] **Webinar mensual** (no requiere código)
- [ ] **Informe trimestral PDF** (se puede hacer manualmente)

---

## 14. Reglas de trabajo para el dev

- `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` → editar SIEMPRE con ✏️ en GitHub, **nunca en ZIP**
- Toda operación Firestore → `src/lib/firestore.ts` únicamente
- TypeScript estricto, sin `any`
- Para ser admin: Firestore console → `users/{uid}` → `role: "admin"`
- Firebase Auth dominios: `meridian-market.vercel.app` debe estar en Authorized Domains Y en Google Cloud Console OAuth credentials

---

## 15. Archivos más importantes para entender el sistema

En orden de prioridad para leer:
1. `src/types.ts` — todos los tipos del sistema
2. `src/lib/firestore.ts` — todas las operaciones de DB
3. `src/AppContext.tsx` — estado global y auth
4. `src/pages/Dashboard.tsx` — lógica de negocio por rol
5. `src/modals/SellerWizard.tsx` — flujo principal del seller
6. `src/components/ValuationCalculator.tsx` — lógica de valuación
7. `src/components/FinancialChatWidget.tsx` — IA + anti-injection
8. `firestore.rules` — seguridad completa de la DB
