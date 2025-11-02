import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay } from 'react-icons/fa';
import { playGame } from '../services/api';
import { useEmulator } from '../context/EmulatorContext';
import toast from 'react-hot-toast';

const GameCard = ({ game, onUpdate, isFocused = false, onFocus = () => {}, showOverlay = true }) => {
  const navigate = useNavigate();
  const { openModal, currentGame, isPlaying } = useEmulator();
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePlay = async (e) => {
    e.stopPropagation();
    try {
      await playGame(game.id);
      openModal(game);
    } catch (error) {
      toast.error('Erro ao iniciar o jogo');
    }
  };

  // Handler para clique no card
  const handleCardClick = () => {
    navigate(`/game/${game.id}`);
  };

  // Handler para foco
  const handleFocus = () => {
    onFocus();
  };

  // Handlers para hover
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Mostrar botão de play quando focado
  useEffect(() => {
    if (isFocused) {
      setShowPlayButton(true);
    } else {
      setShowPlayButton(false);
    }
  }, [isFocused]);


  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      onFocus={handleFocus}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      className="snes-cartridge has-gray-bg"
      style={{
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease',
        width: '300px',
        height: '300px',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 50px 50px 50px',
        outline: 'none',
        boxShadow: isFocused 
          ? '0 0 25px rgba(255, 255, 255, 0.9), inset 0 0 25px rgba(255, 255, 255, 0.4)' 
          : 'none',
        transform: isFocused ? 'scale(1.08)' : 'scale(1)',
        zIndex: isFocused ? 10 : 1
      }}
    >
      {/* Imagem do jogo */}
      <div style={{
        width: '100%',
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '10px'
      }}>
        {game.image_path ? (
          <img
            src={`http://localhost:3001/uploads/images/${game.image_path}`}
            alt={game.name}
            style={{ 
              width: '100%', 
              height: 'auto', 
              objectFit: 'cover',
              imageRendering: 'pixelated',
              borderRadius: '10px'
            }}
          />
        ) : (
          <div className="text-white" style={{ fontSize: '64px' }}>🎮</div>
        )}
        
        {/* Overlay com informações do jogo - só aparece quando selecionado e showOverlay for true */}
        {showOverlay && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            opacity: (isFocused || isHovered) ? 1 : 0,
            transition: 'opacity 0.3s ease',
            borderRadius: '10px'
          }}>
            <h3 style={{
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '8px',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              lineHeight: '1.2',
              color: 'white',
              textAlign: 'center',
              maxWidth: '100%'
            }}>
              {game.name}
            </h3>
            
            <div style={{
              fontSize: '12px',
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
              color: 'white'
            }}>
              <FaPlay style={{ fontSize: '10px' }} /> {game.play_count || 0} jogadas
            </div>
            
            <div style={{
              fontSize: '10px',
              opacity: 0.8,
              textAlign: 'center',
              color: 'white'
            }}>
              {game.last_played ? new Date(game.last_played).toLocaleDateString() : 'Nunca jogado'}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GameCard;