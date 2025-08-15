import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/app-state-context';
import Landing from './components/layout/landing/landing';
import Onboarding from './components/layout/onboarding/onboarding';
import { LocalStorage } from './utils/local-storage';
import {
  protectedRoutes,
  type ProtectedRoute,
} from './constants/protected-routes';
import { Suspense, useEffect, useState } from 'react';
import { RequireOnboarding } from './components/routing/requireOnboarding';
import { useDB } from './hooks/db/useDB';
import LoadingStencil from './components/ui/loading-stencil/loading-stencil';
import { ErrorScreen } from './components/ui/error-screen/error-screen';
import { ErrorBoundary } from 'react-error-boundary';
import Header from './components/layout/header/header';

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

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
    return <LoadingStencil />;
  }
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AppProvider>
        <div className="bg-gray-100 flex flex-col gap-2 min-h-screen p-4">
          <Router>
            <Header onboardingComplete={onboardingComplete} />
            <main>
              <Suspense fallback={<LoadingStencil />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route
                    path="/onboarding"
                    element={
                      <Onboarding
                        setOnboardingComplete={setOnboardingComplete}
                      />
                    }
                  />
                  {protectedRoutes.map((route: ProtectedRoute) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <RequireOnboarding
                          onboardingComplete={onboardingComplete}
                        >
                          {route.element}
                        </RequireOnboarding>
                      }
                    />
                  ))}
                  <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
              </Suspense>
            </main>
          </Router>
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
