import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeadForm } from './LeadForm';

const submitLead = vi.fn();
vi.mock('../services/leads', () => ({ submitLead: (...args: unknown[]) => submitLead(...args) }));

function setup() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <LeadForm characterId="merlina" />
    </MemoryRouter>,
  );
  return {
    user,
    name: screen.getByLabelText(/^nombre/i),
    phone: screen.getByLabelText(/^número de celular/i),
    consent: screen.getByRole('checkbox'),
    submit: screen.getByRole('button', { name: /quiero seguir conectado/i }),
  };
}

beforeEach(() => {
  submitLead.mockReset();
  vi.spyOn(Date, 'now').mockRestore();
});

/** Simula que pasó el tiempo mínimo de llenado del formulario. */
function advanceTime(ms: number) {
  const base = Date.now();
  vi.spyOn(Date, 'now').mockReturnValue(base + ms);
}

describe('LeadForm', () => {
  it('no pide correo ni otros datos', () => {
    setup();
    expect(screen.queryByLabelText(/correo|email|documento|dirección|nacimiento/i)).not.toBeInTheDocument();
  });

  it('la casilla de consentimiento está desmarcada por defecto', () => {
    const { consent } = setup();
    expect(consent).not.toBeChecked();
  });

  it('enlaza la política de privacidad antes de enviar', () => {
    setup();
    expect(screen.getByRole('link', { name: /leer la política/i })).toHaveAttribute('href', '/privacidad');
  });

  it('NO envía sin consentimiento', async () => {
    const { user, name, phone, submit } = setup();
    await user.type(name, 'Ana María');
    await user.type(phone, '3001234567');
    await user.click(submit);
    expect(submitLead).not.toHaveBeenCalled();
    expect(screen.getByText(/debes marcar la autorización/i)).toBeInTheDocument();
  });

  it('valida nombre y celular', async () => {
    const { user, name, phone, consent, submit } = setup();
    await user.type(name, 'A1');
    await user.type(phone, '123');
    await user.click(consent);
    await user.click(submit);
    expect(submitLead).not.toHaveBeenCalled();
    expect(screen.getByText(/usa solo letras/i)).toBeInTheDocument();
    expect(screen.getByText(/empiece por 3/i)).toBeInTheDocument();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveFocus();
  });

  it('envía datos normalizados y muestra confirmación', async () => {
    submitLead.mockResolvedValue({ ok: true });
    const { user, name, phone, consent, submit } = setup();
    await user.type(name, '  Ana   María ');
    await user.type(phone, '300 123 4567');
    await user.click(consent);
    advanceTime(5000);
    await user.click(submit);
    expect(submitLead).toHaveBeenCalledTimes(1);
    const arg = submitLead.mock.calls[0]![0];
    expect(arg).toMatchObject({ phone: '+573001234567', preferredCharacter: 'merlina', consentGiven: true, honeypot: '' });
    expect(arg.consentTextVersion).toMatch(/^v/);
    expect(await screen.findByText(/gracias, ana/i)).toBeInTheDocument();
  });

  it('muestra el error del servidor sin simular éxito', async () => {
    submitLead.mockResolvedValue({ ok: false, reason: 'not_configured', message: 'El registro de contactos no está disponible en este momento.' });
    const { user, name, phone, consent, submit } = setup();
    await user.type(name, 'Ana');
    await user.type(phone, '3001234567');
    await user.click(consent);
    advanceTime(5000);
    await user.click(submit);
    expect(await screen.findByText(/no está disponible/i)).toBeInTheDocument();
    expect(screen.queryByText(/gracias/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /quiero seguir conectado/i })).toBeEnabled();
  });
});
