import { useState } from 'react';
import EncryptButton from '../EncryptButton/EncryptButton';
import DecryptButton from '../DecryptButton/DecryptButton';
import { encryptMessageInImage, decryptMessageFromImage } from '../../utils/imageSteganography';
import './SteganographyForm.scss';

function SteganographyForm({ file, fileType }: { file: File | null, fileType: string }) {
  const [message, setMessage] = useState('');

  const handleEncrypt = async () => {
    if (!file) return;

    let encryptedFile;
    switch (fileType) {
      case 'image':
        encryptedFile = await encryptMessageInImage(file, message);
        break;
      default:
        console.error('Unsupported file type for encryption');
        return;
    }

    console.log('Encrypted File:', encryptedFile);
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
        onChange={(e) => setMessage(e.target.value)} 
        placeholder="Enter your message here"
      />
      <EncryptButton onEncrypt={handleEncrypt} />
      <DecryptButton onDecrypt={handleDecrypt} />
    </div>
  );
}

export default SteganographyForm;
