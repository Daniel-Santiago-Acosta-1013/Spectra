// Convert text to binary string
export const textToBinary = (text: string): string => {
  return text
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
};

// Convert binary string to text
export const binaryToText = (binary: string): string => {
  const bytes = binary.match(/.{8}/g) || [];
  return bytes
    .map(byte => String.fromCharCode(parseInt(byte, 2)))
    .join('');
};