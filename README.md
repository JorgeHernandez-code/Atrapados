# ATRAPADOS · ¿Qué personaje eres?

Experiencia web que acompaña la obra de teatro **ATRAPADOS** ("El silencio es obediencia. La rebeldía,
una amenaza"). Al terminar la función, el público escanea un QR, hace un test recreativo, descubre con
qué personaje tiene más afinidad, lo comparte y, si quiere, deja su nombre y celular para recibir
información de la obra.

> Actividad recreativa. No es una evaluación psicológica ni un diagnóstico.

## 👉 Empieza aquí

| Si eres… | Lee |
|---|---|
| Quien publica la página por primera vez | [docs/PUESTA_EN_MARCHA.md](docs/PUESTA_EN_MARCHA.md): paso a paso, sin programar |
| Freddy (uso diario, cambiar fecha o textos) | [docs/GUIA_FREDDY.md](docs/GUIA_FREDDY.md) |
| Quien vaya a modificar el código | El resto de este README y [docs/CONFIGURACION.md](docs/CONFIGURACION.md) |

## Funcionalidades

- Portada, explicación y sección de la obra con el flyer oficial.
- Test de **15 preguntas sorteadas de un banco de 28**: cada test es distinto (preguntas, orden y
  opciones), con sorteo equilibrado para que los 14 personajes tengan oportunidades reales.
- Una pregunta por pantalla, progreso, volver, cambiar respuestas, reiniciar, uso por teclado.
- Resultado con personaje, descripción, rasgos, frase, indicador de afinidad, explicación de qué
  respuestas influyeron y aviso de empate cuando corresponde.
- Compartir: menú nativo del teléfono, WhatsApp, copiar texto y tarjeta PNG para redes.
- Formulario opcional (nombre + celular) **después** del resultado, con autorización expresa.
- Política de datos en `/privacidad` (Ley 1581 de 2012) con los datos pendientes resaltados.
- Panel `/admin` con autenticación real: métricas, resultados por personaje, búsqueda, filtros,
  revocación, eliminación y exportación CSV.
- Métricas anónimas opcionales, sin herramientas publicitarias.

## Tecnologías

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · React Router 7 · Supabase (PostgreSQL + Auth) ·
Vitest + Testing Library · PGlite para probar la base de datos.

## Inicio rápido

```bash
npm install
cp .env.example .env.local   # completar (ver docs/CONFIGURACION.md)
npm run dev
npm test
npm run build
```

Sin variables de Supabase el test funciona por completo; el formulario y el panel avisan que falta
la configuración.

## Estructura

```
src/
  config/site.ts         ← datos editables: obra, evento, contacto, responsable, consentimiento
  data/characters.ts     ← 14 personajes
  data/questions.ts      ← banco de 28 preguntas y afinidades
  lib/scoring.ts         ← cálculo del resultado y desempates
  lib/quizBuilder.ts     ← sorteo equilibrado de cada test
  lib/validation.ts      ← nombre y celular (misma regla que la base de datos)
  lib/share.ts, shareCard.ts, csv.ts, supabase.ts, random.ts
  services/leads.ts      ← envío de contactos (RPC submit_lead)
  services/analytics.ts  ← capa de eventos independiente del proveedor
  services/admin.ts      ← consultas del panel
  hooks/useQuiz.ts       ← estado del test
  components/            ← Hero, QuizIntro, Quiz, QuizQuestion, QuizProgress, QuizResults,
                           CharacterCard, ShareResult, LeadForm, Header, Footer, PlaySection, TornEdge
  pages/                 ← HomePage, PrivacyPage, AdminPage
supabase/
  migrations/            ← tablas, RLS y funciones
  tests/                 ← pruebas de la migración en Postgres
docs/
  ANALISIS_PERSONAJES.md ← personajes, inconsistencias, preguntas originales y adaptadas
  CONFIGURACION.md       ← Supabase, variables, administradores, publicación, QR
  PRIVACIDAD_Y_DATOS.md  ← tratamiento de datos y obligaciones del organizador
  PRUEBAS.md             ← resultados de las pruebas
  fuentes/               ← documentos originales del equipo (solo local, NO se sube: contiene datos de intérpretes)
```

## Pendiente antes de usarla con público real

1. Completar `DATA_CONTROLLER` en `src/config/site.ts` (responsable legal y correo de atención) y
   revisar la política con quien corresponda.
2. Crear el proyecto Supabase, aplicar la migración, crear la cuenta administrativa y desactivar el
   registro público (docs/CONFIGURACION.md §3).
3. Publicar, configurar `VITE_PUBLIC_SITE_URL` y volver a desplegar.
4. Prueba de punta a punta con el Supabase real y en teléfonos físicos (docs/PRUEBAS.md).
5. Confirmar con el equipo: año de la función, intérpretes (I-5 del análisis), la referencia
   "Felipe / Camilo Sesto" y la grafía de los nombres.
6. Añadir contacto y redes oficiales en `CONTACT` (vacíos para no inventarlos).
7. Generar e imprimir el QR (docs/CONFIGURACION.md §6).
