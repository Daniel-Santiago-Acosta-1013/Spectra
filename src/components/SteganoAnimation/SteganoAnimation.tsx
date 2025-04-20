import React from 'react';
import { motion, Variants, useAnimation, AnimationControls } from 'framer-motion';
import { useEffect, useRef } from 'react';

// --- Component Definitions (Larger Elements) ---

const Pixel: React.FC<{ 
  id: string; 
  color: string; 
  lsb?: string; 
  pixelControls?: AnimationControls;
  lsbControls?: AnimationControls;
}> = ({ id, color, lsb, pixelControls, lsbControls }) => {

  const pixelVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.5 }, // Slightly longer duration for larger size
      borderColor: '#4B5563'
    },
    modified: { 
      borderColor: ['#4B5563', '#A78BFA', '#4B5563'],
      scale: [1, 1.15, 1], // More noticeable pulse
      transition: { duration: 0.5, times: [0, 0.5, 1] }
    }
  };

  const lsbVariants: Variants = {
    hidden: { opacity: 0, scale: 0 },
    // Appear as bit animation ends
    visible: { opacity: 0.8, scale: 1, transition: { delay: 0.4, duration: 0.3 } } 
  };

  return (
    <motion.div
      key={id}
      variants={pixelVariants}
      className={`w-6 h-6 sm:w-8 sm:h-8 border-2 flex items-center justify-center ${color} original-pixel relative`} 
      data-pixel-id={id}
      animate={pixelControls}
      initial="hidden"
      style={{ borderColor: '#4B5563' }}
    >
      {lsb && (
        <motion.span 
          variants={lsbVariants}
          // Responsive text size
          className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm text-white lsb-bit"
          initial="hidden"
          animate={lsbControls}
        >
          {lsb}
        </motion.span>
      )}
    </motion.div>
  );
};

const Bit: React.FC<{ 
  id: string; 
  value: string; 
  index: number;
  pixelId: string; 
  controls?: AnimationControls;
}> = ({ id, value, index, controls }) => {
  const bitVariants: Variants = {
    hidden: { opacity: 0, y: -30, x: 0, scale: 1 }, // Increased initial y offset
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      x: 0,
      scale: 1,
      // Slightly slower stagger for visibility
      transition: { delay: i * 0.12 }
    }),
  };
  return (
    <motion.div
      key={id}
      variants={bitVariants}
      custom={index}
      // Responsive size, text, and spacing
      className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-400 bg-blue-800 text-white flex items-center justify-center text-xs sm:text-sm mx-0.5 sm:mx-1 secret-bit"
      data-bit-id={id}
      initial="hidden"
      animate={controls}
    >
      {value}
    </motion.div>
  );
};


export const SteganoAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelControls = useAnimation();
  const bitControls = useAnimation();
  const lsbControls = useAnimation();

  const originalPixelsData = [
    { id: 'pixel-0', color: 'bg-red-500', lsb: '1' },
    { id: 'pixel-1', color: 'bg-green-500', lsb: '0' },
    { id: 'pixel-2', color: 'bg-blue-500', lsb: '1' },
    { id: 'pixel-3', color: 'bg-red-600', lsb: '1' },
    { id: 'pixel-4', color: 'bg-green-600', lsb: '0' },
    { id: 'pixel-5', color: 'bg-blue-600', lsb: '1' },
    { id: 'pixel-6', color: 'bg-red-700', lsb: '0' },
    { id: 'pixel-7', color: 'bg-green-700', lsb: '1' },
  ];
  const secretMessage = '10110101';

  useEffect(() => {
    let isMounted = true;

    const sequence = async () => {
      if (!isMounted || !containerRef.current) return;
      
      while (isMounted) { 
        // Reset state instantly
        pixelControls.set('hidden');
        bitControls.set('hidden');
        lsbControls.set('hidden');
        pixelControls.set({ borderColor: '#4B5563' }); 
        if (!isMounted) break; 

        // 1. Show Original Pixels
        await pixelControls.start('visible');
        if (!isMounted) break;

        // 2. Show Secret Bits
        await bitControls.start('visible');
        if (!isMounted) break;
        
        await new Promise(res => setTimeout(res, 1000)); // Increased pause before interaction
        if (!isMounted) break;

        // 3. Interaction Phase
        const interactionPromises = secretMessage.split('').map(async (_, i) => {
            const bitElement = document.querySelector(`[data-bit-id="bit-${i}"]`);
            const pixelElement = document.querySelector(`[data-pixel-id="pixel-${i}"]`);
            const containerElement = containerRef.current;

            if (bitElement && pixelElement && containerElement) {
              const pixelRect = pixelElement.getBoundingClientRect();
              const bitRect = bitElement.getBoundingClientRect(); 
              const containerRect = containerElement.getBoundingClientRect();

              const targetX = pixelRect.left - containerRect.left + (pixelRect.width / 2) - (bitRect.width / 2);
              // Target the exact center of the pixel
              const targetY = pixelRect.top - containerRect.top + (pixelRect.height / 2) - (bitRect.height / 2); 
              
              // Animate bit towards pixel and fade completely
              await bitControls.start(customIndex => {
                 if (customIndex === i) {
                     return { 
                         x: targetX, 
                         y: targetY, 
                         opacity: 0, 
                         scale: 0, // Scale to 0 for full disappearance
                         // Slightly longer duration for larger movement
                         transition: { duration: 0.6, ease: "easeInOut", delay: i * 0.1 } 
                     };
                 }
                 return {};
             });
            } 
          });
          
        // Start LSB/Pixel animations concurrently, timed with bit arrival
        const lsbPixelAnimations = Promise.all([
           // Start LSB slightly before bit fully disappears (duration 0.6)
           new Promise(res => setTimeout(res, 400)), // Delay based on bit animation duration and stagger
           lsbControls.start('visible'), 
           pixelControls.start('modified')
        ]);

        await Promise.all([...interactionPromises, lsbPixelAnimations]);
        if (!isMounted) break;

        // --- Pause and Reset for Loop --- 
        await new Promise(res => setTimeout(res, 1500)); // Longer pause to see final state
        if (!isMounted) break;

        // Reset: Start animations back to hidden state for the loop
        await Promise.all([
          lsbControls.start('hidden'),
          pixelControls.start('hidden'), 
          bitControls.start('hidden') 
        ]);
        if (!isMounted) break;

        await new Promise(res => setTimeout(res, 300));
        if (!isMounted) break;
      }
    };

    const timerId = setTimeout(() => {
        if (containerRef.current && isMounted) { 
            sequence();
        } 
    }, 100); 

    return () => {
       isMounted = false;
       clearTimeout(timerId);
       pixelControls.stop();
       bitControls.stop();
       lsbControls.stop();
    }

  }, [pixelControls, bitControls, lsbControls]);

  // --- JSX Structure ---
  return (
    <div 
      ref={containerRef}
      // Responsive padding, min-height, and vertical spacing
      className="stegano-animation-container p-2 sm:p-4 md:p-6 bg-gray-900 rounded-lg relative overflow-hidden min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center space-y-8 md:space-y-12"
    >
      {/* Pixel Grid - Responsive spacing */}
      <div className="flex justify-center space-x-1 sm:space-x-2">
        {originalPixelsData.map(p => (
          <Pixel key={p.id} id={p.id} color={p.color} lsb={p.lsb} pixelControls={pixelControls} lsbControls={lsbControls} />
        ))}
      </div>
      {/* Bit Stream - Responsive spacing */}
      <div className="flex justify-center space-x-1 sm:space-x-2">
        {originalPixelsData.map((p, i) => ( 
           <Bit key={`bit-${i}`} id={`bit-${i}`} value={secretMessage[i]} index={i} pixelId={p.id} controls={bitControls} />
        ))}
      </div>
    </div>
  );
};
