import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaGamepad, FaPlay, FaUsers, FaCog } from 'react-icons/fa';
import useGamepadNavigation from '../hooks/useGamepadNavigation';

const Intro = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const steps = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao SNES Launcher',
      subtitle: 'Seu console pessoal de jogos',
      icon: FaGamepad,
      color: 'ember',
      description: 'Reviva a nostalgia dos clássicos do Super Nintendo em uma experiência moderna e imersiva.'
    },
    {
      id: 'users',
      title: 'Sistema de Usuários',
      subtitle: 'Cada pessoa tem seus jogos',
      icon: FaUsers,
      color: 'ocean',
      description: 'Crie perfis personalizados para cada jogador, com seus próprios jogos, favoritos e configurações.'
    },
    {
      id: 'controls',
      title: 'Controles Intuitivos',
      subtitle: 'Navegação por controle',
      icon: FaCog,
      color: 'rose',
      description: 'Use o controle de videogame ou teclado para navegar facilmente pela interface.'
    },
    {
      id: 'ready',
      title: 'Pronto para Jogar!',
      subtitle: 'A diversão começa agora',
      icon: FaPlay,
      color: 'phantom',
      description: 'Selecione seu perfil e comece a jogar seus jogos favoritos do SNES.'
    }
  ];

  const menuItems = [
    { id: 'start', label: 'Começar', action: () => onComplete() },
    { id: 'skip', label: 'Pular Intro', action: () => onComplete() }
  ];

  const navigation = useGamepadNavigation({
    items: menuItems,
    orientation: 'horizontal',
    onItemActivate: (index, item) => {
      item.action();
    }
  });

  useEffect(() => {
    // Mostrar conteúdo após animação inicial
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showContent) {
      // Auto-avançar steps
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [showContent, steps.length]);

  const currentStepData = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      style={{
        height: '100vh',
        background: '#f0f0f0 url(./intro-background.png) no-repeat center center fixed',
        backgroundSize: '100% 100%',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black',
        position: 'relative',
        overflow: 'hidden',
        padding: '40px 20px'
      }}
    >
      {/* Partículas de fundo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(255, 107, 107, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(107, 107, 255, 0.1) 0%, transparent 50%)',
        zIndex: 1
      }} />

      {/* Conteúdo principal */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 50 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: '800px',
          padding: '40px 20px',
          margin: '20px 0'
        }}
      >
        {/* Logo/Ícone */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: showContent ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{
            fontSize: '120px',
            marginBottom: '40px',
            color: `var(--${currentStepData.color}-color)`,
            filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.3))'
          }}
        >
          <currentStepData.icon />
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 30 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '20px',
            background: `linear-gradient(45deg, var(--${currentStepData.color}-color), #fff)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(255, 255, 255, 0.5)'
          }}
        >
          {currentStepData.title}
        </motion.h1>

        {/* Subtítulo */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          style={{
            fontSize: '24px',
            fontWeight: '300',
            marginBottom: '40px',
            opacity: 0.8
          }}
        >
          {currentStepData.subtitle}
        </motion.h2>

        {/* Descrição */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          style={{
            fontSize: '18px',
            lineHeight: '1.6',
            marginBottom: '60px',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 60px'
          }}
        >
          {currentStepData.description}
        </motion.p>

        {/* Indicador de progresso */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '40px'
          }}
        >
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: index === currentStep 
                  ? `var(--${currentStepData.color}-color)` 
                  : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                boxShadow: index === currentStep 
                  ? `0 0 20px var(--${currentStepData.color}-color)` 
                  : 'none'
              }}
            />
          ))}
        </motion.div>

        {/* Botões de ação */}
        {currentStep === steps.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.7 }}
            style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                ref={navigation.itemRefs[index]}
                onClick={item.action}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`snes-button ${
                  item.id === 'start' ? 'has-ember-color' : 'has-phantom-color'
                }`}
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: navigation.focusedIndex === index 
                    ? '0 0 25px rgba(255, 215, 0, 0.8), inset 0 0 25px rgba(255, 215, 0, 0.3)' 
                    : 'none',
                  transform: navigation.focusedIndex === index ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
              >
                {item.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </motion.div>

    </motion.div>
  );
};

export default Intro;
