import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import EncryptButton from '../EncryptButton/EncryptButton';
import DecryptButton from '../DecryptButton/DecryptButton';
import { encryptMessageInImage, decryptMessageFromImage } from '../../utils/imageSteganography';
import SteganographyVisualization from '../SteganographyVisualization/SteganographyVisualization';
import './SteganographyForm.scss';

function SteganographyForm({ file, fileType, capacity, isPotentialStego }: { file: File | null, fileType: string, capacity: number, isPotentialStego: boolean }) {
  const [message, setMessage] = useState('');
  const [isStegoDetected, setIsStegoDetected] = useState(false);

  useEffect(() => {
    setIsStegoDetected(isPotentialStego);
  }, [isPotentialStego])

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
        setIsStegoDetected(true);
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
      </div>
      <div className='steganoVisualizationContainer'>
        <SteganographyVisualization isStegoDetected={isStegoDetected} />
      </div>
    </>
  );
}

export default SteganographyForm;
