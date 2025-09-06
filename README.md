
# server/ (Render + Postgres) — Autologin & Guard

Servidor listo para desplegar en **Render Free** con **Postgres**.
Incluye panel admin en `/admin` y APIs para la extensión Operador.

## Rápido (Blueprint)
1. Sube esta carpeta a un repo y en Render usa **Blueprints** para desplegar `render.yaml`.
2. Render creará:
   - Web service **autologin-remote** (free)
   - Postgres **autologin-db** (free)
3. Cambia las env vars `ADMIN_PASS` y `ORG_API_KEY` tras desplegar.

## Manual
- **Build:** `npm install`
- **Start:** `node server.js`
- **ENV obligatorias:**
  - `DATABASE_URL` → cadena de conexión Postgres (Render la inyecta si usas el blueprint).
  - `ADMIN_PASS` → password para panel/API admin (cabecera `X-Admin-Auth`).
  - `ORG_API_KEY` → clave para la extensión (cabecera `X-Org-Key`).
  - `PORT` (opcional, por defecto 8787).

## Endpoints
- `GET /admin` → panel estático.
- `POST /api/admin/site?org=<id>` (X-Admin-Auth) → upsert de sitio.
- `POST /api/admin/cred?org=<id>` (X-Admin-Auth) → guarda credenciales **cifradas** (blob AES-GCM).
- `GET /api/admin/list?org=<id>` (X-Admin-Auth) → estado actual.
- `DELETE /api/admin/reset?org=<id>` (X-Admin-Auth) → vacía org.
- `GET /api/config?org=<id>` (X-Org-Key) → lo consume la extensión Operador.

## Modelo de datos
Tabla `config(id text PK, data jsonb, updated_at timestamptz)`.
- `id` = Organization ID (p. ej. `default`)
- `data` = `{ "sites": [...], "credentials": { [siteKey]: {ciphertext, iv, salt} } }`

> Las credenciales se cifran **en el navegador del admin**. El servidor sólo guarda blobs cifrados.

## Seguridad básica
- Cambia `ADMIN_PASS` y `ORG_API_KEY`.
- Restrinje CORS si quieres (dominio del panel/extensión).
- Pon el panel tras VPN si lo necesitas.

