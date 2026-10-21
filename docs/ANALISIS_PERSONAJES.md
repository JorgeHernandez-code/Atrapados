# Análisis de personajes — ATRAPADOS

Documento de trabajo generado **antes** de implementar el test. Resume lo que se extrajo de los
archivos entregados por el equipo teatral, las inconsistencias detectadas y las decisiones tomadas
para el test recreativo.

## 0. Fuentes analizadas

| Archivo | Contenido | Uso |
|---|---|---|
| `Personajes.docx` | 14 perfiles con rasgos. Sin preguntas. | Referencia |
| `Personajes (2).docx` (también enviado como PDF) | Los mismos 14 perfiles **más** 12 bloques de 3 preguntas de ejemplo. | **Fuente principal** |
| Flyer oficial (`public/flyer-atrapados.jpg`) | 1080×1350. | Dirección de arte, datos del evento, imagen para compartir |

Los documentos originales se guardan fuera del repositorio (carpeta local `docs/fuentes/`, excluida
de git) porque incluyen datos de los intérpretes.

La versión 2 contiene íntegramente a la versión 1; no hay contradicciones entre ambas, solo
contenido añadido (las preguntas).

### Datos extraídos del flyer

- Título: **ATRAPADOS**.
- Frase: *"El silencio es obediencia. La rebeldía, una amenaza."*
- "Una obra de: X semestre – Lic. Educación Artística". Aparecen los logos de la Universidad del Tolima.
- Lugar: Auditorio Casa de la Cultura, Sibaté — Calle 10 No. 8-01.
- Fecha: 07 de noviembre, 12:00 p. m. (**el flyer no indica el año**; se asumió 2026 en la configuración).
- Texto académico: la obra integra las asignaturas Didáctica del Teatro, Juegos y Deportes para Niños
  con Necesidades Educativas Especiales y Seminario Nuevas Tendencias en Educación Artística,
  articulando el arte, la inclusión y la exploración escénica.
- Paleta: negro, blanco/grises y amarillo intenso; papel rasgado, grano, fotografías en blanco y negro.

Todos estos datos viven en `src/config/site.ts`.

## 1. Personajes encontrados (14)

La columna "Intérprete" indica si el documento asocia un nombre propio al personaje. **Los nombres
no se incluyen en este repositorio porque es público** y el documento los asocia a rasgos sensibles
(p. ej. "Depresivo", "TOC"). Están en el documento original del equipo, fuera del repositorio. La
aplicación no muestra intérpretes hasta que el equipo los confirme y lo active (`SHOW_ACTOR_NAMES`).

| # | Id | Personaje | Intérprete en el documento | Rasgos originales (literal) |
|---|---|---|---|---|
| 1 | `hipolita` | Hipólita | Sí | Obsesivo, TOC, Angustia, Perfección, Tímido, Inquieto |
| 2 | `sasha` | Sasha | Sí | Sensualidad, Lealtad, Extrovertida, Impulsiva, Alegre |
| 3 | `clarita` | Clarita | Sí | Ansiosa, Nostalgia, Impaciente, Nerviosa, Infantil |
| 4 | `carvajal` | Enfermero Carvajal | Sí | Engreído, Manipulable, Apático, Imponente, Fuerte |
| 5 | `minerva` | Minerva | — | Imitadora, Tímida, Ansiosa, Reprimida, Dependiente (+ nota: "ecopraxia y ecolalia, imita movimientos y palabras involuntariamente") |
| 6 | `yuli` | Yuli | Sí | Rebelde, Agresiva, Ansiosa, Grosera, Manipuladora |
| 7 | `marianita` | Marianita (Mariana Buenaventura) | Sí | Religión, Voces, Influencia, Grosera, Tic |
| 8 | `candy` | Candy (Candy Pérez) | Sí | Coqueta, Segura, Extrovertida, Atrevida, Alegre |
| 9 | `pachito` | Pachito | Dudoso (I-5) | Furia, Frío, Compulsivo, Enojado, Gritón |
| 10 | `jhoncito` | Jhoncito | Sí | Ansioso, Depresivo, Inseguro, Tartamudo, Complejo de Edipo |
| 11 | `merlina` | Merlina | Sí | Silenciosa, Aislada, Culpable, Observadora, Leal |
| 12 | `felipe` | Felipe (en las preguntas: "Felipe / Camilo Sesto") | — | Inseguro, Dependiente, Aspiracionista, Soñador, Copiador |
| 13 | `doc` | Doc | — | Educado, Culto, Inseguro, Tímido, Solitario |
| 14 | `piedad` | Enfermera Piedad | — | Seria, Psicorrígida, Mal humorada, Autoritaria, Disciplinada, Organizada |

No se encontraron personajes duplicados: los 14 nombres de la lista del encargo corresponden a los
14 perfiles del documento.

## 2. Inconsistencias detectadas

| # | Inconsistencia | Decisión |
|---|---|---|
| I-1 | "Mariana buenaventura" en los perfiles vs. "Marianita" en las preguntas. | Mismo personaje. Nombre visible: **Marianita**; `fullName`: "Mariana Buenaventura". |
| I-2 | "Candy Perez" vs. "Candy". | Nombre visible **Candy**; `fullName`: "Candy Pérez". |
| I-3 | "Jhohcito" (errata) vs. "Jhoncito". | Nombre visible **Jhoncito**. Se corrige "Jhohcito". |
| I-4 | "Felipe" vs. "Felipe / Camilo Sesto". | Se interpreta que Felipe imita o admira a Camilo Sesto (encaja con "copiador/soñador"). Nombre visible **Felipe**; la referencia queda en `notes`, sin usarla en la interfaz hasta que el equipo la confirme. |
| I-5 | Los nombres asociados a Pachito y a Jhoncito son casi idénticos, y en el caso de Pachito no queda claro si es el intérprete o el nombre completo del personaje. | No se usan. **Confirmar con el equipo.** |
| I-6 | Formato desigual: unos perfiles usan `Intérprete: Personaje`, otros solo el personaje (Minerva, Felipe, Doc, Enfermera Piedad), otros el nombre propio encima del personaje (Hipólita, Yuli, Marianita, Pachito). | Campo `actor` opcional y `actorConfirmed`. |
| I-7 | Hipólita tiene rasgos en masculino ("Obsesivo", "Tímido", "Inquieto"). | En la interfaz se usan formas femeninas o neutras. |
| I-8 | "Sería" (errata) en Enfermera Piedad. | Se corrige a "Seria". |
| I-9 | "¿Suites actuar por impulso…?" (errata) en Yuli. | Se corrige a "¿Sueles…?". |
| I-10 | **Sasha y Enfermero Carvajal no tienen preguntas** en el documento (solo hay 12 bloques para 14 personajes). | Se diseñaron opciones nuevas para ellos a partir de sus rasgos documentados. |
| I-11 | Los bloques de preguntas están numerados del 2 al 12; el de Yuli no tiene número. | Sin impacto; se usan identificadores propios. |
| I-12 | Cada bloque lleva etiquetas clínicas ("Antisocial", "Obsesivo-Compulsiva", "Esquizoide", "Delirante", "Disociativo", "Histriónico", "Evitativo"…). Minerva incluye "ecopraxia y ecolalia". Jhoncito incluye "Depresivo", "Tartamudo" y "Complejo de Edipo". | **No se muestran al público.** Se conservan en `originalTraits`/`sourceLabel` como referencia de trabajo y en la interfaz se usan descripciones de conducta, no de diagnóstico (ver §4). |
| I-13 | Los rasgos del documento están en sustantivo o adjetivo según el personaje ("Religión", "Voces", "Furia"). | Se normalizan a rasgos descriptivos para la tarjeta de resultado. |

## 3. Preguntas originales (literal, con erratas corregidas entre corchetes)

**Yuli (Antisocial / Rebelde)**
1. ¿Te molesta profundamente seguir reglas que consideras absurdas y prefieres romperlas?
2. ¿Su[el]es actuar por impulso, buscando la diversión o el conflicto sin medir las consecuencias?
3. ¿Te consideras una persona capaz de manipular a otros con facilidad para conseguir lo que quieres?

**Enfermera Piedad (Obsesivo-Compulsiva / Autoritaria)**
1. ¿Te irrita cuando las cosas no se hacen exactamente bajo el orden, la disciplina y las reglas establecidas?
2. ¿Te cuesta trabajo ser flexible y ceder ante las opiniones de los demás en pro de la organización?
3. ¿Sientes que si tú no controlas las situaciones, todo terminará en un caos total?

**Merlina (Esquizoide / Aislada)**
1. ¿Prefieres pasar largas horas en silencio dentro de tu propio mundo mental antes que socializar?
2. ¿Te cuesta expresar tus emociones o te perciben como alguien sumamente distante y frío?
3. ¿Te consideras un "observador silencioso" que prefiere ver la vida pasar desde la retaguardia?

**Jhoncito (Ansioso / Dependiente)**
1. ¿Te da pánico la idea de decepcionar a las figuras de autoridad o a tus padres, incluso en la adultez?
2. ¿Sueles tartamudear, bloquearte o ponerte extremadamente nervioso cuando te enamoras o te sientes presionado?
3. ¿Te cuesta creer en ti mismo y dependes mucho de la validación o el cariño de los demás?

**Marianita (Delirante / Mística)**
1. ¿Alguna vez has sentido que fuerzas invisibles, energías o presencias extrañas te observan o te hablan a solas?
2. ¿Encuentras refugio absoluto en la religión, rituales o rezos constantes para lidiar con el mundo real?
3. ¿Sientes que tienes percepciones o revelaciones que el resto de las personas comunes no logran comprender?

**Pachito (Explosivo / Iracundo)**
1. ¿Sientes que la ira se apodera de ti con mucha facilidad y te cuesta contener los gritos cuando te frustras?
2. ¿Las personas suelen decir que tienes un trato frío y cortante, pero que estallas de la nada?
3. ¿Te cuesta perdonar los agravios y guardas resentimiento acumulado que se convierte en furia?

**Minerva (Ecopraxia / Imitadora)**
1. ¿Te ocurre a veces que, por nerviosismo, repites inconscientemente frases o movimientos de la gente que te rodea?
2. ¿Te consideras una persona extremadamente tímida, reprimida y con miedo a destacar por cuenta propia?
3. ¿Sientes que te cuesta tomar decisiones individuales y prefieres ampararte en los movimientos de un grupo?

**Hipólita (TOC de Limpieza / Perfeccionista)**
1. ¿Sientes una necesidad constante y angustiante de limpiar, ordenar o desinfectar tu entorno?
2. ¿Te carcome la ansiedad si notas que algo está fuera de su lugar o si percibes gérmenes a tu alrededor?
3. ¿Te consideras un individuo hiper-perfeccionista al que le cuesta relajarse por completo?

**Felipe / Camilo Sesto (Histriónico / Disociativo)**
1. ¿Te gusta imaginar que eres otra persona, un artista o alguien famoso para escapar de tu dura realidad?
2. ¿Te describes a ti mismo como un "soñador empedernido" que vive en su propia fantasía?
3. ¿Dependes mucho de la atención de los demás para sentir que tu vida tiene un escenario y un propósito?

**Clarita (Regresiva / Infantil)**
1. Ante situaciones de fuerte estrés o presión, ¿tiendes a hacer pataletas o a reaccionar de forma infantil?
2. ¿Te cuesta una enormidad afrontar conversaciones adultas serias y prefieres reírte nerviosamente o evadirlas?
3. ¿Te sientes profundamente impaciente y reprimida por normas que sientes que te ahogan como a un niño?

**Doc (Evitativo / Inhibido)**
1. ¿Prefieres mantener una distancia formal y culta con la gente antes que involucrarte emocionalmente en sus problemas?
2. ¿A pesar de tener un rol de liderazgo o educación, te invade un sentimiento interno de inseguridad?
3. ¿Disfrutas de la soledad y buscas refugio en tus propios intereses intelectuales (como el arte o los libros)?

**Candy (Histriónica / Extrovertida)**
1. ¿Te encanta ser el centro de atención, usar ropa llamativa y coquetear para dinamizar el ambiente?
2. ¿Te consideras una persona audaz, sumamente alegre y extrovertida que odia el aburrimiento?
3. ¿Sientes que tu seguridad personal brilla más cuando estás rodeada de gente celebrando o bebiendo?

## 4. Preguntas que se proponen modificar y por qué

Las 36 preguntas originales tienen formato **sí/no** y cada una describe a un único personaje. Usadas
tal cual, el test sería muy predecible (cada pregunta "delata" a su personaje) y varias se acercan a un
cuestionario clínico. Por eso se convierten en un **banco de 28 situaciones cotidianas con 4–5
opciones**, donde cada opción suma afinidad a 1–3 personajes. Cada pregunta indica en `sourceRefs`
de qué preguntas originales parte. Cada test sortea 15 de ellas (ver §6).

> Nota: las referencias "P10", "P14-D", etc. de la tabla siguiente corresponden a los identificadores
> `q10-…`, `q14-…` de `src/data/questions.ts`. La matriz definitiva de afinidades está en ese archivo.

Criterios aplicados:

- Se eliminan las etiquetas clínicas y los términos diagnósticos (TOC, ecopraxia, ecolalia, depresivo,
  delirante, esquizoide, antisocial, complejo de Edipo, disociativo, histriónico).
- Se reemplazan intensificadores que patologizan ("angustiante", "pánico", "absoluto", "te carcome",
  "extremadamente") por descripciones de conducta en tono lúdico.
- No se pregunta por síntomas (oír voces, gérmenes, tartamudez, ira incontrolable, consumo de alcohol).
- Se mantiene la esencia teatral de cada personaje.

| Original | Problema | Versión en el test |
|---|---|---|
| Marianita P1 — "fuerzas invisibles… te hablan a solas" | Describe una experiencia que puede asociarse a un síntoma psicótico. | P10: "¿Crees en las señales, la intuición o en algo que no se ve?" → "Sí, siento que hay algo más grande que me guía." |
| Marianita P2 — "refugio absoluto en la religión, rituales o rezos constantes" | Juzga creencias religiosas. | P14-D: "Rezo, enciendo una vela o busco una señal." P12-E: espacio con "imágenes, velas y objetos que me dan paz." |
| Hipólita P1–P2 — "necesidad angustiante de limpiar… gérmenes" | Describe el TOC como síntoma. | P12-A: "Impecable: cada cosa en su lugar." P14-B: "Limpio u ordeno algo para calmarme." |
| Jhoncito P2 — "¿Sueles tartamudear…?" | Señala una condición del habla. | P11-B: "Me pongo nervioso, se me traba la lengua y no digo nada." |
| Jhoncito P1 — "Te da pánico decepcionar…" | "Pánico" patologiza. | P4 y P16-E: "Me da miedo decepcionar o equivocarme." |
| Pachito P1–P3 — "la ira se apodera de ti… resentimiento que se convierte en furia" | Formulado como problema de control de la ira. | P7-A: "Me quedo frío y cortante… hasta que exploto." P13-A: "Respondo más fuerte. No me dejo." |
| Minerva P1 — "repites inconscientemente frases o movimientos" | Describe ecolalia/ecopraxia. | P1-C y P8-A: "Me pego a alguien conocido y hago lo que el grupo haga." |
| Merlina P2 — "sumamente distante y frío" | Etiqueta negativa. | P7-C: "Me lo guardo y lo cargo en silencio." P16-A: "Con el silencio: observo, callo y espero mi momento." |
| Felipe P1 — "escapar de tu dura realidad" | Insinúa disociación. | P9-A: "Un artista famoso, con luces y un público que coree mi nombre." |
| Candy P3 — "celebrando o bebiendo" | Asocia el rasgo al consumo de alcohol. | Se omite "bebiendo". P5-C: "Salir, bailar y que no se acabe la noche." |
| Yuli P3 — "capaz de manipular a otros" | Rasgo negativo directo. | P13-B: "Le doy la vuelta para que termine haciendo lo que yo quiero." |
| Clarita P1 — "hacer pataletas" | Se conserva en tono lúdico. | P2-D: "Hago pataleta… y luego busco cómo saltármela." |
| Piedad P3 — "todo terminará en un caos total" | Aceptable, se suaviza. | P2-B: "La cumplo: sin reglas todo se vuelve un caos." |
| *(Sasha — sin preguntas)* | — | Lealtad e impulsividad: P6-A "Voy sin pensarlo; por los míos lo que sea", P3-B "Improviso", P10-D "Creo en mí y en el momento". |
| *(Carvajal — sin preguntas)* | — | Imponente, apático y manipulable: P2-E "Depende de quién la ponga", P7-E "Me da igual", P13-C "Lo miro desde arriba", P15-E "Decir que no cuando alguien fuerte me lo pide". |

La pregunta 16 usa la frase del flyer como cierre temático:
*"El silencio es obediencia. La rebeldía, una amenaza. ¿Con qué te identificas más?"*

## 5. Rasgos públicos (lo que ve el participante)

| Personaje | Arquetipo para el test | Rasgos visibles |
|---|---|---|
| Hipólita | La del orden perfecto | Perfeccionista · Meticulosa · Inquieta · Reservada |
| Sasha | La leal sin frenos | Leal · Extrovertida · Impulsiva · Alegre · Magnética |
| Clarita | La nostálgica impaciente | Nostálgica · Impaciente · Espontánea · Nerviosa |
| Enfermero Carvajal | El imponente | Imponente · Fuerte · Seguro de sí · Influenciable · Desapegado |
| Minerva | El espejo | Tímida · Contenida · Imitadora · Busca al grupo |
| Yuli | La rebelde | Rebelde · Frontal · Persuasiva · Inquieta |
| Marianita | La mística | Espiritual · Intuitiva · Sin filtro · Influenciable |
| Candy | La chispa | Coqueta · Segura · Atrevida · Alegre · Extrovertida |
| Pachito | El volcán | Intenso · Frío por fuera · Explosivo · Directo |
| Jhoncito | El corazón nervioso | Sensible · Inseguro · Nervioso bajo presión · Apegado a los suyos |
| Merlina | La observadora silenciosa | Silenciosa · Observadora · Leal · Introspectiva |
| Felipe | El soñador de escenario | Soñador · Aspiracionista · Imita a sus ídolos · Necesita público |
| Doc | El erudito solitario | Educado · Culto · Solitario · Inseguro en silencio |
| Enfermera Piedad | La autoridad | Disciplinada · Organizada · Firme · Seria · Exigente |

Las frases representativas de cada personaje se crearon **para esta experiencia** y no se presentan
como diálogos de la obra (la interfaz lo indica).

## 6. Sistema de puntuación y sorteo

**Cada test es diferente** (solicitud del equipo durante el desarrollo):

- El banco tiene 28 preguntas. Cada test sortea **15**: 14 al azar y, siempre al final, la pregunta
  de la frase de la obra ("El silencio es obediencia…"), que funciona como cierre temático.
- El orden de las preguntas y el de las opciones de cada pregunta también se mezclan.
- El sorteo es **equilibrado**: se repite hasta que cada uno de los 14 personajes sea la opción
  principal en al menos 2 de las preguntas elegidas (`src/lib/quizBuilder.ts`).
- Usa una semilla aleatoria guardada en la pestaña: si la persona recarga la página a mitad del test,
  conserva sus preguntas y respuestas. "Repetir" genera un sorteo nuevo.
- Se pueden añadir preguntas al banco sin tocar el código; las pruebas comprueban que el sorteo siga
  equilibrado y que todos los personajes sigan siendo alcanzables.

Puntuación:

- Una pregunta por pantalla, con 4 o 5 opciones.
- Cada opción reparte afinidad: **2 puntos** al personaje que mejor representa esa conducta y
  **1 punto** a uno o dos personajes con una tendencia parecida.
- Ninguna pregunta asigna todas sus opciones a un solo personaje.
- `src/lib/scoring.ts` (función pura, sin estado):
  1. Suma los puntos de cada personaje.
  2. Calcula para cada personaje su **máximo alcanzable** (la suma, pregunta a pregunta, de la mayor
     puntuación que puede recibir) y la **afinidad relativa** = puntos / máximo alcanzable.
  3. Ordena por afinidad relativa, que compensa que algunos personajes aparezcan en más opciones
     que otros.
  4. **Desempate** (reproducible): (a) mayor afinidad relativa; (b) más respuestas en las que el
     personaje recibió 2 puntos; (c) mayor puntuación en la última pregunta (la temática del
     flyer); (d) selección pseudoaleatoria con semilla derivada de las respuestas: mismas
     respuestas, mismo resultado. Si el empate llega a (d), la interfaz lo dice ("Tu resultado
     quedó compartido con…") en lugar de presentarlo como una conclusión.
  5. Devuelve: personaje ganador, ranking, afinidad relativa, personajes empatados, regla de
     desempate usada y las respuestas que más aportaron (para la explicación).
- El porcentaje se presenta como "afinidad en este test", nunca como probabilidad ni medición
  psicológica.
- El máximo alcanzable se calcula sobre las preguntas que le tocaron a esa persona, así que la
  afinidad es comparable entre tests distintos.
- Las pruebas (`src/lib/scoring.test.ts`, `src/lib/quizBuilder.test.ts`) verifican que **cada uno de
  los 14 personajes puede obtenerse en cada test sorteado** (300 sorteos revisados) y simulan 20 000
  tests aleatorios para revisar el equilibrio (resultados en `docs/PRUEBAS.md`).
