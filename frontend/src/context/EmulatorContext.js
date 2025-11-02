import React, { createContext, useContext, useState, useEffect } from 'react';

const EmulatorContext = createContext();

export const useEmulator = () => {
  const context = useContext(EmulatorContext);
  if (!context) {
    throw new Error('useEmulator must be used within an EmulatorProvider');
  }
  return context;
};

export const EmulatorProvider = ({ children }) => {
  const [currentGame, setCurrentGame] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [emulatorInstance, setEmulatorInstance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [blockNavigation, setBlockNavigation] = useState(false);

  // Limpar instância do emulador quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (emulatorInstance) {
        try {
          // Tentar parar o emulador se existir
          if (window.EJS_emulator && window.EJS_emulator.pause) {
            window.EJS_emulator.pause();
          }
        } catch (error) {
          console.log('Emulador já foi limpo');
        }
      }
    };
  }, [emulatorInstance]);

  const startGame = (game) => {
    // Se já tem um jogo rodando, parar primeiro
    if (currentGame && isPlaying) {
      stopGame();
    }
    
    setCurrentGame(game);
    setIsPlaying(true);
  };

  const openModal = (game) => {
    setCurrentGame(game);
    setIsModalOpen(true);
    setBlockNavigation(true); // Bloquear navegação quando modal abre
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsMinimized(false);
    setBlockNavigation(false); // Liberar navegação quando modal fecha
    // Limpar emulador ao fechar modal
    stopGame();
  };

  const closeModalOnly = () => {
    setIsModalOpen(false);
    setIsMinimized(false);
    // NÃO limpar emulador - apenas fechar modal
  };

  const minimizeModal = () => {
    setIsModalOpen(false);
    setIsMinimized(true);
    setBlockNavigation(false); // Liberar navegação quando minimizado
  };

  const maximizeModal = () => {
    setIsMinimized(false);
    setIsModalOpen(true);
    setBlockNavigation(true); // Bloquear navegação quando maximizar
  };

  const stopGame = () => {
    console.log('Parando jogo completamente...');
    try {
      // Limpar instância do EmulatorJS
      if (window.EJS_emulator) {
        try {
          if (typeof window.EJS_emulator.pause === 'function') {
            window.EJS_emulator.pause();
          }
          if (typeof window.EJS_emulator.destroy === 'function') {
            window.EJS_emulator.destroy();
          }
        } catch (e) {
          console.log('Erro ao parar emulador:', e);
        }
      }
      
      // Limpar variáveis globais do EmulatorJS
      const ejsKeys = [
        'EJS_player', 'EJS_core', 'EJS_lightgun', 'EJS_biosUrl', 
        'EJS_gameUrl', 'EJS_pathtodata', 'EJS_emulator'
      ];
      
      ejsKeys.forEach(key => {
        try {
          if (window[key]) {
            delete window[key];
          }
        } catch (e) {
          console.log(`Erro ao deletar ${key}:`, e);
        }
      });
      
      // EJS_Runtime é protegido, apenas limpar se possível
      try {
        if (window.EJS_Runtime) {
          window.EJS_Runtime = null;
        }
      } catch (e) {
        // Ignorar erro - EJS_Runtime é protegido
      }
      
      // Remover TODOS os scripts do EmulatorJS
      document.querySelectorAll('script[src*="emulatorjs"], script[src*="loader.js"]').forEach(script => {
        script.remove();
      });
      
      // Limpar divs do emulador
      const emulatorDivs = ['emulator', 'emulator-modal'];
      emulatorDivs.forEach(id => {
        const div = document.getElementById(id);
        if (div) {
          div.innerHTML = '';
        }
      });
      
      // Forçar garbage collection se disponível
      if (window.gc) {
        window.gc();
      }
      
    } catch (error) {
      console.log('Erro ao parar emulador:', error);
    } finally {
      setCurrentGame(null);
      setIsPlaying(false);
      setEmulatorInstance(null);
    }
  };


  const setEmulator = (instance) => {
    setEmulatorInstance(instance);
  };

  const value = {
    currentGame,
    isPlaying,
    emulatorInstance,
    isModalOpen,
    isMinimized,
    blockNavigation,
    startGame,
    stopGame,
    openModal,
    closeModal,
    closeModalOnly,
    minimizeModal,
    maximizeModal,
    setEmulator
  };

  return (
    <EmulatorContext.Provider value={value}>
      {children}
    </EmulatorContext.Provider>
  );
};
