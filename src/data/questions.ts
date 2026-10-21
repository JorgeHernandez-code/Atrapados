import type { Question } from '../types/question';

/**
 * Banco de preguntas del test. Cada test sortea QUIZ_LENGTH preguntas de este banco
 * y mezcla sus opciones (ver src/lib/quizBuilder.ts). Para agregar preguntas, basta con
 * añadirlas aquí: las pruebas verifican que el sorteo siga equilibrado.
 * - affinity: 2 = el personaje que mejor representa la opción; 1 = tendencia cercana.
 * - note: tendencia que expresa la opción (se usa para explicar el resultado).
 * - sourceRefs: preguntas originales del documento ("<personaje>-<n>") o "nuevo:<personaje>"
 *   cuando la opción se creó a partir de los rasgos porque el documento no traía preguntas.
 * Ver docs/ANALISIS_PERSONAJES.md.
 */
export const QUESTIONS: Question[] = [
  {
    id: 'q01-fiesta',
    text: 'Llegas a una fiesta donde casi no conoces a nadie. ¿Qué haces?',
    sourceRefs: ['candy-1', 'candy-3', 'merlina-1', 'minerva-3', 'nuevo:carvajal'],
    options: [
      { id: 'a', text: 'Me presento y en diez minutos ya estoy en el centro de la pista.', affinity: { candy: 2, sasha: 2, felipe: 1 }, note: 'Buscas la energía del grupo' },
      { id: 'b', text: 'Busco un rincón tranquilo y observo cómo se mueve todo.', affinity: { merlina: 2, doc: 1, hipolita: 1 }, note: 'Prefieres observar antes de exponerte' },
      { id: 'c', text: 'Me pego a alguien conocido y hago lo que haga el grupo.', affinity: { minerva: 2, jhoncito: 1, clarita: 1 }, note: 'Te apoyas en los demás para sentirte seguro' },
      { id: 'd', text: 'Noto todo lo que está fuera de lugar… y me cuesta relajarme.', affinity: { hipolita: 2, piedad: 1 }, note: 'Tu atención se va al orden y al detalle' },
      { id: 'e', text: 'Me quedo en una esquina con cara de que nada me impresiona.', affinity: { carvajal: 2, pachito: 1 }, note: 'Proyectas distancia y aplomo' },
    ],
  },
  {
    id: 'q02-regla',
    text: 'Alguien impone una regla que te parece absurda. ¿Qué haces?',
    sourceRefs: ['yuli-1', 'piedad-1', 'clarita-3', 'nuevo:carvajal'],
    options: [
      { id: 'a', text: 'La rompo. Las reglas sin sentido están para eso.', affinity: { yuli: 2, candy: 1 }, note: 'Desafías la autoridad sin rodeos' },
      { id: 'b', text: 'La cumplo: sin reglas, todo se vuelve un caos.', affinity: { piedad: 2, hipolita: 1 }, note: 'Confías en el orden y la disciplina' },
      { id: 'c', text: 'Me quejo por dentro, pero obedezco en silencio.', affinity: { jhoncito: 2, minerva: 1, merlina: 1 }, note: 'Callas para evitar el conflicto' },
      { id: 'd', text: 'Hago pataleta… y después busco cómo saltármela.', affinity: { clarita: 2, yuli: 1 }, note: 'Reaccionas con impaciencia ante los límites' },
      { id: 'e', text: 'Depende de quién la ponga: si lo dice alguien con poder, la sigo.', affinity: { minerva: 2, carvajal: 1, felipe: 1 }, note: 'Te guías por quien tiene la autoridad' },
    ],
  },
  {
    id: 'q03-planes',
    text: 'Cuando una situación se sale de tus planes, ¿cómo reaccionas?',
    sourceRefs: ['piedad-3', 'yuli-2', 'nuevo:sasha', 'marianita-3'],
    options: [
      { id: 'a', text: 'Intento recuperar el control y organizarlo todo.', affinity: { piedad: 2, hipolita: 1 }, note: 'Necesitas recuperar el control' },
      { id: 'b', text: 'Improviso y busco una salida diferente.', affinity: { sasha: 2, candy: 1, yuli: 1 }, note: 'Improvisas con soltura' },
      { id: 'c', text: 'Me tomo un momento para observar antes de actuar.', affinity: { doc: 2 }, note: 'Analizas antes de moverte' },
      { id: 'd', text: 'Reacciono con lo que siento en ese instante, aunque explote.', affinity: { pachito: 2, clarita: 1 }, note: 'Tus emociones salen primero' },
      { id: 'e', text: 'Pienso que pasó por algo; ya llegará una señal.', affinity: { marianita: 2, minerva: 1 }, note: 'Buscas un sentido más grande' },
    ],
  },
  {
    id: 'q04-error',
    text: 'Te equivocas delante de alguien que admiras o que tiene autoridad sobre ti.',
    sourceRefs: ['jhoncito-1', 'clarita-2', 'hipolita-3', 'pachito-1', 'nuevo:carvajal'],
    options: [
      { id: 'a', text: 'Me bloqueo, se me enredan las palabras y quiero desaparecer.', affinity: { jhoncito: 2, minerva: 1 }, note: 'Te pesa decepcionar a los demás' },
      { id: 'b', text: 'Me río nerviosamente para que no se note.', affinity: { clarita: 2, jhoncito: 1 }, note: 'Usas la risa para escapar de la tensión' },
      { id: 'c', text: 'Lo repaso mil veces en mi cabeza esa noche.', affinity: { hipolita: 2, doc: 1, merlina: 1 }, note: 'Te exiges mucho a ti mismo' },
      { id: 'd', text: 'Actúo como si nada: no me equivoqué, cambié de idea.', affinity: { carvajal: 2 }, note: 'Proteges tu imagen de seguridad' },
      { id: 'e', text: 'Me enojo conmigo y se me nota en la cara.', affinity: { pachito: 2, yuli: 1 }, note: 'La frustración se te nota enseguida' },
    ],
  },
  {
    id: 'q05-tiempo-libre',
    text: '¿Cómo sería tu tarde libre ideal?',
    sourceRefs: ['doc-3', 'felipe-1', 'candy-2', 'hipolita-1', 'marianita-2'],
    options: [
      { id: 'a', text: 'Leyendo, viendo cine de autor o perdido en un museo.', affinity: { doc: 2, merlina: 1 }, note: 'Te refugias en el mundo intelectual' },
      { id: 'b', text: 'Cantando frente al espejo como si fuera un concierto.', affinity: { felipe: 2, candy: 1 }, note: 'Sueñas con un escenario propio' },
      { id: 'c', text: 'Con amigos, bailando, que no se acabe la noche.', affinity: { candy: 2, sasha: 1 }, note: 'Te recarga estar rodeado de gente' },
      { id: 'd', text: 'Ordenando y dejando todo impecable.', affinity: { hipolita: 2, piedad: 1 }, note: 'El orden te da calma' },
      { id: 'e', text: 'Con calma, una vela encendida y música que me conecte con algo más grande.', affinity: { marianita: 2, merlina: 1 }, note: 'Buscas conexión espiritual' },
    ],
  },
  {
    id: 'q06-amigo',
    text: 'Un amigo está en problemas y te pide ayuda a última hora.',
    sourceRefs: ['nuevo:sasha', 'merlina-3', 'doc-1', 'pachito-3'],
    options: [
      { id: 'a', text: 'Voy sin pensarlo. Por los míos, lo que sea.', affinity: { sasha: 2, merlina: 1 }, note: 'Tu lealtad va por delante' },
      { id: 'b', text: 'Ayudo, pero con un plan claro, paso a paso.', affinity: { piedad: 1, hipolita: 1, doc: 1 }, note: 'Ayudas con método' },
      { id: 'c', text: 'Lo escucho y lo aconsejo, pero sin involucrarme demasiado.', affinity: { doc: 2 }, note: 'Mantienes una distancia prudente' },
      { id: 'd', text: 'Voy, y si alguien le hizo daño… me va a escuchar.', affinity: { pachito: 2, yuli: 1 }, note: 'Defiendes con intensidad' },
    ],
  },
  {
    id: 'q07-molestia',
    text: 'Algo te molesta mucho. ¿Cómo lo expresas?',
    sourceRefs: ['pachito-1', 'pachito-2', 'yuli-1', 'merlina-2', 'felipe-3', 'nuevo:carvajal'],
    options: [
      { id: 'a', text: 'Me quedo frío y cortante… hasta que exploto.', affinity: { pachito: 2, piedad: 1 }, note: 'Acumulas hasta estallar' },
      { id: 'b', text: 'Lo digo sin filtro, aunque suene grosero.', affinity: { yuli: 2, marianita: 1 }, note: 'Dices lo que piensas sin filtro' },
      { id: 'c', text: 'Me lo guardo y lo cargo en silencio.', affinity: { merlina: 2, jhoncito: 1 }, note: 'Guardas tus emociones para ti' },
      { id: 'd', text: 'Hago drama: que todo el mundo se entere de lo que siento.', affinity: { clarita: 1, felipe: 1, candy: 1 }, note: 'Expresas todo a lo grande' },
      { id: 'e', text: 'Me da igual. No gasto energía en eso.', affinity: { carvajal: 2 }, note: 'Te muestras indiferente' },
    ],
  },
  {
    id: 'q08-grupo',
    text: '¿Qué papel sueles tener en un grupo?',
    sourceRefs: ['minerva-2', 'minerva-3', 'piedad-2', 'candy-1', 'yuli-1'],
    options: [
      { id: 'a', text: 'Sigo lo que hacen los demás; así me siento más seguro.', affinity: { minerva: 2, felipe: 1 }, note: 'Te mueves con el grupo' },
      { id: 'b', text: 'Marco el ritmo y los demás me siguen.', affinity: { piedad: 2, carvajal: 1 }, note: 'Asumes el mando' },
      { id: 'c', text: 'Soy el alma de la fiesta.', affinity: { candy: 2, sasha: 1 }, note: 'Contagias energía' },
      { id: 'd', text: 'Soy quien desafía al grupo cuando algo no cuadra.', affinity: { yuli: 2, pachito: 1 }, note: 'Cuestionas lo establecido' },
      { id: 'e', text: 'Me quedo a un lado, pero me doy cuenta de todo.', affinity: { merlina: 2, minerva: 1 }, note: 'Observas desde la orilla' },
    ],
  },
  {
    id: 'q09-otra-persona',
    text: 'Si pudieras ser otra persona por un día, serías…',
    sourceRefs: ['felipe-1', 'yuli-1', 'doc-3', 'nuevo:carvajal', 'clarita-3'],
    options: [
      { id: 'a', text: 'Un artista famoso, con luces y un público que corea mi nombre.', affinity: { felipe: 2, candy: 1 }, note: 'Sueñas con el aplauso' },
      { id: 'b', text: 'Alguien que no tenga que rendirle cuentas a nadie.', affinity: { yuli: 2, sasha: 1 }, note: 'Anhelas libertad total' },
      { id: 'c', text: 'Seguiría siendo yo: me gusta mi mundo interior.', affinity: { doc: 2, minerva: 1 }, note: 'Valoras tu mundo interior' },
      { id: 'd', text: 'Alguien con poder, a quien todos respeten sin discutir.', affinity: { carvajal: 2, piedad: 1 }, note: 'Te atrae imponer respeto' },
      { id: 'e', text: 'Un niño otra vez, sin responsabilidades.', affinity: { clarita: 2, jhoncito: 1 }, note: 'Extrañas la infancia' },
    ],
  },
  {
    id: 'q10-senales',
    text: '¿Crees en las señales, la intuición o en algo que no se ve?',
    sourceRefs: ['marianita-1', 'marianita-3', 'doc-1', 'nuevo:sasha'],
    options: [
      { id: 'a', text: 'Sí. Siento que hay algo más grande que me guía.', affinity: { marianita: 2, clarita: 1 }, note: 'Confías en lo que no se ve' },
      { id: 'b', text: 'A veces. Tengo mis rituales y mis amuletos.', affinity: { hipolita: 1, clarita: 1, jhoncito: 1 }, note: 'Los rituales te dan seguridad' },
      { id: 'c', text: 'Solo creo en lo que se puede comprobar.', affinity: { doc: 2, carvajal: 1 }, note: 'Prefieres la razón y la evidencia' },
      { id: 'd', text: 'Creo en mí y en el momento.', affinity: { sasha: 2, candy: 1 }, note: 'Vives el presente' },
    ],
  },
  {
    id: 'q11-amor',
    text: 'Te gusta alguien. ¿Qué pasa?',
    sourceRefs: ['candy-1', 'jhoncito-2', 'felipe-2', 'merlina-3', 'nuevo:sasha'],
    options: [
      { id: 'a', text: 'Coqueteo sin miedo: si me gusta, se lo hago saber.', affinity: { candy: 2, sasha: 1 }, note: 'Te atreves sin rodeos' },
      { id: 'b', text: 'Me pongo nervioso, se me traba la lengua… y no digo nada.', affinity: { jhoncito: 2, minerva: 1 }, note: 'Los nervios te frenan' },
      { id: 'c', text: 'Lo vivo con intensidad, como una canción romántica.', affinity: { felipe: 2, sasha: 1 }, note: 'Lo vives como en una canción' },
      { id: 'd', text: 'Lo observo de lejos y lo guardo como un secreto.', affinity: { merlina: 2, doc: 1 }, note: 'Lo guardas en silencio' },
      { id: 'e', text: 'Hago una lista de pros y contras.', affinity: { hipolita: 1, piedad: 1 }, note: 'Lo analizas con orden' },
    ],
  },
  {
    id: 'q12-espacio',
    text: 'Tu espacio ideal es…',
    sourceRefs: ['hipolita-1', 'clarita-3', 'doc-3', 'marianita-2', 'nuevo:sasha'],
    options: [
      { id: 'a', text: 'Impecable: cada cosa en su lugar.', affinity: { hipolita: 2 }, note: 'El orden es tu refugio' },
      { id: 'b', text: 'Lleno de recuerdos, peluches y fotos de cuando era pequeño.', affinity: { clarita: 2, jhoncito: 1 }, note: 'Te acompaña la nostalgia' },
      { id: 'c', text: 'Libros, discos y arte por todas partes.', affinity: { doc: 2, felipe: 1 }, note: 'Te rodeas de cultura' },
      { id: 'd', text: 'Me da igual el lugar; lo importante es con quién estoy.', affinity: { sasha: 2, candy: 1 }, note: 'Lo que importa es la gente' },
      { id: 'e', text: 'Con imágenes, velas y objetos que me dan paz.', affinity: { marianita: 2, merlina: 1 }, note: 'Buscas un espacio espiritual' },
    ],
  },
  {
    id: 'q13-provocacion',
    text: 'Alguien te desafía o te provoca.',
    sourceRefs: ['pachito-1', 'yuli-3', 'nuevo:carvajal', 'merlina-1', 'jhoncito-3'],
    options: [
      { id: 'a', text: 'Respondo más fuerte. No me dejo.', affinity: { pachito: 2, yuli: 1, marianita: 1 }, note: 'Respondes con fuerza' },
      { id: 'b', text: 'Le doy la vuelta para que termine haciendo lo que yo quiero.', affinity: { yuli: 2, candy: 1 }, note: 'Sabes persuadir' },
      { id: 'c', text: 'Lo miro desde arriba: no está a mi altura.', affinity: { carvajal: 2 }, note: 'Te sabes imponente' },
      { id: 'd', text: 'Me alejo y me voy a mi mundo.', affinity: { merlina: 1, doc: 1, minerva: 1 }, note: 'Te retiras a tu mundo' },
      { id: 'e', text: 'Le pregunto a alguien de confianza qué debería hacer.', affinity: { jhoncito: 2, felipe: 1 }, note: 'Buscas apoyo en otros' },
    ],
  },
  {
    id: 'q14-presion',
    text: 'Cuando estás bajo mucha presión…',
    sourceRefs: ['clarita-1', 'hipolita-2', 'jhoncito-3', 'marianita-2', 'nuevo:carvajal'],
    options: [
      { id: 'a', text: 'Me pongo impaciente: quiero que todo pase ya.', affinity: { clarita: 2, pachito: 1 }, note: 'La impaciencia te gana' },
      { id: 'b', text: 'Limpio u ordeno algo para calmarme.', affinity: { hipolita: 2, piedad: 1 }, note: 'Ordenas para calmarte' },
      { id: 'c', text: 'Me paralizo y espero que alguien me rescate.', affinity: { jhoncito: 2, minerva: 1 }, note: 'Esperas el apoyo de otros' },
      { id: 'd', text: 'Rezo, enciendo una vela o busco una señal.', affinity: { marianita: 2, jhoncito: 1 }, note: 'Te refugias en tu fe' },
      { id: 'e', text: 'Sigo como si nada… o eso aparento.', affinity: { carvajal: 2, merlina: 1 }, note: 'Aparentas que nada te afecta' },
    ],
  },
  {
    id: 'q15-cuesta',
    text: '¿Qué es lo que más te cuesta?',
    sourceRefs: ['piedad-2', 'felipe-3', 'doc-1', 'doc-2', 'pachito-1', 'nuevo:carvajal'],
    options: [
      { id: 'a', text: 'Ceder: si no se hace a mi manera, me cuesta.', affinity: { piedad: 2, hipolita: 1 }, note: 'Te cuesta ser flexible' },
      { id: 'b', text: 'Creer que valgo sin que nadie me lo diga.', affinity: { felipe: 2, jhoncito: 1 }, note: 'Buscas la validación de los demás' },
      { id: 'c', text: 'Abrirle mi corazón a otras personas.', affinity: { doc: 2, merlina: 1 }, note: 'Te cuesta mostrar lo que sientes' },
      { id: 'd', text: 'Quedarme callado cuando algo me saca de quicio.', affinity: { pachito: 2, sasha: 1, yuli: 1 }, note: 'No sabes callar lo que te molesta' },
      { id: 'e', text: 'Decir que no cuando alguien fuerte me lo pide.', affinity: { carvajal: 2, minerva: 1 }, note: 'Te dejas influenciar' },
    ],
  },
  {
    id: 'q17-chisme',
    text: 'Te enteras de un chisme sobre alguien cercano.',
    sourceRefs: ['candy-2', 'merlina-1', 'yuli-1', 'jhoncito-3', 'piedad-1'],
    options: [
      { id: 'a', text: 'Lo cuento de inmediato: ¡no me lo puedo guardar!', affinity: { candy: 2, clarita: 1 }, note: 'Te encanta compartir lo que pasa' },
      { id: 'b', text: 'Me lo guardo. No me corresponde contarlo.', affinity: { merlina: 2, doc: 1 }, note: 'Sabes guardar secretos' },
      { id: 'c', text: 'Le pregunto a la persona directamente, sin rodeos.', affinity: { yuli: 2, sasha: 1 }, note: 'Vas de frente' },
      { id: 'd', text: 'Me preocupa que algún día hablen así de mí.', affinity: { jhoncito: 2, minerva: 1 }, note: 'Te inquieta lo que piensen de ti' },
      { id: 'e', text: 'Corto la conversación: los chismes rompen la convivencia.', affinity: { piedad: 2, pachito: 1 }, note: 'Pones límites claros' },
    ],
  },
  {
    id: 'q18-cumpleanos',
    text: 'Organizas tu cumpleaños. ¿Cómo es?',
    sourceRefs: ['candy-2', 'hipolita-3', 'doc-3', 'felipe-3', 'clarita-3'],
    options: [
      { id: 'a', text: 'Una fiesta enorme, con música y todos mis amigos.', affinity: { candy: 2, sasha: 1 }, note: 'Celebras a lo grande' },
      { id: 'b', text: 'Todo planeado al minuto, con lista de invitados y horarios.', affinity: { hipolita: 2, piedad: 1 }, note: 'Nada queda al azar' },
      { id: 'c', text: 'Una cena pequeña con dos personas de confianza.', affinity: { doc: 2, merlina: 1 }, note: 'Prefieres la intimidad' },
      { id: 'd', text: 'Con show incluido: yo canto o hago una presentación.', affinity: { felipe: 2, candy: 1 }, note: 'Necesitas tu escenario' },
      { id: 'e', text: 'Como cuando era pequeño: torta, globos y juegos.', affinity: { clarita: 2, jhoncito: 1 }, note: 'Vuelves a la infancia' },
    ],
  },
  {
    id: 'q19-fila',
    text: 'Llevas mucho tiempo en una fila y alguien se cuela.',
    sourceRefs: ['pachito-1', 'piedad-1', 'minerva-2', 'nuevo:carvajal', 'candy-2'],
    options: [
      { id: 'a', text: 'Le reclamo en voz alta: esto no se queda así.', affinity: { pachito: 2, marianita: 1 }, note: 'Reaccionas en caliente' },
      { id: 'b', text: 'Llamo a quien esté a cargo para que haga cumplir las reglas.', affinity: { piedad: 2, hipolita: 1 }, note: 'Haces respetar las normas' },
      { id: 'c', text: 'Me molesta, pero no digo nada.', affinity: { minerva: 2, jhoncito: 1 }, note: 'Te contienes' },
      { id: 'd', text: 'Lo miro fijamente hasta que se sienta incómodo.', affinity: { carvajal: 2, merlina: 1 }, note: 'Impones con la mirada' },
      { id: 'e', text: 'Hago un comentario gracioso para que todos se rían.', affinity: { candy: 1, clarita: 1, sasha: 1 }, note: 'Usas el humor' },
    ],
  },
  {
    id: 'q20-regalo',
    text: 'Te regalan algo que no te gusta nada.',
    sourceRefs: ['yuli-1', 'jhoncito-3', 'marianita-3', 'nuevo:carvajal'],
    options: [
      { id: 'a', text: 'Digo la verdad: no es lo mío.', affinity: { yuli: 2, marianita: 1 }, note: 'Eres sincero sin filtro' },
      { id: 'b', text: 'Sonrío y lo agradezco muchísimo, para no herir a nadie.', affinity: { jhoncito: 2, minerva: 1 }, note: 'Cuidas no decepcionar' },
      { id: 'c', text: 'Lo guardo: quizá tenga un significado que aún no entiendo.', affinity: { marianita: 2, clarita: 1 }, note: 'Buscas significados ocultos' },
      { id: 'd', text: 'Me da igual; se lo regalo a otra persona.', affinity: { carvajal: 2 }, note: 'No te apegas' },
    ],
  },
  {
    id: 'q21-musica',
    text: '¿Qué música te acompaña?',
    sourceRefs: ['felipe-1', 'candy-2', 'doc-3', 'pachito-1', 'marianita-2'],
    options: [
      { id: 'a', text: 'Baladas románticas que canto a todo pulmón.', affinity: { felipe: 2, jhoncito: 1 }, note: 'Vives la música como un ídolo' },
      { id: 'b', text: 'Lo que esté sonando en la fiesta.', affinity: { candy: 2, sasha: 1 }, note: 'Te mueve el ambiente' },
      { id: 'c', text: 'Música clásica o jazz, mientras leo.', affinity: { doc: 2, hipolita: 1 }, note: 'Buscas refinamiento' },
      { id: 'd', text: 'Rock pesado, para sacar la rabia.', affinity: { pachito: 2, yuli: 1 }, note: 'Descargas tu intensidad' },
      { id: 'e', text: 'Cantos que me den paz y me conecten con algo más grande.', affinity: { marianita: 2, merlina: 1 }, note: 'Buscas calma espiritual' },
    ],
  },
  {
    id: 'q22-mentira',
    text: 'Descubres que alguien te mintió.',
    sourceRefs: ['pachito-3', 'merlina-2', 'jhoncito-3', 'piedad-1', 'yuli-3'],
    options: [
      { id: 'a', text: 'Exploto: no tolero que me vean la cara.', affinity: { pachito: 2 }, note: 'Reaccionas con fuerza' },
      { id: 'b', text: 'Me alejo en silencio y no vuelvo a confiar igual.', affinity: { merlina: 2, doc: 1 }, note: 'Te retiras en silencio' },
      { id: 'c', text: 'Pienso que fue culpa mía, que algo hice mal.', affinity: { jhoncito: 2, minerva: 1 }, note: 'Cargas con la culpa' },
      { id: 'd', text: 'Lo enfrento con pruebas en la mano, punto por punto.', affinity: { piedad: 2, hipolita: 1 }, note: 'Ordenas los hechos' },
      { id: 'e', text: 'Le hago creer que no me di cuenta… y espero mi momento.', affinity: { yuli: 2, carvajal: 1 }, note: 'Juegas tus cartas con calma' },
    ],
  },
  {
    id: 'q23-grupo-tarea',
    text: 'Te asignan un trabajo en grupo.',
    sourceRefs: ['piedad-2', 'minerva-3', 'hipolita-3', 'felipe-2', 'yuli-1'],
    options: [
      { id: 'a', text: 'Reparto funciones y vigilo que todo se cumpla.', affinity: { piedad: 2, carvajal: 1 }, note: 'Tomas el control' },
      { id: 'b', text: 'Hago lo que me digan; prefiero no decidir.', affinity: { minerva: 2, jhoncito: 1 }, note: 'Sigues al grupo' },
      { id: 'c', text: 'Reviso todo dos veces hasta que quede perfecto.', affinity: { hipolita: 2, doc: 1 }, note: 'Buscas la perfección' },
      { id: 'd', text: 'Pongo las ideas locas; que otro ponga el orden.', affinity: { felipe: 1, clarita: 1, candy: 1 }, note: 'Aportas imaginación' },
      { id: 'e', text: 'Lo hago a mi manera, aunque no sea lo que pidieron.', affinity: { yuli: 2, pachito: 1 }, note: 'Vas por tu cuenta' },
    ],
  },
  {
    id: 'q24-infancia',
    text: 'Cuando recuerdas tu infancia…',
    sourceRefs: ['clarita-3', 'jhoncito-1', 'marianita-2', 'nuevo:sasha', 'doc-3'],
    options: [
      { id: 'a', text: 'Me dan ganas de volver: todo era más fácil.', affinity: { clarita: 2, felipe: 1 }, note: 'Te gana la nostalgia' },
      { id: 'b', text: 'Pienso en lo que esperaban de mí y en no decepcionarlos.', affinity: { jhoncito: 2, piedad: 1 }, note: 'Te importa cumplir expectativas' },
      { id: 'c', text: 'Recuerdo rezos, celebraciones y tradiciones familiares.', affinity: { marianita: 2, minerva: 1 }, note: 'Te marcan las tradiciones' },
      { id: 'd', text: 'Prefiero no mirar atrás: lo importante es ahora.', affinity: { sasha: 2, carvajal: 1 }, note: 'Vives el presente' },
      { id: 'e', text: 'Recuerdo los libros y los juegos que hacía a solas.', affinity: { doc: 2, merlina: 1 }, note: 'Disfrutabas tu propio mundo' },
    ],
  },
  {
    id: 'q25-espejo',
    text: 'Te miras al espejo antes de salir.',
    sourceRefs: ['candy-1', 'felipe-1', 'hipolita-3', 'minerva-2', 'nuevo:carvajal'],
    options: [
      { id: 'a', text: 'Me encanta lo que veo. ¡A brillar!', affinity: { candy: 2, sasha: 1 }, note: 'Te sientes seguro' },
      { id: 'b', text: 'Ensayo poses como si fuera una estrella.', affinity: { felipe: 2, candy: 1 }, note: 'Te imaginas en escena' },
      { id: 'c', text: 'Reviso cada detalle: nada puede estar fuera de lugar.', affinity: { hipolita: 2, piedad: 1 }, note: 'Cuidas cada detalle' },
      { id: 'd', text: 'Me miro rápido; no me gusta llamar la atención.', affinity: { minerva: 2, merlina: 1 }, note: 'Prefieres pasar desapercibido' },
      { id: 'e', text: 'Me veo fuerte, imponente. Así está bien.', affinity: { carvajal: 2, pachito: 1 }, note: 'Proyectas fuerza' },
    ],
  },
  {
    id: 'q26-insomnio',
    text: 'Son las 3 de la mañana y no puedes dormir.',
    sourceRefs: ['jhoncito-1', 'marianita-2', 'doc-3', 'nuevo:sasha', 'hipolita-1'],
    options: [
      { id: 'a', text: 'Repaso todo lo que pudo salir mal hoy.', affinity: { jhoncito: 2, minerva: 1 }, note: 'Le das vueltas a todo' },
      { id: 'b', text: 'Rezo o le hablo al universo.', affinity: { marianita: 2, clarita: 1 }, note: 'Buscas consuelo espiritual' },
      { id: 'c', text: 'Leo hasta que me venza el sueño.', affinity: { doc: 2, merlina: 1 }, note: 'Te refugias en los libros' },
      { id: 'd', text: 'Le escribo a alguien para salir o hablar.', affinity: { sasha: 2, candy: 1 }, note: 'Buscas compañía' },
      { id: 'e', text: 'Me levanto a ordenar o limpiar algo.', affinity: { hipolita: 2, piedad: 1 }, note: 'Ordenar te calma' },
    ],
  },
  {
    id: 'q27-consejo',
    text: 'Un amigo te pide un consejo importante.',
    sourceRefs: ['yuli-1', 'doc-1', 'marianita-3', 'minerva-3', 'piedad-1'],
    options: [
      { id: 'a', text: 'Le digo lo que haría yo, sin rodeos.', affinity: { yuli: 1, pachito: 1, sasha: 1 }, note: 'Hablas claro' },
      { id: 'b', text: 'Le doy una respuesta razonada, con argumentos.', affinity: { doc: 2, piedad: 1 }, note: 'Razonas cada paso' },
      { id: 'c', text: 'Le digo que confíe en las señales y en su intuición.', affinity: { marianita: 2, felipe: 1 }, note: 'Confías en la intuición' },
      { id: 'd', text: 'Le digo lo que creo que quiere escuchar.', affinity: { minerva: 2, carvajal: 1 }, note: 'Te adaptas a los demás' },
      { id: 'e', text: 'Le recuerdo que las reglas existen por algo.', affinity: { piedad: 2, hipolita: 1 }, note: 'Defiendes las normas' },
    ],
  },
  {
    id: 'q28-control',
    text: 'Te dan el control de un lugar durante un día.',
    sourceRefs: ['piedad-3', 'nuevo:carvajal', 'nuevo:sasha', 'yuli-1', 'jhoncito-3'],
    options: [
      { id: 'a', text: 'Pongo orden: horarios, reglas y disciplina.', affinity: { piedad: 2, hipolita: 1 }, note: 'Impones disciplina' },
      { id: 'b', text: 'Me luzco: que todos sepan quién manda.', affinity: { carvajal: 2, candy: 1 }, note: 'Disfrutas el poder' },
      { id: 'c', text: 'Hago una fiesta y abro las puertas.', affinity: { sasha: 2, clarita: 1 }, note: 'Lo conviertes en celebración' },
      { id: 'd', text: 'Elimino todas las reglas absurdas.', affinity: { yuli: 2, pachito: 1 }, note: 'Rompes con lo establecido' },
      { id: 'e', text: 'Se lo dejo a alguien más; tanta responsabilidad me pesa.', affinity: { minerva: 2, jhoncito: 1 }, note: 'Prefieres no cargar con el mando' },
    ],
  },
  {
    id: 'q16-silencio',
    text: '"El silencio es obediencia. La rebeldía, una amenaza". ¿Con qué te identificas más?',
    hint: 'La frase de la obra.',
    sourceRefs: ['merlina-1', 'yuli-1', 'piedad-1', 'felipe-2', 'jhoncito-1'],
    options: [
      { id: 'a', text: 'Con el silencio: observo, callo y espero mi momento.', affinity: { merlina: 2, minerva: 1 }, note: 'Eliges el silencio' },
      { id: 'b', text: 'Con la rebeldía: alguien tiene que decir las cosas.', affinity: { yuli: 2, sasha: 1 }, note: 'Eliges la rebeldía' },
      { id: 'c', text: 'Con el orden: alguien tiene que mantener las reglas.', affinity: { piedad: 2, carvajal: 1 }, note: 'Eliges el orden' },
      { id: 'd', text: 'Con la fantasía: me escapo a un mundo donde soy libre.', affinity: { felipe: 2, clarita: 1, marianita: 1 }, note: 'Eliges la fantasía' },
      { id: 'e', text: 'Con el miedo: me asusta decepcionar o equivocarme.', affinity: { jhoncito: 2, hipolita: 1 }, note: 'Te acompaña el miedo a fallar' },
    ],
  },
];
