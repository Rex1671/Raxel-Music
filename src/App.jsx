import React, { useState, useRef, useEffect } from 'react';
import Player from './components/Player';
import Playlist from './components/Playlist';
import songList from './songs.json';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundEffects from './components/BackgroundEffects';
import ThemeSelector from './components/ThemeSelector';
import SleepTimer from './components/SleepTimer';
import { ToastContainer } from './components/Toast';

function App() {
  const [songs, setSongs] = useState(songList);
  const [currentSong, setCurrentSong] = useState(songList.find(s => s.title === "Tum Aur Main") || songList[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [filter, setFilter] = useState('all');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });


  const [toasts, setToasts] = useState([]);

  const addToast = (message, duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (songSrc) => {
    const isFav = favorites.includes(songSrc);
    if (isFav) {
      addToast("Removed from Favorites");
      setFavorites(prev => prev.filter(src => src !== songSrc));
    } else {
      addToast("Added to Favorites");
      setFavorites(prev => [...prev, songSrc]);
    }
  };

  const filteredSongs = songs.filter(song => {
    if (filter === 'favorites') return favorites.includes(song.src);
    if (filter === 'all') return true;
    return song.category === filter;
  });


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(prev => Math.min(1, prev + 0.1));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(prev => Math.max(0, prev - 0.1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShuffle, repeatMode, filter, songs, currentSong]);


  useEffect(() => {
    const handleContext = (e) => e.preventDefault();
    const handleDrag = (e) => e.preventDefault();

    document.addEventListener('contextmenu', handleContext);
    document.addEventListener('dragstart', handleDrag);

    document.addEventListener('dragstart', handleDrag);
    const handleDevTools = (e) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleDevTools);

    return () => {
      document.removeEventListener('contextmenu', handleContext);
      document.removeEventListener('dragstart', handleDrag);
      window.removeEventListener('keydown', handleDevTools);
    };
  }, []);

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);


  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.crossOrigin = "anonymous";

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioContext.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(audioContext.destination);


    return () => {
      audioContext.close();
    };
  }, []);


  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      

      fetch(currentSong.src)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          const data = new Uint8Array(buffer);
          const decryptedData = new Uint8Array(data.length);
          const KEY = 0xAA;
          
          for (let i = 0; i < data.length; i++) {
            decryptedData[i] = data[i] ^ KEY;
          }

          const blob = new Blob([decryptedData], { type: 'audio/mp3' });
          const blobUrl = URL.createObjectURL(blob);
          audioRef.current.src = blobUrl;
          audioRef.current.volume = volume;
          
          audioRef.current.volume = volume;
          
          if (isPlayingRef.current) {
            if (audioContextRef.current?.state === 'suspended') {
              audioContextRef.current.resume();
            }
            audioRef.current.play().catch(e => console.error("Play error:", e));
          }
        })
        .catch(err => console.error("Error loading audio:", err));

      audioRef.current.ontimeupdate = () => setProgress(audioRef.current.currentTime);
      audioRef.current.onloadedmetadata = () => setDuration(audioRef.current.duration);
      audioRef.current.onended = handleNext;
    }
  }, [currentSong]);

  useEffect(() => {
    if (isPlaying) {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      if (audioRef.current.readyState > 0) {
        audioRef.current.play().catch(e => {
          console.error("Play error:", e);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const handleNext = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    let nextIndex;
    const currentList = filteredSongs.length > 0 ? filteredSongs : songs;
    
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * currentList.length);
      setCurrentSong(currentList[nextIndex]);
    } else {
      const currentIndex = currentList.findIndex(s => s.src === currentSong.src);
      if (currentIndex === -1) {
         setCurrentSong(currentList[0]);
      } else {
         nextIndex = (currentIndex + 1) % currentList.length;
         setCurrentSong(currentList[nextIndex]);
      }
    }
  };

  const handlePrev = () => {
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    const currentList = filteredSongs.length > 0 ? filteredSongs : songs;

    if (isShuffle) {
      const nextIndex = Math.floor(Math.random() * currentList.length);
      setCurrentSong(currentList[nextIndex]);
    } else {
      const currentIndex = currentList.findIndex(s => s.src === currentSong.src);
      if (currentIndex === -1) {
         setCurrentSong(currentList[0]);
      } else {
         const prevIndex = (currentIndex - 1 + currentList.length) % currentList.length;
         setCurrentSong(currentList[prevIndex]);
      }
    }
  };

  const handleSeek = (time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  return (
    <div className="app-container">
      
      <BackgroundEffects analyser={analyserRef.current} isPlaying={isPlaying} />

      <a 
        href="https://www.instagram.com/raxel__music?igsh=MTJma28zM2htNjU1ZQ==" 
        onClick={(e) => {
          e.preventDefault();
          const webUrl = "https://www.instagram.com/raxel__music?igsh=MTJma28zM2htNjU1ZQ==";
          const appUrl = "instagram://user?username=raxel__music";
          
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          
          if (isMobile) {
            window.location.href = appUrl;
            setTimeout(() => {
              window.open(webUrl, '_blank');
            }, 1000);
          } else {
            window.open(webUrl, '_blank');
          }
        }}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          zIndex: 50,
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 0 15px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'block',
          cursor: 'pointer'
        }}
      >
        <img 
          src="/logo.jpg" 
          alt="Logo" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scale(1.4)'
          }}
        />
      </a>

      <div className="main-content">
        
        <button 
          className="icon-btn" 
          onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
          style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50, background: 'rgba(0,0,0,0.5)' }}
        >
          {isPlaylistOpen ? <X /> : <Menu />}
        </button>

        <ThemeSelector addToast={addToast} />

        <SleepTimer onTimerComplete={() => setIsPlaying(false)} />

        <div className="player-wrapper">
          <Player 
            currentSong={currentSong}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onNext={handleNext}
            onPrev={handlePrev}
            progress={progress}
            duration={duration}
            onSeek={handleSeek}
            volume={volume}
            setVolume={setVolume}
            isShuffle={isShuffle}
            toggleShuffle={() => {
              setIsShuffle(!isShuffle);
              addToast(!isShuffle ? "Shuffle On" : "Shuffle Off");
            }}
            repeatMode={repeatMode}
            toggleRepeat={() => {
              const modes = ['none', 'all', 'one'];
              const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
              setRepeatMode(nextMode);
              addToast(`Repeat: ${nextMode === 'one' ? 'One' : nextMode === 'all' ? 'All' : 'Off'}`);
            }}
            analyser={analyserRef.current}
            isFavorite={favorites.includes(currentSong?.src)}
            toggleFavorite={() => toggleFavorite(currentSong?.src)}
          />
        </div>

        <AnimatePresence>
          {isPlaylistOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ 
                position: 'absolute', 
                right: 0, 
                top: 0, 
                height: '100%', 
                zIndex: 40,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <Playlist 
                songs={filteredSongs} 
                currentSong={currentSong} 
                onSongSelect={(song) => {
                  setCurrentSong(song);
                  setIsPlaying(true);
                }}
                filter={filter}
                setFilter={setFilter}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <ToastContainer toasts={toasts} removeToast={removeToast} />

      </div>
    </div>
  );
}

export default App;
