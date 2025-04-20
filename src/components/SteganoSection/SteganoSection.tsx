import React from 'react';
import { motion, Variants } from 'framer-motion';

interface SteganoSectionProps {
  title: string;
  content: string;
}

// Define animation variants for the card
const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30, // Start slightly below final position
    scale: 0.95 // Start slightly smaller
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" // Smooth easing
    }
  }
};

export const SteganoSection: React.FC<SteganoSectionProps> = ({
  title,
  content,
}) => {
  return (
    // Use motion.div and apply variants
    <motion.div
      variants={cardVariants}
      // initial and animate will be controlled by the parent container's stagger
      className="mb-6 md:mb-8 last:mb-0 bg-gray-700 bg-opacity-40 p-4 md:p-6 rounded-lg shadow-md"
    >
      <h3 className="text-lg md:text-xl font-semibold mb-3 text-purple-300">{title}</h3>
      <div className="text-gray-300 space-y-2 text-sm md:text-base">
        {content.split('\n').map((line, index) => (
          // Use dangerouslySetInnerHTML to render bold tags correctly if needed, or parse manually
          // For simplicity, let's assume simple text for now.
          <p key={index}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p> // Basic bold removal for now
        ))}
      </div>
    </motion.div>
  );
};