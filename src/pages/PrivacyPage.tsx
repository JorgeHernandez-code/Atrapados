import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { CONSENT, DATA_CONTROLLER, SITE, pendingControllerFields } from '../config/site';

/** Marca visible para los datos que el organizador aún no ha completado. */
function Value({ value, label }: { value: string | null; label: string }) {
  if (value) return <strong className="text-paper">{value}</strong>;
  return (
    <mark className="bg-volt px-1.5 py-0.5 font-semibold text-ink">
      [Pendiente: {label}]
    </mark>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-paper/15 py-10">
      <h2 id={id} className="display text-3xl text-paper sm:text-4xl">
        {title}
      </h2>
      <div className="mt-5 space-y-4 leading-relaxed text-paper/85">{children}</div>
    </section>
  );
}

export function PrivacyPage() {
  const pending = pendingControllerFields();
  const c = DATA_CONTROLLER;

  useEffect(() => {
    document.title = 'Política de tratamiento de datos · ATRAPADOS';
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="flex min-h-svh flex-col bg-ink">
      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-8">
        <Link to="/" className="display text-2xl text-paper hover:text-volt">
          {SITE.playTitle}
        </Link>
        <p className="eyebrow mt-14 text-volt">Ley 1581 de 2012</p>
        <h1 className="display mt-3 text-[clamp(2.8rem,10vw,5.5rem)] text-paper">Política de tratamiento de datos personales</h1>
        <p className="mt-5 text-sm text-ash">
          Última actualización: {c.policyUpdatedAt} · Versión del texto de autorización: {CONSENT.version}
        </p>

        {pending.length > 0 && (
          <div role="note" className="mt-8 border-2 border-volt p-5 text-sm text-paper">
            <p className="font-bold text-volt">Aviso para el equipo organizador</p>
            <p className="mt-2">
              Antes de recibir datos del público deben completarse estos datos en <code>src/config/site.ts</code>: {pending.join(', ')}. Esta política es una base que el
              responsable debe revisar; su publicación no garantiza por sí sola el cumplimiento de la normativa.
            </p>
          </div>
        )}

        <Section id="responsable" title="1. Responsable del tratamiento">
          <p>
            Responsable: <Value value={c.legalName} label="nombre o razón social" />, identificado con <Value value={c.idType} label="tipo de identificación" />{' '}
            <Value value={c.idNumber} label="número" />, con domicilio en <Value value={c.address} label="domicilio" />.
          </p>
          <p>
            Canal de atención: <Value value={c.email} label="correo de contacto" />
            {c.phone ? (
              <>
                {' '}· Teléfono: <strong className="text-paper">{c.phone}</strong>
              </>
            ) : null}
            .
          </p>
        </Section>

        <Section id="datos" title="2. Qué datos recogemos">
          <p>Solo si decides registrarte voluntariamente después de ver tu resultado:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Tu nombre.</li>
            <li>Tu número de celular (con el indicativo del país).</li>
            <li>El personaje que obtuviste en el test.</li>
            <li>La constancia de tu autorización: fecha, hora y versión del texto que aceptaste.</li>
          </ul>
          <p>
            <strong className="text-paper">No recogemos</strong> correo electrónico, documento de identidad, dirección, fecha de nacimiento, información médica ni otros datos sensibles. No
            guardamos tus respuestas individuales del test.
          </p>
          <p>
            Para medir el uso de la página podemos registrar eventos anónimos (por ejemplo, &quot;se inició el test&quot; o &quot;se obtuvo tal personaje&quot;) con un identificador aleatorio
            que se borra al cerrar la pestaña. Esos eventos no se relacionan con tu nombre ni con tu celular. Para limitar envíos automatizados se guarda temporalmente una huella cifrada
            (hash) de la dirección IP, nunca la IP en claro, que se descarta en la siguiente limpieza automática una vez pasadas 24 horas.
          </p>
          <p>Puedes hacer el test y ver tu resultado sin entregar ningún dato personal.</p>
        </Section>

        <Section id="finalidad" title="3. Para qué los usamos">
          <ul className="list-disc space-y-1 pl-6">
            <li>Enviarte información sobre la obra {SITE.playTitle}: nuevas funciones, actividades relacionadas y próximos proyectos teatrales del equipo.</li>
            <li>Conocer, de forma agregada, qué personajes resultan más frecuentes.</li>
          </ul>
          <p>
            No vendemos ni cedemos tus datos. No te agregaremos a grupos de WhatsApp ni a campañas sin una autorización específica para ello. Puedes pedir que dejemos de escribirte en
            cualquier momento.
          </p>
        </Section>

        <Section id="derechos" title="4. Tus derechos">
          <p>Como titular de los datos tienes derecho a:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Conocer, actualizar y rectificar tus datos.</li>
            <li>Solicitar prueba de la autorización que otorgaste.</li>
            <li>Ser informado sobre el uso que se ha dado a tus datos.</li>
            <li>Revocar la autorización y solicitar la supresión de tus datos.</li>
            <li>Acceder gratuitamente a tus datos.</li>
            <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) después de haber agotado el trámite de consulta o reclamo ante el responsable.</li>
          </ul>
        </Section>

        <Section id="procedimiento" title="5. Cómo ejercerlos: consultas, reclamos y revocación">
          <p>
            Escríbenos a <Value value={c.email} label="correo de contacto" /> indicando tu nombre, el número de celular registrado y lo que solicitas (acceso, actualización,
            rectificación, supresión o revocación). Para proteger tus datos podremos pedirte que confirmes que eres el titular del número.
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="text-paper">Consultas</strong>: se responden en un máximo de diez (10) días hábiles, prorrogables por cinco (5) días hábiles más si se informa el motivo.
            </li>
            <li>
              <strong className="text-paper">Reclamos</strong> (corrección, actualización, supresión o incumplimiento): se responden en un máximo de quince (15) días hábiles, prorrogables
              por ocho (8) días hábiles más si se informa el motivo. Si el reclamo está incompleto te pediremos completarlo dentro de los cinco (5) días siguientes.
            </li>
            <li>
              <strong className="text-paper">Revocación</strong>: también puedes responder &quot;NO MÁS&quot; a cualquier mensaje que te enviemos. Dejaremos de contactarte y, si lo
              pides, borraremos tus datos.
            </li>
          </ul>
        </Section>

        <Section id="conservacion" title="6. Cuánto tiempo los conservamos">
          <p>{c.retention}</p>
        </Section>

        <Section id="proveedores" title="7. Proveedores que pueden procesarlos">
          <p>Para operar la página usamos proveedores tecnológicos que actúan como encargados del tratamiento. Algunos pueden almacenar la información fuera de Colombia:</p>
          <ul className="space-y-3">
            {c.processors.map((p) => (
              <li key={p.name} className="border-l-2 border-paper/30 pl-4">
                <strong className="text-paper">{p.name}</strong>
                <br />
                <span className="text-sm">
                  {p.purpose}. Ubicación: {p.location}.
                </span>
              </li>
            ))}
          </ul>
          <p>Solo las personas autorizadas del equipo, con usuario y contraseña, pueden consultar los contactos.</p>
        </Section>

        <Section id="autorizacion" title="8. Texto de la autorización">
          <blockquote className="border-l-4 border-volt pl-4 italic">{CONSENT.text}</blockquote>
          <p className="text-sm text-ash">La casilla aparece desmarcada y marcarla es voluntario. No marcarla no te impide hacer el test ni ver tu resultado.</p>
        </Section>

        <Section id="cambios" title="9. Cambios a esta política">
          <p>Si cambiamos esta política o el texto de autorización publicaremos la nueva versión en esta página con su fecha de actualización.</p>
        </Section>

        <p className="mt-6 text-sm text-ash">
          Normativa de referencia: Ley Estatutaria 1581 de 2012 y Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015).
        </p>

        <Link to="/" className="btn btn-primary mt-12">
          <span aria-hidden="true">←</span> Volver al test
        </Link>
      </main>
      <Footer />
    </div>
  );
}
