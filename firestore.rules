# MERIDIAN — Contexto del Proyecto
> Última actualización: 2025-04 | Leer este archivo al inicio de cada sesión.

## Stack
| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind v4 |
| Auth | Firebase Auth (Google) — proyecto `ai-studio-applet-webapp-9c65e` |
| DB | Firestore — DB `ai-studio-f4b65f53-ac57-48b1-9ed2-56362abb2b48` |
| Deploy | Vercel → https://meridian-market.vercel.app |
| Repo | github.com/mateobsapia-lang/meridian — código en `meridian-v2/src/` |

## Reglas de trabajo
- `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` → editar SIEMPRE con ✏️ en GitHub, nunca en ZIP
- Toda op Firestore → `src/lib/firestore.ts` únicamente
- TypeScript estricto, sin `any`
- Para ser admin: Firestore console → `users/{uid}` → `role: "admin"`
- **IMPORTANTE login Google**: en Firebase Console → Authentication → Authorized Domains → agregar `*.vercel.app` y `meridian-market.vercel.app`

## Estructura de archivos
```
meridian-v2/
├── firestore.rules        ← Deploy en Firebase Console → Firestore → Rules
├── vercel.json            ← Security headers + CSP (en raíz del repo, NO en src/)
├── CONTEXT.md
└── src/
    ├── App.tsx            ← Rutas + todos los modales registrados
    ├── AppContext.tsx     ← Estado global: auth, modales (incluye lead magnets)
    ├── firebase.ts
    ├── types.ts           ← Deal, AppUser, BuyerProfile, DiagnosticoLead, ReporteLead, SimuladorLead
    ├── data.ts
    ├── index.css
    ├── main.tsx
    ├── components/
    │   ├── Header.tsx, Footer.tsx, Modal.tsx
    │   ├── NotificationBell.tsx, ScrollToTop.tsx, Ticker.tsx, Toast.tsx
    │   └── ValuationCalculator.tsx
    ├── modals/
    │   ├── AIAnalysisModal.tsx    ← Score IA → persiste en Firestore → notifyAdmins
    │   ├── BuyerWizard.tsx        ← 3 pasos: perfil + tesis + KYC → guarda buyerProfile en Firestore
    │   ├── DiagnosticoModal.tsx   ← Lead magnet: 8 preguntas → score vendibilidad IA
    │   ├── ReporteValuacionModal.tsx ← Lead magnet: revenue+margen → reporte PDF con IA
    │   ├── SimuladorOfertaModal.tsx  ← Lead magnet buyer: criterios → count deals match
    │   ├── SellerWizard.tsx       ← 5 pasos → crea deal → llama AIAnalysisModal con dealId real
    │   ├── ContactModal.tsx, LeadCaptureModal.tsx
    │   ├── LoginModal.tsx, NDAModal.tsx, ProfileModal.tsx, WelcomeModal.tsx
    ├── pages/
    │   ├── Home.tsx       ← Tiene sección lead magnets Hormozi (Diagnóstico / Reporte / Simulador)
    │   ├── Dashboard.tsx  ← Seller/Buyer/Admin. Admin ve score IA + panel detalle
    │   ├── DealView.tsx, Mercado.tsx, Compradores.tsx, Nosotros.tsx, Proceso.tsx
    └── lib/
        ├── firestore.ts   ← Todas las ops DB. saveDealAIScore, notifyAdmins, getAdminUids
        │                    saveDiagnosticoLead, saveReporteLead, saveSimuladorLead
        └── matching.ts
```

## Colecciones Firestore
| Colección | Descripción |
|---|---|
| `users` | `{uid, email, role, buyerProfile?}` |
| `deals` | Ver tipo `Deal` en types.ts |
| `ndas` | `{dealId, buyerId, status: pending\|signed}` |
| `notifications` | `{userId, type, title, message, read}` |
| `auditLogs` | Inmutables |
| `documents` | Data room |
| `leads` | Calculadora original |
| `leads_diagnostico` | Lead magnet diagnóstico de vendibilidad |
| `leads_reporte` | Lead magnet reporte de valuación |
| `leads_simulador` | Lead magnet simulador de oferta (buyer) |
| `leads_buyers` | BuyerWizard sin auth |

## Estados de deal
```
draft → under_review → published → nda_phase → loi_received → closing → closed
```
Score IA: ≥80 auto-publica · 50-79 queda en under_review · <50 vuelve a draft

## Lo que está implementado ✅
- Login Google + roles + WelcomeModal
- SellerWizard → crea deal → AIAnalysisModal (score → Firestore → notifyAdmins dinámico)
- BuyerWizard completo (3 pasos: perfil + tesis + KYC/AML) → guarda buyerProfile en Firestore
- DiagnosticoModal: 8 preguntas → score vendibilidad IA → factores críticos + recomendaciones
- ReporteValuacionModal: sliders revenue/margen → reporte con múltiplos + análisis IA
- SimuladorOfertaModal: criterios buyer → count deals activos → alerta email
- Mercado, DealView, Dashboard (seller/buyer/admin con score IA visible)
- NotificationBell, NDAModal, AuditLog, Data Room upload
- Firestore rules: deny-all, rol en DB, campos inmutables, 4 colecciones lead magnets
- vercel.json: CSP corregida (sin bloqueo Google Auth), HSTS, X-Frame, Permissions-Policy
- Home: sección lead magnets Hormozi + sección compradores B2B

## Pendiente 🔴🟡🟢
### 🔴 Alta prioridad
- [ ] **Email transaccional** — Resend o EmailJS: notificar deal aprobado, NDA firmado, nuevo deal matching
- [ ] **Informe trimestral** — PDF real generado con deals de Firestore (puede ser manual al principio)

### 🟡 Importante
- [ ] **Contrato digital** — acuerdo de comisión 5% antes de publicar (HelloSign)
- [ ] **Google Analytics 4** — reemplazar `G-XXXXXXXXXX` en `index.html`
- [ ] **Match score mejorado** — usar buyerProfile guardado en matching.ts

### 🟢 Nice to have
- [ ] **Blog SEO** — "vender empresa argentina", "M&A PyMEs"
- [ ] **Componentes 21st.dev** — hero, testimonials
- [ ] Mover Claude API a Edge Function de Vercel (seguridad de API key)

## Bugs conocidos
| Severidad | Descripción | Archivo |
|---|---|---|
| 🟡 MEDIO | `LoginModal` hardcodea `role:'seller'` en nuevo usuario — ya corregido en AppContext | AppContext.tsx |
| 🟢 BAJO | `ProfileModal` llama updateDoc directo — debería pasar por firestore.ts | modals/ProfileModal.tsx |

## Fix urgente Firebase (hacer YA)
Firebase Console → Authentication → Settings → Authorized Domains:
- Agregar `meridian-market.vercel.app`
- Agregar `*.vercel.app` (cubre previews de Vercel)
