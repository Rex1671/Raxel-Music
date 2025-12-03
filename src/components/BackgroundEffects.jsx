import React, { useEffect, useRef } from 'react';

const BackgroundEffects = ({ analyser, isPlaying }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    const particleCount = 150;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        color: `hsl(${Math.random() * 60 + 280}, 70%, 50%)` 
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const computedStyle = getComputedStyle(document.documentElement);
      const primaryColor = computedStyle.getPropertyValue('--primary-color').trim();
      const secondaryColor = computedStyle.getPropertyValue('--secondary-color').trim();

      let volume = 0;
      let bass = 0;

      if (isPlaying && analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        
        let bassSum = 0;
        for (let i = 0; i < 10; i++) {
          bassSum += dataArray[i];
        }
        bass = bassSum / 10; 

       
        let volumeSum = 0;
        const volumeBins = Math.min(100, bufferLength);
        for (let i = 0; i < volumeBins; i++) {
          volumeSum += dataArray[i];
        }
        volume = volumeSum / volumeBins;
      }


      const volumePercent = volume / 255;
      const bassPercent = bass / 255;


      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * (0.8 + bassPercent * 0.4)
      );

      gradient.addColorStop(0, `${primaryColor}33`);
      gradient.addColorStop(1, 'transparent'); 
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
       
        const speedMultiplier = 0.5 + (volumePercent * 25);
        
        p.x += p.speedX * speedMultiplier;
        p.y += p.speedY * speedMultiplier;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();

        const currentSize = p.size * (1 + volumePercent * 4);
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);

        ctx.fillStyle = secondaryColor;

        ctx.globalAlpha = 0.3 + volumePercent * 0.7;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0,
        pointerEvents: 'none'
      }} 
    />
  );
};

export default BackgroundEffects;
