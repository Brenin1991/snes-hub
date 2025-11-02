import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaVolumeUp, FaKeyboard, FaDesktop, FaGamepad, FaSave, FaArrowLeft } from 'react-icons/fa';
import HomeButton from '../components/HomeButton';
import useGamepadNavigation from '../hooks/useGamepadNavigation';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    // Audio Settings
    masterVolume: 80,
    musicVolume: 70,
    sfxVolume: 90,
    muteAudio: false,
    
    // Video Settings
    fullscreen: false,
    vsync: true,
    pixelPerfect: true,
    scale: 2,
    
    // Controls Settings
    controllerEnabled: true,
    keyboardControls: true,
    turboMode: false,
    
    // Game Settings
    autoSave: true,
    showFPS: false,
    debugMode: false,
    language: 'pt-BR'
  });

  const [currentSection, setCurrentSection] = useState('audio'); // 'audio', 'video', 'controls', 'game', 'buttons'

  // Função para voltar
  const handleBack = () => {
    navigate(-1); // Volta para a página anterior
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('snes-launcher-settings', JSON.stringify(settings));
    console.log('Configurações salvas:', settings);
  };

  const handleReset = () => {
    setSettings({
      masterVolume: 80,
      musicVolume: 70,
      sfxVolume: 90,
      muteAudio: false,
      fullscreen: false,
      vsync: true,
      pixelPerfect: true,
      scale: 2,
      controllerEnabled: true,
      keyboardControls: true,
      turboMode: false,
      autoSave: true,
      showFPS: false,
      debugMode: false,
      language: 'pt-BR'
    });
  };

  // Configuração da navegação para seções
  const sectionItems = [
    { id: 'audio', label: 'Áudio', section: 'audio' },
    { id: 'video', label: 'Vídeo', section: 'video' },
    { id: 'controls', label: 'Controles', section: 'controls' },
    { id: 'game', label: 'Jogo', section: 'game' },
    { id: 'buttons', label: 'Ações', section: 'buttons' }
  ];

  // Navegação para seções
  const sectionNavigation = useGamepadNavigation({
    items: sectionItems,
    orientation: 'horizontal',
    onItemActivate: (index, item) => {
      setCurrentSection(item.section);
    }
  });

  // Navegação para botões de ação
  const buttonItems = [
    { id: 'reset', label: 'Resetar', action: handleReset, icon: FaCog },
    { id: 'save', label: 'Salvar', action: handleSave, icon: FaSave },
    { id: 'back', label: 'Voltar', action: handleBack, icon: FaArrowLeft }
  ];

  const buttonsNavigation = useGamepadNavigation({
    items: buttonItems,
    orientation: 'horizontal',
    onItemActivate: (index, item) => {
      item.action();
    }
  });

  // Handler para navegação entre seções
  const handleSectionNavigation = (direction) => {
    const sections = ['audio', 'video', 'controls', 'game', 'buttons'];
    const currentIndex = sections.indexOf(currentSection);
    
    if (direction === 'right' && currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
    } else if (direction === 'left' && currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1]);
    }
  };

  // Navegação global
  React.useEffect(() => {
    const handleGlobalNavigation = (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        handleSectionNavigation(event.key === 'ArrowLeft' ? 'left' : 'right');
      } else if (event.key === 'Escape') {
        event.preventDefault();
        handleBack();
      }
    };

    const handleGamepadBack = () => {
      handleBack();
    };

    document.addEventListener('keydown', handleGlobalNavigation);
    window.addEventListener('gamepadBack', handleGamepadBack);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalNavigation);
      window.removeEventListener('gamepadBack', handleGamepadBack);
    };
  }, [currentSection]);

  return (
    <div style={{ padding: '20px' }}>
      <HomeButton />
      <div style={{ marginBottom: '30px' }}>
        <h1 className="text-black" style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          Configurações
        </h1>
        <p className="text-phantom-color" style={{ fontSize: '14px', opacity: 0.8 }}>
          Personalize sua experiência de jogo
        </p>
        
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px', 
        marginBottom: '30px' 
      }}>
        {/* Audio Settings */}
        <div 
          ref={sectionNavigation.itemRefs[0]}
          className="snes-container has-plumber-bg" 
          style={{ 
            padding: '25px',
            boxShadow: currentSection === 'audio' 
              ? '0 0 20px rgba(255, 255, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3)' 
              : 'none',
            transform: currentSection === 'audio' ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease',
            border: currentSection === 'audio' ? '3px solid #000' : 'none'
          }}
        >
          <h2 className="text-black" style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
            <FaVolumeUp />
            Áudio
          </h2>
          
          <div className="snes-form-group">
            <label className="text-white">Volume Principal</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.masterVolume}
                onChange={(e) => handleSettingChange('masterVolume', parseInt(e.target.value))}
                className="snes-range has-soft-green-thumb"
                style={{ flex: 1 }}
              />
              <span className="text-white" style={{ fontSize: '12px', minWidth: '40px', textAlign: 'center' }}>
                {settings.masterVolume}%
              </span>
            </div>
          </div>

          <div className="snes-form-group">
            <label className="text-white">Volume da Música</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume}
                onChange={(e) => handleSettingChange('musicVolume', parseInt(e.target.value))}
                className="snes-range has-ocean-bg"
                style={{ flex: 1 }}
              />
              <span className="text-white" style={{ fontSize: '12px', minWidth: '40px', textAlign: 'center' }}>
                {settings.musicVolume}%
              </span>
            </div>
          </div>

          <div className="snes-form-group">
            <label className="text-white">Volume dos Efeitos</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.sfxVolume}
                onChange={(e) => handleSettingChange('sfxVolume', parseInt(e.target.value))}
                className="snes-range has-aged-yellow-thumb has-ember-bg"
                style={{ flex: 1 }}
              />
              <span className="text-white" style={{ fontSize: '12px', minWidth: '40px', textAlign: 'center' }}>
                {settings.sfxVolume}%
              </span>
            </div>
          </div>

          <div className="snes-checkbox snes-checkbox--vertical">
            <label className="snes-checkbox__item has-nature-icon text-white">
              <input
                type="checkbox"
                checked={settings.muteAudio}
                onChange={(e) => handleSettingChange('muteAudio', e.target.checked)}
              />
              <span className="snes-checkbox__item__content">Silenciar Áudio</span>
            </label>
          </div>
        </div>

        {/* Video Settings */}
        <div 
          ref={sectionNavigation.itemRefs[1]}
          className="snes-container has-sunshine-bg" 
          style={{ 
            padding: '25px',
            boxShadow: currentSection === 'video' 
              ? '0 0 20px rgba(255, 255, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3)' 
              : 'none',
            transform: currentSection === 'video' ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease',
            border: currentSection === 'video' ? '3px solid #000' : 'none'
          }}
        >
          <h2 className="text-black" style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
            <FaDesktop />
            Vídeo
          </h2>
          
          <div className="snes-form-group">
            <label className="text-white">Escala do Emulador</label>
            <div className="snes-input">
              <select
                value={settings.scale}
                onChange={(e) => handleSettingChange('scale', parseInt(e.target.value))}
              >
                <option value="1">1x (Original)</option>
                <option value="2">2x (Recomendado)</option>
                <option value="3">3x</option>
                <option value="4">4x</option>
              </select>
            </div>
          </div>

          <div className="snes-form-group">
            <label className="text-white">Idioma</label>
            <div className="snes-input">
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
                <option value="fr-FR">Français</option>
              </select>
            </div>
          </div>

          <div className="snes-checkbox snes-checkbox--vertical">
            <label className="snes-checkbox__item has-ember-icon text-white">
              <input
                type="checkbox"
                checked={settings.fullscreen}
                onChange={(e) => handleSettingChange('fullscreen', e.target.checked)}
              />
              <span className="snes-checkbox__item__content">Tela Cheia</span>
            </label>
            
            <label className="snes-checkbox__item has-ocean-icon text-white">
              <input
                type="checkbox"
                checked={settings.vsync}
                onChange={(e) => handleSettingChange('vsync', e.target.checked)}
              />
              <span className="snes-checkbox__item__content">VSync</span>
            </label>
            
            <label className="snes-checkbox__item has-galaxy-icon text-white">
              <input
                type="checkbox"
                checked={settings.pixelPerfect}
                onChange={(e) => handleSettingChange('pixelPerfect', e.target.checked)}
              />
              <span className="snes-checkbox__item__content">Pixel Perfect</span>
            </label>
          </div>
        </div>

        {/* Controls Settings */}
        <div 
          ref={sectionNavigation.itemRefs[2]}
          className="snes-container has-ocean-bg" 
          style={{ 
            padding: '25px',
            boxShadow: currentSection === 'controls' 
              ? '0 0 20px rgba(255, 255, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3)' 
              : 'none',
            transform: currentSection === 'controls' ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease',
            border: currentSection === 'controls' ? '3px solid #000' : 'none'
          }}
        >
          <h2 className="text-black" style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
            <FaGamepad />
            Controles
          </h2>
          
          <div className="snes-checkbox snes-checkbox--vertical">
            <label className="snes-checkbox__item has-nature-icon text-white">
              <input
                type="checkbox"
                checked={settings.controllerEnabled}
                onChange={(e) => handleSettingChange('controllerEnabled', e.target.checked)}
              />
              <span className="snes-checkbox__item__content">Habilitar Controle</span>
            </label>
            
            <label className="snes-checkbox__item has-ember-icon text-white">
              <input
                type="checkbox"
                checked={settings.keyboardControls}
                onChange={(e) => handleSettingChange('keyboardControls', e.target.checked)}
              />
              <span className="snes-checkbox__item__content">Controles de Teclado</span>
            </label>
            
            <label className="snes-checkbox__item has-galaxy-icon text-white">
              <input
                type="checkbox"
                checked={settings.turboMode}
                onChange={(e) => handleSettingChange('turboMode', e.target.checked)}
              />
              <span className="snes-checkbox__item__content">Modo Turbo</span>
            </label>
          </div>
        </div>

        {/* Game Settings */}
        <div 
          ref={sectionNavigation.itemRefs[3]}
          className="snes-container has-galaxy-bg" 
          style={{ 
            padding: '25px',
            boxShadow: currentSection === 'game' 
              ? '0 0 20px rgba(255, 255, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3)' 
              : 'none',
            transform: currentSection === 'game' ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease',
            border: currentSection === 'game' ? '3px solid #000' : 'none'
          }}
        >
          <h2 className="text-black" style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
            <FaCog />
            Jogo
          </h2>
          
          <div className="snes-checkbox snes-checkbox--vertical">
            <label className="snes-checkbox__item has-nature-icon text-white">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
              />
              <span className="snes-checkbox__item__content">Salvamento Automático</span>
            </label>
            
            <label className="snes-checkbox__item has-ember-icon text-white">
              <input
                type="checkbox"
                checked={settings.showFPS}
                onChange={(e) => handleSettingChange('showFPS', e.target.checked)}
              />
              <span className="snes-checkbox__item__content">Mostrar FPS</span>
            </label>
            
            <label className="snes-checkbox__item has-rose-icon text-white">
              <input
                type="checkbox"
                checked={settings.debugMode}
                onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
              />
              <span className="snes-checkbox__item__content">Modo Debug</span>
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '30px' }}>
        {buttonItems.map((item, index) => (
          <motion.button
            key={item.id}
            ref={buttonsNavigation.itemRefs[index]}
            onClick={item.action}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`snes-button ${
              item.id === 'reset' ? 'has-phantom-color' :
              item.id === 'save' ? 'has-ember-color' :
              'has-ocean-color'
            }`}
            style={{
              padding: '12px 24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease',
              boxShadow: currentSection === 'buttons' && buttonsNavigation.focusedIndex === index 
                ? '0 0 25px rgba(255, 215, 0, 0.8), inset 0 0 25px rgba(255, 215, 0, 0.3)' 
                : 'none',
              transform: currentSection === 'buttons' && buttonsNavigation.focusedIndex === index 
                ? 'scale(1.1)' 
                : 'scale(1)',
              outline: 'none'
            }}
          >
            <item.icon />
            {item.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Settings;