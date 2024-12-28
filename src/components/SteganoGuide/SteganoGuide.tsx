import React from 'react';
import { SteganoSection } from '../SteganoSection/SteganoSection';
import './SteganoGuide.css';

export const SteganoGuide: React.FC = () => {
  const sections = [
    {
      title: "¿Qué es la Esteganografía?",
      content: "La esteganografía es el arte de ocultar información dentro de otros datos aparentemente inofensivos. A diferencia de la criptografía que hace el mensaje ilegible, la esteganografía esconde el mensaje de forma que pase desapercibido.",
      animationClass: "fade-in"
    },
    {
      title: "¿Cómo funciona en imágenes?",
      content: "Cada píxel de una imagen está compuesto por valores RGB (Rojo, Verde, Azul). Modificamos ligeramente estos valores para almacenar nuestro mensaje secreto sin que el cambio sea visible al ojo humano.",
      animationClass: "slide-in"
    },
    {
      title: "El Proceso",
      content: "1. Tu mensaje se convierte a código binario (0s y 1s)\n2. Cada bit se oculta en el último bit de los valores de color\n3. Los cambios son tan pequeños que la imagen se ve igual",
      animationClass: "fade-up"
    },
    {
      title: "Ventajas",
      content: "• Comunicación discreta y segura\n• La imagen mantiene su apariencia original\n• Difícil de detectar sin el software adecuado",
      animationClass: "slide-up"
    }
  ];

  return (
    <div className="stegano-guide">
      {sections.map((section, index) => (
        <SteganoSection
          key={index}
          {...section}
          delay={index * 0.3}
        />
      ))}
    </div>
  );
};