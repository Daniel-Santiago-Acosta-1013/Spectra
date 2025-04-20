import { textToBinary, binaryToText } from './binary';
import { getImageData, imageDataToDataURL } from './imageProcessing';

const HEADER_LENGTH = 32; // Length of the message length header in bits
const REPETITION_FACTOR = 3; // Number of times each bit is repeated for robustness

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

    // Repeat each bit for robustness
    let repeatedBinary = '';
    for (const bit of fullBinary) {
      repeatedBinary += bit.repeat(REPETITION_FACTOR);
    }

    // Check si la imagen tiene suficiente capacidad (bits disponibles vs bits repetidos necesarios)
    const requiredBits = repeatedBinary.length;
    const availableBits = data.length / 4; // Assuming 1 bit per pixel (Red channel)

    if (requiredBits > availableBits) {
      throw new Error(`Message is too large for this image. Required bits: ${requiredBits}, Available bits: ${availableBits}`);
    }

    // Encode the repeated binary data into the image (using the red channel)
    for (let i = 0; i < repeatedBinary.length; i++) {
      const bit = parseInt(repeatedBinary[i]);
      // Ensure we don't go out of bounds (should be caught by the check above, but good practice)
      if (i * 4 < data.length) {
        data[i * 4] = encodeBit(data[i * 4], bit);
      } else {
        // This case should theoretically not happen due to the check above
        console.warn("Attempted to write bit beyond image data bounds.");
        break;
      }
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
    const availableBits = data.length / 4;

    // 1. Extract and decode header (message length) with majority voting
    let headerBinary = '';
    const headerRepeatedLength = HEADER_LENGTH * REPETITION_FACTOR;

    if (headerRepeatedLength > availableBits) {
        throw new Error('Not enough data in image to extract header.');
    }

    for (let i = 0; i < headerRepeatedLength; i += REPETITION_FACTOR) {
      let ones = 0;
      for (let j = 0; j < REPETITION_FACTOR; j++) {
        if (i + j < availableBits) {
            ones += decodeBit(data[(i + j) * 4]);
        } else {
             throw new Error('Image data ended unexpectedly during header decoding.');
        }
      }
      // Majority voting
      headerBinary += (ones > REPETITION_FACTOR / 2) ? '1' : '0';
    }
    const messageLength = parseInt(headerBinary, 2);

    // 2. Validate message length based on available bits AFTER header
    const messageRepeatedLength = messageLength * REPETITION_FACTOR;
    const maxPossibleMessageLength = Math.floor((availableBits - headerRepeatedLength) / REPETITION_FACTOR);

    if (messageLength <= 0 || messageLength > maxPossibleMessageLength) {
      console.error(`Invalid message length: ${messageLength}. Max possible: ${maxPossibleMessageLength}`);
      throw new Error('Invalid message length detected or message exceeds image capacity.');
    }

    // 3. Extract and decode message bits with majority voting
    let messageBinary = '';
    const startMessageIndex = headerRepeatedLength;
    const endMessageIndex = startMessageIndex + messageRepeatedLength;

    for (let i = startMessageIndex; i < endMessageIndex; i += REPETITION_FACTOR) {
        let ones = 0;
        for(let j = 0; j < REPETITION_FACTOR; j++) {
            if (i + j < availableBits) {
                ones += decodeBit(data[(i + j) * 4]);
            } else {
                 throw new Error('Image data ended unexpectedly during message decoding.');
            }
        }
        // Majority voting
        messageBinary += (ones > REPETITION_FACTOR / 2) ? '1' : '0';
    }

    // Check if decoded message matches expected length
    if (messageBinary.length !== messageLength) {
        throw new Error(`Decoded message length (${messageBinary.length}) does not match header length (${messageLength}). Data might be corrupted.`);
    }


    // 4. Convert binary to text
    return binaryToText(messageBinary);
  } catch (error) {
    // Provide more specific error feedback if possible
    const errMsg = (error as Error).message;
    console.error("Decoding failed:", errMsg);
    if (errMsg.includes('Invalid message length') || errMsg.includes('Data might be corrupted')) {
        throw new Error('Failed to decode message: Invalid data or corrupted image.');
    } else if (errMsg.includes('Not enough data') || errMsg.includes('unexpectedly')) {
         throw new Error('Failed to decode message: Image data is incomplete or too small.');
    }
    throw new Error('Failed to decode message: ' + errMsg);
  }
};

/**
 * Obtiene la capacidad máxima de caracteres que se pueden almacenar en la imagen,
 * considerando la redundancia para corrección de errores.
 */
export const getImageCapacity = async (image: File): Promise<number> => {
  try {
    const imageData = await getImageData(image);
    const data = imageData.data;

    // Cantidad total de píxeles = data.length / 4
    // Cada píxel nos da 1 bit (se está usando solo el canal rojo)
    const totalBits = data.length / 4;

    // Calcular bits disponibles después de restar la cabecera (que también se repite)
    const headerRepeatedBits = HEADER_LENGTH * REPETITION_FACTOR;
    const availableDataBits = totalBits - headerRepeatedBits;

    if (availableDataBits <= 0) {
      return 0;
    }

    // Calcular cuántos bits de mensaje originales caben, considerando el factor de repetición
    const maxMessageBits = Math.floor(availableDataBits / REPETITION_FACTOR);

    // Convertir bits de mensaje a caracteres (1 char = 8 bits)
    const capacityInChars = Math.floor(maxMessageBits / 8);

    return capacityInChars < 0 ? 0 : capacityInChars;
  } catch (error) {
      console.error("Error calculating image capacity:", error);
      // Return 0 or throw, depending on desired behavior on error
      return 0;
  }
};
