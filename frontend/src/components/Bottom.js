import React from 'react';
import { motion } from 'framer-motion';

const Bottom = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: '100%',
        height: '100px',
        backgroundImage: 'url(/bottom.png)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        zIndex: 10,
        marginTop: 'auto',
        backgroundColor: '#e0e0e0'
      }}
    >
    </motion.div>
  );
};

export default Bottom;
