# Meridian v2 — Guía de Setup

## 1. Crear proyecto Firebase

1. Ir a https://console.firebase.google.com
2. "Agregar proyecto" → nombre: `meridian`
3. Desactivar Google Analytics (opcional)

## 2. Habilitar servicios

En el panel de Firebase:

- **Authentication** → Get started → Email/Password → Habilitar
- **Firestore Database** → Create database → Producción → Elegir región (ej: `southamerica-east1`)
- **Storage** → Get started → Producción

## 3. Registrar app web

1. En la consola → ícono web `</>` → nombre: `meridian-web`
2. Copiar el `firebaseConfig` que aparece

## 4. Pegar config en el proyecto

Abrir `src/firebase.ts` y reemplazar los valores:

```ts
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 5. Desplegar Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # elegir proyecto existente
firebase deploy --only firestore:rules
```

## 6. Desplegar Storage Rules

Crear `storage.rules`:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /deals/{dealId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

```bash
firebase deploy --only storage
```

## 7. Crear primer usuario Admin

1. Correr la app: `npm install && npm run dev`
2. Registrarse con un email
3. En Firestore console → colección `users` → encontrar tu documento por UID
4. Cambiar el campo `role` de `"seller"` a `"admin"`
5. Recargar la app → tenés acceso al panel de Admin

## 8. Correr en local

```bash
npm install
npm run dev
# → http://localhost:3000
```

## 9. Deploy a producción (Vercel, gratis)

```bash
npm install -g vercel
vercel
# Seguir las instrucciones, elegir el proyecto
```

## Índices de Firestore requeridos

En la consola de Firestore → Indexes → Agregar:

| Colección | Campo 1 | Campo 2 | Tipo |
|-----------|---------|---------|------|
| deals | status (ASC) | createdAt (DESC) | Compound |
| ndas | buyerId (ASC) | — | Single |
| ndas | dealId (ASC) | — | Single |
| auditLogs | dealId (ASC) | createdAt (DESC) | Compound |
| notifications | userId (ASC) | createdAt (DESC) | Compound |
| documents | dealId (ASC) | createdAt (DESC) | Compound |

> Tip: Si aparece un error de índice faltante en la consola del browser, Firebase te da el link directo para crearlo.

## Estructura de colecciones

```
/users/{uid}
  email, role, buyerProfile?, createdAt

/deals/{MRD-xxx}
  status, ownerId, nombreFantasia, industria, region, descripcion
  revenue, ebitda, crecimiento, deuda, askingPrice
  cuit, tipoSocietario, jurisdiccion, representante, telefono, email
  highlights[], viewCount, ndaRequests, ndaSigned, dataRoomAccess, ioiCount
  createdAt, updatedAt, publishedAt

/ndas/{auto}
  dealId, buyerId, buyerName, buyerEmail, status, createdAt, signedAt?

/notifications/{auto}
  userId, type, title, message, dealId?, read, createdAt

/auditLogs/{auto}
  dealId, userId, userEmail, action, metadata, createdAt

/documents/{auto}
  dealId, name, storagePath, downloadUrl, uploadedBy, createdAt
```
