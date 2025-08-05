import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppProvider } from './context/app-state-context';
import Landing from './components/layout/landing/landing';
import Onboarding from './components/layout/onboarding/onboarding';
import { LocalStorage } from './utils/local-storage';
import { navLinks } from './constants/data';
import {
  protectedRoutes,
  type ProtectedRoute,
} from './constants/protected-routes';
import { useEffect, useState } from 'react';
import { RequireOnboarding } from './components/routing/requireOnboarding';
import { useDB } from './hooks/db/useDB';
import LoadingStencil from './components/ui/loading-stencil/loading-stencil';
import { ErrorScreen } from './components/ui/error-screen/error-screen';

function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(
    () => LocalStorage.get<boolean>('onboardingComplete') === true
  );
  const { isDBReady, dbError } = useDB();
  useEffect(() => {
    const handler = () => {
      setOnboardingComplete(
        LocalStorage.get<boolean>('onboardingComplete') === true
      );
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (dbError) {
    return (
      <ErrorScreen 
        title="Database Error"
        message={dbError}
        actionLabel="Reload Page"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!isDBReady) {
    return (
      <LoadingStencil />
    );
  }
  return (
    <AppProvider>
      <div className="p-4 bg-gray-100 min-h-screen">
        <Router>
          <nav>
            {onboardingComplete &&
              navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        active:outline-none"
                >
                  {link.label}
                </Link>
              ))}
          </nav>
          <main>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/onboarding"
                element={
                  <Onboarding setOnboardingComplete={setOnboardingComplete} />
                }
              />
              {protectedRoutes.map((route: ProtectedRoute) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <RequireOnboarding onboardingComplete={onboardingComplete}>
                      {route.element}
                    </RequireOnboarding>
                  }
                />
              ))}
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </main>
        </Router>
      </div>
    </AppProvider>
  );
}

export default App;
