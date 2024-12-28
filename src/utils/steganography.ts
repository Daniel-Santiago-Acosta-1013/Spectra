import { textToBinary, binaryToText } from './binary';
import { getImageData, imageDataToDataURL } from './imageProcessing';

const HEADER_LENGTH = 32; // Length of the message length header in bits

// Encode a single bit into a pixel's red channel
const encodeBit = (pixel: number, bit: number): number => {
  return (pixel & 0xFE) | bit; // Clear LSB and set it to our bit
};

// Decode a single bit from a pixel's red channel
const decodeBit = (pixel: number): number => {
  return pixel & 0x01; // Get LSB
};

export const encodeMessage = async (image: File, message: string): Promise<string> => {
  try {
    const imageData = await getImageData(image);
    const data = imageData.data;

    // Convert message to binary
    const messageBinary = textToBinary(message);

    // Create header with message length (32 bits)
    const messageLength = messageBinary.length;
    const header = messageLength.toString(2).padStart(HEADER_LENGTH, '0');

    // Combine header and message
    const fullBinary = header + messageBinary;

    // Check si la imagen tiene suficiente capacidad (bits disponibles vs bits del mensaje)
    if (fullBinary.length > data.length / 4) {
      throw new Error('Message is too large for this image');
    }

    // Encode the binary data into the image (usando el canal rojo)
    for (let i = 0; i < fullBinary.length; i++) {
      const bit = parseInt(fullBinary[i]);
      data[i * 4] = encodeBit(data[i * 4], bit);
    }

    return imageDataToDataURL(imageData);
  } catch (error) {
    throw new Error('Failed to encode message: ' + (error as Error).message);
  }
};

export const decodeMessage = async (image: File): Promise<string> => {
  try {
    const imageData = await getImageData(image);
    const data = imageData.data;

    // Extract header (message length)
    let headerBinary = '';
    for (let i = 0; i < HEADER_LENGTH; i++) {
      headerBinary += decodeBit(data[i * 4]);
    }
    const messageLength = parseInt(headerBinary, 2);

    // Validar rango de longitud
    if (messageLength <= 0 || messageLength > (data.length / 4) - HEADER_LENGTH) {
      throw new Error('Invalid message length detected');
    }

    // Extraer los bits del mensaje
    let messageBinary = '';
    for (let i = HEADER_LENGTH; i < HEADER_LENGTH + messageLength; i++) {
      messageBinary += decodeBit(data[i * 4]);
    }

    // Convertir binario a texto
    return binaryToText(messageBinary);
  } catch (error) {
    throw new Error('Failed to decode message: ' + (error as Error).message);
  }
};

/**
 * Obtiene la capacidad máxima de caracteres que se pueden almacenar en la imagen.
 */
export const getImageCapacity = async (image: File): Promise<number> => {
  const imageData = await getImageData(image);
  const data = imageData.data;
  
  // Cantidad total de píxeles = data.length / 4
  // Cada píxel nos da 1 bit (se está usando solo el canal rojo)
  // Restamos la cabecera de 32 bits (HEADER_LENGTH)
  // Luego dividimos entre 8 para convertir bits a caracteres (1 char = 8 bits)
  
  const totalBits = data.length / 4; 
  const maxMessageBits = totalBits - HEADER_LENGTH;  
  const capacityInChars = Math.floor(maxMessageBits / 8);
  
  return capacityInChars < 0 ? 0 : capacityInChars;
};
