rules_version = '2';

// ─────────────────────────────────────────────────────────────
//  MERIDIAN — Firestore Security Rules
//  Última revisión: 2025-04
//
//  Principios:
//  1. Deny-all por defecto (sin match explícito → denegado)
//  2. El rol del usuario vive en /users/{uid}.role — nunca en el token client-side
//  3. Admin = role == "admin" verificado en Firestore, no en el cliente
//  4. Los campos críticos (status, ownerId, aiScore) son inmutables una vez establecidos
//     salvo por admin
// ─────────────────────────────────────────────────────────────

service cloud.firestore {
  match /databases/{database}/documents {

    // ── Helpers ───────────────────────────────────────────────

    // Rol verificado contra Firestore (no contra client claims)
    function userRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isAdmin() {
      return request.auth != null && userRole() == 'admin';
    }

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(ownerId) {
      return request.auth != null && request.auth.uid == ownerId;
    }

    // Campos que NUNCA puede modificar el seller después de crear el deal
    function immutableFields() {
      return ['ownerId', 'createdAt', 'status', 'aiScore', 'aiRecommendation',
              'viewCount', 'ndaRequests', 'ndaSigned', 'dataRoomAccess', 'ioiCount'];
    }

    function noImmutableChange() {
      return !request.resource.data.diff(resource.data).affectedKeys()
               .hasAny(immutableFields());
    }

    // ── /users ────────────────────────────────────────────────
    match /users/{userId} {
      // Leer perfil propio o admin lee cualquiera
      allow read: if isOwner(userId) || isAdmin();

      // Crear propio perfil (primer login)
      allow create: if isOwner(userId)
        && request.resource.data.keys().hasAll(['email', 'role', 'createdAt'])
        && request.resource.data.role in ['seller', 'buyer']  // no puede auto-asignarse admin
        && request.resource.data.email == request.auth.token.email;

      // Actualizar: solo campos permitidos; role solo lo cambia admin
      allow update: if isOwner(userId)
        && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role'])
        || isAdmin();
    }

    // ── /deals ────────────────────────────────────────────────
    match /deals/{dealId} {
      // Deals publicados: cualquiera puede leer (mercado público)
      allow read: if resource.data.status == 'published'
                     || resource.data.status == 'nda_phase'
                     || resource.data.status == 'loi_received';

      // El seller lee sus propios deals (todos los estados)
      allow read: if isAuthenticated() && isOwner(resource.data.ownerId);

      // Admin lee todo
      allow read: if isAdmin();

      // Seller crea deal — status forzado a under_review por las rules
      allow create: if isAuthenticated()
        && request.resource.data.ownerId == request.auth.uid
        && request.resource.data.status == 'under_review'
        && request.resource.data.keys().hasAll([
             'ownerId', 'nombreFantasia', 'industria', 'region',
             'descripcion', 'revenue', 'ebitda', 'askingPrice',
             'tipoSocietario', 'representante', 'email', 'status'
           ])
        // Validaciones de rango básicas
        && request.resource.data.revenue is int && request.resource.data.revenue > 0
        && request.resource.data.ebitda is int
        && request.resource.data.askingPrice is int && request.resource.data.askingPrice > 0;

      // Seller puede editar solo sus deals en estado draft/under_review
      // y no puede tocar campos inmutables
      allow update: if isOwner(resource.data.ownerId)
        && resource.data.status in ['draft', 'under_review']
        && noImmutableChange();

      // Admin puede hacer cualquier update (cambiar status, agregar aiScore, etc.)
      allow update: if isAdmin();

      // Nadie borra deals — se archivan cambiando status
      allow delete: if false;
    }

    // ── /ndas ─────────────────────────────────────────────────
    match /ndas/{ndaId} {
      // Buyer lee sus propios NDAs; seller lee NDAs de sus deals; admin lee todo
      allow read: if isAuthenticated() && (
        resource.data.buyerId == request.auth.uid
        || isAdmin()
        || get(/databases/$(database)/documents/deals/$(resource.data.dealId)).data.ownerId == request.auth.uid
      );

      // Solo buyers autenticados pueden crear una solicitud de NDA
      allow create: if isAuthenticated()
        && request.resource.data.buyerId == request.auth.uid
        && request.resource.data.status == 'pending'
        && request.resource.data.keys().hasAll(['dealId', 'buyerId', 'buyerName', 'buyerEmail', 'status', 'createdAt']);

      // Solo el comprador que lo creó puede firmarlo (pasar a 'signed')
      allow update: if isAuthenticated()
        && resource.data.buyerId == request.auth.uid
        && resource.data.status == 'pending'
        && request.resource.data.status == 'signed'
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'signedAt']);

      allow delete: if false;
    }

    // ── /notifications ────────────────────────────────────────
    match /notifications/{notifId} {
      // Solo el destinatario y el admin leen
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || isAdmin()
      );

      // Solo el sistema (via admin SDK / Cloud Function) crea — cliente no puede
      // En ausencia de Cloud Functions, solo el admin puede crear notificaciones
      allow create: if isAdmin();

      // Solo el destinatario marca como leído
      allow update: if isAuthenticated()
        && resource.data.userId == request.auth.uid
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read'])
        && request.resource.data.read == true;

      allow delete: if false;
    }

    // ── /auditLogs ────────────────────────────────────────────
    match /auditLogs/{logId} {
      // Seller ve logs de sus deals; admin ve todo
      allow read: if isAdmin()
        || (isAuthenticated()
            && get(/databases/$(database)/documents/deals/$(resource.data.dealId)).data.ownerId == request.auth.uid);

      // Cualquier usuario autenticado puede crear logs de sus propias acciones
      allow create: if isAuthenticated()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.keys().hasAll(['dealId', 'userId', 'userEmail', 'action', 'createdAt'])
        && request.resource.data.action in [
             'view_teaser', 'view_dataroom', 'download_doc', 'sign_nda', 'submit_ioi'
           ];

      // Audit logs son inmutables
      allow update, delete: if false;
    }

    // ── /documents ────────────────────────────────────────────
    match /documents/{docId} {
      // Solo quien firmó NDA o el seller o admin puede leer
      allow read: if isAdmin()
        || (isAuthenticated()
            && get(/databases/$(database)/documents/deals/$(resource.data.dealId)).data.ownerId == request.auth.uid);

      // El seller del deal puede subir documentos
      allow create: if isAuthenticated()
        && get(/databases/$(database)/documents/deals/$(request.resource.data.dealId)).data.ownerId == request.auth.uid
        && request.resource.data.uploadedBy == request.auth.uid;

      allow update, delete: if isAdmin();
    }

    // ── /leads ────────────────────────────────────────────────
    match /leads/{leadId} {
      // Solo admin puede leer leads (son datos comerciales sensibles)
      allow read: if isAdmin();

      // Cualquiera puede crear un lead (calculadora pública, sin auth requerida)
      allow create: if request.resource.data.keys().hasAll(['email', 'createdAt'])
        && request.resource.data.email is string
        && request.resource.data.email.size() > 3;

      allow update, delete: if isAdmin();
    }

    // ── Catch-all: deny everything else ──────────────────────
    match /{document=**} {
      allow read, write: if false;
    }

  }
}
