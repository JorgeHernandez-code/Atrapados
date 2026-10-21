# Privacidad y tratamiento de datos

Este documento describe cómo trata la aplicación los datos personales y qué **debe completar el
equipo organizador** antes de usar el formulario con público real. La aplicación aplica medidas
técnicas razonables, pero **no garantiza por sí sola el cumplimiento** de la Ley 1581 de 2012 ni del
Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015). Se recomienda una revisión jurídica.

## Qué se recoge

| Dato | Cuándo | Dónde |
|---|---|---|
| Nombre, celular (E.164) | Solo si la persona envía el formulario con la autorización marcada | `leads` |
| Personaje obtenido | Junto al formulario (se informa en pantalla) | `leads.preferred_character` |
| Fecha y versión del texto de autorización | Junto al formulario | `leads.consented_at`, `consent_text_version` |
| Eventos de uso anónimos | Solo con `VITE_ANALYTICS_ENABLED=true` | `quiz_events` (sin datos personales) |
| Hash de la IP | Para limitar envíos automatizados | `private.rate_limits` (se purga pasadas 24 h) |

No se recogen correo, documento, dirección, fecha de nacimiento, información médica, respuestas
individuales del test ni cookies de seguimiento. El resultado se ve sin entregar datos.

## Cómo se cumple cada característica del consentimiento

| Requisito | Implementación |
|---|---|
| Informado | El texto y el enlace a `/privacidad` están junto a la casilla; la política se abre en otra pestaña para no perder el resultado. Se avisa que se guarda el personaje. |
| Expreso | Casilla **desmarcada** por defecto; sin marcarla el formulario no se envía (validado en el navegador y en la base de datos). |
| Específico | El texto se limita a información sobre la obra y actividades relacionadas. |
| Verificable | Cada registro guarda la fecha y la versión exacta del texto aceptado (`CONSENT.version`). |
| Separado del test | El formulario aparece después del resultado, es opcional y no condiciona nada. |

## Obligaciones pendientes del organizador (antes de producción)

- [ ] Completar en `src/config/site.ts` → `DATA_CONTROLLER`: nombre o razón social, tipo y número de
      identificación, domicilio y correo de atención. Mientras falten, `/privacidad` los muestra
      resaltados como **[Pendiente]**.
- [ ] Decidir quién es el responsable (¿la universidad, el programa, una persona del equipo?) y
      confirmarlo con la institución.
- [ ] Revisar y aprobar el texto de la política y el plazo de conservación (`retention`).
- [ ] Actualizar la lista de proveedores (`processors`) con la región real de Supabase y el hosting.
- [ ] Designar a la persona que atenderá consultas (10 días hábiles) y reclamos (15 días hábiles).
- [ ] Definir cómo se enviarán los mensajes. Si se usa WhatsApp: **no** agregar a nadie a grupos sin
      una autorización específica; enviar solo información de la obra; atender "NO MÁS" (lo promete la
      política) registrando la revocación en el panel.
- [ ] Antes de cada envío masivo, exportar solo contactos con consentimiento **vigente** (filtro del panel).
- [ ] Guardar los CSV exportados en un lugar con acceso restringido y borrarlos cuando no se necesiten.
- [ ] Al terminar el plazo de conservación, borrar los registros (SQL: `delete from public.leads where created_at < ...`).
- [ ] Evaluar si se requiere inscribir la base de datos en el Registro Nacional de Bases de Datos (RNBD)
      de la SIC (depende de la naturaleza jurídica del responsable).
- [ ] Desactivar el registro público de cuentas en Supabase Auth y usar contraseñas robustas para el panel.

## Atención de solicitudes desde el panel

| Solicitud | Acción |
|---|---|
| Revocar autorización | Botón **Revocar**: guarda la fecha; el contacto sigue en la base como prueba, marcado "Revocado". |
| Supresión | Botón **Eliminar**: borra el registro definitivamente. |
| Rectificación del nombre | No se permite desde el panel (privilegio por columna). Hacerlo en el SQL Editor de Supabase tras verificar la identidad. |
| Acceso / prueba de autorización | Buscar por nombre y compartir fecha y versión del texto aceptado. |

## Seguridad aplicada

- RLS activo en todas las tablas; el visitante anónimo no tiene ningún privilegio directo sobre ellas.
- Inserción solo mediante `submit_lead` (`SECURITY DEFINER`, `search_path` vacío) con validación propia.
- El panel depende de Supabase Auth + `admin_users` comprobado en la base de datos, no de ocultar la ruta.
- Ninguna clave secreta en el frontend; `.env*` está en `.gitignore`.
- Exportación CSV protegida contra inyección de fórmulas.
- `/admin` marcado `noindex` y excluido en `robots.txt`.
