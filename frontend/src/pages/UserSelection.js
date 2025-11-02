import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaUserPlus, FaCog, FaPlay, FaEdit, FaTrash } from 'react-icons/fa';
import { getUsers, createUser, deleteUser, loginUser } from '../services/api';
import { useUser } from '../context/UserContext';
import useGamepadNavigation from '../hooks/useGamepadNavigation';
import toast from 'react-hot-toast';

const UserSelection = ({ onUserSelect, onBack }) => {
  const { login } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    display_name: '',
    color_theme: 'ember'
  });

  const colorThemes = [
    { id: 'ember', name: 'Ember', color: '#ff6b6b' },
    { id: 'ocean', name: 'Ocean', color: '#4ecdc4' },
    { id: 'rose', name: 'Rose', color: '#ff9ff3' },
    { id: 'phantom', name: 'Phantom', color: '#a8e6cf' },
    { id: 'gray', name: 'Gray', color: '#95a5a6' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUser.username || !newUser.display_name) {
        toast.error('Username e nome são obrigatórios');
        return;
      }

      const formData = new FormData();
      formData.append('username', newUser.username);
      formData.append('display_name', newUser.display_name);
      formData.append('color_theme', newUser.color_theme);

      const user = await createUser(formData);
      setUsers([...users, user]);
      setNewUser({ username: '', display_name: '', color_theme: 'ember' });
      setShowCreateForm(false);
      toast.success('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Erro ao criar usuário');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
        await deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        toast.success('Usuário deletado com sucesso!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao deletar usuário');
    }
  };

  const handleUserLogin = async (user) => {
    try {
      const response = await loginUser(user.id);
      
      // Usar o contexto para fazer login
      login(response.user, response.session_token);
      
      onUserSelect(response.user);
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('Erro ao fazer login');
    }
  };

  // Configuração da navegação
  const allItems = [
    ...users.map(user => ({ ...user, type: 'user' })),
    { id: 'create', type: 'action', label: 'Criar Usuário', icon: FaUserPlus, action: () => setShowCreateForm(true) },
    { id: 'back', type: 'action', label: 'Voltar', icon: FaCog, action: onBack }
  ];

  const navigation = useGamepadNavigation({
    items: allItems,
    orientation: 'grid',
    gridColumns: 3,
    onItemActivate: (index, item) => {
      if (item.type === 'user') {
        handleUserLogin(item);
      } else if (item.type === 'action') {
        item.action();
      }
    }
  });

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f0f0f0 url(./intro-background.png) no-repeat center center fixed',
        backgroundSize: '100% 100%',
        backgroundAttachment: 'fixed',
        color: 'black'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '48px', marginBottom: '20px' }}
          >
            🎮
          </motion.div>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Carregando usuários...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{
        height: '100vh',
        background: '#f0f0f0 url(./intro-background.png) no-repeat center center fixed',
        backgroundSize: '100% 100%',
        backgroundAttachment: 'fixed',
        padding: '40px 30px',
        color: 'black',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: 'center', marginBottom: '50px' }}
      >
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          marginBottom: '15px',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Selecionar Usuário
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.8 }}>
          Escolha seu perfil para continuar
        </p>
      </motion.div>

      {/* Grid de usuários */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}
      >
        {allItems.map((item, index) => (
          <motion.div
            key={item.id}
            ref={navigation.itemRefs[index]}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (item.type === 'user') {
                handleUserLogin(item);
              } else if (item.type === 'action') {
                item.action();
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`snes-container ${
              item.type === 'user' ? 'has-gray-bg' : 'has-phantom-bg'
            }`}
            style={{
              padding: '40px 30px',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: navigation.focusedIndex === index 
                ? '0 0 25px rgba(255, 215, 0, 0.8), inset 0 0 25px rgba(255, 215, 0, 0.3)' 
                : 'none',
              transform: navigation.focusedIndex === index ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
          >
            {item.type === 'user' ? (
              <>
                {/* Avatar do usuário */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${colorThemes.find(t => t.id === item.color_theme)?.color || '#ff6b6b'}, #fff)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '20px',
                  boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
                }}>
                  {item.avatar_path ? (
                    <img
                      src={`http://localhost:3001/uploads/avatars/${item.avatar_path}`}
                      alt={item.display_name}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>

                {/* Nome do usuário */}
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  color: colorThemes.find(t => t.id === item.color_theme)?.color || '#ff6b6b'
                }}>
                  {item.display_name}
                </h3>

                {/* Username */}
                <p style={{
                  fontSize: '14px',
                  opacity: 0.7,
                  marginBottom: '20px'
                }}>
                  @{item.username}
                </p>

                {/* Indicador de login */}
                <div style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: colorThemes.find(t => t.id === item.color_theme)?.color || '#ff6b6b',
                  border: `2px solid ${colorThemes.find(t => t.id === item.color_theme)?.color || '#ff6b6b'}`,
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)'
                }}>
                  <FaPlay style={{ marginRight: '8px' }} />
                  Clique para Entrar
                </div>

                {/* Botões de ação (apenas no hover) */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  display: 'flex',
                  gap: '5px',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="snes-button has-ocean-color"
                    style={{
                      padding: '5px',
                      fontSize: '12px',
                      minWidth: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingUser(item);
                    }}
                  >
                    <FaEdit />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="snes-button has-red-color"
                    style={{
                      padding: '5px',
                      fontSize: '12px',
                      minWidth: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUser(item.id);
                    }}
                  >
                    <FaTrash />
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                {/* Ícone de ação */}
                <div style={{
                  fontSize: '48px',
                  marginBottom: '20px',
                  color: item.id === 'create' ? '#4ecdc4' : '#95a5a6'
                }}>
                  <item.icon />
                </div>

                {/* Label da ação */}
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '10px'
                }}>
                  {item.label}
                </h3>
              </>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Modal de criação de usuário */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="snes-container has-gray-bg"
            style={{
              padding: '40px',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center'
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>
              Criar Novo Usuário
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '16px',
                  border: '2px solid #333',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'black',
                  marginBottom: '15px'
                }}
              />
              <input
                type="text"
                placeholder="Nome de Exibição"
                value={newUser.display_name}
                onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '16px',
                  border: '2px solid #333',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'black',
                  marginBottom: '20px'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <p style={{ fontSize: '14px', marginBottom: '15px', opacity: 0.8 }}>
                Escolha um tema de cor:
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {colorThemes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setNewUser({ ...newUser, color_theme: theme.id })}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: theme.color,
                      border: newUser.color_theme === theme.id ? '3px solid #fff' : '2px solid #333',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <motion.button
                onClick={handleCreateUser}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="snes-button has-ember-color"
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Criar Usuário
              </motion.button>
              <motion.button
                onClick={() => setShowCreateForm(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="snes-button has-phantom-color"
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Cancelar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

    </motion.div>
  );
};

export default UserSelection;
