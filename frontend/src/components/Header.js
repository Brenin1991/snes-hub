import React from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useUser } from '../context/UserContext';

const Header = () => {
  const { currentUser, logout } = useUser();

  const colorThemes = {
    ember: '#ff6b6b',
    ocean: '#4ecdc4',
    rose: '#ff9ff3',
    phantom: '#a8e6cf',
    gray: '#95a5a6'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: '100%',
        height: '120px',
        backgroundImage: 'url(/header.png)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        zIndex: 10,
        backgroundColor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 30px'
      }}
    >
      {/* Logo/Title */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          
        }}
      >
        SNES Launcher
      </motion.div>

      {/* User Info */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '10px 20px',
            borderRadius: '25px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            border: `2px solid ${colorThemes[currentUser.color_theme] || '#ff6b6b'}`
          }}
        >
          {/* Avatar */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${colorThemes[currentUser.color_theme] || '#ff6b6b'}, #fff)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}>
            {currentUser.avatar_path ? (
              <img
                src={`http://localhost:3001/uploads/avatars/${currentUser.avatar_path}`}
                alt={currentUser.display_name}
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

          {/* User Details */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '2px'
            }}>
              {currentUser.display_name}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              opacity: 0.8
            }}>
              @{currentUser.username}
            </div>
          </div>

          {/* Logout Button */}
          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            title="Sair"
          >
            <FaSignOutAlt />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Header;
