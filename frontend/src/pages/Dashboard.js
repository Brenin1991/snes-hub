import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaHeart, FaClock, FaTrophy, FaPlus, FaCog } from 'react-icons/fa';
import GameCard from '../components/GameCard';
import { getGames } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useEmulator } from '../context/EmulatorContext';
import useGamepadNavigation from '../hooks/useGamepadNavigation';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { blockNavigation } = useEmulator();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'favorites', 'recent', 'total'
  const [currentSection, setCurrentSection] = useState('stats'); // 'stats', 'games', 'buttons'

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      console.log('Loading games...');
      const response = await getGames();
      console.log('Games response:', response);
      setGames(response.data || []);
    } catch (error) {
      console.error('Error loading games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: games?.length || 0,
    favorites: games?.filter(game => game.is_favorite).length || 0,
    recentlyPlayed: games?.filter(game => game.last_played).length || 0,
    totalPlayTime: games?.reduce((sum, game) => sum + (game.play_count || 0), 0) || 0
  };

  const favoriteGames = games?.filter(game => game.is_favorite) || [];
  const recentGames = games
    ?.filter(game => game.last_played)
    ?.sort((a, b) => new Date(b.last_played) - new Date(a.last_played))
    ?.slice(0, 4) || [];

  // Função para filtrar jogos baseado no filtro ativo
  const getFilteredGames = () => {
    switch (activeFilter) {
      case 'favorites':
        return favoriteGames;
      case 'recent':
        return recentGames;
      case 'total':
        return games || [];
      case 'all':
      default:
        return games || [];
    }
  };

  const filteredGames = getFilteredGames();

  // Configuração da navegação
  const statsItems = [
    { id: 'total', label: 'Total de Jogos', filter: 'total' },
    { id: 'favorites', label: 'Favoritos', filter: 'favorites' },
    { id: 'recent', label: 'Jogados Recentemente', filter: 'recent' },
    { id: 'all', label: 'Todos os Jogos', filter: 'all' }
  ];

  const buttonItems = [
    { id: 'add', label: 'Adicionar Jogo', action: () => navigate('/add-game') },
    { id: 'settings', label: 'Configurações', action: () => navigate('/settings') }
  ];

  // Navegação unificada
  const allItems = [
    ...statsItems.map(item => ({ ...item, type: 'stat' })),
    ...filteredGames.map(game => ({ ...game, type: 'game' })),
    ...buttonItems.map(item => ({ ...item, type: 'button' }))
  ];

  const navigation = useGamepadNavigation({
    items: allItems,
    orientation: 'grid',
    gridColumns: 4,
    blockNavigation: blockNavigation,
    onItemSelect: (index, item) => {
      if (item.type === 'stat') {
        setActiveFilter(item.filter);
        setCurrentSection('stats');
      } else if (item.type === 'game') {
        setCurrentSection('games');
      } else if (item.type === 'button') {
        setCurrentSection('buttons');
      }
    },
    onItemActivate: (index, item) => {
      if (item.type === 'stat') {
        setActiveFilter(item.filter);
        setCurrentSection('games');
      } else if (item.type === 'game') {
        navigate(`/game/${item.id}`);
      } else if (item.type === 'button') {
        item.action();
      }
    }
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="snes-container has-phantom-bg" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="text-white">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 30px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h1 className="text-black" style={{ fontSize: '40px', fontWeight: 'bold', letterSpacing: '2px' }}>
            Dashboard
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <motion.button
              ref={navigation.itemRefs[statsItems.length + filteredGames.length]}
              onClick={() => navigate('/add-game')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="snes-button has-sunshine-color"
              style={{
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 'bold',
                boxShadow: navigation.focusedIndex === (statsItems.length + filteredGames.length)
                  ? '0 0 25px rgba(255, 215, 0, 0.8), inset 0 0 25px rgba(255, 215, 0, 0.3)' 
                  : 'none',
                transform: navigation.focusedIndex === (statsItems.length + filteredGames.length) 
                  ? 'scale(1.1)' 
                  : 'scale(1)',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              <FaPlus />
              Adicionar Jogo
            </motion.button>
            
            <motion.button
              ref={navigation.itemRefs[statsItems.length + filteredGames.length + 1]}
              onClick={() => navigate('/settings')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="snes-button has-ember-color"
              style={{
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 'bold',
                boxShadow: navigation.focusedIndex === (statsItems.length + filteredGames.length + 1)
                  ? '0 0 25px rgba(255, 215, 0, 0.8), inset 0 0 25px rgba(255, 215, 0, 0.3)' 
                  : 'none',
                transform: navigation.focusedIndex === (statsItems.length + filteredGames.length + 1) 
                  ? 'scale(1.1)' 
                  : 'scale(1)',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              <FaCog />
              Configurações
            </motion.button>
          </div>
        </div>
        <p className="text-black" style={{ fontSize: '10px', opacity: 0.8, letterSpacing: '1px' }}>
          Bem-vindo ao seu launcher SNES pessoal
        </p>
        
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '25px', 
        marginBottom: '40px',
        flexWrap: 'wrap'
      }}>
        <motion.div
          ref={navigation.itemRefs[0]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveFilter('total')}
          className={`snes-container ${activeFilter === 'total' ? 'has-ember-bg' : 'has-red-bg'}`}
          style={{ 
            padding: '20px', 
            textAlign: 'center', 
            flex: '1',
            minWidth: '200px',
            cursor: 'pointer',
            boxShadow: navigation.focusedIndex === 0 
              ? '0 0 25px rgba(255, 215, 0, 0.8), inset 0 0 25px rgba(255, 215, 0, 0.3)' 
              : 'none',
            transform: navigation.focusedIndex === 0 ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s ease',
          }}
        >
          <div className="text-white" style={{ fontSize: '24px' }}>
            <FaPlay />
          </div>
          <div>
            <div className="text-white" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
              {stats.total}
            </div>
            <div className="text-white" style={{ fontSize: '10px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Total de Jogos
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={navigation.itemRefs[1]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveFilter('favorites')}
          className={`snes-container ${activeFilter === 'favorites' ? 'has-ember-bg' : 'has-yellow-bg'}`}
          style={{ 
            padding: '20px', 
            textAlign: 'center', 
            flex: '1',
            minWidth: '200px',
            cursor: 'pointer',
            boxShadow: navigation.focusedIndex === 1 
              ? '0 0 25px rgba(255, 215, 0, 0.8), inset 0 0 25px rgba(255, 215, 0, 0.3)' 
              : 'none',
            transform: navigation.focusedIndex === 1 ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
        >
          <div className="text-white" style={{ fontSize: '24px' }}>
            <FaHeart />
          </div>
          <div>
            <div className="text-white" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
              {stats.favorites}
            </div>
            <div className="text-white" style={{ fontSize: '10px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Favoritos
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={navigation.itemRefs[2]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveFilter('recent')}
          className={`snes-container ${activeFilter === 'recent' ? 'has-ember-bg' : 'has-blue-bg'}`}
          style={{ 
            padding: '20px', 
            textAlign: 'center', 
            flex: '1',
            minWidth: '200px',
            cursor: 'pointer',
            boxShadow: navigation.focusedIndex === 2 
              ? '0 0 25px rgba(255, 215, 0, 0.8), inset 0 0 25px rgba(255, 215, 0, 0.3)' 
              : 'none',
            transform: navigation.focusedIndex === 2 ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
        >
          <div className="text-white" style={{ fontSize: '24px' }}>
            <FaClock />
          </div>
          <div>
            <div className="text-white" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
              {stats.recentlyPlayed}
            </div>
            <div className="text-white" style={{ fontSize: '10px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Jogados Recentemente
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={navigation.itemRefs[3]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveFilter('all')}
          className={`snes-container ${activeFilter === 'all' ? 'has-ember-bg' : 'has-nature-bg'}`}
          style={{ 
            padding: '20px', 
            textAlign: 'center', 
            flex: '1',
            minWidth: '200px',
            cursor: 'pointer',
            boxShadow: navigation.focusedIndex === 3 
              ? '0 0 25px rgba(255, 215, 0, 0.8), inset 0 0 25px rgba(255, 215, 0, 0.3)' 
              : 'none',
            transform: navigation.focusedIndex === 3 ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
        >
          <div className="text-white" style={{ fontSize: '24px' }}>
            <FaTrophy />
          </div>
          <div>
            <div className="text-white" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
              {stats.totalPlayTime}
            </div>
            <div className="text-white" style={{ fontSize: '10px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Total de Jogadas
            </div>
          </div>
        </motion.div>
      </div>

      {/* Seção de Jogos Filtrados */}
      {filteredGames && filteredGames.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h2 className="text-black" style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              letterSpacing: '1px' 
            }}>
              {activeFilter === 'favorites' && '⭐ Favoritos'}
              {activeFilter === 'recent' && '🕒 Jogados Recentemente'}
              {activeFilter === 'total' && '🎮 Todos os Jogos'}
              {activeFilter === 'all' && '🏆 Todos os Jogos'}
            </h2>
            <div className="text-phantom-color" style={{ 
              fontSize: '10px', 
              opacity: 0.8 
            }}>
              {filteredGames.length} jogo{filteredGames.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                ref={navigation.itemRefs[statsItems.length + index]}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  boxShadow: navigation.focusedIndex === (statsItems.length + index)
                    ? '0 0 25px rgba(255, 215, 0, 0.9), inset 0 0 25px rgba(255, 215, 0, 0.4)' 
                    : 'none',
                  transform: navigation.focusedIndex === (statsItems.length + index) 
                    ? 'scale(1.08)' 
                    : 'scale(1)',
                  transition: 'all 0.2s ease',
                  zIndex: navigation.focusedIndex === (statsItems.length + index) ? 10 : 1
                }}
              >
                <GameCard 
                  game={game} 
                  onUpdate={loadGames} 
                  isFocused={navigation.focusedIndex === (statsItems.length + index)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px' 
        }}>
          <div className="snes-container has-phantom-bg" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="text-white" style={{ fontSize: '48px', marginBottom: '20px' }}>🎮</div>
            <p className="text-white" style={{ fontSize: '18px', fontWeight: 'bold' }}>Carregando jogos...</p>
          </div>
        </div>
      )}

      {!loading && (!games || games.length === 0) && (
        <div>
          <div className="snes-container has-phantom-bg" style={{ 
            textAlign: 'center', 
            padding: '40px' 
          }}>
            <div className="text-white" style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>
              🎮
            </div>
            <p className="text-white" style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '10px' 
            }}>
              Nenhum jogo encontrado
            </p>
            <p className="text-white" style={{ 
              fontSize: '14px', 
              opacity: 0.7,
              marginBottom: '20px'
            }}>
              Adicione alguns jogos para começar a jogar!
            </p>
            <motion.button
              onClick={() => navigate('/add-game')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="snes-button has-ember-color"
              style={{
                padding: '15px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <FaPlus />
              Adicionar Primeiro Jogo
            </motion.button>
          </div>
        </div>
      )}

      </div>
    );
};

export default Dashboard;