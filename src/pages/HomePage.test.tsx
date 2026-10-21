import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QUESTIONS } from '../data/questions';
import { QUIZ_LENGTH } from '../lib/quizBuilder';

const questionNumber = () => screen.getByText(/pregunta/i, { selector: 'p' });
const optionCount = (text: string) => QUESTIONS.find((q) => text.endsWith(q.text))?.options.length;
import { HomePage } from './HomePage';

beforeEach(() => {
  sessionStorage.clear();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

function renderHome(url = '/') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <HomePage />
    </MemoryRouter>,
  );
}

const continueBtn = () => screen.getByRole('button', { name: /continuar|ver mi resultado/i });

async function startQuiz() {
  const user = userEvent.setup();
  renderHome();
  await user.click(screen.getByRole('button', { name: /descubrir mi personaje/i }));
  return user;
}

describe('portada', () => {
  it('muestra título, subtítulo, botón y aviso recreativo', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/atrapados/i);
    expect(screen.getByText(/¿qué personaje eres\?/i)).toBeInTheDocument();
    expect(screen.getAllByText(/no constituye una evaluación psicológica ni un diagnóstico/i).length).toBeGreaterThan(0);
    expect(screen.getByAltText(/flyer oficial/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /política de tratamiento de datos/i })).toHaveAttribute('href', '/privacidad');
  });

  it('muestra el personaje de quien compartió el enlace', () => {
    renderHome('/?r=yuli');
    expect(screen.getByText(/le salió/i)).toHaveTextContent('Yuli');
  });

  it('ignora un parámetro ?r= inválido', () => {
    renderHome('/?r=<script>');
    expect(screen.queryByText(/le salió/i)).not.toBeInTheDocument();
  });
});

describe('test interactivo', () => {
  it('no permite avanzar sin seleccionar una respuesta', async () => {
    const user = await startQuiz();
    expect(continueBtn()).toBeDisabled();
    await user.click(continueBtn());
    expect(questionNumber()).toHaveTextContent(/01/);
  });

  it('todas las preguntas permiten seleccionar respuestas y se llega al resultado', async () => {
    const user = await startQuiz();
    for (let i = 0; i < QUIZ_LENGTH; i++) {
      const group = screen.getByRole('radiogroup');
      const radios = within(group).getAllByRole('radio');
      expect(radios.length).toBe(optionCount(screen.getByRole('heading', { level: 2 }).textContent ?? ''));
      await user.click(radios[i % radios.length]!);
      expect(radios[i % radios.length]).toBeChecked();
      expect(continueBtn()).toBeEnabled();
      await user.click(continueBtn());
    }
    expect(screen.getByText(/tu personaje es/i)).toBeInTheDocument();
    expect(screen.getByText(/tu resultado sugiere una afinidad con/i)).toBeInTheDocument();
    expect(screen.getByText(/afinidad en este test/i)).toBeInTheDocument();
    expect(screen.getByText(/frase creada para esta experiencia/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /¿por qué/i })).toBeInTheDocument();
    // El formulario aparece después del resultado y es opcional.
    expect(screen.getByRole('heading', { name: /quieres seguir conectado/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('permite retroceder y cambiar una respuesta', async () => {
    const user = await startQuiz();
    await user.click(within(screen.getByRole('radiogroup')).getAllByRole('radio')[0]!);
    await user.click(continueBtn());
    await user.click(within(screen.getByRole('radiogroup')).getAllByRole('radio')[1]!);
    await user.click(screen.getByRole('button', { name: /anterior/i }));

    const radios = within(screen.getByRole('radiogroup')).getAllByRole('radio');
    expect(radios[0]).toBeChecked();
    await user.click(radios[2]!);
    expect(radios[2]).toBeChecked();
    expect(radios[0]).not.toBeChecked();
    await user.click(continueBtn());
    // La respuesta de la pregunta 2 se conserva.
    expect(within(screen.getByRole('radiogroup')).getAllByRole('radio')[1]).toBeChecked();
  });

  it('el botón Anterior está deshabilitado en la primera pregunta', async () => {
    await startQuiz();
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled();
  });

  it('permite reiniciar el test con confirmación', async () => {
    const user = await startQuiz();
    await user.click(within(screen.getByRole('radiogroup')).getAllByRole('radio')[0]!);
    await user.click(continueBtn());
    await user.click(screen.getByRole('button', { name: /^reiniciar$/i }));
    await user.click(screen.getByRole('button', { name: /sí, reiniciar/i }));
    const radios = within(screen.getByRole('radiogroup')).getAllByRole('radio');
    expect(radios.every((r) => !(r as HTMLInputElement).checked)).toBe(true);
    expect(questionNumber()).toHaveTextContent(/01/);
  });

  it('se puede responder solo con teclado', async () => {
    const user = await startQuiz();
    const first = within(screen.getByRole('radiogroup')).getAllByRole('radio')[0]!;
    first.focus();
    await user.keyboard(' ');
    expect(first).toBeChecked();
    await user.keyboard('{Enter}');
    expect(questionNumber()).toHaveTextContent(/02/);
  });

  it('desde el resultado se puede repetir el test', async () => {
    const user = await startQuiz();
    for (let i = 0; i < QUIZ_LENGTH; i++) {
      await user.click(within(screen.getByRole('radiogroup')).getAllByRole('radio')[0]!);
      await user.click(continueBtn());
    }
    await user.click(screen.getAllByRole('button', { name: /repetir/i })[0]!);
    expect(questionNumber()).toHaveTextContent(/01/);
    expect(within(screen.getByRole('radiogroup')).getAllByRole('radio').every((r) => !(r as HTMLInputElement).checked)).toBe(true);
  });

  it('el resultado funciona sin backend configurado', async () => {
    const user = await startQuiz();
    for (let i = 0; i < QUIZ_LENGTH; i++) {
      await user.click(within(screen.getByRole('radiogroup')).getAllByRole('radio')[1]!);
      await user.click(continueBtn());
    }
    expect(screen.getByText(/tu personaje es/i)).toBeInTheDocument();
  });
});
