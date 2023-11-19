import { useState } from 'react';
import EncryptButton from '../EncryptButton/EncryptButton';
import DecryptButton from '../DecryptButton/DecryptButton';
import { encryptMessageInImage, decryptMessageFromImage } from '../../utils/imageSteganography';
import './SteganographyForm.scss';

function SteganographyForm({ file, fileType, capacity }: { file: File | null, fileType: string, capacity: number }) {
  const [message, setMessage] = useState('');

  const handleEncrypt = async () => {
    if (!file) return;

    let encryptedFile;
    switch (fileType) {
      case 'image':
        encryptedFile = await encryptMessageInImage(file, message);

        // Crear un enlace para descargar la imagen encriptada
        const url = URL.createObjectURL(encryptedFile);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(/\.[^/.]+$/, "") + "-encript";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;
      default:
        console.error('Unsupported file type for encryption');
        return;
    }
  };

  const handleDecrypt = async () => {
    if (!file) return;

    let decryptedMessage;
    switch (fileType) {
      case 'image':
        decryptedMessage = await decryptMessageFromImage(file);
        break;
      default:
        console.error('Unsupported file type for decryption');
        return;
    }

    console.log('Decrypted Message:', decryptedMessage);
  };

  return (
    <div className="SteganographyForm">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.substring(0, capacity))}
        placeholder="Enter your message here"
        maxLength={capacity}
      />
      <p>Characters: {message.length}/{capacity}</p>
      <EncryptButton onEncrypt={handleEncrypt} />
      <DecryptButton onDecrypt={handleDecrypt} />
    </div>
  );
}

export default SteganographyForm;
