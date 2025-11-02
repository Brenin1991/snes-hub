import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaVolumeUp, FaVolumeMute, FaExpand, FaMinus, FaPlay, FaPause } from 'react-icons/fa';
import { useEmulator } from '../context/EmulatorContext';
import EmulatorFallback from './EmulatorFallback';
import toast from 'react-hot-toast';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$isMinimized ? 'transparent' : 'rgba(0, 0, 0, 0.95)'};
  z-index: ${props => props.$isMinimized ? '1000' : '9999'};
  display: flex;
  align-items: ${props => props.$isMinimized ? 'flex-end' : 'center'};
  justify-content: ${props => props.$isMinimized ? 'flex-end' : 'center'};
  padding: ${props => props.$isMinimized ? '20px' : '20px'};
  transition: all 0.3s ease;
  pointer-events: ${props => props.$isMinimized ? 'none' : 'auto'};
  
  @media (max-width: 768px) {
    padding: ${props => props.$isMinimized ? '15px' : '10px'};
  }
  
  @media (max-width: 480px) {
    padding: ${props => props.$isMinimized ? '10px' : '0'};
  }
  
  /* Esconder overlay do webpack-dev-server */
  #webpack-dev-server-client-overlay {
    display: none !important;
  }
`;

const ModalContent = styled(motion.div)`
  width: 100%;
  max-width: ${props => props.$isMinimized ? '400px' : '1200px'};
  height: 100%;
  max-height: ${props => props.$isMinimized ? '300px' : '90vh'};
  background: #000;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  transition: all 0.3s ease;
  pointer-events: auto;
  
  @media (max-width: 768px) {
    max-height: ${props => props.$isMinimized ? '250px' : '95vh'};
    max-width: ${props => props.$isMinimized ? '350px' : '100%'};
    border-radius: 10px;
    margin: 10px;
  }
  
  @media (max-width: 480px) {
    max-height: ${props => props.$isMinimized ? '200px' : '100vh'};
    max-width: ${props => props.$isMinimized ? '300px' : '100%'};
    border-radius: 0;
    margin: 0;
    height: ${props => props.$isMinimized ? '200px' : '100vh'};
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
`;

const GameInfo = styled.div`
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const GameTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: white;
`;

const GameSubtitle = styled.p`
  font-size: 12px;
  margin: 2px 0 0 0;
  opacity: 0.7;
  color: white;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ControlButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &.active {
    background: rgba(255, 107, 107, 0.3);
    border-color: #ff6b6b;
  }
`;

const EmulatorArea = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  position: relative;
  overflow: hidden;
`;

const EmulatorWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const EmulatorFrame = styled.div`
  width: 100%;
  height: 100%;
  border: 2px solid #333;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
`;

const LoadingScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const LoadingIcon = styled.div`
  font-size: 36px;
  margin-bottom: 15px;
  animation: spin 2s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: white;
`;

const ErrorScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const ErrorIcon = styled.div`
  font-size: 36px;
  margin-bottom: 15px;
  color: #ff6b6b;
`;

const ErrorText = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #ff6b6b;
`;

const ErrorSubtext = styled.div`
  font-size: 12px;
  opacity: 0.7;
  text-align: center;
  max-width: 300px;
  color: white;
`;


const CloseButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 107, 107, 0.3);
    border-color: #ff6b6b;
  }
`;


const EmulatorModal = () => {
  const { 
    currentGame, 
    isPlaying, 
    isModalOpen, 
    isMinimized,
    closeModal, 
    closeModalOnly,
    minimizeModal,
    maximizeModal,
    setEmulator 
  } = useEmulator();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [emulatorInitialized, setEmulatorInitialized] = useState(false);

  useEffect(() => {
    if ((isModalOpen || isMinimized) && currentGame && !emulatorInitialized) {
      console.log('=== INICIANDO EMULADOR ===');
      setLoading(true);
      setError(null);
      initializeEmulator();
    } else if ((isModalOpen || isMinimized) && currentGame && emulatorInitialized) {
      // Emulador já está rodando, apenas mostrar
      setLoading(false);
      setError(null);
    }
  }, [isModalOpen, isMinimized, currentGame, emulatorInitialized]);

  // Esconder overlay do webpack quando modal estiver aberto
  useEffect(() => {
    const webpackOverlay = document.getElementById('webpack-dev-server-client-overlay');
    if (webpackOverlay) {
      webpackOverlay.style.display = 'none';
    }
  }, [isModalOpen, isMinimized]);

      // Fechar modal com ESC e minimizar/maximizar com B
      useEffect(() => {
        const handleKeyDown = (event) => {
          if (event.key === 'Escape' && isModalOpen) {
            handleClose();
          }
          
          // Tecla B para minimizar/maximizar
          if (event.key === 'b' || event.key === 'B') {
            event.preventDefault();
            console.log('Tecla B pressionada - Modal aberto:', isModalOpen, 'Minimizado:', isMinimized);
            if (isModalOpen && !isMinimized) {
              console.log('Minimizando modal...');
              handleMinimize();
            } else if (isMinimized) {
              console.log('Maximizando modal...');
              handleMaximize();
            }
          }
          
          // Focus trap - quando modal está maximizado, manter foco dentro
          if (isModalOpen && !isMinimized && event.key === 'Tab') {
            const modalContent = document.querySelector('[data-modal-content]');
            if (modalContent) {
              const focusableElements = modalContent.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              );
              const firstElement = focusableElements[0];
              const lastElement = focusableElements[focusableElements.length - 1];
              
              if (event.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                  event.preventDefault();
                  lastElement?.focus();
                }
              } else {
                // Tab
                if (document.activeElement === lastElement) {
                  event.preventDefault();
                  firstElement?.focus();
                }
              }
            }
          }
        };

    // Capturar erros globais do EmulatorJS
    const handleGlobalError = (event) => {
      console.error('Erro global capturado:', {
        error: event.error,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      // Se for erro do EmulatorJS, não quebrar a aplicação
      if (event.filename && event.filename.includes('emulatorjs')) {
        console.log('Erro do EmulatorJS ignorado');
        event.preventDefault();
        return false;
      }
    };

    // Capturar promises rejeitadas
    const handleUnhandledRejection = (event) => {
      console.error('Promise rejeitada:', event.reason);
      // Se for do EmulatorJS, ignorar
      if (event.reason && event.reason.toString().includes('emulatorjs')) {
        console.log('Promise rejeitada do EmulatorJS ignorada');
        event.preventDefault();
      }
    };

    // Função para detectar botão Share do Xbox
    const handleGamepadInput = () => {
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad) {
          // Se modal está maximizado, bloquear apenas analógicos (joysticks) para navegação
          if (isModalOpen && !isMinimized) {
            // Bloquear analógicos (joysticks) se estiverem sendo usados para navegação
            for (let k = 0; k < gamepad.axes.length; k++) {
              if (Math.abs(gamepad.axes[k]) > 0.1) {
                console.log(`Analógico ${k} bloqueado - modal maximizado`);
                return; // Bloquear ação
              }
            }
          }
          
          // Botão Start (índice 9) para minimizar/maximizar
          if (gamepad.buttons[8] && gamepad.buttons[8].pressed) {
            console.log('🎮 EmulatorModal: Botão Start pressionado - Modal aberto:', isModalOpen, 'Minimizado:', isMinimized);
            if (isModalOpen && !isMinimized) {
              console.log('🎮 EmulatorModal: Minimizando modal via gamepad...');
              handleMinimize();
            } else if (isMinimized) {
              console.log('🎮 EmulatorModal: Maximizando modal via gamepad...');
              handleMaximize();
            }
            break;
          }
          
        }
      }
    };

    let gamepadInterval;
    if (isModalOpen || isMinimized) {
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('error', handleGlobalError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      
      
      // Adicionar listener para gamepad
      gamepadInterval = setInterval(handleGamepadInput, 100);
      
      // Prevenir scroll do body apenas quando modal estiver aberto (não minimizado)
      if (isModalOpen && !isMinimized) {
        document.body.style.overflow = 'hidden';
        
        // Focus trap - manter foco dentro do modal quando maximizado
        const modalElement = document.querySelector('[data-modal-content]');
        if (modalElement) {
          modalElement.focus();
        }
      } else {
        document.body.style.overflow = 'unset';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      document.body.style.overflow = 'unset';
      
      
      // Limpar interval do gamepad se existir
      if (gamepadInterval) {
        clearInterval(gamepadInterval);
      }
    };
  }, [isModalOpen, isMinimized]);


  const initializeEmulator = () => {
    console.log('Inicializando emulador para:', currentGame?.name);
    if (!currentGame || !currentGame.rom_path) {
      setError('ROM não encontrada');
      setLoading(false);
      return;
    }

    // Se já tem emulador rodando, não reinicializar
    if (window.EJS_emulator) {
      console.log('Emulador já está rodando, apenas mostrando');
      setLoading(false);
      return;
    }

    const loadEmulator = () => {
      try {
        // Limpar instância anterior se existir
        if (window.EJS_emulator) {
          try {
            if (typeof window.EJS_emulator.destroy === 'function') {
              window.EJS_emulator.destroy();
            }
          } catch (e) {
            console.log('Emulador anterior já foi limpo');
          }
        }

        // Limpar variáveis globais
        delete window.EJS_player;
        delete window.EJS_core;
        delete window.EJS_lightgun;
        delete window.EJS_biosUrl;
        delete window.EJS_gameUrl;
        delete window.EJS_pathtodata;
        delete window.EJS_emulator;

        // Limpar script anterior
        const existingScript = document.querySelector('script[src*="loader.js"]');
        if (existingScript) {
          existingScript.remove();
        }

        // Limpar div do emulador
        const emulatorDiv = document.getElementById('emulator-modal');
        if (emulatorDiv) {
          emulatorDiv.innerHTML = '';
        }

        // Aguardar um pouco para garantir limpeza
        setTimeout(() => {
          try {
            // Configurar EmulatorJS
            window.EJS_player = '#emulator-modal';
            window.EJS_core = 'snes9x';
            window.EJS_lightgun = false;
            window.EJS_biosUrl = '';
            window.EJS_gameUrl = `http://localhost:3001/api/roms/${currentGame.rom_path}`;
            window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';

            // Carregar o script do EmulatorJS
            const script = document.createElement('script');
            script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
            script.async = true;
            script.onload = () => {
              try {
                // Aguardar o emulador ser inicializado com timeout
                let attempts = 0;
                const maxAttempts = 100; // 10 segundos máximo
                
                const checkEmulator = () => {
                  try {
                    attempts++;
                    
                    if (window.EJS_emulator) {
                      setEmulator(window.EJS_emulator);
                      setEmulatorInitialized(true);
                      setLoading(false);
                    } else if (attempts < maxAttempts) {
                      setTimeout(checkEmulator, 100);
                    } else {
                      console.error('Timeout: Emulador não foi inicializado em 10 segundos');
                      setError('Timeout: Emulador demorou muito para carregar');
                      setLoading(false);
                    }
                  } catch (e) {
                    console.error('Erro ao verificar emulador:', e);
                    setError('Erro ao verificar o emulador');
                    setLoading(false);
                  }
                };
                checkEmulator();
              } catch (e) {
                console.error('Erro ao configurar emulador:', e);
                setError('Erro ao configurar o emulador');
                setLoading(false);
              }
            };
            script.onerror = (e) => {
              console.error('Erro ao carregar script do EmulatorJS:', e);
              setError('Erro ao carregar o emulador. Verifique sua conexão com a internet.');
              setLoading(false);
            };
            
            // Timeout para o script
            setTimeout(() => {
              if (!window.EJS_emulator && !emulatorInitialized) {
                console.error('Script do EmulatorJS não carregou em 15 segundos');
                setError('Erro de conexão: Não foi possível carregar o emulador');
                setLoading(false);
              }
            }, 15000);
            document.head.appendChild(script);
          } catch (error) {
            console.error('Erro ao configurar EmulatorJS:', error);
            setError('Erro ao configurar o emulador');
            setLoading(false);
          }
        }, 500);
      } catch (error) {
        console.error('Erro ao inicializar emulador:', error);
        setError('Erro ao inicializar o emulador');
        setLoading(false);
      }
    };

    loadEmulator();
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    // Implementar lógica de mute do emulador
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMinimize = (e) => {
    if (e) {
      e.stopPropagation();
    }
    console.log('Minimizando modal - emulador deve continuar rodando');
    minimizeModal();
  };

  const handleMaximize = (e) => {
    if (e) {
      e.stopPropagation();
    }
    console.log('Maximizando modal - emulador deve continuar rodando');
    maximizeModal();
  };

  const handleClose = () => {
    console.log('Fechando modal completamente - limpando emulador');
    
    // Limpar emulador ao fechar
    try {
      // Parar e destruir emulador
      if (window.EJS_emulator) {
        console.log('Destruindo emulador...');
        try {
          // Pausar primeiro
          if (typeof window.EJS_emulator.pause === 'function') {
            window.EJS_emulator.pause();
          }
          // Depois destruir
          if (typeof window.EJS_emulator.destroy === 'function') {
            window.EJS_emulator.destroy();
          }
        } catch (e) {
          console.log('Erro ao destruir emulador:', e);
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
            console.log(`Removido: ${key}`);
          }
        } catch (e) {
          console.log(`Não foi possível deletar ${key}:`, e);
        }
      });
      
      // EJS_Runtime é protegido, apenas limpar se possível
      try {
        if (window.EJS_Runtime) {
          window.EJS_Runtime = null;
          console.log('EJS_Runtime limpo (setado como null)');
        }
      } catch (e) {
        // Ignorar erro - EJS_Runtime é protegido
        console.log('EJS_Runtime é protegido, ignorando...');
      }
      
      // Remover TODOS os scripts do EmulatorJS
      document.querySelectorAll('script[src*="emulatorjs"], script[src*="loader.js"]').forEach(script => {
        script.remove();
        console.log('Script removido:', script.src);
      });
      
      // Limpar div do emulador
      const emulatorDiv = document.getElementById('emulator-modal');
      if (emulatorDiv) {
        emulatorDiv.innerHTML = '';
        console.log('Div do emulador limpo');
      }
      
      // Forçar garbage collection se disponível
      if (window.gc) {
        window.gc();
      }
      
    } catch (error) {
      console.log('Erro ao limpar emulador:', error);
    }
    
    // Resetar estado
    setEmulatorInitialized(false);
    closeModal(); // Esta função limpa o emulador
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    initializeEmulator();
  };

  if (!currentGame || (!isModalOpen && !isMinimized)) {
    return null;
  }

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          // Só fechar se clicou no overlay E não estiver minimizado
          if (e.target === e.currentTarget && !isMinimized) {
            handleClose();
          }
        }}
        style={{ cursor: isMinimized ? 'default' : 'pointer' }}
        $isMinimized={isMinimized}
      >
            <ModalContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'default' }}
              $isMinimized={isMinimized}
              data-modal-content
              tabIndex={-1}
            >
          <ModalHeader>
            <div></div>
            
            <GameInfo>
              <GameTitle>{currentGame.name}</GameTitle>
              <GameSubtitle>SNES Emulator</GameSubtitle>
            </GameInfo>
            
             <Controls>
               <ControlButton
                 onClick={isMinimized ? handleMaximize : handleMinimize}
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
                 title={isMinimized ? "Maximizar" : "Minimizar"}
               >
                 {isMinimized ? <FaExpand /> : <FaMinus />}
               </ControlButton>
               
               <ControlButton
                 onClick={toggleMute}
                 className={isMuted ? 'active' : ''}
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
                 title="Mutar/Desmutar"
               >
                 {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
               </ControlButton>
               
               <ControlButton
                 onClick={toggleFullscreen}
                 className={isFullscreen ? 'active' : ''}
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
                 title="Tela Cheia"
               >
                 <FaExpand />
               </ControlButton>
               
               <CloseButton
                 onClick={handleClose}
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
                 title="Fechar"
               >
                 <FaTimes />
               </CloseButton>
             </Controls>
          </ModalHeader>

          <EmulatorArea>
            <EmulatorWrapper>
              <EmulatorFrame>
                <div id="emulator-modal" style={{ width: '100%', height: '100%' }}></div>
                {loading && (
                  <LoadingScreen>
                    <LoadingIcon>🎮</LoadingIcon>
                    <LoadingText>Carregando Emulador...</LoadingText>
                  </LoadingScreen>
                )}
                {error && (
                  <ErrorScreen>
                    <ErrorIcon>⚠️</ErrorIcon>
                    <ErrorText>Erro ao carregar o jogo</ErrorText>
                    <ErrorSubtext>{error}</ErrorSubtext>
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <ControlButton onClick={handleRetry}>
                        Tentar Novamente
                      </ControlButton>
                      <ControlButton onClick={handleClose}>
                        Fechar
                      </ControlButton>
                    </div>
                  </ErrorScreen>
                )}
              </EmulatorFrame>
            </EmulatorWrapper>
            
          </EmulatorArea>
         </ModalContent>
       </ModalOverlay>
    </AnimatePresence>
  );
};

export default EmulatorModal;
