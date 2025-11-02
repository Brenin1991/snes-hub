import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaTh, FaList, FaPlus } from 'react-icons/fa';
import HomeButton from '../components/HomeButton';
import GameCard from '../components/GameCard';
import { getGames } from '../services/api';
import { useEmulator } from '../context/EmulatorContext';
import useGamepadNavigation from '../hooks/useGamepadNavigation';
import { useNavigate } from 'react-router-dom';

const GameLibrary = () => {
  const navigate = useNavigate();
  const { blockNavigation } = useEmulator();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [currentSection, setCurrentSection] = useState('controls'); // 'controls', 'games'

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const response = await getGames();
      setGames(response.data);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = (games || []).filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'favorites' && game.is_favorite) ||
      (filter === 'recent' && game.last_played);
    return matchesSearch && matchesFilter;
  });

  // Configuração da navegação para controles
  const controlItems = [
    { id: 'search', label: 'Buscar', action: () => document.getElementById('search-input')?.focus() },
    { id: 'filter', label: filter === 'all' ? 'Todos' : 'Favoritos', action: () => setFilter(filter === 'all' ? 'favorites' : 'all') },
    { id: 'grid', label: 'Grade', action: () => setViewMode('grid') },
    { id: 'list', label: 'Lista', action: () => setViewMode('list') },
    { id: 'add', label: 'Adicionar Jogo', action: () => navigate('/add-game') }
  ];

  // Navegação para controles
  const controlsNavigation = useGamepadNavigation({
    items: controlItems,
    orientation: 'horizontal',
    blockNavigation: blockNavigation,
    onItemActivate: (index, item) => {
      item.action();
    }
  });

  // Navegação para jogos
  const gamesNavigation = useGamepadNavigation({
    items: filteredGames,
    orientation: viewMode === 'grid' ? 'grid' : 'vertical',
    gridColumns: 4,
    blockNavigation: blockNavigation,
    onItemActivate: (index, game) => {
      // Navegar para detalhes do jogo
      window.location.href = `/game/${game.id}`;
    }
  });

  // Handler para navegação entre seções
  const handleSectionNavigation = (direction) => {
    if (direction === 'down' && currentSection === 'controls') {
      setCurrentSection('games');
    } else if (direction === 'up' && currentSection === 'games') {
      setCurrentSection('controls');
    }
  };

  // Navegação global
  useEffect(() => {
    const handleGlobalNavigation = (event) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        handleSectionNavigation(event.key === 'ArrowUp' ? 'up' : 'down');
      }
    };

    document.addEventListener('keydown', handleGlobalNavigation);
    return () => document.removeEventListener('keydown', handleGlobalNavigation);
  }, [currentSection]);

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
    <div style={{ padding: '20px' }}>
      <HomeButton />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <h1 className="text-black" style={{ fontSize: '32px', fontWeight: 'bold' }}>
          Biblioteca de Jogos
        </h1>
        
        {/* Indicador de navegação */}
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          background: 'rgba(0, 0, 0, 0.8)', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace',
          zIndex: 1000
        }}>
          Seção: {currentSection === 'controls' ? 'Controles' : 'Jogos'} | 
          Use ↑↓ para navegar entre seções | 
          Use ←→ para navegar dentro da seção | 
          Enter para ativar
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div className="text-phantom-color" style={{ position: 'absolute', left: '15px', fontSize: '18px' }}>
              <FaSearch />
            </div>
            <input
              id="search-input"
              type="text"
              placeholder="Buscar jogos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="snes-input"
              style={{ 
                width: '300px', 
                paddingLeft: '45px',
                boxShadow: currentSection === 'controls' && controlsNavigation.focusedIndex === 0 
                  ? '0 0 15px rgba(255, 255, 255, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.2)' 
                  : 'none',
                transform: currentSection === 'controls' && controlsNavigation.focusedIndex === 0 
                  ? 'scale(1.05)' 
                  : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          <button
            ref={controlsNavigation.itemRefs[1]}
            onClick={() => setFilter(filter === 'all' ? 'favorites' : 'all')}
            className="snes-button has-ocean-color"
            style={{
              padding: '12px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              boxShadow: currentSection === 'controls' && controlsNavigation.focusedIndex === 1 
                ? '0 0 15px rgba(255, 255, 255, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.2)' 
                : 'none',
              transform: currentSection === 'controls' && controlsNavigation.focusedIndex === 1 
                ? 'scale(1.1)' 
                : 'scale(1)'
            }}
          >
            <FaFilter />
            {filter === 'all' ? 'Todos' : 'Favoritos'}
          </button>

          <div className="snes-container" style={{ display: 'flex', overflow: 'hidden' }}>
            <button
              ref={controlsNavigation.itemRefs[2]}
              onClick={() => setViewMode('grid')}
              className={`snes-button ${viewMode === 'grid' ? 'has-ember-color' : 'has-phantom-color'}`}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxShadow: currentSection === 'controls' && controlsNavigation.focusedIndex === 2 
                  ? '0 0 15px rgba(255, 255, 255, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.2)' 
                  : 'none',
                transform: currentSection === 'controls' && controlsNavigation.focusedIndex === 2 
                  ? 'scale(1.1)' 
                  : 'scale(1)'
              }}
            >
              <FaTh />
            </button>
            <button
              ref={controlsNavigation.itemRefs[3]}
              onClick={() => setViewMode('list')}
              className={`snes-button ${viewMode === 'list' ? 'has-ember-color' : 'has-phantom-color'}`}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                boxShadow: currentSection === 'controls' && controlsNavigation.focusedIndex === 3 
                  ? '0 0 15px rgba(255, 255, 255, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.2)' 
                  : 'none',
                transform: currentSection === 'controls' && controlsNavigation.focusedIndex === 3 
                  ? 'scale(1.1)' 
                  : 'scale(1)'
              }}
            >
              <FaList />
            </button>
          </div>

          <motion.button
            ref={controlsNavigation.itemRefs[4]}
            onClick={() => navigate('/add-game')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="snes-button has-galaxy-color"
            style={{
              padding: '12px 24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              boxShadow: currentSection === 'controls' && controlsNavigation.focusedIndex === 4 
                ? '0 0 15px rgba(255, 255, 255, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.2)' 
                : 'none',
              transform: currentSection === 'controls' && controlsNavigation.focusedIndex === 4 
                ? 'scale(1.1)' 
                : 'scale(1)'
            }}
          >
            <FaPlus />
            Adicionar Jogo
          </motion.button>
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="snes-container has-phantom-bg" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="text-white" style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.5 }}>
            🎮
          </div>
          <h3 className="text-white" style={{ fontSize: '24px', marginBottom: '15px' }}>
            {searchTerm ? 'Nenhum jogo encontrado' : 'Nenhum jogo na biblioteca'}
          </h3>
          <p className="text-white" style={{ fontSize: '16px', marginBottom: '30px' }}>
            {searchTerm 
              ? 'Tente ajustar sua busca ou filtros' 
              : 'Adicione seu primeiro jogo para começar'
            }
          </p>
          {!searchTerm && (
            <motion.button
              onClick={() => navigate('/add-game')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="snes-button has-ember-color"
              style={{
                padding: '12px 24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                margin: '0 auto'
              }}
            >
              <FaPlus />
              Adicionar Primeiro Jogo
            </motion.button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '20px',
              marginBottom: '30px' 
            }}>
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  ref={gamesNavigation.itemRefs[index]}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    boxShadow: currentSection === 'games' && gamesNavigation.focusedIndex === index 
                      ? '0 0 25px rgba(255, 255, 255, 0.9), inset 0 0 25px rgba(255, 255, 255, 0.4)' 
                      : 'none',
                    transform: currentSection === 'games' && gamesNavigation.focusedIndex === index 
                      ? 'scale(1.08)' 
                      : 'scale(1)',
                    transition: 'all 0.2s ease',
                    zIndex: currentSection === 'games' && gamesNavigation.focusedIndex === index ? 10 : 1
                  }}
                >
                  <GameCard game={game} onUpdate={loadGames} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  ref={gamesNavigation.itemRefs[index]}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    boxShadow: currentSection === 'games' && gamesNavigation.focusedIndex === index 
                      ? '0 0 25px rgba(255, 255, 255, 0.9), inset 0 0 25px rgba(255, 255, 255, 0.4)' 
                      : 'none',
                    transform: currentSection === 'games' && gamesNavigation.focusedIndex === index 
                      ? 'scale(1.05)' 
                      : 'scale(1)',
                    transition: 'all 0.2s ease',
                    zIndex: currentSection === 'games' && gamesNavigation.focusedIndex === index ? 10 : 1
                  }}
                >
                  <GameCard game={game} onUpdate={loadGames} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      </div>
    );
};

export default GameLibrary;