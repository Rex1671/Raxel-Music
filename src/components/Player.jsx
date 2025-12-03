import React, { useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Repeat1, Heart } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import Visualizer from './Visualizer';

const Player = ({ currentSong, isPlaying, setIsPlaying, onNext, onPrev, progress, duration, onSeek, volume, setVolume, isShuffle, toggleShuffle, repeatMode, toggleRepeat, analyser, isFavorite, toggleFavorite }) => {
  const progressBarRef = useRef(null);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e) => {
    const width = progressBarRef.current.clientWidth;
    const clickX = e.nativeEvent.offsetX;
    const newTime = (clickX / width) * duration;
    onSeek(newTime);
  };

  const getCoverText = (title) => {

    const cleaned = title.replace(/[^a-zA-Z\s]/g, '').trim();
    

    if (cleaned.toLowerCase().includes('verse')) return null;
    if (cleaned.length < 2) return null;
    
    return cleaned;
  };

  const coverText = currentSong ? getCoverText(currentSong.title) : null;


  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const springConfig = { damping: 25, stiffness: 200 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      className="glass-panel player-card"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="album-art-container"
        style={{ 
          width: 'min(70vw, 280px)', 
          height: 'min(70vw, 280px)', 
          borderRadius: '24px', 
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
          rotateX: springRotateX,
          rotateY: springRotateY,
          perspective: 1000,
          flexShrink: 0
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.img
          key={currentSong?.src}
          src={currentSong?.cover || '/images/cover_abstract.png'}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1.15, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {coverText && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '0',
            width: '100%',
            textAlign: 'center',
            padding: '0 10px',
            zIndex: 10
          }}>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.8rem',
              fontWeight: '800',
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              letterSpacing: '-0.5px',
              textTransform: 'uppercase',
              lineHeight: '1.1'
            }}>
              {coverText}
            </h2>
            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1rem',
              fontWeight: '500',
              color: 'rgba(255,255,255,0.8)',
              marginTop: '4px',
              textShadow: '0 2px 5px rgba(0,0,0,0.5)'
            }}>
              {currentSong?.artist}
            </p>
          </div>
        )}

        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '50%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          pointerEvents: 'none'
        }} />
      </motion.div>

      <div className="player-controls-section">
        <Visualizer isPlaying={isPlaying} analyser={analyser} />

        <div className="song-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', width: '100%' }}>
          <div style={{ textAlign: 'left', overflow: 'hidden', flex: 1, minWidth: 0, width: '0' }}>
            {currentSong?.title.length > 12 ? (
              <div className="scrolling-text-container">
                <div className="scrolling-text-seamless">
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.2rem', whiteSpace: 'nowrap' }}>
                    <span>{currentSong.title}</span>
                    <span>{currentSong.title}</span>
                  </h2>
                </div>
              </div>
            ) : (
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentSong ? currentSong.title : 'Select a Song'}
              </h2>
            )}

            <p style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentSong ? currentSong.artist : '...'}
            </p>
          </div>
          <button 
            className="icon-btn" 
            onClick={toggleFavorite}
            style={{ color: isFavorite ? '#ef4444' : 'var(--text-secondary)', flexShrink: 0, marginLeft: '1rem' }}
          >
             <Heart size={24} fill={isFavorite ? '#ef4444' : 'none'} />
          </button>
        </div>

        <div className="progress-section" style={{ width: '100%', marginBottom: '1.5rem' }}>
          <div 
            ref={progressBarRef}
            onClick={handleSeek}
            style={{ 
              width: '100%', 
              height: '6px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '3px', 
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <motion.div 
              style={{ 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))',
                borderRadius: '3px',
                width: `${(progress / duration) * 100}%`,
                boxShadow: '0 0 10px var(--primary-color)',
                position: 'relative'
              }}
              layoutId="progress"
            >
              <div style={{
                position: 'absolute',
                right: '-6px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 0 10px var(--primary-color)'
              }} />
            </motion.div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="controls-row">
          <button 
            className="icon-btn" 
            onClick={toggleShuffle}
            style={{ color: isShuffle ? 'var(--secondary-color)' : 'var(--text-secondary)' }}
          >
            <Shuffle size={20} />
          </button>

          <button className="icon-btn" onClick={onPrev}>
            <SkipBack size={24} />
          </button>
          <button 
            className="icon-btn" 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ 
              background: 'linear-gradient(135deg, #6d28d9, #db2777)', 
              padding: '16px',
              boxShadow: '0 0 20px rgba(219, 39, 119, 0.4)'
            }}
          >
            {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
          </button>
          <button className="icon-btn" onClick={onNext}>
            <SkipForward size={24} />
          </button>

          <button 
            className="icon-btn" 
            onClick={toggleRepeat}
            style={{ color: repeatMode !== 'none' ? 'var(--secondary-color)' : 'var(--text-secondary)' }}
          >
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>


        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
          <Volume2 size={20} color="var(--text-secondary)" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--secondary-color)' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Player;
