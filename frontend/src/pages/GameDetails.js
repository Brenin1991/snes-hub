import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaHeart, FaTrash, FaClock, FaGamepad, FaArrowLeft } from 'react-icons/fa';
import { getGameById, playGame, toggleFavorite, deleteGame, getGameScreenshots } from '../services/api';
import { useEmulator } from '../context/EmulatorContext';
import useGamepadNavigation from '../hooks/useGamepadNavigation';
import GameCard from '../components/GameCard';
import toast from 'react-hot-toast';

const GameDetails = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { openModal, currentGame, isPlaying, blockNavigation } = useEmulator();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screenshots, setScreenshots] = useState([]);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [isAutoSlide, setIsAutoSlide] = useState(true);

  // Função para voltar
  const handleBack = () => {
    navigate(-1); // Volta para a página anterior
  };

  useEffect(() => {
    loadGame();
  }, [gameId]);

  // Slide automático
  useEffect(() => {
    if (screenshots.length > 1 && isAutoSlide) {
      const interval = setInterval(() => {
        setCurrentScreenshotIndex((prev) => 
          prev === screenshots.length - 1 ? 0 : prev + 1
        );
      }, 3000); // Muda a cada 3 segundos

      return () => clearInterval(interval);
    }
  }, [screenshots.length, isAutoSlide]);

  const loadGame = async () => {
    try {
      setLoading(true);
      const gameData = await getGameById(gameId);
      setGame(gameData);
      
      // Carregar screenshots
      const screenshotsData = await getGameScreenshots(gameId);
      setScreenshots(screenshotsData);
    } catch (error) {
      console.error('Error loading game:', error);
      toast.error('Erro ao carregar jogo');
      navigate('/library');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async () => {
    try {
      await playGame(game.id);
      openModal(game);
    } catch (error) {
      toast.error('Erro ao iniciar o jogo');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(game.id);
      setGame(prev => ({ ...prev, is_favorite: !prev.is_favorite }));
      toast.success(game.is_favorite ? 'Removido dos favoritos!' : 'Adicionado aos favoritos!');
    } catch (error) {
      toast.error('Erro ao atualizar favorito.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja deletar ${game.name}?`)) {
      try {
        await deleteGame(game.id);
        toast.success('Jogo deletado com sucesso!');
        navigate('/library');
      } catch (error) {
        toast.error('Erro ao deletar jogo.');
      }
    }
  };

  // Funções para navegar pelos screenshots
  const nextScreenshot = () => {
    setIsAutoSlide(false); // Pausa o slide automático
    setCurrentScreenshotIndex((prev) => 
      prev === screenshots.length - 1 ? 0 : prev + 1
    );
  };

  const prevScreenshot = () => {
    setIsAutoSlide(false); // Pausa o slide automático
    setCurrentScreenshotIndex((prev) => 
      prev === 0 ? screenshots.length - 1 : prev - 1
    );
  };

  const goToScreenshot = (index) => {
    setIsAutoSlide(false); // Pausa o slide automático
    setCurrentScreenshotIndex(index);
  };


  // Configuração da navegação
  const actionItems = [
    { id: 'play', label: 'Jogar', action: handlePlay, icon: FaPlay },
    { id: 'favorite', label: game?.is_favorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos', action: handleToggleFavorite, icon: FaHeart },
    { id: 'delete', label: 'Deletar Jogo', action: handleDelete, icon: FaTrash },
    { id: 'back', label: 'Voltar', action: handleBack, icon: FaArrowLeft }
  ];

  const navigation = useGamepadNavigation({
    items: actionItems,
    orientation: 'horizontal',
    blockNavigation: blockNavigation,
    onItemActivate: (index, item) => {
      item.action();
    }
  });

  // Handler para ESC e botão B do controle
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleBack();
      }
    };

    const handleGamepadBack = () => {
      handleBack();
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('gamepadBack', handleGamepadBack);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('gamepadBack', handleGamepadBack);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="snes-container has-phantom-bg" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="text-white" style={{ fontSize: '48px', marginBottom: '20px' }}>🎮</div>
          <p className="text-white" style={{ fontSize: '18px', fontWeight: 'bold' }}>Carregando Jogo...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="snes-container has-phantom-bg" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="text-white" style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <p className="text-white" style={{ fontSize: '18px', fontWeight: 'bold' }}>Jogo não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '40px 30px' }}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: '40px' }}
      >
        <h1 className="text-black" style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          letterSpacing: '2px' 
        }}>
          {game.name}
        </h1>
      </motion.div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Card do jogo */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ flex: '0 0 300px' }}
        >
          <GameCard 
            game={game} 
            isFocused={false}
            onFocus={() => {}}
            onUpdate={() => {}}
            showOverlay={false}
          />
        </motion.div>

        {/* Informações do jogo */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ flex: 1, minWidth: '300px' }}
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="snes-container has-gray-bg" 
            style={{ padding: '40px', marginBottom: '30px' }}
          >
            <h2 className="text-white" style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '25px',
              letterSpacing: '1px'
            }}>
              Informações do Jogo
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <FaPlay className="text-white" style={{ fontSize: '16px' }} />
                <span className="text-white" style={{ fontSize: '12px', fontWeight: 'bold' }}>Jogadas:</span>
                <span className="text-white" style={{ fontSize: '12px' }}>{game.play_count || 0}</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <FaClock className="text-white" style={{ fontSize: '16px' }} />
                <span className="text-white" style={{ fontSize: '12px', fontWeight: 'bold' }}>Última jogada:</span>
                <span className="text-white" style={{ fontSize: '12px' }}>
                  {game.last_played ? new Date(game.last_played).toLocaleDateString() : 'Nunca jogado'}
                </span>
              </motion.div>
              
              {game.description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <span className="text-white" style={{ fontSize: '12px', fontWeight: 'bold' }}>Descrição:</span>
                  <p className="text-white" style={{ fontSize: '12px', marginTop: '5px', lineHeight: '1.4' }}>
                    {game.description}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Botões de ação */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}
          >
            {actionItems.map((item, index) => (
              <motion.button
                key={item.id}
                ref={navigation.itemRefs[index]}
                onClick={item.action}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`snes-button ${
                  item.id === 'play' ? 'has-ember-color' :
                  item.id === 'favorite' ? (game.is_favorite ? 'has-rose-color' : 'has-phantom-color') :
                  item.id === 'delete' ? 'has-red-color' :
                  'has-ocean-color'
                }`}
                style={{
                  padding: '18px 35px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 'bold',
                  boxShadow: navigation.focusedIndex === index 
                    ? '0 0 25px rgba(255, 215, 0, 0.8), inset 0 0 25px rgba(255, 215, 0, 0.3)' 
                    : 'none',
                  transform: navigation.focusedIndex === index ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
              >
                <item.icon />
                {item.label}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Slider de Screenshots */}
      {screenshots.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          style={{ marginTop: '40px' }}
        >
          <h2 className="text-white" style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '25px',
            letterSpacing: '1px',
            textAlign: 'center'
          }}>
            Screenshots do Jogo
          </h2>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '20px'
          }}>
            {/* Screenshot principal */}
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: '800px',
              height: '400px',
              overflow: 'hidden',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
            }}>
              <img
                src={`http://localhost:3001/uploads/screenshots/${screenshots[currentScreenshotIndex]?.image_path}`}
                alt={`Screenshot ${currentScreenshotIndex + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain', // Mudado de 'cover' para 'contain' para não cortar
                  imageRendering: 'pixelated',
                  backgroundColor: '#000' // Fundo preto para preencher espaços vazios
                }}
              />
              
              {/* Botões de navegação */}
              {screenshots.length > 1 && (
                <>
                  <button
                    onClick={prevScreenshot}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: 'none',
                      color: 'white',
                      fontSize: '24px',
                      padding: '10px 15px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(0, 0, 0, 0.9)';
                      e.target.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                      e.target.style.transform = 'translateY(-50%) scale(1)';
                    }}
                  >
                    ‹
                  </button>
                  
                  <button
                    onClick={nextScreenshot}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      border: 'none',
                      color: 'white',
                      fontSize: '24px',
                      padding: '10px 15px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(0, 0, 0, 0.9)';
                      e.target.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                      e.target.style.transform = 'translateY(-50%) scale(1)';
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            
            {/* Indicador de progresso */}
            {screenshots.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                {screenshots.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: currentScreenshotIndex === index 
                        ? '#ff6b6b' 
                        : 'rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => goToScreenshot(index)}
                  />
                ))}
              </div>
            )}

            {/* Miniaturas */}
            {screenshots.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {screenshots.map((screenshot, index) => (
                  <button
                    key={screenshot.id}
                    onClick={() => goToScreenshot(index)}
                    style={{
                      width: '80px',
                      height: '60px',
                      border: 'none',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      opacity: currentScreenshotIndex === index ? 1 : 0.6,
                      transform: currentScreenshotIndex === index ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.3s ease',
                      boxShadow: currentScreenshotIndex === index 
                        ? '0 0 15px rgba(255, 255, 255, 0.5)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <img
                      src={`http://localhost:3001/uploads/screenshots/${screenshot.image_path}`}
                      alt={`Screenshot ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        imageRendering: 'pixelated'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GameDetails;
