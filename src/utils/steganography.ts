import { textToBinary, binaryToText } from './binary';
import { getImageData, imageDataToDataURL } from './imageProcessing';

const HEADER_LENGTH = 32; // Length of the message length header in bits

// Encode a single bit into a pixel's alpha channel
const encodeBit = (pixel: number, bit: number): number => {
  return (pixel & 0xFE) | bit; // Clear LSB and set it to our bit
};

// Decode a single bit from a pixel's alpha channel
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

    // Check if image has enough capacity
    if (fullBinary.length > data.length / 4) {
      throw new Error('Message is too large for this image');
    }

    // Encode the binary data into the image
    for (let i = 0; i < fullBinary.length; i++) {
      const bit = parseInt(fullBinary[i]);
      data[i * 4] = encodeBit(data[i * 4], bit); // Encode in red channel
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

    if (messageLength <= 0 || messageLength > (data.length / 4) - HEADER_LENGTH) {
      throw new Error('Invalid message length detected');
    }

    // Extract message binary data
    let messageBinary = '';
    for (let i = HEADER_LENGTH; i < HEADER_LENGTH + messageLength; i++) {
      messageBinary += decodeBit(data[i * 4]);
    }

    // Convert binary back to text
    return binaryToText(messageBinary);
  } catch (error) {
    throw new Error('Failed to decode message: ' + (error as Error).message);
  }
};