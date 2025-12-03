import React, { useState } from 'react';
import { Play, Music, Heart, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const Playlist = ({ songs, currentSong, onSongSelect, isOpen, onClose, filter, setFilter, favorites, toggleFavorite }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'songs', label: 'Songs' },
    { id: 'bgm', label: 'BGM' },
    { id: 'favorites', label: 'Favorites' },
  ];

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <motion.div 
      className="glass-panel"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{ 
        width: window.innerWidth < 768 ? '100vw' : '350px', 
        height: '100%', 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: window.innerWidth < 768 ? '0' : '2rem',
        boxSizing: 'border-box'
      }}
    >
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Music size={20} /> Library
      </h3>

      {/* Search Bar */}
      <div style={{ 
        position: 'relative', 
        marginBottom: '1rem', 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: '12px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Search size={18} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder="Search songs..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            width: '100%',
            outline: 'none',
            fontSize: '0.9rem'
          }}
        />
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: filter === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: filter === tab.id ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: filter === tab.id ? '600' : '400',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
        {filteredSongs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
            No songs found
          </div>
        ) : (
          filteredSongs.map((song, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSongSelect(song)}
              style={{
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: currentSong?.src === song.src ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: currentSong?.src === song.src ? '1px solid rgba(255,255,255,0.2)' : 'none'
              }}
            >
              <div 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                {currentSong?.src === song.src ? <Play size={16} fill="currentColor" /> : <Music size={16} />}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {song.artist}
                </p>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(song.src);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: favorites.includes(song.src) ? '#ef4444' : 'rgba(255,255,255,0.3)' }}
              >
                <Heart size={16} fill={favorites.includes(song.src) ? '#ef4444' : 'none'} />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Playlist;
