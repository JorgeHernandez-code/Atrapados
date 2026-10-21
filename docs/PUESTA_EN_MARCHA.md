# Puesta en marcha (se hace una sola vez)

Todo se hace desde el navegador. No hay que instalar nada ni escribir código.
Tiempo aproximado: 30–40 minutos. Necesitas: la cuenta de GitHub donde está el proyecto y un correo.

Al terminar tendrás:

- La página publicada en internet (gratis), por ejemplo `https://atrapados.vercel.app`.
- La base de datos donde quedan los contactos (gratis).
- Una cuenta para que Freddy entre al panel `/admin`.

---

## Paso 1 — Crear la base de datos (Supabase)

1. Entra en <https://supabase.com> → **Start your project** → inicia sesión con GitHub.
2. **New project**:
   - *Name*: `atrapados`
   - *Database Password*: pulsa **Generate a password** y **guárdala** en un lugar seguro.
   - *Region*: **East US (North Virginia)** o la más cercana a Colombia que aparezca.
   - Pulsa **Create new project** y espera 1–2 minutos.
3. En el menú izquierdo abre **SQL Editor** → **New query**.
4. En GitHub abre el archivo
   [`supabase/migrations/20261020000000_init.sql`](../supabase/migrations/20261020000000_init.sql),
   pulsa el botón **Copy raw file** (icono de copiar), vuelve a Supabase, pega todo y pulsa **Run**.
   Debe decir *Success. No rows returned*.
5. Menú izquierdo → **Project Settings** (engranaje) → **API** (o **Data API** / **API Keys**). Copia en un bloc de notas:
   - **Project URL** (empieza por `https://` y termina en `.supabase.co`)
   - La clave **anon public** o **publishable** (texto largo).

   ⚠️ **No copies** la clave *service_role* / *secret*. Esa nunca se usa en este proyecto.

## Paso 2 — Bloquear el registro de desconocidos

1. Menú izquierdo → **Authentication** → **Sign In / Providers** (o *Providers*).
2. Desactiva **Allow new users to sign up** y guarda.

Así solo existen las cuentas que tú crees.

## Paso 3 — Publicar la página (Vercel)

1. Entra en <https://vercel.com> → **Sign up** → **Continue with GitHub**.
2. **Add New… → Project** → busca `Atrapados` → **Import**.
3. Abre **Environment Variables** y agrega estas tres (nombre exacto a la izquierda, valor a la derecha):

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | la Project URL del paso 1 |
   | `VITE_SUPABASE_ANON_KEY` | la clave anon/publishable del paso 1 |
   | `VITE_ANALYTICS_ENABLED` | `true` |

4. Pulsa **Deploy** y espera 1–2 minutos. Aparecerá la dirección de la página (por ejemplo
   `https://atrapados-xxxx.vercel.app`). Ábrela y comprueba que se ve el test.
5. Opcional: en **Settings → Domains** puedes cambiarla por una más corta, como `atrapados.vercel.app`.
6. Agrega una cuarta variable con la dirección definitiva y vuelve a publicar:
   - **Settings → Environment Variables** → `VITE_PUBLIC_SITE_URL` = `https://atrapados.vercel.app`
     (tu dirección, sin `/` al final).
   - **Deployments** → en el último, menú **⋯** → **Redeploy**.

Desde ahora, **cada cambio que se guarde en GitHub se publica solo** en 1–2 minutos.
Si un cambio tiene un error, Vercel no lo publica y deja funcionando la versión anterior.

## Paso 4 — Crear la cuenta de Freddy para el panel

1. En Supabase → **Authentication** → **Users** → **Add user** → **Create new user**.
   - Correo de Freddy y una contraseña segura. Marca **Auto Confirm User**.
2. **SQL Editor** → **New query** → pega esto cambiando el correo → **Run**:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'correo-de-freddy@ejemplo.com';
   ```

3. Repite con tu propio correo si también quieres acceso.
4. Prueba: abre `https://TU-DIRECCION/admin` e inicia sesión.

## Paso 5 — Completar los datos legales (obligatorio antes del estreno)

La ley colombiana exige decir quién es el responsable de los datos. Mientras falte, la página
`/privacidad` muestra avisos amarillos **[Pendiente]**.

1. En GitHub abre [`src/config/site.ts`](../src/config/site.ts) → icono del **lápiz** (Edit).
2. Busca `DATA_CONTROLLER` y cambia cada `null` por el dato entre comillas, por ejemplo:

   ```ts
   legalName: 'Nombre de la persona o entidad responsable' as string | null,
   idType: 'C.C.' as string | null,
   idNumber: '123456789' as string | null,
   address: 'Dirección, Ciudad' as string | null,
   email: 'correo@ejemplo.com' as string | null,
   ```

3. Abajo, **Commit changes** → **Commit changes**. En 2 minutos la página se actualiza.
4. Abre `/privacidad` y comprueba que ya no hay avisos amarillos.

Decidan con la universidad quién figura como responsable.

## Paso 6 — Prueba final y código QR

1. Desde tu celular: haz el test, deja tu nombre y número, y compártelo por WhatsApp.
2. Entra a `/admin` y verifica que apareces. Luego elimínate con el botón **Eliminar**.
3. Genera el QR con la dirección de la página (por ejemplo en <https://www.qr-code-generator.com>,
   tipo **URL**, versión **estática** / sin registro). Descárgalo en PNG o SVG.
4. Pruébalo con dos teléfonos distintos antes de imprimir. Mínimo 3 × 3 cm; imprímelo negro sobre
   blanco o negro sobre amarillo.

Listo. Entrega a Freddy la [Guía para Freddy](GUIA_FREDDY.md) con su correo y contraseña.
