import React, { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const themes = [
  {
    id: 'default',
    name: 'Cyberpunk',
    colors: {
      primary: '#6d28d9',
      secondary: '#db2777',
      bgGradient: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #000000 100%)'
    }
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#22d3ee',
      bgGradient: 'radial-gradient(circle at 50% 50%, #0c4a6e 0%, #000000 100%)'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      secondary: '#ef4444',
      bgGradient: 'radial-gradient(circle at 50% 50%, #7c2d12 0%, #000000 100%)'
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#10b981',
      secondary: '#84cc16',
      bgGradient: 'radial-gradient(circle at 50% 50%, #064e3b 0%, #000000 100%)'
    }
  }
];

const ThemeSelector = ({ addToast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');

  const applyTheme = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.colors.primary);
    root.style.setProperty('--secondary-color', theme.colors.secondary);
    root.style.setProperty('--bg-gradient', theme.colors.bgGradient);
    
    setCurrentTheme(themeId);
    setIsOpen(false);
    if (addToast) addToast(`Theme set to ${theme.name}`);
  };

  return (
    <div style={{ position: 'absolute', top: '20px', left: '135px', zIndex: 50 }}>
      <button 
        className="icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: 'rgba(0,0,0,0.5)' }}
      >
        <Palette size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            style={{
              position: 'absolute',
              top: '50px',
              left: '0',
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minWidth: '120px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: currentTheme === theme.id ? theme.colors.secondary : 'white',
                  padding: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: currentTheme === theme.id ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` 
                }} />
                {theme.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;
