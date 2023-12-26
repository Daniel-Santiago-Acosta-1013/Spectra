import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import EncryptButton from '../EncryptButton/EncryptButton';
import DecryptButton from '../DecryptButton/DecryptButton';
import { encryptMessageInImage, decryptMessageFromImage } from '../../utils/imageSteganography';
import './SteganographyForm.scss';

function SteganographyForm({ file, fileType, capacity, isPotentialStego, mode }: 
  { file: File | null, fileType: string, capacity: number, isPotentialStego: boolean, mode: 'encrypt' | 'decrypt' }) {
  
  const [message, setMessage] = useState('');
  const [isStegoDetected, setIsStegoDetected] = useState(isPotentialStego);
  const [key, setKey] = useState('');

  useEffect(() => {
    setIsStegoDetected(isPotentialStego);
  }, [isPotentialStego]);

  const handleEncrypt = async () => {
    if (!file || fileType !== 'image' || mode !== 'encrypt') return;

    try {
      const { encryptedFile, key: encryptionKey } = await encryptMessageInImage(file, message);
      saveFile(encryptedFile, encryptedFile.name);
      saveFile(new Blob([encryptionKey], { type: 'text/plain' }), `key-${encryptedFile.name}.txt`);
      setIsStegoDetected(true);
    } catch (error) {
      console.error('Error en la encriptación:', error);
    }
  };

  const handleDecrypt = async () => {
    if (!file || fileType !== 'image' || mode !== 'decrypt' || !key) return;

    try {
      const decryptedMessage = await decryptMessageFromImage(file, key);
      setMessage(decryptedMessage);
      setIsStegoDetected(false);
    } catch (error) {
      console.error('Error en la desencriptación:', error);
      Swal.fire({
        title: 'No Message Found',
        text: 'There is no hidden message in this image.',
        icon: 'info',
        confirmButtonText: 'Ok'
      });
    }
  };

  const saveFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="SteganographyForm">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.substring(0, capacity))}
        placeholder={mode === 'encrypt' ? "Enter your message here" : "Decrypted message will appear here"}
        maxLength={capacity}
        readOnly={mode === 'decrypt'}
      />
      <p>Characters: {message.length}/{capacity}</p>
      {mode === 'encrypt' && <EncryptButton onEncrypt={handleEncrypt} />}
      {isStegoDetected && mode === 'decrypt' && <DecryptButton onDecrypt={handleDecrypt} />}
      {isStegoDetected && mode === 'decrypt' && (
        <input type="text" value={key} onChange={e => setKey(e.target.value)} placeholder="Enter decryption key" />
      )}
    </div>
  );
}

export default SteganographyForm;
