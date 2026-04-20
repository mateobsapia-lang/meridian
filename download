# Configurar notificaciones por email

Cuando alguien envía una empresa, querés recibir un email. Usamos **EmailJS** (gratis, 200 emails/mes).

## Pasos

1. **Crear cuenta** en https://www.emailjs.com

2. **Agregar servicio de email**
   - Email Services → Add New Service → Gmail
   - Conectar tu cuenta de Gmail
   - Copiar el **Service ID**

3. **Crear template**
   - Email Templates → Create New Template
   - Diseñar el email con estas variables:
   ```
   Nuevo deal recibido: {{deal_id}}
   Empresa: {{empresa}}
   Industria: {{industry}}
   Región: {{region}}
   Asking Price: {{asking}}
   Representante: {{from_name}}
   Email contacto: {{contact_email}}
   Ver en app: {{link}}
   ```
   - Copiar el **Template ID**

4. **Obtener Public Key**
   - Account → General → Public Key

5. **Pegar en el código**
   - Abrir `src/lib/notifications.ts` en GitHub
   - Reemplazar:
     - `TU_SERVICE_ID` → tu Service ID
     - `TU_TEMPLATE_ID` → tu Template ID  
     - `TU_PUBLIC_KEY` → tu Public Key
     - `TU_EMAIL@gmail.com` → tu email

6. **Instalar EmailJS** — agregar al package.json:
   ```json
   "@emailjs/browser": "^4.0.0"
   ```
   O editar `package.json` en GitHub y agregar esa línea en dependencies.

Listo — cada vez que alguien complete el SellerWizard y sea usuario logueado, te llega un email.
