import React, { useState, useEffect } from 'react';
import { PetOverlay } from './components/PetOverlay';
import { Dashboard } from './pages/Dashboard';

export const App: React.FC = () => {
  const [route, setRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash;
    }
    return 'dashboard';
  });

  useEffect(() => {
    const updateRoute = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setRoute(hash);
      }
    };

    updateRoute();
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  if (route === 'pet') {
    return <PetOverlay />;
  }

  return <Dashboard />;
};

export default App;
