import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome } from 'react-icons/fa';

const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate('/')}
      whileHover={{ x: -5 }}
      whileTap={{ scale: 0.95 }}
      className="snes-button has-phantom-color"
      style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}
    >
      <FaHome />
      Dashboard
    </motion.button>
  );
};

export default HomeButton;
