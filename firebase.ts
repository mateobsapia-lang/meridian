rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function userRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    function isAdmin() { return request.auth != null && userRole() == 'admin'; }
    function isAuth() { return request.auth != null; }
    function isOwner(uid) { return request.auth != null && request.auth.uid == uid; }
    function noImmutable() {
      return !request.resource.data.diff(resource.data).affectedKeys()
        .hasAny(['ownerId','createdAt','status','aiScore','aiRecommendation','viewCount','ndaRequests','ndaSigned','dataRoomAccess','ioiCount']);
    }

    // USERS
    match /users/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow create: if isOwner(uid)
        && request.resource.data.keys().hasAll(['email','role','createdAt'])
        && request.resource.data.role in ['seller','buyer']
        && request.resource.data.email == request.auth.token.email;
      allow update: if (isOwner(uid) && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role'])) || isAdmin();
    }

    // DEALS
    match /deals/{dealId} {
      allow read: if resource.data.status in ['published','nda_phase','loi_received']
        || (isAuth() && isOwner(resource.data.ownerId)) || isAdmin();
      allow create: if isAuth()
        && request.resource.data.ownerId == request.auth.uid
        && request.resource.data.status == 'under_review';
      allow update: if (isOwner(resource.data.ownerId) && resource.data.status in ['draft','under_review'] && noImmutable()) || isAdmin();
      allow delete: if false;
    }

    // NDAs
    match /ndas/{ndaId} {
      allow read: if isAuth() && (
        resource.data.buyerId == request.auth.uid || isAdmin()
        || get(/databases/$(database)/documents/deals/$(resource.data.dealId)).data.ownerId == request.auth.uid
      );
      allow create: if isAuth() && request.resource.data.buyerId == request.auth.uid && request.resource.data.status == 'pending';
      allow update: if isAuth() && resource.data.buyerId == request.auth.uid
        && resource.data.status == 'pending' && request.resource.data.status == 'signed'
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status','signedAt']);
      allow delete: if false;
    }

    // NOTIFICATIONS
    match /notifications/{nid} {
      allow read: if isAuth() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAdmin();
      allow update: if isAuth() && resource.data.userId == request.auth.uid
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read'])
        && request.resource.data.read == true;
      allow delete: if false;
    }

    // AUDIT LOGS
    match /auditLogs/{logId} {
      allow read: if isAdmin() || (isAuth() && get(/databases/$(database)/documents/deals/$(resource.data.dealId)).data.ownerId == request.auth.uid);
      allow create: if isAuth() && request.resource.data.userId == request.auth.uid
        && request.resource.data.action in ['view_teaser','view_dataroom','download_doc','sign_nda','submit_ioi'];
      allow update, delete: if false;
    }

    // DOCUMENTS
    match /documents/{docId} {
      allow read: if isAdmin() || (isAuth() && get(/databases/$(database)/documents/deals/$(resource.data.dealId)).data.ownerId == request.auth.uid);
      allow create: if isAuth() && get(/databases/$(database)/documents/deals/$(request.resource.data.dealId)).data.ownerId == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    // LEADS (calculadora original)
    match /leads/{lid} {
      allow read: if isAdmin();
      allow create: if request.resource.data.keys().hasAll(['email','createdAt']) && request.resource.data.email is string && request.resource.data.email.size() > 3;
      allow update, delete: if isAdmin();
    }

    // LEAD MAGNETS — escritura pública (sin auth), lectura solo admin
    match /leads_diagnostico/{lid} {
      allow read: if isAdmin();
      allow create: if request.resource.data.keys().hasAll(['email','score','createdAt']) && request.resource.data.email is string;
      allow update, delete: if isAdmin();
    }
    match /leads_reporte/{lid} {
      allow read: if isAdmin();
      allow create: if request.resource.data.keys().hasAll(['email','industria','revenue','createdAt']) && request.resource.data.email is string;
      allow update, delete: if isAdmin();
    }
    match /leads_simulador/{lid} {
      allow read: if isAdmin();
      allow create: if request.resource.data.keys().hasAll(['email','ticketMin','ticketMax','createdAt']) && request.resource.data.email is string;
      allow update, delete: if isAdmin();
    }
    match /leads_buyers/{lid} {
      allow read: if isAdmin();
      allow create: if request.resource.data.keys().hasAll(['email','createdAt']) && request.resource.data.email is string;
      allow update, delete: if isAdmin();
    }

    // CATCH-ALL
    match /{document=**} { allow read, write: if false; }
  }
}
