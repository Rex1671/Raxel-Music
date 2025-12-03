import React, { useState, useEffect, useRef } from 'react';
import { Moon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SleepTimer = ({ onTimerComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  const options = [
    { label: '15 min', value: 15 * 60 },
    { label: '30 min', value: 30 * 60 },
    { label: '1 hour', value: 60 * 60 },
  ];

  const startTimer = (seconds) => {
    clearInterval(timerRef.current);
    setTimeLeft(seconds);
    setIsActive(true);
    setIsOpen(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsActive(false);
          onTimerComplete();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelTimer = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    setTimeLeft(null);
    setIsOpen(false);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ position: 'absolute', top: '20px', left: '80px', zIndex: 50 }}>
      <button 
        className="icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: isActive ? 'rgba(109, 40, 217, 0.5)' : 'rgba(0,0,0,0.5)',
          width: isActive ? 'auto' : '40px',
          padding: isActive ? '8px 12px' : '8px',
          borderRadius: '20px',
          gap: '8px'
        }}
      >
        {isActive ? (
          <>
            <Clock size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{formatTime(timeLeft)}</span>
          </>
        ) : (
          <Moon size={24} />
        )}
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
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0 8px' }}>
              Sleep Timer
            </h4>
            {options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => startTimer(opt.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  borderRadius: '6px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                {opt.label}
              </button>
            ))}
            {isActive && (
              <button
                onClick={cancelTimer}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: 'none',
                  color: '#ef4444',
                  padding: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  borderRadius: '6px',
                  marginTop: '4px'
                }}
              >
                Stop Timer
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SleepTimer;
