import { useState, useEffect, useRef, useCallback } from 'react';

const useGamepadNavigation = (options = {}) => {
  const {
    initialFocusIndex = 0,
    items = [],
    onItemSelect = () => {},
    onItemActivate = () => {},
    wrapAround = true,
    orientation = 'horizontal', // 'horizontal', 'vertical', 'grid'
    gridColumns = 4,
    enableKeyboard = true,
    enableGamepad = true,
    debounceMs = 150,
    blockNavigation = false
  } = options;

  const [focusedIndex, setFocusedIndex] = useState(initialFocusIndex);
  const [isNavigating, setIsNavigating] = useState(false);
  const itemRefs = useRef([]);
  const lastInputTime = useRef(0);

  // Função principal de navegação
  const navigate = useCallback((direction) => {
    if (items.length === 0 || blockNavigation) return;

    const now = Date.now();
    if (now - lastInputTime.current < 200) {
      return; // Debounce simples
    }
    lastInputTime.current = now;

    let newIndex = focusedIndex;

    switch (direction) {
      case 'up':
        if (orientation === 'vertical') {
          newIndex = focusedIndex - 1;
        } else if (orientation === 'grid') {
          newIndex = Math.max(0, focusedIndex - gridColumns);
        }
        break;
      case 'down':
        if (orientation === 'vertical') {
          newIndex = focusedIndex + 1;
        } else if (orientation === 'grid') {
          newIndex = Math.min(items.length - 1, focusedIndex + gridColumns);
        }
        break;
      case 'left':
        if (orientation === 'horizontal') {
          newIndex = focusedIndex - 1;
        } else if (orientation === 'grid') {
          newIndex = focusedIndex - 1;
        }
        break;
      case 'right':
        if (orientation === 'horizontal') {
          newIndex = focusedIndex + 1;
        } else if (orientation === 'grid') {
          newIndex = focusedIndex + 1;
        }
        break;
      default:
        return;
    }

    // Aplicar wrap around se habilitado
    if (wrapAround) {
      if (newIndex < 0) {
        newIndex = items.length - 1;
      } else if (newIndex >= items.length) {
        newIndex = 0;
      }
    } else {
      // Limitar aos bounds
      newIndex = Math.max(0, Math.min(newIndex, items.length - 1));
    }

    if (newIndex !== focusedIndex && newIndex >= 0 && newIndex < items.length) {
      setFocusedIndex(newIndex);
      onItemSelect(newIndex, items[newIndex]);
      
      // Scroll para o item focado
      scrollToFocusedItem(newIndex);
    }
  }, [focusedIndex, items, orientation, gridColumns, wrapAround, onItemSelect]);

  // Função para scroll automático
  const scrollToFocusedItem = useCallback((index) => {
    const itemElement = itemRefs.current[index];
    if (itemElement) {
      itemElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, []);

  // Função para ativar item (Enter/Space)
  const activateItem = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < items.length && !blockNavigation) {
      onItemActivate(focusedIndex, items[focusedIndex]);
    }
  }, [focusedIndex, items, onItemActivate, blockNavigation]);

  // Função para definir foco programaticamente
  const setFocus = useCallback((index) => {
    if (index >= 0 && index < items.length) {
      setFocusedIndex(index);
      scrollToFocusedItem(index);
    }
  }, [items.length, scrollToFocusedItem]);

  // Mapeamento de teclas
  const keyMap = {
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'Enter': 'activate',
    'Escape': 'back',
    'Backspace': 'back'
  };

  // Mapeamento de botões do gamepad
  const gamepadButtonMap = {
    12: 'up',    // D-pad up
    13: 'down',  // D-pad down
    14: 'left',  // D-pad left
    15: 'right', // D-pad right
    0: 'activate', // A button
    1: 'back',   // B button (voltar)
    8: 'escape'   // Select/Back button
  };

  // Handler para teclado
  const handleKeyDown = useCallback((event) => {
    if (!enableKeyboard || blockNavigation) return;

    const action = keyMap[event.key];
    if (action) {
      event.preventDefault();
      
      if (action === 'activate') {
        activateItem();
      } else if (action === 'back') {
        // Disparar evento customizado para voltar
        window.dispatchEvent(new CustomEvent('gamepadBack'));
      } else {
        navigate(action);
      }
    }
  }, [enableKeyboard, activateItem, navigate]);

  // Handler para gamepad
  const handleGamepadInput = useCallback(() => {
    if (!enableGamepad || blockNavigation) return;

    const gamepad = navigator.getGamepads()[0];
    if (!gamepad) return;

    // Verificar D-pad
    const dpadUp = gamepad.buttons[12]?.pressed;
    const dpadDown = gamepad.buttons[13]?.pressed;
    const dpadLeft = gamepad.buttons[14]?.pressed;
    const dpadRight = gamepad.buttons[15]?.pressed;
    const buttonA = gamepad.buttons[0]?.pressed;
    const buttonB = gamepad.buttons[1]?.pressed;
    const buttonSelect = gamepad.buttons[8]?.pressed;

    if (dpadUp) navigate('up');
    if (dpadDown) navigate('down');
    if (dpadLeft) navigate('left');
    if (dpadRight) navigate('right');
    if (buttonA) activateItem();
    
    // Só processar botão B se não estiver bloqueado (para permitir minimizar modal)
    if (buttonB && !blockNavigation) {
      window.dispatchEvent(new CustomEvent('gamepadBack'));
    }
    
   
  }, [enableGamepad, activateItem, navigate, blockNavigation]);

  // Polling do gamepad
  useEffect(() => {
    if (!enableGamepad) return;

    let gamepadPollingInterval;
    
    const pollGamepad = () => {
      const gamepad = navigator.getGamepads()[0];
      if (gamepad) {
        handleGamepadInput();
      }
    };

    // Polling mais frequente para gamepad
    gamepadPollingInterval = setInterval(pollGamepad, 50);

    return () => {
      if (gamepadPollingInterval) {
        clearInterval(gamepadPollingInterval);
      }
    };
  }, [enableGamepad, handleGamepadInput]);

  // Event listeners
  useEffect(() => {
    if (enableKeyboard) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enableKeyboard, handleKeyDown]);

  // Atualizar refs quando items mudam
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items.length]);

  // Reset focus quando items mudam
  useEffect(() => {
    if (items.length > 0 && focusedIndex >= items.length) {
      setFocusedIndex(0);
    }
  }, [items.length, focusedIndex]);

  return {
    focusedIndex,
    isNavigating,
    setFocus,
    itemRefs,
    navigate,
    activateItem
  };
};

export default useGamepadNavigation;
