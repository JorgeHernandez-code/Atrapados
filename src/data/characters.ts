import type { Character, CharacterId } from '../types/character';

/**
 * Personajes de ATRAPADOS.
 * Fuente: docs/fuentes/Personajes-v2.docx. Ver docs/ANALISIS_PERSONAJES.md para las decisiones.
 * - `originalTraits` conserva literalmente los rasgos del documento (uso interno).
 * - `traits`, `description` y `quote` están redactados para el público, sin lenguaje clínico.
 * - Las frases (`quote`) se crearon para esta experiencia y NO son diálogos de la obra.
 * - Los nombres de los intérpretes NO están en el repositorio (es público). Para mostrarlos, añade
 *   `actor: 'Nombre'` y `actorConfirmed: true` con su autorización, y activa FEATURES.SHOW_ACTOR_NAMES.
 */
export const CHARACTERS: Character[] = [
  {
    id: 'hipolita',
    name: 'Hipólita',
    actorConfirmed: false,
    archetype: 'La del orden perfecto',
    originalTraits: ['Obsesivo', 'TOC', 'Angustia', 'Perfección', 'Tímido', 'Inquieto'],
    traits: ['Perfeccionista', 'Meticulosa', 'Inquieta', 'Reservada'],
    description:
      'Hipólita encuentra calma cuando cada cosa está en su lugar. Nota el detalle que nadie más ve y le cuesta soltar el control, aunque por dentro nunca deja de moverse.',
    quote: 'Si todo está en su sitio, quizá yo también lo esté.',
    tone: 'paper',
    notes: 'Rasgos en masculino en el documento (Obsesivo, Tímido, Inquieto); se adaptan en la interfaz.',
  },
  {
    id: 'sasha',
    name: 'Sasha',
    actorConfirmed: false,
    archetype: 'La leal sin frenos',
    originalTraits: ['Sensualidad', 'Lealtad', 'Extrovertida', 'Impulsiva', 'Alegre'],
    traits: ['Leal', 'Extrovertida', 'Impulsiva', 'Alegre', 'Magnética'],
    description:
      'Sasha vive hacia afuera: ríe fuerte, decide rápido y no abandona a los suyos. Su energía llena cualquier espacio, y su lealtad es tan intensa como sus impulsos.',
    quote: 'Primero salto, después pregunto. Pero nunca salto sola.',
    tone: 'yellow',
    notes: 'El documento no incluye preguntas para Sasha; se crearon opciones a partir de sus rasgos.',
  },
  {
    id: 'clarita',
    name: 'Clarita',
    actorConfirmed: false,
    archetype: 'La nostálgica impaciente',
    originalTraits: ['Ansiosa', 'Nostalgia', 'Impaciente', 'Nerviosa', 'Infantil'],
    traits: ['Nostálgica', 'Impaciente', 'Espontánea', 'Nerviosa'],
    description:
      'Clarita guarda un pedazo de infancia en el bolsillo. Quiere que todo pase ya, se ríe cuando los nervios aprietan y extraña los tiempos en que nadie le exigía crecer.',
    quote: '¿Y si crecer fuera opcional?',
    tone: 'ink',
  },
  {
    id: 'carvajal',
    name: 'Enfermero Carvajal',
    actorConfirmed: false,
    archetype: 'El imponente',
    originalTraits: ['Engreído', 'Manipulable', 'Apático', 'Imponente', 'Fuerte'],
    traits: ['Imponente', 'Fuerte', 'Seguro de sí', 'Influenciable', 'Desapegado'],
    description:
      'Carvajal se planta y el lugar cambia. Parece que nada lo conmueve, pero quien sabe hablarle al oído puede moverlo más de lo que él admitiría.',
    quote: 'No me impresiona. Casi nada me impresiona.',
    tone: 'paper',
    notes: 'El documento no incluye preguntas para Carvajal; se crearon opciones a partir de sus rasgos.',
  },
  {
    id: 'minerva',
    name: 'Minerva',
    actorConfirmed: false,
    archetype: 'El espejo',
    originalTraits: ['Imitadora', 'Tímida', 'Ansiosa', 'Reprimida', 'Dependiente', 'Ecopraxia y ecolalia (nota del documento)'],
    traits: ['Tímida', 'Contenida', 'Imitadora', 'Busca al grupo'],
    description:
      'Minerva se refleja en quienes la rodean: repite, acompaña, sigue. Prefiere no destacar, pero en su manera de imitar hay una observación finísima de los demás.',
    quote: 'Si lo haces tú, quizá yo también pueda.',
    tone: 'ink',
    notes: 'La nota clínica (ecopraxia/ecolalia) no se muestra al público.',
  },
  {
    id: 'yuli',
    name: 'Yuli',
    actorConfirmed: false,
    archetype: 'La rebelde',
    originalTraits: ['Rebelde', 'Agresiva', 'Ansiosa', 'Grosera', 'Manipuladora'],
    traits: ['Rebelde', 'Frontal', 'Persuasiva', 'Inquieta'],
    description:
      'Yuli no acepta una regla solo porque alguien la escribió. Dice lo que piensa sin pedir permiso y sabe mover las piezas para salirse con la suya. Para algunos es una amenaza; para otros, la única que se atreve.',
    quote: 'Si me quieren callada, van a tener que esperar sentados.',
    tone: 'yellow',
  },
  {
    id: 'marianita',
    name: 'Marianita',
    fullName: 'Mariana Buenaventura',
    actorConfirmed: false,
    archetype: 'La mística',
    originalTraits: ['Religión', 'Voces', 'Influencia', 'Grosera', 'Tic'],
    traits: ['Espiritual', 'Intuitiva', 'Sin filtro', 'Influenciable'],
    description:
      'Marianita busca señales en todas partes y se aferra a su fe para entender el mundo. Escucha lo que otros no escuchan y, cuando algo no le gusta, lo suelta sin anestesia.',
    quote: 'Nada es casualidad. Ni siquiera que estés leyendo esto.',
    tone: 'paper',
    notes: '"Mariana buenaventura" en los perfiles y "Marianita" en las preguntas: mismo personaje.',
  },
  {
    id: 'candy',
    name: 'Candy',
    fullName: 'Candy Pérez',
    actorConfirmed: false,
    archetype: 'La chispa',
    originalTraits: ['Coqueta', 'Segura', 'Extrovertida', 'Atrevida', 'Alegre'],
    traits: ['Coqueta', 'Segura', 'Atrevida', 'Alegre', 'Extrovertida'],
    description:
      'Candy entra y se encienden las luces. Coquetea, se atreve y contagia alegría; el aburrimiento es su único enemigo y el centro del escenario, su lugar natural.',
    quote: '¿Aburrirme? No, gracias. Yo vine a brillar.',
    tone: 'yellow',
  },
  {
    id: 'pachito',
    name: 'Pachito',
    actorConfirmed: false,
    archetype: 'El volcán',
    originalTraits: ['Furia', 'Frío', 'Compulsivo', 'Enojado', 'Gritón'],
    traits: ['Intenso', 'Frío por fuera', 'Explosivo', 'Directo'],
    description:
      'Pachito parece de hielo… hasta que deja de serlo. Acumula en silencio y, cuando estalla, se escucha en todo el edificio. No sabe disimular lo que le molesta.',
    quote: 'Yo estoy tranquilo. Muy tranquilo. Hasta que no.',
    tone: 'ink',
    notes: 'El documento no deja claro si el nombre que acompaña al personaje es el del intérprete o su nombre completo. Confirmar.',
  },
  {
    id: 'jhoncito',
    name: 'Jhoncito',
    actorConfirmed: false,
    archetype: 'El corazón nervioso',
    originalTraits: ['Ansioso', 'Depresivo', 'Inseguro', 'Tartamudo', 'Complejo de Edipo'],
    traits: ['Sensible', 'Inseguro', 'Nervioso bajo presión', 'Apegado a los suyos'],
    description:
      'Jhoncito siente todo con intensidad. Le pesa la idea de decepcionar a quienes quiere, se le traban las palabras cuando más las necesita y busca un abrazo que le confirme que lo está haciendo bien.',
    quote: 'Lo que quería decir era… bueno, ya sabes.',
    tone: 'paper',
    notes: 'En el documento aparece como "Jhohcito" (errata). Rasgos sensibles no se muestran al público.',
  },
  {
    id: 'merlina',
    name: 'Merlina',
    actorConfirmed: false,
    archetype: 'La observadora silenciosa',
    originalTraits: ['Silenciosa', 'Aislada', 'Culpable', 'Observadora', 'Leal'],
    traits: ['Silenciosa', 'Observadora', 'Leal', 'Introspectiva'],
    description:
      'Merlina mira desde la esquina y lo entiende todo. Habla poco, carga más de lo que cuenta y, cuando decide estar de tu lado, no se mueve de ahí.',
    quote: 'El silencio también dice cosas. Solo hay que saber escucharlo.',
    tone: 'ink',
  },
  {
    id: 'felipe',
    name: 'Felipe',
    actorConfirmed: false,
    archetype: 'El soñador de escenario',
    originalTraits: ['Inseguro', 'Dependiente', 'Aspiracionista', 'Soñador', 'Copiador'],
    traits: ['Soñador', 'Aspiracionista', 'Imita a sus ídolos', 'Necesita público'],
    description:
      'Felipe vive con una canción en la cabeza y un escenario imaginario bajo los pies. Copia a sus ídolos, sueña en grande y necesita que alguien lo mire para sentirse completo.',
    quote: 'Las luces se apagan, pero yo sigo cantando.',
    tone: 'yellow',
    notes: 'En las preguntas aparece como "Felipe / Camilo Sesto". La referencia no se usa en la interfaz hasta confirmarla.',
  },
  {
    id: 'doc',
    name: 'Doc',
    actorConfirmed: false,
    archetype: 'El erudito solitario',
    originalTraits: ['Educado', 'Culto', 'Inseguro', 'Tímido', 'Solitario'],
    traits: ['Educado', 'Culto', 'Solitario', 'Inseguro en silencio'],
    description:
      'Doc tiene una respuesta para casi todo y una biblioteca como refugio. Mantiene una distancia cortés con los demás, aunque detrás de tanta seguridad intelectual hay más dudas de las que deja ver.',
    quote: 'Los libros nunca preguntan cómo estoy. Por eso me gustan.',
    tone: 'paper',
  },
  {
    id: 'piedad',
    name: 'Enfermera Piedad',
    actorConfirmed: false,
    archetype: 'La autoridad',
    originalTraits: ['Seria', 'Psicorrígida', 'Mal humorada', 'Autoritaria', 'Disciplinada', 'Organizada'],
    traits: ['Disciplinada', 'Organizada', 'Firme', 'Seria', 'Exigente'],
    description:
      'Piedad sostiene el orden cuando todo amenaza con desbordarse. Exige, corrige y no negocia las reglas, porque cree que sin ellas el caos lo devoraría todo.',
    quote: 'Aquí las cosas se hacen bien. O se vuelven a hacer.',
    tone: 'ink',
    notes: '"Sería" en el documento (errata) se corrige a "Seria".',
  },
];

export const CHARACTER_IDS = CHARACTERS.map((c) => c.id);

const BY_ID = new Map(CHARACTERS.map((c) => [c.id, c]));

export function getCharacter(id: CharacterId): Character {
  const c = BY_ID.get(id);
  if (!c) throw new Error(`Personaje desconocido: ${id}`);
  return c;
}

export function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === 'string' && BY_ID.has(value as CharacterId);
}
