import { useEffect, useState } from 'react';
import EncryptButton from '../EncryptButton/EncryptButton';
import DecryptButton from '../DecryptButton/DecryptButton';
import { encryptMessageInImage, decryptMessageFromImage } from '../../utils/imageSteganography';
import Swal from 'sweetalert2';
import './SteganographyForm.scss';

function SteganographyForm({ file, fileType, capacity, isPotentialStego, mode }:
  { file: File | null, fileType: string, capacity: number, isPotentialStego: boolean, mode: 'encrypt' | 'decrypt' }) {

  const [message, setMessage] = useState('');
  const [isStegoDetected, setIsStegoDetected] = useState(isPotentialStego);
  useEffect(() => {
    setIsStegoDetected(isPotentialStego);
  }, [isPotentialStego]);

  const handleEncrypt = async () => {
    if (!file || mode !== 'encrypt') {
      Swal.fire({
        title: 'Error',
        text: 'Please select a file to encrypt.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }

    if (!message) {
      Swal.fire({
        title: 'Error',
        text: 'The message field is empty. Please enter a message to encrypt.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }

    if (fileType !== 'png') {
      Swal.fire({
        title: 'Error',
        text: 'The selected file is not a PNG image. Please select a PNG image to encrypt.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }

    try {
      const encryptedFile = await encryptMessageInImage(file, message);
      saveFile(encryptedFile, encryptedFile.name);
      setIsStegoDetected(true);
    } catch (error) {
      console.error('Error en la encriptación:', error);
      Swal.fire({
        title: 'Encryption Error',
        text: 'An error occurred during encryption. Please try again.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  };

  const handleDecrypt = async () => {
    if (!file || fileType !== 'image' || mode !== 'decrypt') return;

    try {
      const decryptedMessage = await decryptMessageFromImage(file);
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
    </div>
  );
}

export default SteganographyForm;
