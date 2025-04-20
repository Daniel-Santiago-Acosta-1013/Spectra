import React from 'react';
import { motion, Variants } from 'framer-motion';
import { SteganoSection } from '../SteganoSection/SteganoSection';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

export const SteganoGuide: React.FC = () => {
  const sections = [
    {
      title: "¿Qué es la Esteganografía?",
      content: "La esteganografía es el arte y la ciencia de ocultar información secreta dentro de otro tipo de datos, como imágenes, audio o texto, de manera que la presencia del mensaje oculto sea indetectable para un observador casual. A diferencia de la criptografía, que cifra el mensaje para hacerlo ilegible sin la clave correcta, la esteganografía se enfoca en ocultar la *existencia* misma del mensaje.",
    },
    {
      title: "Técnica Común: LSB (Least Significant Bit)",
      content: "Una de las técnicas más populares para imágenes es la modificación del Bit Menos Significativo (LSB). Cada píxel de una imagen digital (especialmente en formatos sin pérdida como PNG o BMP) está representado por valores numéricos para sus componentes de color (Rojo, Verde, Azul - RGB). La técnica LSB consiste en reemplazar el último bit (el menos significativo) de cada componente de color de algunos píxeles con los bits del mensaje secreto. Estos cambios son tan sutiles que resultan prácticamente imperceptibles para el ojo humano.",
    },
    {
      title: "El Proceso Detallado (LSB)",
      content: "1. **Preparación:** El mensaje secreto (texto, archivo, etc.) se convierte primero a una secuencia de bits (0s y 1s).\n2. **Selección de Píxeles:** Se eligen los píxeles de la imagen portadora donde se ocultarán los bits. Esto puede ser secuencial, aleatorio o basado en una clave.\n3. **Incrustación:** Por cada bit del mensaje secreto, se toma un componente de color (R, G o B) de un píxel seleccionado y se modifica su último bit para que coincida con el bit del mensaje.\n4. **Resultado:** Se obtiene una nueva imagen (imagen esteganográfica o 'stego-image') que luce idéntica a la original, pero que contiene el mensaje oculto en los LSB de sus píxeles.",
    },
    {
      title: "Ventajas y Consideraciones",
      content: "**Ventajas:**\n• **Ocultación:** El principal beneficio es la discreción; el mensaje no atrae atención.\n• **Integridad del Portador:** La imagen original apenas sufre modificaciones visibles.\n**Consideraciones:**\n• **Capacidad Limitada:** La cantidad de información que se puede ocultar depende del tamaño y tipo de la imagen portadora.\n• **Fragilidad:** Procesos como la compresión con pérdida (JPEG), el cambio de tamaño o la edición pueden destruir el mensaje oculto.\n• **Detección:** Aunque difícil, existen técnicas de análisis estadístico (estegoanálisis) para detectar la presencia de información oculta.",
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-8"
    >
      {sections.map((section, index) => (
        <SteganoSection
          key={index}
          title={section.title}
          content={section.content}
        />
      ))}
    </motion.div>
  );
};