import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import EncryptButton from '../EncryptButton/EncryptButton';
import DecryptButton from '../DecryptButton/DecryptButton';
import { encryptMessageInImage, decryptMessageFromImage } from '../../utils/imageSteganography';
import './SteganographyForm.scss';

function SteganographyForm({ file, fileType, capacity, isPotentialStego }: { file: File | null, fileType: string, capacity: number, isPotentialStego: boolean }) {
  const [message, setMessage] = useState('');
  const [isStegoDetected, setIsStegoDetected] = useState(false);
  const [key, setKey] = useState('');

  useEffect(() => {
    setIsStegoDetected(isPotentialStego);
  }, [isPotentialStego])

  const handleEncrypt = async () => {
    if (!file) return;
  
    try {
      const { encryptedFile, key } = await encryptMessageInImage(file, message);
      // Guarda la imagen encriptada
      saveFile(encryptedFile, encryptedFile.name);
      // Guarda la clave en un archivo de texto
      saveFile(new Blob([key], { type: 'text/plain' }), `key-${encryptedFile.name}.txt`);
      setIsStegoDetected(true);
    } catch (error) {
      console.error('Error en la encriptación:', error);
    }
  };

  const handleDecrypt = async () => {
    if (!file || !key) return;

    let decryptedMessage;
    switch (fileType) {
      case 'image':
        decryptedMessage = await decryptMessageFromImage(file, key);
        if (decryptedMessage) {
          setMessage(decryptedMessage);
          setIsStegoDetected(false);
        } else {
          // Mostrar un modal si no hay mensaje
          Swal.fire({
            title: 'No Message Found',
            text: 'There is no hidden message in this image.',
            icon: 'info',
            confirmButtonText: 'Ok'
          });
        }
        break;
      default:
        console.error('Unsupported file type for decryption');
        return;
    }
  };

  function saveFile(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.[^/.]+$/, "") + "-encript";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="SteganographyForm"> 
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.substring(0, capacity))}
          placeholder="Enter your message here"
          maxLength={capacity}
        />
        <p>Characters: {message.length}/{capacity}</p>
        <EncryptButton onEncrypt={handleEncrypt} />
        {isStegoDetected && <DecryptButton onDecrypt={handleDecrypt} />}
        {isStegoDetected && (
        <input type="text" value={key} onChange={e => setKey(e.target.value)} placeholder="Enter decryption key" />
      )}
      </div>
    </>
  );
}

export default SteganographyForm;
