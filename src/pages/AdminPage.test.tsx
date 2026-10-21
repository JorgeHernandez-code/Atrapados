import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

describe('AdminPage sin backend', () => {
  it('no muestra datos y explica la configuración pendiente', async () => {
    vi.resetModules();
    vi.doMock('../lib/supabase', () => ({ isSupabaseConfigured: false, getSupabase: async () => null }));
    const { AdminPage } = await import('./AdminPage');
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/supabase no está configurado/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    vi.doUnmock('../lib/supabase');
  });
});

describe('AdminPage con backend', () => {
  it('pide iniciar sesión cuando no hay sesión', async () => {
    vi.resetModules();
    vi.doMock('../lib/supabase', () => ({ isSupabaseConfigured: true, getSupabase: async () => null }));
    vi.doMock('../services/admin', async (orig) => ({
      ...(await orig<typeof import('../services/admin')>()),
      getSession: async () => null,
      onAuthChange: () => () => undefined,
      checkIsAdmin: vi.fn(),
    }));
    const { AdminPage } = await import('./AdminPage');
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: /acceso del equipo/i })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('una cuenta sin rol de administrador no ve contactos', async () => {
    vi.resetModules();
    vi.doMock('../lib/supabase', () => ({ isSupabaseConfigured: true, getSupabase: async () => null }));
    vi.doMock('../services/admin', async (orig) => ({
      ...(await orig<typeof import('../services/admin')>()),
      getSession: async () => ({ user: { id: 'u1' } }),
      onAuthChange: () => () => undefined,
      checkIsAdmin: async () => false,
    }));
    const { AdminPage } = await import('./AdminPage');
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );
    expect(await screen.findByText(/sin permisos/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
