/**
 * CONFIGURACIÓN CENTRAL DE ATRAPADOS
 * ----------------------------------
 * Todos los datos editables de la obra, el evento, el contacto y la política de datos viven aquí.
 * Los valores `null` son datos que el equipo organizador DEBE completar antes de publicar.
 * La aplicación muestra un aviso "Pendiente" donde falten.
 */

export const SITE = {
  playTitle: 'ATRAPADOS',
  tagline: 'El silencio es obediencia. La rebeldía, una amenaza.',
  /** Créditos tal como aparecen en el flyer. */
  credits: 'Una obra de X semestre — Licenciatura en Educación Artística',
  institution: 'Universidad del Tolima',
  academicNote:
    'La obra integra las asignaturas Didáctica del Teatro, Juegos y Deportes para Niños con Necesidades Educativas Especiales y Seminario Nuevas Tendencias en Educación Artística, articulando el arte, la inclusión y la exploración escénica en una experiencia teatral colectiva.',

  /** URL pública. Si no se define en el entorno se usa el origen actual del navegador. */
  publicUrl: (import.meta.env.VITE_PUBLIC_SITE_URL || '').replace(/\/$/, ''),

  flyer: {
    src: '/flyer-atrapados.jpg',
    srcSmall: '/flyer-atrapados-640.jpg',
    alt: 'Flyer oficial de ATRAPADOS: tres intérpretes en blanco y negro separados por un rasgado amarillo. Auditorio Casa de la Cultura, Sibaté, 7 de noviembre, 12:00 p. m.',
  },
} as const;

export const EVENT = {
  venue: 'Auditorio Casa de la Cultura',
  city: 'Sibaté',
  address: 'Calle 10 No. 8-01',
  /** El flyer no indica el año: se asume 2026. Verificar. */
  dateISO: '2026-11-07T12:00:00-05:00',
  dayLabel: '07',
  monthLabel: 'Noviembre',
  timeLabel: '12:00 p. m.',
} as const;

export interface SocialLink {
  label: string;
  url: string;
}

export const CONTACT = {
  /** Correo o WhatsApp público del equipo. NO inventar: completar con datos reales. */
  email: null as string | null,
  phone: null as string | null,
  /** Redes oficiales. Vacío = no se muestran. Ejemplo: { label: 'Instagram', url: 'https://instagram.com/...' } */
  social: [] as SocialLink[],
};

/**
 * Responsable del tratamiento de datos personales (Ley 1581 de 2012).
 * Estos datos son obligatorios antes de activar el formulario en producción.
 */
export const DATA_CONTROLLER = {
  legalName: null as string | null,
  idType: null as string | null, // p. ej. "NIT" o "C.C."
  idNumber: null as string | null,
  address: null as string | null,
  email: null as string | null,
  phone: null as string | null,
  /** Plazo de conservación de los datos. */
  retention: 'Hasta 24 meses después de la última función de la obra o hasta que el titular solicite la supresión, lo que ocurra primero.',
  /** Fecha de la última actualización de la política. */
  policyUpdatedAt: '2026-10-20',
  /**
   * Proveedores (encargados) que pueden procesar los datos. Ajustar según la infraestructura real
   * (por ejemplo, la región elegida en Supabase y el servicio de hosting).
   */
  processors: [
    { name: 'Supabase Inc.', purpose: 'Base de datos y autenticación del panel administrativo', location: 'Según la región elegida al crear el proyecto (puede estar fuera de Colombia)' },
    { name: 'Proveedor de hosting de la página (p. ej. Vercel o Netlify)', purpose: 'Publicación del sitio web; registra datos técnicos de conexión', location: 'Estados Unidos u otros países' },
    { name: 'WhatsApp (Meta Platforms)', purpose: 'Solo si el equipo envía la información por WhatsApp', location: 'Estados Unidos u otros países' },
  ],
};

/**
 * Texto de autorización. Si cambias el texto, cambia también la versión:
 * la versión queda guardada con cada registro para poder verificar qué aceptó cada persona.
 */
export const CONSENT = {
  version: 'v1-2026-10-20',
  text: 'Autorizo expresamente al equipo de ATRAPADOS a utilizar mi nombre y número de celular para enviarme información sobre la obra y sus actividades relacionadas. He leído la política de tratamiento de datos personales.',
} as const;

export const FEATURES = {
  /** Mostrar los nombres de los intérpretes en los resultados (pendiente de confirmación del equipo). */
  SHOW_ACTOR_NAMES: false,
} as const;

/** Lista de datos obligatorios que faltan, para mostrar avisos y para la documentación. */
export function pendingControllerFields(): string[] {
  const labels: Record<string, string> = {
    legalName: 'Nombre o razón social del responsable',
    idType: 'Tipo de identificación',
    idNumber: 'Número de identificación',
    address: 'Domicilio',
    email: 'Correo de contacto para consultas y reclamos',
  };
  return Object.entries(labels)
    .filter(([key]) => !DATA_CONTROLLER[key as keyof typeof DATA_CONTROLLER])
    .map(([, label]) => label);
}

export function siteUrl(): string {
  if (SITE.publicUrl) return SITE.publicUrl;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}
