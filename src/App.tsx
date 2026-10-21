import { lazy, Suspense, useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';

const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo({ top: 0 }), [pathname]);
  return null;
}

function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-start justify-center gap-6 bg-ink px-4 sm:px-8">
      <p className="display text-[clamp(5rem,25vw,12rem)] text-volt">404</p>
      <p className="text-xl text-paper">Esta puerta está cerrada.</p>
      <Link to="/" className="btn btn-primary">
        Volver al test
      </Link>
    </main>
  );
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-svh bg-ink" aria-busy="true" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
