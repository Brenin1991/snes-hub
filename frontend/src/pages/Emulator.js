import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaMinus } from 'react-icons/fa';
import { getGameById, playGame } from '../services/api';
import { useEmulator } from '../context/EmulatorContext';
import EmulatorFallback from '../components/EmulatorFallback';
import toast from 'react-hot-toast';

const EmulatorContainer = styled.div`
  height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
`;

const BackButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 15px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const GameInfo = styled.div`
  text-align: center;
  flex: 1;
`;

const GameTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const GameSubtitle = styled.p`
  font-size: 14px;
  opacity: 0.7;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const ControlButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
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
  max-width: 800px;
  max-height: 600px;
  position: relative;
`;

const EmulatorFrame = styled.div`
  width: 100%;
  height: 100%;
  border: 2px solid #333;
  border-radius: 10px;
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
  font-size: 48px;
  margin-bottom: 20px;
  animation: spin 2s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  font-size: 18px;
  font-weight: bold;
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
  font-size: 48px;
  margin-bottom: 20px;
  color: #ff6b6b;
`;

const ErrorText = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #ff6b6b;
`;

const ErrorSubtext = styled.div`
  font-size: 14px;
  opacity: 0.7;
  text-align: center;
  max-width: 400px;
`;

const Instructions = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  text-align: center;
  z-index: 5;
`;

const Emulator = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { currentGame, isPlaying, setEmulator } = useEmulator();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const stopGame = () => {
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
      
      // Limpar variáveis globais
      delete window.EJS_player;
      delete window.EJS_core;
      delete window.EJS_lightgun;
      delete window.EJS_biosUrl;
      delete window.EJS_gameUrl;
      delete window.EJS_pathtodata;
      delete window.EJS_emulator;
      
      // Remover script do EmulatorJS se existir
      const existingScript = document.querySelector('script[src*="loader.js"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Limpar div do emulador
      const emulatorDiv = document.getElementById('emulator');
      if (emulatorDiv) {
        emulatorDiv.innerHTML = '';
      }
      
    } catch (error) {
      console.log('Erro ao parar emulador:', error);
    }
  };

  useEffect(() => {
    console.log('=== RESET BRUTAL INICIADO ===');
    
    // RESET BRUTAL - DESTRUIR TUDO
    try {
      // Destruir emulador se existir
      if (window.EJS_emulator) {
        window.EJS_emulator.destroy();
        window.EJS_emulator = null;
      }
      
      // Limpar TODAS as variáveis globais
      Object.keys(window).forEach(key => {
        if (key.startsWith('EJS_')) {
          delete window[key];
        }
      });
      
      // Remover TODOS os scripts do EmulatorJS
      document.querySelectorAll('script[src*="loader.js"]').forEach(script => {
        script.remove();
      });
      
      // Limpar div do emulador
      const emulatorDiv = document.getElementById('emulator');
      if (emulatorDiv) {
        emulatorDiv.innerHTML = '';
      }
      
      // Forçar garbage collection se disponível
      if (window.gc) {
        window.gc();
      }
      
      console.log('RESET BRUTAL CONCLUÍDO - CARREGANDO JOGO');
      
      // Aguardar um pouco e carregar
      setTimeout(() => {
        loadGame();
      }, 200);
      
    } catch (error) {
      console.log('Erro no reset brutal:', error);
      loadGame();
    }
    
    // Cleanup simples
    return () => {
      console.log('CLEANUP SIMPLES');
    };
  }, [gameId]);

  useEffect(() => {
    if (game) {
      // Verificar se o emulador já está rodando para o mesmo jogo
      if (window.EJS_emulator && window.EJS_gameUrl && window.EJS_gameUrl.includes(game.rom_path)) {
        console.log('Emulador já está rodando para este jogo, apenas restaurando visual');
        setLoading(false);
        // Garantir que o emulador esteja visível
        const emulatorDiv = document.getElementById('emulator');
        if (emulatorDiv) {
          emulatorDiv.style.display = 'block';
        }
      } else {
        console.log('Inicializando novo emulador');
        initializeEmulator();
      }
    }
  }, [game]);

  const loadGame = async () => {
    try {
      const gameData = await getGameById(gameId);
      setGame(gameData);
    } catch (error) {
      console.error('Erro ao carregar jogo:', error);
      setError('Erro ao carregar informações do jogo');
    } finally {
      setLoading(false);
    }
  };

  const initializeEmulator = () => {
    console.log('Inicializando emulador para:', game?.name);
    if (!game || !game.rom_path) {
      setError('ROM não encontrada');
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
        const emulatorDiv = document.getElementById('emulator');
        if (emulatorDiv) {
          emulatorDiv.innerHTML = '';
        }

        // Aguardar um pouco para garantir limpeza
        setTimeout(() => {
          try {
            // Registrar contador de jogadas
            playGame(gameId);

            // Configurar EmulatorJS
            window.EJS_player = '#emulator';
            window.EJS_core = 'snes9x';
            window.EJS_lightgun = false;
            window.EJS_biosUrl = '';
            window.EJS_gameUrl = `http://localhost:3001/api/roms/${game.rom_path}`;
            window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';

            // Carregar o script do EmulatorJS
            const script = document.createElement('script');
            script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
            script.async = true;
            script.onload = () => {
              try {
                // Aguardar o emulador ser inicializado
                const checkEmulator = () => {
                  if (window.EJS_emulator) {
                    setEmulator(window.EJS_emulator);
                    setLoading(false);
                  } else {
                    setTimeout(checkEmulator, 100);
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
              console.error('Erro ao carregar script:', e);
              setError('Erro ao carregar o emulador');
              setLoading(false);
            };
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Implementar lógica de mute do emulador
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleMinimize = () => {
    navigate('/');
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    initializeEmulator();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <EmulatorContainer>
        <Header>
          <BackButton onClick={handleBack} whileHover={{ scale: 1.05 }}>
            <FaArrowLeft />
            Voltar
          </BackButton>
          <GameInfo>
            <GameTitle>Carregando...</GameTitle>
          </GameInfo>
          <Controls></Controls>
        </Header>
        <EmulatorArea>
          <LoadingScreen>
            <LoadingIcon>🎮</LoadingIcon>
            <LoadingText>Carregando Emulador...</LoadingText>
          </LoadingScreen>
        </EmulatorArea>
      </EmulatorContainer>
    );
  }

  if (error) {
    return (
      <EmulatorContainer>
        <Header>
          <BackButton onClick={handleBack} whileHover={{ scale: 1.05 }}>
            <FaArrowLeft />
            Voltar
          </BackButton>
          <GameInfo>
            <GameTitle>Erro</GameTitle>
          </GameInfo>
          <Controls></Controls>
        </Header>
        <EmulatorArea>
          <ErrorScreen>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorText>Erro ao carregar o jogo</ErrorText>
            <ErrorSubtext>{error}</ErrorSubtext>
          </ErrorScreen>
        </EmulatorArea>
      </EmulatorContainer>
    );
  }

  return (
    <EmulatorContainer>
      <Header>
        <BackButton onClick={handleBack} whileHover={{ scale: 1.05 }}>
          <FaArrowLeft />
          Voltar
        </BackButton>
        
        <GameInfo>
          <GameTitle>{game?.name}</GameTitle>
          <GameSubtitle>SNES Emulator</GameSubtitle>
        </GameInfo>
        
        <Controls>
          <ControlButton
            onClick={handleMinimize}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Minimizar"
          >
            <FaMinus />
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
        </Controls>
      </Header>

      <EmulatorArea>
        <EmulatorWrapper>
          <EmulatorFrame>
            <div id="emulator" style={{ width: '100%', height: '100%' }}></div>
            {error && (
              <EmulatorFallback
                onRetry={handleRetry}
                onGoHome={handleGoHome}
                error={error}
              />
            )}
          </EmulatorFrame>
        </EmulatorWrapper>
        
        <Instructions>
          <div><strong>Controles:</strong> Setas para mover, Z para pular, X para correr</div>
          <div><strong>Menu:</strong> Enter para pausar, Esc para configurações</div>
        </Instructions>
      </EmulatorArea>
    </EmulatorContainer>
  );
};

export default Emulator;
