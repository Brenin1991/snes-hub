import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { EmulatorProvider } from './context/EmulatorContext';
import { UserProvider, useUser } from './context/UserContext';
import Header from './components/Header';
import Bottom from './components/Bottom';
import EmulatorModal from './components/EmulatorModal';
import ErrorBoundary from './components/ErrorBoundary';
import Intro from './pages/Intro';
import UserSelection from './pages/UserSelection';
import Dashboard from './pages/Dashboard';
import GameLibrary from './pages/GameLibrary';
import GameDetails from './pages/GameDetails';
import Settings from './pages/Settings';
import AddGame from './pages/AddGame';
import './webpack-overlay-fix.css';

const AppContent = () => {
  const { currentUser, loading, login } = useUser();
  const [showIntro, setShowIntro] = useState(true);
  const [showUserSelection, setShowUserSelection] = useState(false);

  useEffect(() => {
    // Verificar se é a primeira vez abrindo o app
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      setShowUserSelection(false);
    }
  }, [currentUser]);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setShowUserSelection(true);
    localStorage.setItem('hasSeenIntro', 'true');
  };

  const handleUserSelect = (user) => {
    // O login já foi feito no UserSelection, o useEffect vai fechar a tela
    // quando currentUser for atualizado
  };

  const handleBackToUserSelection = () => {
    setShowUserSelection(true);
  };

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎮</div>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return <Intro onComplete={handleIntroComplete} />;
  }

  if (showUserSelection || !currentUser) {
    return <UserSelection onUserSelect={handleUserSelect} onBack={() => setShowIntro(true)} />;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg,rgb(221, 221, 221) 0%,rgb(228, 228, 228) 50%,rgb(230, 230, 230) 100%)',
      backgroundSize: '100% 100%',
      backgroundAttachment: 'fixed'
    }}>
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<GameLibrary />} />
          <Route path="/game/:gameId" element={<GameDetails />} />
          <Route path="/add-game" element={<AddGame />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <ErrorBoundary>
          <EmulatorModal />
        </ErrorBoundary>
      </div>
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <EmulatorProvider>
        <AppContent />
      </EmulatorProvider>
    </UserProvider>
  );
}

export default App;
