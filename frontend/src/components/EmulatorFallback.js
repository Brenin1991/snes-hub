import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';

const FallbackContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding: 40px;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  color: #ff6b6b;
  margin-bottom: 20px;
`;

const ErrorTitle = styled.h2`
  color: white;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
`;

const ErrorMessage = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  text-align: center;
  margin-bottom: 30px;
  max-width: 500px;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled(motion.button)`
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  border: none;
  border-radius: 10px;
  padding: 15px 25px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: none;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

const EmulatorFallback = ({ onRetry, onGoHome, error }) => {
  return (
    <FallbackContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ErrorIcon>
          <FaExclamationTriangle />
        </ErrorIcon>
        
        <ErrorTitle>Erro no Emulador</ErrorTitle>
        
        <ErrorMessage>
          {error || 'Ocorreu um erro ao carregar o emulador. Isso pode acontecer devido a problemas de rede ou conflitos de script.'}
        </ErrorMessage>
        
        <ButtonGroup>
          <Button
            onClick={onRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaRedo />
            Tentar Novamente
          </Button>
          
          <Button
            onClick={onGoHome}
            className="secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHome />
            Voltar ao Início
          </Button>
        </ButtonGroup>
      </motion.div>
    </FallbackContainer>
  );
};

export default EmulatorFallback;
