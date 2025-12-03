import React, { useEffect, useRef } from 'react';

const Visualizer = ({ isPlaying, analyser }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        const barWidth = (canvas.width / 40) * 2.5;
        let x = 0;
        for(let i = 0; i < 40; i++) {
            const height = 4;
            ctx.fillRect(x, canvas.height - height, barWidth - 2, height);
            x += barWidth;
        }
        return;
      }

      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);


      const bars = 40;
      const barWidth = (canvas.width / bars);
      let x = 0;

      for (let i = 0; i < bars; i++) {

        const index = Math.floor(i * (bufferLength / bars) * 0.5); 
        const value = dataArray[index];
        
        const percent = value / 255;
        const height = (percent * canvas.height) + 4;


        const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#6d28d9';
        const secondary = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim() || '#db2777';


        const gradient = ctx.createLinearGradient(0, canvas.height - height, 0, canvas.height);
        gradient.addColorStop(0, secondary);
        gradient.addColorStop(1, primary);

        ctx.fillStyle = gradient;
        

        ctx.fillRect(x, canvas.height - height, barWidth - 4, height);

        x += barWidth;
      }
    };

    if (isPlaying) {
      draw();
    } else {
      cancelAnimationFrame(animationRef.current);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / 40);
      let x = 0;
      for(let i = 0; i < 40; i++) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(x, canvas.height - 4, barWidth - 4, 4);
          x += barWidth;
      }
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, analyser]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={60} 
      style={{ marginBottom: '2rem', width: '100%', maxWidth: '100%', height: '60px' }}
    />
  );
};

export default Visualizer;
