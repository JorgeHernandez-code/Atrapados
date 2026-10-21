# Guía para Freddy

Hola, Freddy. Esta página es el test **"¿Qué personaje de ATRAPADOS eres?"**. El público escanea un
código QR al final de la función, responde unas preguntas y descubre a qué personaje se parece.
Quien quiera puede dejar su nombre y celular para recibir noticias de la obra.

No necesitas saber programar. Lo único que harás es **entrar al panel** y, de vez en cuando,
**cambiar algún texto**.

---

## 1. Lo que necesitas tener a mano

| Qué | Dónde |
|---|---|
| Dirección de la página | Te la da Jorge (por ejemplo `https://atrapados.vercel.app`) |
| Panel de contactos | La misma dirección terminada en **`/admin`** |
| Tu correo y contraseña del panel | Te los da Jorge |
| Cuenta de GitHub (solo para cambiar textos) | Jorge te da acceso al proyecto |

## 2. El día de la función

1. Pon el código QR donde el público lo vea al salir (programa de mano, pantalla, cartel).
2. Antes de abrir sala, escanéalo tú mismo para confirmar que la página abre.
3. Frase sugerida para decir o poner junto al QR:
   *"¿Qué personaje de ATRAPADOS eres? Escanea y descúbrelo."*

## 3. Ver los contactos (panel)

1. Abre la dirección de la página terminada en **`/admin`** y entra con tu correo y contraseña.
2. Arriba verás un **resumen**: cuántas personas visitaron la página, cuántas hicieron el test,
   cuántas compartieron y cuántas dejaron sus datos. También qué personaje salió más.
3. Abajo está la **lista de contactos**. Puedes:
   - **Buscar** por nombre.
   - **Filtrar** por personaje o por consentimiento (*Vigente* / *Revocado*).
   - **Exportar CSV**: descarga la lista para abrirla en Excel o Google Sheets.
4. Al terminar, pulsa **Cerrar sesión**, sobre todo si el computador no es tuyo.

### Reglas importantes al usar los contactos

- Escribe **solo** sobre la obra, nuevas funciones y actividades del grupo. Para eso dieron permiso.
- **No** agregues a nadie a grupos de WhatsApp sin preguntarle antes.
- Antes de enviar mensajes, exporta solo los contactos con consentimiento **Vigente**.
- Si alguien responde **"NO MÁS"** o pide que no le escriban: búscalo en el panel y pulsa **Revocar**.
- Si alguien pide que **borren** sus datos: pulsa **Eliminar** (no se puede deshacer).
- No compartas el archivo CSV con personas ajenas al equipo y bórralo cuando ya no lo necesites.

## 4. Cambiar la fecha, el lugar u otros textos

Sirve, por ejemplo, para anunciar una nueva función.

1. Entra en <https://github.com/JorgeHernandez-code/Atrapados> con tu cuenta.
2. Abre la carpeta **`src`** → **`config`** → archivo **`site.ts`**.
3. Pulsa el **lápiz** ✏️ (arriba a la derecha, "Edit this file").
4. Cambia **solo el texto que está entre comillas `'...'`**. Por ejemplo, en la parte `EVENT`:

   ```ts
   venue: 'Auditorio Casa de la Cultura',   ← nombre del lugar
   city: 'Sibaté',                          ← ciudad
   address: 'Calle 10 No. 8-01',            ← dirección
   dayLabel: '07',                          ← día (dos números)
   monthLabel: 'Noviembre',                 ← mes
   timeLabel: '12:00 p. m.',                ← hora
   ```

   Ten cuidado de **no borrar las comillas, las comas ni los dos puntos**.
5. Pulsa el botón verde **Commit changes…** y otra vez **Commit changes**.
6. Espera 2 minutos y recarga la página: el cambio ya está publicado.

Si te equivocas y algo queda mal escrito, **la página no se daña**: el sistema detecta el error y
mantiene la versión anterior. Avísale a Jorge, que puede deshacer el cambio.

En ese mismo archivo también puedes completar:

- `CONTACT`: correo, teléfono y redes oficiales del grupo (aparecen al pie de la página).
- `DATA_CONTROLLER`: datos del responsable legal (ver la guía de puesta en marcha, paso 5).

## 5. Cambiar el flyer

1. En GitHub abre la carpeta **`public`**.
2. **Add file → Upload files** y sube el nuevo flyer con **exactamente estos nombres**,
   para reemplazar los actuales:
   - `flyer-atrapados.jpg` (tamaño original, ideal 1080 × 1350)
   - `flyer-atrapados-640.jpg` (el mismo, más pequeño: 640 × 800)
3. **Commit changes**.

## 6. Usar el proyecto en otra obra

| Qué quieres hacer | ¿Lo puedes hacer tú? |
|---|---|
| Otra función de ATRAPADOS (nueva fecha o lugar) | ✅ Sí, con la sección 4 |
| Cambiar flyer, frase o créditos | ✅ Sí, secciones 4 y 5 |
| Una obra nueva **con otros personajes y preguntas** | ⚠️ Necesitas ayuda técnica |

Para una obra nueva, quien te ayude debe cambiar:

1. `src/data/characters.ts`: los personajes.
2. `src/data/questions.ts`: el banco de preguntas.
3. La lista de personajes de la base de datos.

Le tomará unas horas. Entrégale el documento de personajes de la nueva obra y el archivo
`docs/ANALISIS_PERSONAJES.md`, que sirve de modelo.

Consejo: antes de empezar otra obra, **exporta y guarda el CSV** de los contactos de ATRAPADOS.

## 7. Si algo no funciona

| Problema | Qué hacer |
|---|---|
| La página no abre | Revisa la conexión. Si sigue igual, avisa a Jorge. |
| El formulario dice "no está disponible" | La base de datos puede estar en pausa: el plan gratuito de Supabase pausa los proyectos sin uso tras unos días. Jorge la reactiva en supabase.com → proyecto → **Restore**. El test sigue funcionando igual. |
| No puedes entrar al panel | Revisa el correo y la contraseña. Jorge puede cambiarla en Supabase → Authentication → Users. |
| El panel dice "Sin permisos" | Tu cuenta existe, pero falta darle acceso (guía de puesta en marcha, paso 4). |

> Recuerda: el test es un juego inspirado en la obra. No es una evaluación psicológica.
