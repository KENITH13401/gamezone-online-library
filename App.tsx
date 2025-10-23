import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

import Header from './components/Header';
import HomePage from './pages/HomePage';
import GameDetailPage from './pages/GameDetailPage';
import SearchPage from './pages/SearchPage';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import Spinner from './components/Spinner';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  return user ? children : <Navigate to="/auth" state={{ from: location }} replace />;
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Use sessionStorage to detect the first load in a session.
  const isInitialSessionLoad = !sessionStorage.getItem('appHasLoaded');

  if (loading) {
    return (
      <main className="container mx-auto flex justify-center items-center h-[calc(100vh-150px)]">
        <Spinner />
      </main>
    );
  }
  
  // After auth check, if this is the first load, set the flag
  // to prevent this logic from running on subsequent navigations.
  if (isInitialSessionLoad) {
    sessionStorage.setItem('appHasLoaded', 'true');
  }

  // On the very first load of the session, if the user is not logged in
  // and they are not on the home, explore or auth page, redirect them to the homepage.
  if (isInitialSessionLoad && !user && !['/', '/explore', '/auth'].includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }


  // If a logged-in user is at the root path, redirect them to their dashboard
  if (user && location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<HomePage />} />
        <Route path="/game/:id" element={<GameDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />
        {/* A catch-all route to redirect any unknown paths to the homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
          <HashRouter>
            <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans transition-colors duration-300">
              <Header />
              <AppContent />
            </div>
          </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;