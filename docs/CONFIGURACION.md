# Configuración

## 1. Datos editables de la obra

Todo está en **`src/config/site.ts`**:

| Bloque | Qué contiene |
|---|---|
| `SITE` | Título, frase, créditos, institución, texto académico, rutas del flyer |
| `EVENT` | Lugar, ciudad, dirección, fecha y hora. **El flyer no indica el año: se asumió 2026.** |
| `CONTACT` | Correo, teléfono y redes **oficiales**. Vacíos por defecto (no se inventaron). |
| `DATA_CONTROLLER` | Responsable del tratamiento de datos. **Obligatorio antes de publicar el formulario.** |
| `CONSENT` | Texto de autorización y su versión. Si cambias el texto, cambia la versión. |
| `FEATURES.SHOW_ACTOR_NAMES` | Mostrar intérpretes en el resultado (`false` hasta confirmar nombres). |

Personajes: `src/data/characters.ts`. Banco de preguntas: `src/data/questions.ts`.
Número de preguntas por test: `QUIZ_LENGTH` en `src/lib/quizBuilder.ts`.

Redes sociales, ejemplo:

```ts
social: [{ label: 'Instagram', url: 'https://www.instagram.com/CUENTA_OFICIAL' }],
```

Retratos oficiales (opcional): guarda `public/characters/<id>.jpg` y añade `imageId: '<id>'` al personaje.

## 2. Variables de entorno

Copia `.env.example` como `.env.local` (local) o configúralas en el hosting:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `VITE_SUPABASE_URL` | Para formulario y panel | Project URL de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Para formulario y panel | Clave pública *anon* / *publishable* |
| `VITE_PUBLIC_SITE_URL` | Recomendada | URL pública definitiva, sin `/` final. Se usa en los enlaces para compartir, la tarjeta y los metadatos para redes (`og:image` necesita una URL absoluta). |
| `VITE_ANALYTICS_ENABLED` | No | `true` para guardar métricas anónimas en Supabase |

**Nunca** pongas la `service_role` key ni la contraseña de la base de datos en estas variables:
todo lo que empieza por `VITE_` termina dentro del JavaScript público.

Sin las variables de Supabase el test y el resultado funcionan igual; el formulario muestra
"El registro de contactos no está disponible" y el panel indica que falta la configuración.
No se simula ningún registro.

## 3. Supabase

### 3.1 Crear el proyecto

1. Crea un proyecto en <https://supabase.com>. Elige la región (afecta dónde se guardan los
   datos; anótala en `DATA_CONTROLLER.processors`).
2. *Project Settings → API*: copia **Project URL** y la clave **anon/publishable** a las variables.

### 3.2 Crear las tablas y políticas

Opción A — SQL Editor: abre `supabase/migrations/20261020000000_init.sql`, pégalo completo y ejecútalo.

Opción B — CLI:

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

Crea: `characters`, `leads`, `quiz_events`, `admin_users`, el esquema privado `private.rate_limits`
y las funciones `submit_lead`, `track_event`, `admin_stats`, `is_admin`.

### 3.3 Qué puede hacer cada rol

| Rol | Puede | No puede |
|---|---|---|
| Visitante (`anon`) | Ejecutar `submit_lead()` y `track_event()` | Leer, insertar directamente, modificar o borrar cualquier tabla; ver estadísticas |
| Usuario autenticado no admin | Comprobar si él mismo es admin | Ver contactos o métricas, hacerse admin |
| Administrador | Leer contactos y métricas, marcar revocaciones, borrar contactos | Insertar contactos saltándose `submit_lead`, cambiar nombre o celular de un contacto |

`submit_lead` valida en el servidor: consentimiento `true`, nombre (2–60 letras), celular E.164
(celulares colombianos `+573…` de 10 dígitos), personaje válido, versión del texto, campo trampa
vacío y tiempo mínimo de llenado. Limita a 60 registros cada 10 minutos por conexión (la IP se guarda
solo como hash). Un número repetido no se duplica: se renueva la autorización y la respuesta es
idéntica para no revelar qué números están registrados.

Estas reglas están probadas contra Postgres real en `supabase/tests/database.test.ts`.

> El límite de 60 envíos / 10 min por IP es generoso a propósito: el público de una función puede
> compartir la misma red Wi-Fi. Ajústalo en `submit_lead` (`hit_rate_limit('lead', 600) > 60`).
> Si se detecta spam real, se recomienda añadir Cloudflare Turnstile validado en una Edge Function.

### 3.4 Crear cuentas administrativas

1. *Authentication → Providers → Email*: activado. **Desactiva "Allow new users to sign up"**
   (*Authentication → Sign In / Providers*), para que nadie pueda crear cuentas desde fuera.
   Aunque alguien lograra crear una, no vería datos: solo los usuarios en `admin_users` acceden.
2. *Authentication → Users → Add user*: crea la cuenta con correo y una contraseña robusta.
3. En el SQL Editor:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'correo-del-admin@ejemplo.com';
   ```

4. Entra en `https://TU-DOMINIO/admin`.

Para quitar acceso: `delete from public.admin_users where user_id = '...';`

### 3.5 Métricas

Con `VITE_ANALYTICS_ENABLED=true` se guardan en `quiz_events`: visita, inicio, finalización (con
personaje), vista de resultado, reinicio, clic en compartir (con canal) y envío de formulario.
Sin nombre, celular, respuestas, IP ni cookies; el identificador de sesión es aleatorio y vive solo en la
pestaña. El panel muestra totales, tasas y resultados por personaje.

Si se prefiere otro proveedor (Plausible, Umami…), usa `registerAnalyticsProvider()` en
`src/services/analytics.ts`. No se instaló ninguna herramienta publicitaria.

## 4. Ejecutar localmente

```bash
npm install
cp .env.example .env.local   # y completa los valores
npm run dev                   # http://localhost:5173
npm test                      # pruebas
npm run build                 # versión de producción en dist/
```

## 5. Publicar

La app es estática (SPA). Cualquier hosting sirve si redirige todas las rutas a `index.html`.

**Vercel**: importa el repositorio → Framework *Vite* → variables de entorno → *Deploy*.
`vercel.json` ya incluye la redirección y cabeceras de seguridad.

**Netlify**: build `npm run build`, carpeta `dist`. `public/_redirects` ya incluye la redirección.

Después de publicar:

1. Pon la URL definitiva en `VITE_PUBLIC_SITE_URL` y vuelve a desplegar.
2. Comprueba la vista previa del enlace en WhatsApp (usa `public/og-image.jpg`).
3. En Supabase, *Authentication → URL Configuration*: pon la URL del sitio como *Site URL*.

## 6. Código QR

1. Usa la URL definitiva con un parámetro de origen opcional, por ejemplo
   `https://TU-DOMINIO/?utm_source=qr&utm_medium=funcion` (la app lo ignora; sirve para
   analítica externa si se configura).
2. Genera el QR con cualquier generador **estático** (sin redirecciones de terceros que caduquen).
   Corrección de errores **M** o **Q**, para que se lea aunque el papel se arrugue.
3. Imprime negro sobre blanco o negro sobre amarillo (#FFF52B); evita amarillo sobre blanco.
   Tamaño mínimo recomendado: 3 × 3 cm para lectura a 30 cm; más grande para proyectarlo o
   ponerlo en una pared.
4. Escanéalo con varios teléfonos (Android e iPhone) antes de imprimir.
5. Texto sugerido junto al QR: *"¿Qué personaje de ATRAPADOS eres? Escanea y descúbrelo."*
