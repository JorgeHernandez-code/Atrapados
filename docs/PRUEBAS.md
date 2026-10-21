# Pruebas y control de calidad

Última ejecución: 2026-10-20 · `npm test` → **173 pruebas, 9 archivos, todas aprobadas** ·
`tsc --noEmit` sin errores · `npm run build` correcto.

```bash
npm test          # todas las pruebas
npm run simulate  # puntuación + simulación con detalle
```

## Archivos de prueba

| Archivo | Qué cubre |
|---|---|
| `src/lib/scoring.test.ts` | Integridad de datos, cálculo, empates, alcanzabilidad de los 14 personajes, simulación de equilibrio |
| `src/lib/quizBuilder.test.ts` | Sorteo: longitud, sin repetidas, cierre fijo, reproducible, tests distintos, opciones mezcladas, equilibrio |
| `src/lib/validation.test.ts` | Nombre y celular (normalización E.164, Colombia y otros países) |
| `src/lib/share.test.ts` | Mensaje para compartir, enlace sin datos personales, WhatsApp, CSV seguro |
| `src/services/leads.test.ts` | Sin consentimiento no hay envío, validación, backend no configurado, traducción de errores |
| `src/components/LeadForm.test.tsx` | Formulario: casilla desmarcada, enlace a la política, errores, envío normalizado, error del servidor |
| `src/pages/HomePage.test.tsx` | Portada, flujo completo, avanzar sin respuesta, retroceder, cambiar, reiniciar, teclado, sin backend |
| `src/pages/AdminPage.test.tsx` | Panel sin backend, sin sesión y con cuenta sin permisos |
| `supabase/tests/database.test.ts` | **Migración real en Postgres (PGlite)**: RLS, privilegios, validación del servidor, duplicados, límite de envíos, estadísticas |

## Lista de verificación

| # | Verificación | Resultado | Cómo |
|---|---|---|---|
| 1 | El proyecto compila | ✅ | `tsc --noEmit` y `vite build` |
| 2 | Pruebas disponibles | ✅ 173/173 | `npm test` |
| 3 | Todas las preguntas permiten seleccionar | ✅ | HomePage: recorre un test completo y comprueba cada grupo de opciones |
| 4 | Se puede retroceder | ✅ | HomePage: "permite retroceder y cambiar una respuesta" |
| 5 | Se puede reiniciar | ✅ | Con confirmación; genera un sorteo nuevo |
| 6 | Cálculo de puntuaciones | ✅ | scoring.test |
| 7 | Empates | ✅ | Tres reglas probadas por separado, incluido el sorteo reproducible |
| 8 | Todos los personajes se pueden obtener | ✅ | En el banco completo y en cada uno de 300 tests sorteados |
| 9 | Validación de nombre y celular | ✅ | Navegador (validation.test) y servidor (database.test) |
| 10 | Sin consentimiento no se envía nada | ✅ | Formulario, servicio y base de datos (`consent_required`) |
| 11 | Errores de la base de datos | ✅ | Red, servidor, límite y validación con mensajes distintos; nunca se simula éxito |
| 12 | Resultados sin backend | ✅ | Sin variables de Supabase el test y el resultado funcionan |
| 13 | Compartir | ✅ / ⚠️ | Texto, enlace y WhatsApp probados; tarjeta PNG generada y revisada en Chrome headless. **Web Share nativo no probado en un teléfono real** |
| 14 | Panel no público | ✅ | RLS probado en Postgres; la interfaz no muestra datos sin sesión de administrador |
| 15 | Móviles | ✅ / ⚠️ | Capturas a 390×844 y 1440×900 en Chrome headless. **Falta probar en teléfonos físicos (Android e iPhone)** |
| 16 | Accesibilidad básica | ✅ / ⚠️ | Etiquetas, `radiogroup`, foco al cambiar de pregunta, navegación por teclado probada, `aria-live`, contraste alto, `prefers-reduced-motion`. **No se probó con lector de pantalla real** |
| 17 | Sin secretos en el repositorio | ✅ | Búsqueda de claves y JWT; solo `.env.example` sin valores |

## Equilibrio del test (simulación)

20 000 tests sorteados, cada uno respondido al azar (uniforme ideal: 7,1 %):

| Personaje | % | Personaje | % |
|---|---|---|---|
| Hipólita | 6,2 | Candy | 7,7 |
| Sasha | 6,1 | Pachito | 7,1 |
| Clarita | 7,4 | Jhoncito | 6,7 |
| Enfermero Carvajal | 7,1 | Merlina | 6,1 |
| Minerva | 6,1 | Felipe | 6,9 |
| Yuli | 8,4 | Doc | 8,1 |
| Marianita | 10,2 | Enfermera Piedad | 6,0 |

Empates resueltos por sorteo: 1,1 %. La prueba falla si un personaje baja del 3 % o supera el 14 %.
Marianita queda algo por encima del promedio; si el equipo lo prefiere, se equilibra añadiendo
preguntas al banco.

## Pruebas de base de datos

`supabase/tests/database.test.ts` ejecuta la migración en PGlite (Postgres compilado a WebAssembly) con
los roles `anon` y `authenticated` y los privilegios por defecto de Supabase. Verifica, entre otros:

- `anon` **no** puede leer, contar, insertar, actualizar ni borrar `leads`; ni leer `quiz_events`,
  `admin_users` o `private.rate_limits`; ni ejecutar `admin_stats()`.
- Un usuario autenticado sin rol de administrador obtiene 0 filas y no puede hacerse administrador.
- El administrador lee, revoca y borra, pero no puede insertar contactos directamente ni cambiar nombres.
- `submit_lead` rechaza 9 tipos de entradas inválidas y no guarda nada cuando las rechaza.
- Un número repetido no se duplica ni sobrescribe el nombre.
- La IP solo se guarda como hash; el límite de 60 envíos / 10 min bloquea y no afecta a otra conexión.

**Limitación:** es Postgres real, pero no un proyecto Supabase real. Falta una prueba de punta a punta
contra el proyecto definitivo (ver README → pendientes).

## Prueba manual recomendada antes del estreno

1. Escanear el QR con 2–3 teléfonos distintos y completar el test.
2. Enviar el formulario con un número real del equipo y verlo en `/admin`.
3. Intentar enviar sin marcar la casilla.
4. Compartir por WhatsApp y comprobar la vista previa del enlace.
5. Descargar la tarjeta en Android e iPhone.
6. Exportar el CSV y abrirlo en Excel / Google Sheets.
7. Revocar y eliminar el contacto de prueba.
